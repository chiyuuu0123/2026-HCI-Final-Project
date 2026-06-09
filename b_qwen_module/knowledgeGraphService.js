"use strict";

const crypto = require("node:crypto");
const neo4j = require("neo4j-driver");
const { QwenClient } = require("./qwenClient");

const DEFAULT_NEO4J_URI = "bolt://localhost:7687";
const DEFAULT_NEO4J_USERNAME = "neo4j";
const DEFAULT_NEO4J_PASSWORD = "mindstudy-local-neo4j";
const GRAPH_TEXT_LIMIT = 28000;
const GRAPH_NODE_LIMIT = 18;

function asNumber(value, fallback = 0) {
  if (neo4j.isInt(value)) return value.toNumber();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asText(value, fallback = "") {
  return String(value == null ? fallback : value).trim();
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
      text: asText(documentMeta.text || documentMeta.content, "").slice(0, GRAPH_TEXT_LIMIT),
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
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = rawEdges
    .map((edge, index) => ({
      id: asText(edge.id, `edge-${index + 1}`),
      source: asText(edge.source || edge.from || edge.sourceId || edge.start),
      target: asText(edge.target || edge.to || edge.targetId || edge.end),
      relation: asText(edge.relation || edge.label || edge.type, "相关"),
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
    "JSON 结构如下：",
    "{",
    '  "graph": {',
    '    "nodes": [{"id":"知识点唯一中文名","label":"显示名","summary":"80字内解释","chapter":"章节","difficulty":"基础|中等|较难","source":"资料标题或页码","sourceSnippets":["原文片段"],"examples":["例子"],"keywords":["关键词"],"mastery":50}],',
    '    "edges": [{"source":"节点id","target":"节点id","relation":"前置|包含|应用|对比|评价|相关","weight":0.6}]',
    "  },",
    '  "quiz": {"questions": [{"id":"q1","topic":"节点id","type":"choice|multi|judge|short|match","difficulty":"基础|中等|较难","prompt":"题干","options":["A","B"],"answer":0,"keywords":["关键词"],"sampleAnswer":"参考答案","explanation":"解析","source":"资料出处"}]},',
    '  "recommendations": [{"topic":"节点id","title":"复习建议标题","detail":"具体建议"}]',
    "}",
    "质量要求：8-16 个节点，边不少于 6 条，覆盖定义、方法、指标、应用场景；每个节点尽量带原文片段。",
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
      maxTokens: request.options?.maxTokens ?? 3000,
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
        await session.run(
          `
          UNWIND $edges AS edge
          MATCH (source:Concept {id: edge.sourceScopedId})
          MATCH (target:Concept {id: edge.targetScopedId})
          MERGE (source)-[rel:RELATED_TO {localId: edge.id}]->(target)
          SET rel.courseId = $courseId,
              rel.sourceLocalId = edge.source,
              rel.targetLocalId = edge.target,
              rel.relation = edge.relation,
              rel.weight = edge.weight,
              rel.updatedAt = timestamp()
          `,
          {
            courseId: course.id,
            edges: graph.edges.map((edge) => ({
              ...edge,
              sourceScopedId: scopedId(course.id, edge.source),
              targetScopedId: scopedId(course.id, edge.target),
            })),
          },
        );
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
        OPTIONAL MATCH (node)-[rel:RELATED_TO]->(target:Concept {courseId: $courseId})
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
        OPTIONAL MATCH (center)-[rel:RELATED_TO]-(neighbor:Concept {courseId: $courseId})
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
        MATCH path = shortestPath((source)-[:RELATED_TO*..4]-(target))
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
