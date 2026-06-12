"use strict";

const crypto = require("node:crypto");
const neo4j = require("neo4j-driver");
const { QwenClient } = require("./qwenClient");

const DEFAULT_NEO4J_URI = "bolt://localhost:7687";
const DEFAULT_NEO4J_USERNAME = "neo4j";
const DEFAULT_NEO4J_PASSWORD = "mindstudy-local-neo4j";
const GRAPH_TEXT_LIMIT = 60000;
const GRAPH_NODE_LIMIT = 64;
const RELATION_TYPE_MAP = {
  "前置": "PREREQUISITE_OF",
  "包含": "PART_OF",
  "应用": "APPLIES_TO",
  "对比": "CONTRASTS_WITH",
  "因果": "CAUSES",
  "证据": "SUPPORTED_BY",
  "示例": "EXAMPLE_OF",
  "评价": "EVALUATES",
  "相关": "RELATED_TO",
};
const RELATION_TYPES = Array.from(new Set(Object.values(RELATION_TYPE_MAP)));

function asNumber(value, fallback = 0) {
  if (neo4j.isInt(value)) return value.toNumber();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asText(value, fallback = "") {
  return String(value == null ? fallback : value).trim();
}

function sampleTextWithinLimit(text = "", limit = GRAPH_TEXT_LIMIT) {
  const raw = String(text || "");
  const maxLength = Math.max(0, Number(limit) || 0);
  if (!maxLength || raw.length <= maxLength) return raw;
  const partLength = Math.floor(maxLength / 3);
  const middleStart = Math.max(0, Math.floor((raw.length - partLength) / 2));
  return [
    raw.slice(0, partLength),
    raw.slice(middleStart, middleStart + partLength),
    raw.slice(-partLength),
  ].join("\n\n[...]\n\n").slice(0, maxLength);
}

function getRelationType(relation = "相关") {
  const text = asText(relation, "相关");
  return RELATION_TYPE_MAP[text] || RELATION_TYPE_MAP[Object.keys(RELATION_TYPE_MAP).find((key) => text.includes(key))] || "RELATED_TO";
}

const NOISE_CONCEPT_PATTERN = /(ISBN|CIP|copyright|all rights reserved|edition|出版社|出版|印刷|责任编辑|责任编|版权所有|盗版|防伪|校区|大学|学院|图书在版|编目|定价|开本|印张|字数|书名|作者|译者|封面|封底|library of congress|pearson|mcgraw|press|本书|本章|本节|本页|本版|英文版|中文版|网站|网址|第\s*\d+\s*版|第[一二三四五六七八九十]+版|pdf|\.pdf|http|www\.|目录|前言|致谢|参考文献|附录|练习题|习题|图\s*\d+|表\s*\d+|例\s*\d+|教材|课件|文档|新课程|知识文档)/i;
const CONCEPT_SIGNAL_PATTERN = /(是|指|表示|定义|概念|包括|分为|组成|用于|作用|特点|模型|算法|方法|系统|结构|过程|关系|约束|查询|事务|索引|范式|模式|实体|属性|完整性|并发|恢复|SQL|ER|database|relation|transaction|query|index|schema)/i;
const FRAGMENT_CONCEPT_PATTERN = /^(的|了|和|或|与|及|以及|并|对|由|在|从|给|为|把|将|其|这|该|这些|那些|一个|一种|本|第)|(\b(the|and|or|with|this|that|these|those)\b)$/i;
const SENTENCE_CONCEPT_PATTERN = /(为什么|怎么样|如何|说明|建议|给予|提出|讨论|研究领域|工作|内容|方面|来说|结论|要求|如下|如下所示|可以看到|本书中)/;
const GENERIC_NOISE_LABELS = new Set(["本书", "本章", "本节", "本书中", "方面", "方面由", "其内容", "内容", "工作", "结论", "要求", "目前", "研究领域", "网址"]);

function isLikelyConceptLabel(label = "", context = "") {
  const normalized = asText(label);
  if (!normalized || normalized.length < 2 || normalized.length > 32) return false;
  if (GENERIC_NOISE_LABELS.has(normalized)) return false;
  if (NOISE_CONCEPT_PATTERN.test(normalized)) return false;
  if (FRAGMENT_CONCEPT_PATTERN.test(normalized)) return false;
  if (SENTENCE_CONCEPT_PATTERN.test(normalized) && normalized.length > 6) return false;
  if (/[。！？；;]$/.test(normalized)) return false;
  if (/^[\d\s\-–—_.:：@〇○oO\[\]()/\\]+$/.test(normalized)) return false;
  const digitRatio = (normalized.match(/\d/g) || []).length / Math.max(1, normalized.length);
  if (digitRatio > 0.35) return false;
  return CONCEPT_SIGNAL_PATTERN.test(`${normalized}\n${context}`) || /[\u4e00-\u9fa5]/.test(normalized) || /^[A-Z]{2,8}$/.test(normalized);
}

function normalizeComparableText(value = "") {
  return String(value || "").toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "");
}

function isConceptSupportedByDocuments(node, documents = []) {
  if (!documents.length) return true;
  const label = asText(node.label || node.id);
  if (!isLikelyConceptLabel(label, `${node.summary || ""}\n${(node.keywords || []).join(" ")}`)) return false;
  const snippets = (node.sourceSnippets || []).join("\n");
  if (snippets && !NOISE_CONCEPT_PATTERN.test(snippets)) return true;
  const comparableLabel = normalizeComparableText(label);
  if (!comparableLabel) return false;
  const docs = normalizeComparableText(documents.map((documentMeta) => documentMeta.text || "").join("\n"));
  const evidence = normalizeComparableText(`${snippets}\n${node.summary || ""}\n${(node.keywords || []).join(" ")}`);
  return docs.includes(comparableLabel) || (evidence.includes(comparableLabel) && !NOISE_CONCEPT_PATTERN.test(evidence));
}

function isNoiseTextLine(line = "") {
  const normalized = asText(line).replace(/\s+/g, " ");
  if (!normalized) return true;
  if (NOISE_CONCEPT_PATTERN.test(normalized)) return true;
  if (/^\s*(第\s*)?\d+\s*(页|page)?\s*$/i.test(normalized)) return true;
  if (/^[\d\s\-–—_.:：@〇○oO\[\]()/\\]+$/.test(normalized)) return true;
  const digitRatio = (normalized.match(/\d/g) || []).length / Math.max(1, normalized.length);
  return digitRatio > 0.55 && !CONCEPT_SIGNAL_PATTERN.test(normalized);
}

function cleanTextForPrompt(text = "") {
  const kept = [];
  String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line || isNoiseTextLine(line)) return;
      kept.push(line.replace(/\s{2,}/g, " "));
    });
  return sampleTextWithinLimit(kept.join("\n"), GRAPH_TEXT_LIMIT);
}

function scopedId(courseId, localId) {
  return `${courseId}::${localId}`;
}

function createHashId(parts) {
  return crypto.createHash("sha1").update(parts.filter(Boolean).join("::")).digest("hex").slice(0, 16);
}

function extractJsonPayload(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? candidate.slice(firstBrace, lastBrace + 1) : candidate;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function normalizeCourse(course = {}) {
  const id = asText(course.id || course.courseId, "default-course");
  return {
    id,
    name: asText(course.name, "MindStudy Course"),
    description: asText(course.description, ""),
  };
}

function normalizeDocuments(documents = []) {
  return (Array.isArray(documents) ? documents : [])
    .map((documentMeta, index) => ({
      id: asText(documentMeta.id, `doc-${index + 1}`),
      title: asText(documentMeta.title || documentMeta.name, `Document ${index + 1}`),
      text: cleanTextForPrompt(documentMeta.text || documentMeta.content),
      mimeType: asText(documentMeta.mimeType, "text/plain"),
      extension: asText(documentMeta.extension, "TXT"),
    }))
    .filter((documentMeta) => documentMeta.text);
}

function normalizeGraphPayload(payload = {}, documents = [], engine = "qwen") {
  const graphSource = payload.graph || payload;
  const rawNodes = Array.isArray(graphSource.nodes) ? graphSource.nodes : [];
  const rawEdges = Array.isArray(graphSource.edges) ? graphSource.edges : [];
  const documentTitles = documents.map((documentMeta) => documentMeta.title);
  const nodes = rawNodes.slice(0, GRAPH_NODE_LIMIT).map((node, index) => {
    const label = asText(node.label || node.name || node.title || node.id, `知识点 ${index + 1}`);
    const localId = asText(node.id, label);
    const sourceSnippets = Array.isArray(node.sourceSnippets)
      ? node.sourceSnippets
      : Array.isArray(node.sources)
        ? node.sources
        : node.sourceSnippet
          ? [node.sourceSnippet]
          : [];
    return {
      id: localId,
      label,
      summary: asText(node.summary || node.description || node.text, `${label} 是课程资料中的核心知识点。`).slice(0, 180),
      chapter: asText(node.chapter || node.community || node.group, "课程资料"),
      difficulty: ["基础", "中等", "较难"].includes(node.difficulty) ? node.difficulty : index < 4 ? "基础" : index < 10 ? "中等" : "较难",
      source: asText(node.source || node.file, documentTitles[0] || "上传资料"),
      examples: Array.isArray(node.examples) ? node.examples.map(String).slice(0, 4) : node.example ? [String(node.example)] : [],
      keywords: Array.isArray(node.keywords) ? node.keywords.map(String).slice(0, 8) : [label],
      sourceSnippets: sourceSnippets.map((snippet) => asText(snippet.text || snippet, "")).filter(Boolean).slice(0, 4),
      mastery: Math.min(100, Math.max(0, asNumber(node.mastery, 50 + (index % 5) * 6))),
      x: Number.isFinite(Number(node.x)) ? Number(node.x) : 130 + (index % 5) * 180,
      y: Number.isFinite(Number(node.y)) ? Number(node.y) : 110 + Math.floor(index / 5) * 150,
    };
  }).filter((node) =>
    isLikelyConceptLabel(node.label || node.id, `${node.summary}\n${(node.keywords || []).join(" ")}`)
    && isConceptSupportedByDocuments(node, documents));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const resolveEndpoint = (value) => {
    const raw = asText(value);
    if (nodeIds.has(raw)) return raw;
    const comparable = raw.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "");
    const matched = nodes.find((node) => {
      const id = node.id.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "");
      const label = node.label.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "");
      return id === comparable || label === comparable;
    });
    return matched?.id || raw;
  };
  const edges = rawEdges
    .map((edge, index) => ({
      id: asText(edge.id, `edge-${index + 1}`),
      source: resolveEndpoint(edge.source || edge.from || edge.sourceId || edge.start),
      target: resolveEndpoint(edge.target || edge.to || edge.targetId || edge.end),
      relation: asText(edge.relation || edge.label || edge.type, "相关"),
      relationType: getRelationType(edge.relation || edge.label || edge.type),
      explanation: asText(edge.explanation || edge.reason, ""),
      weight: Math.min(1, Math.max(0.1, asNumber(edge.weight, 0.6))),
    }))
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target) && edge.source !== edge.target);

  return {
    nodes,
    edges,
    meta: {
      generatedBy: engine,
      generatedAt: Date.now(),
      sourceDocuments: documentTitles,
      fallbackUsed: false,
    },
  };
}

function buildGraphPrompt(course, documents) {
  const context = documents
    .map((documentMeta, index) => `[D${index + 1}] ${documentMeta.title}\n${documentMeta.text.slice(0, Math.floor(GRAPH_TEXT_LIMIT / Math.max(1, documents.length)))}`)
    .join("\n\n---\n\n");
  return [
    "你是 MindStudy 的课程知识图谱抽取器。",
    "请基于课程资料抽取真实可学习的概念节点和概念关系。",
    "必须返回严格 JSON，不要 Markdown，不要解释。",
    "只抽取正文里的课程概念、原理、方法、模型、术语、流程和约束。",
    "禁止把 PDF 文件名、书名、作者、学校、学院、出版社、版次、ISBN、CIP、版权声明、页码、目录项、封面/封底信息、人名、机构名、本书说明、网址、参考文献、习题说明当作知识点。",
    "负例：不要输出“本书”“本书中”“本书英文版网站的网址”“第7版是”“方面由”“目前的研究领域”“表和例子来说明为什么结论”“的工作提出建议或给予了”这类节点。",
    "节点必须是可考试、可复习的短概念或短主题，例如“事务”“并发控制”“关系模型”“SQL”“完整性约束”。",
    "JSON 结构如下：",
    "{",
    '  "graph": {',
    '    "nodes": [{"id":"知识点唯一中文名","label":"显示名","summary":"80字内解释","chapter":"章节","difficulty":"基础|中等|较难","source":"资料标题或页码","sourceSnippets":["原文片段"],"examples":["例子"],"keywords":["关键词"],"mastery":50}],',
    '    "edges": [{"source":"节点id","target":"节点id","relation":"前置|包含|应用|对比|因果|证据|示例|评价|相关","weight":0.6,"explanation":"为什么成立"}]',
    "  },",
    '  "recommendations": [{"topic":"节点id","title":"复习建议标题","detail":"具体建议"}]',
    "}",
    "质量要求：优先生成 24-64 个节点，边数不少于节点数的 1.2 倍；覆盖章节层级、核心概念、方法/模型、约束、流程、应用和对比关系；每个核心节点必须能在正文中找到证据。",
    "不要生成测验题。自动测验由独立文档题库流程生成，不能依赖知识图谱。",
    `课程：${course.name}`,
    "",
    "课程资料：",
    context || "(没有资料文本)",
  ].join("\n");
}

function nodeToGraphNode(recordNode) {
  const properties = recordNode.properties || {};
  return {
    id: asText(properties.localId || properties.label),
    label: asText(properties.label || properties.localId),
    summary: asText(properties.summary),
    chapter: asText(properties.chapter, "课程资料"),
    difficulty: asText(properties.difficulty, "中等"),
    source: asText(properties.source, "课程资料"),
    examples: Array.isArray(properties.examples) ? properties.examples : [],
    keywords: Array.isArray(properties.keywords) ? properties.keywords : [],
    sourceSnippets: Array.isArray(properties.sourceSnippets) ? properties.sourceSnippets : [],
    mastery: asNumber(properties.mastery, 55),
    x: asNumber(properties.x, 130),
    y: asNumber(properties.y, 110),
  };
}

function edgeToGraphEdge(recordRelation) {
  const properties = recordRelation.properties || {};
  return {
    id: asText(properties.localId || recordRelation.identity?.toString?.(), "edge"),
    source: asText(properties.sourceLocalId),
    target: asText(properties.targetLocalId),
    relation: asText(properties.relation, "相关"),
    relationType: recordRelation.type || getRelationType(properties.relation),
    explanation: asText(properties.explanation, ""),
    weight: asNumber(properties.weight, 0.6),
  };
}

class KnowledgeGraphService {
  constructor(options = {}) {
    this.neo4jConfig = {
      uri: options.neo4jConfig?.uri || DEFAULT_NEO4J_URI,
      username: options.neo4jConfig?.username || DEFAULT_NEO4J_USERNAME,
      password: options.neo4jConfig?.password || DEFAULT_NEO4J_PASSWORD,
      browserUrl: options.neo4jConfig?.browserUrl || "http://localhost:7474",
    };
    this.qwenClient = options.qwenClient || new QwenClient(options.qwenClientOptions || {});
    this.driver = null;
  }

  getDriver() {
    if (!this.driver) {
      this.driver = neo4j.driver(
        this.neo4jConfig.uri,
        neo4j.auth.basic(this.neo4jConfig.username, this.neo4jConfig.password),
        { maxConnectionPoolSize: 8, connectionTimeout: 8000 },
      );
    }
    return this.driver;
  }

  async close() {
    if (!this.driver) return;
    await this.driver.close();
    this.driver = null;
  }

  async runWrite(work) {
    const session = this.getDriver().session({ defaultAccessMode: neo4j.session.WRITE });
    try {
      return await work(session);
    } finally {
      await session.close();
    }
  }

  async runRead(work) {
    const session = this.getDriver().session({ defaultAccessMode: neo4j.session.READ });
    try {
      return await work(session);
    } finally {
      await session.close();
    }
  }

  async ensureSchema() {
    await this.runWrite(async (session) => {
      await session.run("CREATE CONSTRAINT mindstudy_course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE");
      await session.run("CREATE CONSTRAINT mindstudy_document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE");
      await session.run("CREATE CONSTRAINT mindstudy_concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE");
      await session.run("CREATE CONSTRAINT mindstudy_source_chunk_id IF NOT EXISTS FOR (s:SourceChunk) REQUIRE s.id IS UNIQUE");
    });
  }

  async getStatus() {
    const driver = this.getDriver();
    await driver.verifyConnectivity();
    await this.ensureSchema();
    const result = await this.runRead((session) =>
      session.run("CALL dbms.components() YIELD name, versions RETURN name, versions[0] AS version LIMIT 1"),
    );
    const record = result.records[0];
    return {
      connected: true,
      uri: this.neo4jConfig.uri,
      browserUrl: this.neo4jConfig.browserUrl,
      username: this.neo4jConfig.username,
      name: record?.get("name") || "Neo4j",
      version: record?.get("version") || "",
    };
  }

  async generateGraphPayload(request = {}) {
    const course = normalizeCourse(request.course);
    const documents = normalizeDocuments(request.documents);
    if (!documents.length) {
      throw new Error("没有可用于生成知识图谱的资料文本。");
    }
    const response = await this.qwenClient.chat({
      messages: [
        { role: "system", content: "Return strict JSON only. You extract course knowledge graphs for MindStudy." },
        { role: "user", content: buildGraphPrompt(course, documents) },
      ],
      temperature: request.options?.temperature ?? 0.12,
      maxTokens: request.options?.maxTokens ?? 8192,
      model: request.options?.model,
    });
    const parsed = extractJsonPayload(response.content);
    if (!parsed) throw new Error("Qwen 没有返回可解析的知识图谱 JSON。");
    return {
      graph: normalizeGraphPayload(parsed, documents, "qwen"),
      quiz: parsed.quiz || { questions: [] },
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      model: response.model,
      usage: response.usage,
    };
  }

  async generateFromDocuments(request = {}) {
    const generated = await this.generateGraphPayload(request);
    const saved = await this.saveCourseGraph({
      ...request,
      graph: generated.graph,
      quiz: generated.quiz,
      recommendations: generated.recommendations,
    });
    return {
      ...generated,
      graph: saved.graph,
      saved: true,
    };
  }

  async clearCourseGraph(request = {}) {
    const course = normalizeCourse(request.course || { id: request.courseId });
    await this.ensureSchema();
    await this.runWrite(async (session) => {
      await session.run(
        `
        MATCH (course:Course {id: $courseId})
        OPTIONAL MATCH (course)-[:HAS_CONCEPT]->(concept:Concept)
        OPTIONAL MATCH (concept)-[:SUPPORTED_BY]->(chunk:SourceChunk)
        WITH collect(DISTINCT concept) AS concepts, collect(DISTINCT chunk) AS chunks
        FOREACH (item IN chunks | DETACH DELETE item)
        FOREACH (item IN concepts | DETACH DELETE item)
        `,
        { courseId: course.id },
      );
      await session.run(
        `
        MATCH (course:Course {id: $courseId})-[:HAS_DOCUMENT]->(document:Document)
        DETACH DELETE document
        `,
        { courseId: course.id },
      );
    });
    return { cleared: true, courseId: course.id };
  }

  async saveCourseGraph(request = {}) {
    const course = normalizeCourse(request.course);
    const documents = normalizeDocuments(request.documents);
    const graph = normalizeGraphPayload(request.graph || {}, documents, request.graph?.meta?.generatedBy || "local-rules");
    await this.ensureSchema();
    await this.clearCourseGraph({ course });

    await this.runWrite(async (session) => {
      await session.run(
        `
        MERGE (course:Course {id: $course.id})
        SET course.name = $course.name,
            course.description = $course.description,
            course.updatedAt = timestamp()
        WITH course
        UNWIND $documents AS document
        MERGE (doc:Document {id: document.scopedId})
        SET doc.localId = document.id,
            doc.courseId = $course.id,
            doc.title = document.title,
            doc.mimeType = document.mimeType,
            doc.extension = document.extension,
            doc.updatedAt = timestamp()
        MERGE (course)-[:HAS_DOCUMENT]->(doc)
        `,
        {
          course,
          documents: documents.map((documentMeta) => ({
            ...documentMeta,
            scopedId: scopedId(course.id, documentMeta.id),
          })),
        },
      );

      await session.run(
        `
        MATCH (course:Course {id: $courseId})
        UNWIND $nodes AS node
        MERGE (concept:Concept {id: node.scopedId})
        SET concept.localId = node.id,
            concept.courseId = $courseId,
            concept.label = node.label,
            concept.summary = node.summary,
            concept.chapter = node.chapter,
            concept.difficulty = node.difficulty,
            concept.source = node.source,
            concept.examples = node.examples,
            concept.keywords = node.keywords,
            concept.sourceSnippets = node.sourceSnippets,
            concept.mastery = node.mastery,
            concept.x = node.x,
            concept.y = node.y,
            concept.updatedAt = timestamp()
        MERGE (course)-[:HAS_CONCEPT]->(concept)
        WITH concept, node
        OPTIONAL MATCH (doc:Document {courseId: $courseId, title: node.source})
        FOREACH (_ IN CASE WHEN doc IS NULL THEN [] ELSE [1] END |
          MERGE (concept)-[:FROM_DOCUMENT]->(doc)
        )
        `,
        {
          courseId: course.id,
          nodes: graph.nodes.map((node) => ({ ...node, scopedId: scopedId(course.id, node.id) })),
        },
      );

      const chunks = graph.nodes.flatMap((node) =>
        (node.sourceSnippets || []).map((snippet, index) => ({
          id: scopedId(course.id, `chunk-${createHashId([node.id, snippet, String(index)])}`),
          conceptScopedId: scopedId(course.id, node.id),
          courseId: course.id,
          title: node.source || "课程资料",
          text: snippet,
          page: "",
        })),
      );
      if (chunks.length) {
        await session.run(
          `
          UNWIND $chunks AS chunk
          MATCH (concept:Concept {id: chunk.conceptScopedId})
          MERGE (source:SourceChunk {id: chunk.id})
          SET source.courseId = chunk.courseId,
              source.title = chunk.title,
              source.text = chunk.text,
              source.page = chunk.page,
              source.updatedAt = timestamp()
          MERGE (concept)-[:SUPPORTED_BY]->(source)
          `,
          { chunks },
        );
      }

      if (graph.edges.length) {
        const groupedEdges = new Map();
        graph.edges.forEach((edge) => {
          const relationType = RELATION_TYPES.includes(edge.relationType) ? edge.relationType : getRelationType(edge.relation);
          const list = groupedEdges.get(relationType) || [];
          list.push({
            ...edge,
            relationType,
            sourceScopedId: scopedId(course.id, edge.source),
            targetScopedId: scopedId(course.id, edge.target),
          });
          groupedEdges.set(relationType, list);
        });
        for (const [relationType, edges] of groupedEdges.entries()) {
          await session.run(
            `
            UNWIND $edges AS edge
            MATCH (source:Concept {id: edge.sourceScopedId})
            MATCH (target:Concept {id: edge.targetScopedId})
            MERGE (source)-[rel:${relationType} {localId: edge.id}]->(target)
            SET rel.courseId = $courseId,
                rel.sourceLocalId = edge.source,
                rel.targetLocalId = edge.target,
                rel.relation = edge.relation,
                rel.relationType = edge.relationType,
                rel.explanation = edge.explanation,
                rel.weight = edge.weight,
                rel.updatedAt = timestamp()
            `,
            { courseId: course.id, edges },
          );
        }
      }
    });

    return {
      saved: true,
      courseId: course.id,
      graph: await this.getCourseGraph({ courseId: course.id }),
    };
  }

  async getCourseGraph(request = {}) {
    const courseId = asText(request.courseId || request.course?.id, "default-course");
    await this.ensureSchema();
    const result = await this.runRead((session) =>
      session.run(
        `
        MATCH (:Course {id: $courseId})-[:HAS_CONCEPT]->(node:Concept)
        OPTIONAL MATCH (node)-[rel]->(target:Concept {courseId: $courseId})
        WHERE rel IS NULL OR rel.courseId = $courseId
        RETURN collect(DISTINCT node) AS nodes, collect(DISTINCT rel) AS edges
        `,
        { courseId },
      ),
    );
    const record = result.records[0];
    const nodes = (record?.get("nodes") || []).map(nodeToGraphNode);
    const edges = (record?.get("edges") || []).filter(Boolean).map(edgeToGraphEdge);
    return {
      nodes,
      edges,
      meta: {
        generatedBy: "neo4j",
        generatedAt: Date.now(),
        fallbackUsed: false,
        sourceDocuments: [],
      },
    };
  }

  async getNodeNeighborhood(request = {}) {
    const courseId = asText(request.courseId || request.course?.id, "default-course");
    const nodeId = asText(request.nodeId);
    const limit = Math.min(40, Math.max(4, asNumber(request.limit, 18)));
    if (!nodeId) throw new Error("nodeId is required.");
    await this.ensureSchema();
    const result = await this.runRead((session) =>
      session.run(
        `
        MATCH (center:Concept {id: $scopedNodeId})
        OPTIONAL MATCH (center)-[rel]-(neighbor:Concept {courseId: $courseId})
        WHERE rel IS NULL OR rel.courseId = $courseId
        RETURN collect(DISTINCT center) + collect(DISTINCT neighbor)[0..$limit] AS nodes,
               collect(DISTINCT rel) AS edges
        `,
        { courseId, scopedNodeId: scopedId(courseId, nodeId), limit: neo4j.int(limit) },
      ),
    );
    const record = result.records[0];
    return {
      nodes: (record?.get("nodes") || []).filter(Boolean).map(nodeToGraphNode),
      edges: (record?.get("edges") || []).filter(Boolean).map(edgeToGraphEdge),
    };
  }

  async searchNodes(request = {}) {
    const courseId = asText(request.courseId || request.course?.id, "default-course");
    const query = asText(request.query).toLowerCase();
    const limit = Math.min(20, Math.max(3, asNumber(request.limit, 8)));
    if (!query) return [];
    await this.ensureSchema();
    const result = await this.runRead((session) =>
      session.run(
        `
        MATCH (:Course {id: $courseId})-[:HAS_CONCEPT]->(node:Concept)
        WHERE toLower(node.label) CONTAINS $query
           OR toLower(node.summary) CONTAINS $query
           OR any(keyword IN node.keywords WHERE toLower(keyword) CONTAINS $query)
        RETURN node
        LIMIT $limit
        `,
        { courseId, query, limit: neo4j.int(limit) },
      ),
    );
    return result.records.map((record) => nodeToGraphNode(record.get("node")));
  }

  async findPath(request = {}) {
    const courseId = asText(request.courseId || request.course?.id, "default-course");
    const sourceId = asText(request.sourceId);
    const targetId = asText(request.targetId);
    if (!sourceId || !targetId) throw new Error("sourceId and targetId are required.");
    await this.ensureSchema();
    const result = await this.runRead((session) =>
      session.run(
        `
        MATCH (source:Concept {id: $sourceScopedId}), (target:Concept {id: $targetScopedId})
        MATCH path = shortestPath((source)-[:PREREQUISITE_OF|PART_OF|APPLIES_TO|CONTRASTS_WITH|CAUSES|SUPPORTED_BY|EXAMPLE_OF|EVALUATES|RELATED_TO*..4]-(target))
        RETURN nodes(path) AS nodes, relationships(path) AS edges
        LIMIT 1
        `,
        {
          sourceScopedId: scopedId(courseId, sourceId),
          targetScopedId: scopedId(courseId, targetId),
        },
      ),
    );
    const record = result.records[0];
    return {
      nodes: (record?.get("nodes") || []).map(nodeToGraphNode),
      edges: (record?.get("edges") || []).map(edgeToGraphEdge),
    };
  }
}

function createKnowledgeGraphService(options = {}) {
  return new KnowledgeGraphService(options);
}

module.exports = {
  createKnowledgeGraphService,
  normalizeGraphPayload,
  DEFAULT_NEO4J_URI,
  DEFAULT_NEO4J_USERNAME,
  DEFAULT_NEO4J_PASSWORD,
};
