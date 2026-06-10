const STORAGE_KEY = "mindstudy.courseLibrary.v1";
const PLANNER_STORAGE_KEY = "mindstudy.planner.v1";
const APP_ZOOM_STORAGE_KEY = "mindstudy.appZoom.v1";
const APP_ZOOM_MIN = 0.75;
const APP_ZOOM_MAX = 1.4;
const APP_ZOOM_STEP = 0.05;
const LONGLONG_POSITION_STORAGE_KEY = "mindstudy.longlongPosition.v1";
const LONGLONG_DEFAULT_SPRITE = "./assets/longlong-guide.gif";
const LONGLONG_ANIMATION_SPRITES = {
  default: LONGLONG_DEFAULT_SPRITE,
  sleep: "./assets/longlong-pet/base-frame/gif/longlong-sleep.gif",
  "move-left": "./assets/longlong-pet/base-frame/gif/longlong-move-left.gif",
  "move-right": "./assets/longlong-pet/base-frame/gif/longlong-move-right.gif",
  "move-up": "./assets/longlong-pet/base-frame/gif/longlong-move-up.gif",
  touch: "./assets/longlong-pet/base-frame/gif/longlong-touch.gif",
};
const LONGLONG_SLEEP_DELAY_MS = 20000;
const LONGLONG_RAG_TEXT_LIMIT = 1600;
const LONGLONG_REMINDER_LIMIT = 3;
const LONGLONG_CHAT_AFFECTION = 2;
const LONGLONG_FALLBACK_COIN_SECONDS = 10 * 60;
const LONGLONG_THINKING_LINE = "这个问题让龙龙想一下";
const LONGLONG_ANSWER_LINE = "嘿嘿，龙龙一语道破天机啦！";
const LONGLONG_SLEEP_LINE = "龙龙要无忧地安眠了";
const LONGLONG_QUOTE_AUDIO = new Map([
  ["龙龙吞咽了太多意义，但其实生命只需要呼吸。", "./assets/longlong-voice/quote-01.wav"],
  ["你欠龙龙的眼泪太多，龙龙数不清。", "./assets/longlong-voice/quote-02.wav"],
  ["如果忧郁是一种天赋，那我龙龙将天赋异禀。", "./assets/longlong-voice/quote-03.wav"],
  ["龙龙不胖，龙龙只有两吨；", "./assets/longlong-voice/quote-04.wav"],
  ["今夜星光闪闪，我爱你的心满满！", "./assets/longlong-voice/quote-05.wav"],
  ["每只龙龙都一定会找到自己的小七哦！", "./assets/longlong-voice/quote-06.wav"],
]);
const LONGLONG_GIFT_AUDIO = new Map([
  ["谢谢你的呼吸抱枕。龙龙吞咽了太多意义，但其实生命只需要呼吸。", "./assets/longlong-voice/gift-01.wav"],
  ["这颗眼泪玻璃珠好亮。你欠龙龙的眼泪太多，龙龙数不清。", "./assets/longlong-voice/gift-02.wav"],
  ["蓝色小斗篷收到。如果忧郁是一种天赋，那我龙龙将天赋异禀。", "./assets/longlong-voice/gift-03.wav"],
  ["体重秤就放远一点。龙龙不胖，龙龙只有两吨。", "./assets/longlong-voice/gift-04.wav"],
  ["星星夜灯亮啦。今夜星光闪闪，我爱你的心满满！", "./assets/longlong-voice/gift-05.wav"],
  ["小七玩偶到龙龙怀里啦。每只龙龙都一定会找到自己的小七哦！", "./assets/longlong-voice/gift-06.wav"],
  ["奶油云朵软软的，龙龙今天也被你好好接住了。", "./assets/longlong-voice/gift-07.wav"],
  ["学习书签收到，龙龙会把你努力的这一页好好夹住。", "./assets/longlong-voice/gift-08.wav"],
]);
const LONGLONG_POKE_AUDIO = new Map([
  ["摸摸收到，龙龙继续陪你。", "./assets/longlong-voice/poke-01.wav"],
  ["嘿嘿，龙龙精神满满。", "./assets/longlong-voice/poke-02.wav"],
  ["先别跑偏，我们把这一小步做完。", "./assets/longlong-voice/poke-03.wav"],
  ["收到召唤，龙龙把注意力捡回来啦。", "./assets/longlong-voice/poke-04.wav"],
  ["摸摸可以，但这页也要读完喔。", "./assets/longlong-voice/poke-05.wav"],
  ["龙龙在岗，放心大胆问。", "./assets/longlong-voice/poke-06.wav"],
  ["嘿嘿，奖励已收到，继续冲。", "./assets/longlong-voice/poke-07.wav"],
  ["龙龙拍拍你，别急，慢慢来。", "./assets/longlong-voice/poke-08.wav"],
]);
const LONGLONG_TIP_AUDIO = new Map([
  ["先做最重要的一小步，完成后再休息。", "./assets/longlong-voice/tip-01.wav"],
  ["眼睛有点累的话，龙龙建议你看远处十秒。", "./assets/longlong-voice/tip-02.wav"],
  ["如果资料太多，就先抓标题和关键词。", "./assets/longlong-voice/tip-03.wav"],
  ["先把问题写清楚，答案就会靠近一点。", "./assets/longlong-voice/tip-04.wav"],
  ["读不动的时候，先圈出三个关键词。", "./assets/longlong-voice/tip-05.wav"],
  ["复习别贪多，今天先把一个知识点讲明白。", "./assets/longlong-voice/tip-06.wav"],
  ["卡住不是失败，是龙龙提醒你该换个角度。", "./assets/longlong-voice/tip-07.wav"],
  ["做完这一段就喝口水，龙龙给你记着。", "./assets/longlong-voice/tip-08.wav"],
  ["如果开始分心，就把下一步缩小到两分钟。", "./assets/longlong-voice/tip-09.wav"],
  ["遇到英文段落，先看术语，再看句子关系。", "./assets/longlong-voice/tip-10.wav"],
]);
const LONGLONG_SLEEP_AUDIO = new Map([
  [LONGLONG_SLEEP_LINE, "./assets/longlong-voice/sleep-01.wav"],
]);
const LONGLONG_MAIN_POKES = [...LONGLONG_POKE_AUDIO.keys()];
const LONGLONG_MAIN_TIPS = [...LONGLONG_TIP_AUDIO.keys()];
const LONGLONG_MAIN_QUOTES = [...LONGLONG_QUOTE_AUDIO.keys()];
const LONGLONG_FIXED_AUDIO = new Map([
  [LONGLONG_THINKING_LINE, "./assets/longlong-voice/ai-thinking.wav"],
  [LONGLONG_ANSWER_LINE, "./assets/longlong-voice/ai-answer.wav"],
  ...LONGLONG_POKE_AUDIO,
  ...LONGLONG_TIP_AUDIO,
  ...LONGLONG_QUOTE_AUDIO,
  ...LONGLONG_GIFT_AUDIO,
  ...LONGLONG_SLEEP_AUDIO,
]);
let longlongFixedAudio = null;

const viewTitles = {
  dashboard: "学习工作台",
  reader: "资料阅读",
  rag: "RAG 知识问答",
  coding: "阿龙在 Coding",
  planner: "TodoList",
  map: "知识图谱",
  mindmap: "思维导图",
  quiz: "自动测验",
  report: "学习报告",
  focus: "状态与音乐",
};

const nodeContent = {
  人机交互: "研究人与数字系统之间的输入、反馈、任务流程和体验质量，是本课程的中心主题。",
  可用性: "衡量系统是否易学、易用、有效率，并能让用户满意完成目标任务。",
  用户体验: "关注用户在使用产品前、中、后的整体感受，包括情绪、信任和流畅度。",
  评估方法: "用于判断交互系统是否易用、有效和令人满意。当前掌握度偏低，建议结合 SUS 量表和用户访谈一起复习。",
  "Fitts 定律": "用于描述目标大小、距离与指向操作时间之间的关系，常用于按钮和控件布局设计。",
  "SUS 量表": "一种快速评估系统可用性的问卷量表，适合在原型测试后收集主观反馈。",
  认知负荷: "表示用户理解、记忆和操作界面时承受的心理负担，过高会降低学习效率。",
  用户访谈: "通过与用户交流获取需求、痛点和真实使用感受，适合发现深层问题。",
  原型测试: "用低成本原型验证交互流程和视觉布局，帮助尽早发现设计问题。",
};

const knowledgeTopics = [
  { id: "人机交互", chapter: "导论", difficulty: "基础", baseMastery: 76, related: ["可用性", "用户体验", "认知负荷"], source: "Lecture 01 · HCI 概念框架" },
  { id: "可用性", chapter: "评估", difficulty: "基础", baseMastery: 72, related: ["评估方法", "SUS 量表", "原型测试"], source: "Lecture 05 · 可用性定义" },
  { id: "用户体验", chapter: "设计", difficulty: "中等", baseMastery: 70, related: ["用户访谈", "原型测试", "认知负荷"], source: "Lecture 03 · UX 与用户研究" },
  { id: "评估方法", chapter: "评估", difficulty: "中等", baseMastery: 46, related: ["可用性", "SUS 量表", "用户访谈"], source: "Lecture 05 · 可用性评估方法" },
  { id: "Fitts 定律", chapter: "交互模型", difficulty: "较难", baseMastery: 68, related: ["可用性", "认知负荷"], source: "Lecture 04 · 指向任务模型" },
  { id: "SUS 量表", chapter: "评估", difficulty: "中等", baseMastery: 42, related: ["评估方法", "可用性"], source: "Lecture 05 · SUS 问卷" },
  { id: "认知负荷", chapter: "认知", difficulty: "中等", baseMastery: 64, related: ["用户体验", "人机交互"], source: "Lecture 02 · 认知基础" },
  { id: "用户访谈", chapter: "用户研究", difficulty: "中等", baseMastery: 51, related: ["用户体验", "评估方法"], source: "Lecture 03 · 用户研究方法" },
  { id: "原型测试", chapter: "设计验证", difficulty: "基础", baseMastery: 58, related: ["可用性", "用户体验", "评估方法"], source: "Lecture 06 · 原型与测试" },
];

const quizBank = [
  {
    id: "q-satisfaction-choice",
    topic: "评估方法",
    type: "choice",
    difficulty: "中等",
    prompt: "下列哪一项最适合作为“满意度”的评价指标？",
    options: ["完成任务所需的平均时间", "用户主观评分和反馈", "页面加载速度", "鼠标点击次数"],
    answer: 1,
    explanation: "满意度关注用户主观感受，常通过问卷、评分、访谈反馈获得。",
  },
  {
    id: "q-sus-purpose",
    topic: "SUS 量表",
    type: "judge",
    difficulty: "基础",
    prompt: "SUS 量表适合在原型或系统试用后快速收集用户对可用性的主观评价。",
    answer: true,
    explanation: "SUS 是轻量级问卷，常用于快速比较不同版本或判断系统可用性基线。",
  },
  {
    id: "q-usability-three",
    topic: "可用性",
    type: "short",
    difficulty: "基础",
    prompt: "简述可用性评估中常见的三个核心指标。",
    keywords: ["有效", "效率", "满意"],
    sampleAnswer: "有效性、效率和满意度。",
    explanation: "有效性看目标是否完成，效率看完成成本，满意度看用户主观感受。",
  },
  {
    id: "q-method-match",
    topic: "评估方法",
    type: "match",
    difficulty: "中等",
    prompt: "将评估方法与最适合收集的信息匹配。",
    pairs: [
      ["用户访谈", "需求、痛点和真实使用感受"],
      ["可用性测试", "任务完成情况与操作问题"],
      ["SUS 量表", "快速主观可用性评分"],
    ],
    explanation: "访谈偏定性洞察，可用性测试观察任务表现，SUS 快速量化主观评价。",
  },
  {
    id: "q-fitts-choice",
    topic: "Fitts 定律",
    type: "choice",
    difficulty: "较难",
    prompt: "根据 Fitts 定律，哪种按钮更容易被快速点击？",
    options: ["离鼠标远且面积小", "离鼠标近且面积大", "颜色更深但位置更远", "文字更多但面积不变"],
    answer: 1,
    explanation: "目标越近、越大，指向操作时间通常越短。",
  },
  {
    id: "q-cognitive-load",
    topic: "认知负荷",
    type: "judge",
    difficulty: "中等",
    prompt: "界面元素越多，用户一定越容易理解系统状态。",
    answer: false,
    explanation: "过多元素会增加理解和选择成本，可能提高认知负荷。",
  },
  {
    id: "q-interview-short",
    topic: "用户访谈",
    type: "short",
    difficulty: "中等",
    prompt: "用户访谈为什么适合发现深层需求？",
    keywords: ["交流", "追问", "动机", "痛点", "真实"],
    sampleAnswer: "访谈可以通过交流和追问理解用户动机、痛点与真实使用场景。",
    explanation: "访谈不是只收集答案，更重要的是追问行为背后的原因。",
  },
  {
    id: "q-prototype-choice",
    topic: "原型测试",
    type: "choice",
    difficulty: "基础",
    prompt: "在 HCI 项目早期做低保真原型测试的主要价值是什么？",
    options: ["直接替代最终产品", "尽早以低成本发现流程和理解问题", "提高数据库性能", "生成最终报告封面"],
    answer: 1,
    explanation: "低保真原型能用较低成本验证交互流程，避免后期返工。",
  },
  {
    id: "q-ux-match",
    topic: "用户体验",
    type: "match",
    difficulty: "中等",
    prompt: "将用户体验维度与解释匹配。",
    pairs: [
      ["使用前", "期待、信任和学习成本"],
      ["使用中", "流畅度、反馈和控制感"],
      ["使用后", "满意度、记忆点和复用意愿"],
    ],
    explanation: "UX 贯穿使用前、中、后，不只等同于界面美观。",
  },
];

const STUDY_MODULE_VERSION = 2;
const GRAPH_QUALITY_MIN_NODES = 8;
const GRAPH_QUALITY_MIN_EDGES = 5;
const GRAPH_TEXT_LIMIT = 60000;
const GRAPH_NODE_LIMIT = 64;
const GRAPH_MINDMAP_BRANCH_LIMIT = 10;
const GRAPH_MINDMAP_CHILD_LIMIT = 8;
const GRAPH_DEFAULT_VIEWPORT = { x: 0, y: 0, scale: 1 };
const GRAPH_GENERATION_TIMEOUT_MS = 120000;
const GRAPH_SECONDARY_AI_TIMEOUT_MS = 90000;
const GRAPH_NOISE_LINE_PATTERN = /(ISBN|CIP|copyright|all rights reserved|seventh edition|edition|机械工业出版社|出版社|出版|印刷|版次|责任编辑|责任编|版权所有|盗版|防伪|校区|大学|学院|图书在版|编目|定价|开本|印张|字数|书名|作者|译者|封面|封底|library of congress|pearson|mcgraw|press)/i;
const GRAPH_CONCEPT_SIGNAL_PATTERN = /(是|指|表示|定义|概念|包括|分为|组成|用于|作用|特点|模型|算法|方法|系统|结构|过程|关系|约束|查询|事务|索引|范式|模式|实体|属性|完整性|并发|恢复|SQL|ER|database|relation|transaction|query|index|schema)/i;
const GRAPH_LABEL_HARD_NOISE_PATTERN = /(本书|本章|本节|本页|本版|英文版|中文版|网站|网址|第\s*\d+\s*版|第[一二三四五六七八九十]+版|pdf|\.pdf|http|www\.|目录|前言|致谢|参考文献|附录|练习题|习题|图\s*\d+|表\s*\d+|例\s*\d+|版权|出版社|作者|译者|教材|课件|文档|新课程|知识文档)/i;
const GRAPH_LABEL_FRAGMENT_PATTERN = /^(的|了|和|或|与|及|以及|并|对|由|在|从|给|为|把|将|其|这|该|这些|那些|一个|一种|本|第)\b|^(的|了|和|或|与|及|以及|并|对|由|在|从|给|为|把|将|其|这|该)|(\b(the|and|or|with|for|this|that|these|those)\b)$/i;
const GRAPH_SENTENCE_LABEL_PATTERN = /(为什么|怎么样|如何|说明|建议|给予|提出|讨论|研究领域|工作|内容|方面|来说|结论|要求|如下|如下所示|可以看到|本书中)/;
const GRAPH_GENERIC_NOISE_LABELS = new Set(["本书", "本章", "本节", "本书中", "方面", "方面由", "其内容", "内容", "工作", "结论", "要求", "目前", "研究领域", "网址"]);
const GRAPH_GENERATION_STEPS = {
  idle: { title: "等待生成", detail: "导入资料后可用 Qwen / 本地规则生成课程图谱和题目。", progress: 0 },
  extracting: { title: "正在整理资料", detail: "提取 PDF / Markdown 文本，准备生成课程知识结构。", progress: 18 },
  ai: { title: LONGLONG_THINKING_LINE, detail: "龙龙正在生成结构化知识图谱和题目 JSON。", progress: 56 },
  validating: { title: "正在校验结果", detail: "检查节点、边、题目、出处和薄弱知识点。", progress: 76 },
  done: { title: "生成完成", detail: "知识图谱、自动题组、错题本和报告已准备好。", progress: 100 },
  fallback: { title: "已使用本地兜底", detail: "外部生成不可用，已根据资料标题、关键词和内置题库生成稳定演示内容。", progress: 100 },
  error: { title: "生成遇到问题", detail: "请检查资料文本或稍后重试，当前会保留已有学习数据。", progress: 100 },
};
let graphGenerationRunId = 0;

const defaultGraphPositions = {
  人机交互: { x: 460, y: 300 },
  可用性: { x: 250, y: 180 },
  用户体验: { x: 680, y: 190 },
  评估方法: { x: 660, y: 430 },
  "Fitts 定律": { x: 240, y: 470 },
  "SUS 量表": { x: 820, y: 315 },
  认知负荷: { x: 450, y: 95 },
  用户访谈: { x: 460, y: 565 },
  原型测试: { x: 105, y: 325 },
};

const title = document.querySelector("#view-title");
const navItems = document.querySelectorAll("[data-view]");
const panels = document.querySelectorAll("[data-view-panel]");
const readerPanels = {
  library: document.querySelector(".chapter-panel"),
  document: document.querySelector(".document-panel"),
  insight: document.querySelector(".insight-panel"),
};

const runtimeFiles = new Map();
const documentState = {
  current: null,
};
const supportedDocumentExtensions = new Set(["PDF", "MD"]);
const PDF_TEXT_LIMIT = 60000;
const PDF_PAGE_TEXT_LIMIT = 8000;
const PDF_AI_PAGE_TEXT_LIMIT = 5000;
const PDF_OCR_LANGUAGES = ["eng", "chi_sim"];
const PDF_OCR_RENDER_SCALE = 1.8;
const PDF_OCR_MAX_CANVAS_SIDE = 2200;
const PDF_OCR_AUTO_MAX_PAGES = 8;
const AI_CONTEXT_TEXT_LIMIT = 12000;
const AI_READING_TEXT_LIMIT = 8000;
const RAG_KNOWLEDGE_TEXT_LIMIT = 240000;
const RAG_DEFAULT_CHUNK_SIZE = 1400;
const RAG_DEFAULT_MAX_CHUNKS = 6;
const RAG_MIN_CHUNK_SIZE = 500;
const RAG_MAX_CHUNK_SIZE = 4000;
const RAG_MIN_MAX_CHUNKS = 2;
const RAG_MAX_MAX_CHUNKS = 12;
const VOICE_COMMAND_MAX_RECORDING_MS = 14000;
const VOICE_COMMAND_MIN_RECORDING_MS = 500;
const VOICE_COMMAND_SILENCE_GRACE_MS = 900;
const VOICE_COMMAND_MONITOR_INTERVAL_MS = 120;
const VOICE_COMMAND_SPEECH_THRESHOLD = 0.018;
const VOICE_COMMAND_DUPLICATE_WINDOW_MS = 1800;
const VOICE_COMMAND_TRANSCRIBE_PROMPT = "这是一段中文语音控制指令，可能包含打开资料、切换页面、学习资料、生成知识图谱等操作。请只输出用户说的话。";
const cameraState = {
  stream: null,
  sampleTimer: null,
  canvas: null,
  lastBrightness: 0,
  visionReady: false,
  visionError: "",
  visionInFlight: false,
  lastVisionResultAt: 0,
  mouse: {
    x: 0,
    y: 0,
    visible: false,
    lastClickAt: 0,
    lastScrollY: null,
    lastScrollAt: 0,
  },
};
const gestureRuntimeConfig = {
  visionFrameIntervalMs: 180,
  showVisionLandmarks: false,
};
const pdfInkState = {
  enabled: false,
  tool: "pen",
  color: "#188f84",
  width: 4,
  currentStroke: null,
  pointerId: null,
  activeCanvas: null,
};
const pdfImagePlacementState = {
  current: null,
  pointerId: null,
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0,
};

let workspace = loadWorkspace();
let plannerState = loadPlannerState();
let pdfJsLoadingPromise = null;
let pdfPageObserver = null;
let pdfLazyRenderObserver = null;
let pdfRenderToken = 0;
let pdfPageTextTimer = null;
let pdfReaderResizeRenderTimer = null;
let appZoom = loadAppZoom();
let appZoomToastTimer = null;
let longlongSnapshotCache = "";
let longlongPosition = loadLonglongPosition();
let studyTimerSnapshot = {
  seconds: 0,
  formatted: "00:00:00",
  label: "今日学习 00:00:00",
  dailySeconds: {},
};
let longlongBondState = {
  affection: 0,
  coins: 0,
  gifted: {},
  level: {
    name: "初识",
    detail: "龙龙刚刚探头",
    progress: 0,
    nextName: "熟悉",
    nextThreshold: 20,
  },
  coinRule: {
    secondsPerCoin: LONGLONG_FALLBACK_COIN_SECONDS,
    dailyCoinCap: 18,
  },
  giftCatalog: [],
};
const longlongState = {
  expanded: false,
  giftOpen: false,
  chatOpen: false,
  mood: "等待摄像头",
  moodDetail: "我会结合状态识别和音乐建议提醒你。",
  focusScore: "--",
  music: "白噪音 + 轻钢琴，适合继续专注阅读。",
  ragAnswer: "RAG 向量接口已预留，后续接入资料库向量检索后会在这里回答。",
};
let longlongBondNoticeTimer = null;
let longlongCoinSyncKey = "";
let longlongBubbleTimer = null;
let longlongActionsHideTimer = null;
let longlongMainChatHistory = [];
const longlongDragState = {
  active: false,
  moved: false,
  suppressToggle: false,
  pointerId: null,
  mode: "",
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0,
};
let longlongSpriteState = "default";
let longlongSpriteRestoreTimer = null;
let longlongSleepTimer = null;
const voiceCommandState = {
  open: false,
  listening: false,
  recording: false,
  recognizing: false,
  mediaRecorder: null,
  stream: null,
  audioContext: null,
  audioSource: null,
  analyser: null,
  audioLevelData: null,
  chunks: [],
  stopTimer: null,
  monitorTimer: null,
  sessionId: 0,
  recordingStartedAt: 0,
  lastSpeechAt: 0,
  hasSpeech: false,
  cancelCurrentRecording: false,
  lastExecutedTranscript: "",
  lastExecutedAt: 0,
};
const graphPanState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startViewportX: 0,
  startViewportY: 0,
};
const graphNodeDragState = {
  active: false,
  pointerId: null,
  nodeId: "",
  moved: false,
  startX: 0,
  startY: 0,
  startNodeX: 0,
  startNodeY: 0,
};

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function withLonglongAnswerLine(markdown) {
  const content = String(markdown || "AI 没有返回内容。").trim();
  if (content.startsWith(LONGLONG_ANSWER_LINE)) return content;
  return `${LONGLONG_ANSWER_LINE}\n\n${content}`;
}

function playLonglongFixedLine(line) {
  const source = LONGLONG_FIXED_AUDIO.get(line);
  if (!source) return;

  if (longlongFixedAudio) {
    longlongFixedAudio.pause();
    longlongFixedAudio.src = "";
  }

  longlongFixedAudio = new Audio(source);
  longlongFixedAudio.volume = 0.92;
  longlongFixedAudio.play().catch(() => {});
}

function playLonglongThinkingLine() {
  playLonglongFixedLine(LONGLONG_THINKING_LINE);
}

function playLonglongAnswerLine() {
  playLonglongFixedLine(LONGLONG_ANSWER_LINE);
}

function clampAppZoom(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 1;
  return Math.min(APP_ZOOM_MAX, Math.max(APP_ZOOM_MIN, numericValue));
}

function normalizeAppZoom(value) {
  return Math.round(clampAppZoom(value) * 100) / 100;
}

function loadAppZoom() {
  try {
    const storedZoom = Number(localStorage.getItem(APP_ZOOM_STORAGE_KEY));
    return normalizeAppZoom(storedZoom || 1);
  } catch (error) {
    return 1;
  }
}

function saveAppZoom() {
  try {
    localStorage.setItem(APP_ZOOM_STORAGE_KEY, String(appZoom));
  } catch (error) {
    // 缩放只是体验增强，存储失败时保持本次会话可用即可。
  }
}

function showAppZoomIndicator() {
  let indicator = document.querySelector(".app-zoom-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = "app-zoom-indicator";
    document.body.appendChild(indicator);
  }

  indicator.textContent = `${Math.round(appZoom * 100)}%`;
  indicator.classList.add("show");
  window.clearTimeout(appZoomToastTimer);
  appZoomToastTimer = window.setTimeout(() => {
    indicator.classList.remove("show");
  }, 820);
}

function applyAppZoom({ persist = false, announce = false, rerenderReader = false } = {}) {
  document.documentElement.style.setProperty("--app-zoom", appZoom.toFixed(2));
  document.documentElement.dataset.appZoom = String(Math.round(appZoom * 100));

  if (typeof window.mindStudy?.setZoomFactor === "function") {
    document.documentElement.classList.remove("css-app-zoom");
    window.mindStudy.setZoomFactor(appZoom);
  } else {
    document.documentElement.classList.add("css-app-zoom");
  }

  if (persist) saveAppZoom();
  if (announce) showAppZoomIndicator();
  if (rerenderReader) rerenderCurrentPdfAfterReaderResize(90);
}

function setAppZoom(nextZoom, options = {}) {
  const normalizedZoom = normalizeAppZoom(nextZoom);
  if (Math.abs(normalizedZoom - appZoom) < 0.001 && !options.announce) return;

  appZoom = normalizedZoom;
  applyAppZoom(options);
}

function handleAppZoomWheel(event) {
  if (!event.ctrlKey) return;

  event.preventDefault();
  const direction = event.deltaY > 0 ? -1 : 1;
  setAppZoom(appZoom + direction * APP_ZOOM_STEP, {
    persist: true,
    announce: true,
    rerenderReader: true,
  });
}

function getLonglongElements() {
  return {
    root: document.querySelector("#longlong-assistant"),
    avatar: document.querySelector(".longlong-avatar"),
    avatarImage: document.querySelector(".longlong-avatar img"),
    panel: document.querySelector("#longlong-panel"),
    actions: document.querySelector(".longlong-actions"),
    bubble: document.querySelector("#longlong-bubble"),
    studyTimePill: document.querySelector("#longlong-time-pill"),
    coins: document.querySelector("#longlong-coins"),
    chatPopover: document.querySelector("#longlong-chat-popover"),
    chatList: document.querySelector("#longlong-chat-list"),
    chatInput: document.querySelector("#longlong-chat-input"),
    giftPopover: document.querySelector("#longlong-gift-popover"),
    bondLevel: document.querySelector("#longlong-bond-level"),
    bondDetail: document.querySelector("#longlong-bond-detail"),
    bondPoints: document.querySelector("#longlong-bond-points"),
    bondProgress: document.querySelector("#longlong-bond-progress-bar"),
    bondNote: document.querySelector("#longlong-bond-note"),
    giftRule: document.querySelector("#longlong-gift-rule"),
    giftShop: document.querySelector("#longlong-gift-shop"),
    inventory: document.querySelector("#longlong-inventory"),
  };
}

function pickLonglongItem(items = []) {
  return items[Math.floor(Math.random() * items.length)] || "";
}

function setLonglongBubbleText(text, { temporary = true } = {}) {
  const elements = getLonglongElements();
  if (!elements.bubble || !text) return;
  window.clearTimeout(longlongBubbleTimer);
  elements.bubble.textContent = text;
  if (temporary) {
    longlongBubbleTimer = window.setTimeout(() => {
      longlongBubbleTimer = null;
      syncLonglongAssistant();
    }, 4200);
  }
}

function setLonglongActionsVisible(visible) {
  window.clearTimeout(longlongActionsHideTimer);
  const elements = getLonglongElements();
  elements.root?.classList.toggle("actions-visible", Boolean(visible));
}

function scheduleLonglongActionsHide(delay = 120) {
  window.clearTimeout(longlongActionsHideTimer);
  longlongActionsHideTimer = window.setTimeout(() => {
    setLonglongActionsVisible(false);
  }, delay);
}

function hideLonglongActions() {
  setLonglongActionsVisible(false);
  const activeElement = document.activeElement;
  if (activeElement?.closest?.(".longlong-actions")) {
    activeElement.blur();
  }
}

function initLonglongActionHover() {
  const elements = getLonglongElements();
  const targets = [elements.avatar, elements.actions].filter(Boolean);

  targets.forEach((target) => {
    target.addEventListener("pointerenter", () => setLonglongActionsVisible(true));
    target.addEventListener("pointerleave", () => scheduleLonglongActionsHide());
  });
}

function positionLonglongPopover(popover) {
  const elements = getLonglongElements();
  if (!popover || popover.hidden) return;

  popover.style.maxHeight = `${Math.max(220, window.innerHeight - 32)}px`;
  popover.style.left = "";
  popover.style.top = "";

  const anchorRect = elements.avatar?.getBoundingClientRect() || elements.root?.getBoundingClientRect();
  if (!anchorRect) return;

  const margin = 16;
  const rect = popover.getBoundingClientRect();
  const width = Math.min(rect.width || 320, window.innerWidth - margin * 2);
  const height = Math.min(rect.height || 360, window.innerHeight - margin * 2);
  const preferredLeft = anchorRect.left + anchorRect.width / 2 - width / 2;
  const preferredTop = anchorRect.top - height - 12;
  const fallbackTop = anchorRect.bottom + 12;
  const top = preferredTop >= margin ? preferredTop : Math.min(fallbackTop, window.innerHeight - height - margin);
  const left = Math.min(window.innerWidth - width - margin, Math.max(margin, preferredLeft));

  popover.style.width = `${width}px`;
  popover.style.maxHeight = `${height}px`;
  popover.style.left = `${left}px`;
  popover.style.top = `${Math.max(margin, top)}px`;
}

function positionOpenLonglongPopovers() {
  const elements = getLonglongElements();
  positionLonglongPopover(elements.giftPopover);
  positionLonglongPopover(elements.chatPopover);
}

function setLonglongGiftPopover(open) {
  longlongState.giftOpen = Boolean(open);
  const elements = getLonglongElements();
  elements.root?.classList.toggle("gift-open", longlongState.giftOpen);
  if (elements.giftPopover) elements.giftPopover.hidden = !longlongState.giftOpen;
  if (longlongState.giftOpen) {
    setLonglongChatPopover(false);
    setLonglongExpanded(true);
    renderLonglongBondState();
    window.requestAnimationFrame(() => positionLonglongPopover(elements.giftPopover));
  }
}

function setLonglongChatPopover(open) {
  longlongState.chatOpen = Boolean(open);
  const elements = getLonglongElements();
  elements.root?.classList.toggle("chat-open", longlongState.chatOpen);
  if (elements.chatPopover) elements.chatPopover.hidden = !longlongState.chatOpen;
  if (longlongState.chatOpen) {
    setLonglongGiftPopover(false);
    setLonglongExpanded(true);
    window.setTimeout(() => elements.chatInput?.focus(), 60);
    window.requestAnimationFrame(() => positionLonglongPopover(elements.chatPopover));
  }
}

function addLonglongChatMessage(role, content, options = {}) {
  const elements = getLonglongElements();
  if (!elements.chatList) return null;
  const message = document.createElement("article");
  message.className = `longlong-chat-message ${role}`;
  message.innerHTML = `
    ${role === "assistant" ? '<img src="./assets/longlong-guide.gif" alt="" draggable="false" />' : ""}
    <div>
      ${renderAiMarkdown(String(content || ""))}
      ${options.meta ? `<small>${escapeHtml(options.meta)}</small>` : ""}
    </div>
  `;
  elements.chatList.append(message);
  elements.chatList.scrollTop = elements.chatList.scrollHeight;
  return message;
}

function updateLonglongChatMessage(message, content, options = {}) {
  const elements = getLonglongElements();
  if (!message) return;
  const body = message.querySelector("div");
  if (!body) return;
  body.innerHTML = `
    ${renderAiMarkdown(String(content || ""))}
    ${options.meta ? `<small>${escapeHtml(options.meta)}</small>` : ""}
  `;
  if (elements.chatList) elements.chatList.scrollTop = elements.chatList.scrollHeight;
}

function formatStudyDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const restSeconds = seconds % 60;

  return [hours, minutes, restSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function normalizeStudyTimerSnapshot(snapshot = {}) {
  const seconds = Math.max(0, Math.floor(Number(snapshot.seconds) || 0));
  const dailySeconds = snapshot.dailySeconds && typeof snapshot.dailySeconds === "object"
    ? Object.fromEntries(
        Object.entries(snapshot.dailySeconds)
          .map(([dateKey, value]) => [dateKey, Math.max(0, Math.floor(Number(value) || 0))])
          .filter(([dateKey]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey)),
      )
    : {};
  const formatted = typeof snapshot.formatted === "string" && snapshot.formatted
    ? snapshot.formatted
    : formatStudyDuration(seconds);
  if (snapshot.date) dailySeconds[snapshot.date] = seconds;

  return {
    ...snapshot,
    seconds,
    dailySeconds,
    formatted,
    label: snapshot.label || `今日学习 ${formatted}`,
  };
}

function renderStudyTimerSnapshot() {
  const elements = getLonglongElements();
  const dashboardStudyTime = document.querySelector("#dashboard-study-time");
  const dashboardStudyNote = document.querySelector("#dashboard-study-note");

  if (elements.studyTime) elements.studyTime.textContent = studyTimerSnapshot.formatted;
  if (elements.studyTimePill) elements.studyTimePill.textContent = `今日 ${studyTimerSnapshot.formatted}`;
  if (dashboardStudyTime) dashboardStudyTime.textContent = studyTimerSnapshot.formatted;
  if (dashboardStudyNote) dashboardStudyNote.textContent = `已累计 ${formatStudyDurationText(studyTimerSnapshot.seconds)}`;
}

function normalizeLonglongBondSnapshot(snapshot = {}) {
  const level = snapshot.level && typeof snapshot.level === "object" ? snapshot.level : {};
  const coinRule = snapshot.coinRule && typeof snapshot.coinRule === "object" ? snapshot.coinRule : {};
  return {
    affection: Math.max(0, Math.floor(Number(snapshot.affection) || 0)),
    coins: Math.max(0, Math.floor(Number(snapshot.coins) || 0)),
    gifted: snapshot.gifted && typeof snapshot.gifted === "object" ? snapshot.gifted : {},
    level: {
      name: level.name || "初识",
      detail: level.detail || "龙龙刚刚探头",
      progress: Math.min(100, Math.max(0, Math.floor(Number(level.progress) || 0))),
      nextName: level.nextName || "",
      nextThreshold: Math.max(0, Math.floor(Number(level.nextThreshold) || 0)),
      isMax: Boolean(level.isMax),
    },
    coinRule: {
      secondsPerCoin: Math.max(60, Math.floor(Number(coinRule.secondsPerCoin) || LONGLONG_FALLBACK_COIN_SECONDS)),
      dailyCoinCap: Math.max(1, Math.floor(Number(coinRule.dailyCoinCap) || 18)),
    },
    giftCatalog: Array.isArray(snapshot.giftCatalog) ? snapshot.giftCatalog : [],
  };
}

function setLonglongBondState(snapshot = {}) {
  longlongBondState = normalizeLonglongBondSnapshot(snapshot);
  renderLonglongBondState();
}

function getSafeLucideIcon(icon) {
  const value = String(icon || "gift").trim();
  return /^[a-z0-9-]+$/i.test(value) ? value : "gift";
}

function renderLonglongGiftShop(elements = getLonglongElements()) {
  if (!elements.giftShop) return;
  const gifts = longlongBondState.giftCatalog || [];
  elements.giftShop.innerHTML = gifts.length
    ? gifts
        .map((gift) => {
          const price = Math.max(0, Math.floor(Number(gift.price) || 0));
          const affection = Math.max(0, Math.floor(Number(gift.affection) || 0));
          const canBuy = longlongBondState.coins >= price;
          return `
            <article class="longlong-gift-row">
              <span class="longlong-gift-icon"><i data-lucide="${getSafeLucideIcon(gift.icon)}"></i></span>
              <div class="longlong-gift-copy">
                <strong>${escapeHtml(gift.name || "神秘礼物")}</strong>
                <span>${price} 龙币 · +${affection} 好感</span>
              </div>
              <button type="button" data-longlong-gift="${escapeHtml(gift.id)}" ${canBuy ? "" : "disabled"}>赠送</button>
            </article>
          `;
        })
        .join("")
    : `<p class="longlong-bond-note">龙龙商城准备中。</p>`;
  window.lucide?.createIcons();
}

function renderLonglongInventory(elements = getLonglongElements()) {
  if (!elements.inventory) return;
  const gifts = longlongBondState.giftCatalog || [];
  const owned = gifts
    .map((gift) => ({
      name: gift.name,
      count: Math.max(0, Math.floor(Number(longlongBondState.gifted?.[gift.id]) || 0)),
    }))
    .filter((gift) => gift.count > 0);
  elements.inventory.textContent = owned.length
    ? `已送：${owned.map((gift) => `${gift.name} x${gift.count}`).join("、")}`
    : "还没有送礼。";
}

function renderLonglongBondState() {
  const elements = getLonglongElements();
  const level = longlongBondState.level || {};
  const secondsPerCoin = longlongBondState.coinRule?.secondsPerCoin || LONGLONG_FALLBACK_COIN_SECONDS;

  if (elements.coins) elements.coins.textContent = `${longlongBondState.coins} 龙币`;
  if (elements.bondLevel) elements.bondLevel.textContent = level.name || "初识";
  if (elements.bondDetail) elements.bondDetail.textContent = level.detail || "龙龙刚刚探头";
  if (elements.bondPoints) elements.bondPoints.textContent = `${longlongBondState.affection} 好感`;
  if (elements.bondProgress) elements.bondProgress.style.width = `${level.progress || 0}%`;
  if (elements.giftRule) elements.giftRule.textContent = `${formatStudyDurationText(secondsPerCoin)} / 1 龙币`;
  if (elements.bondNote && !longlongBondNoticeTimer) {
    elements.bondNote.textContent = level.isMax
      ? "龙龙已经找到自己的小七啦。"
      : `距 ${level.nextName || "下一阶段"} 还需要 ${Math.max(0, (level.nextThreshold || 0) - longlongBondState.affection)} 好感。`;
  }
  renderLonglongGiftShop(elements);
  renderLonglongInventory(elements);
  if (longlongState.giftOpen) {
    window.requestAnimationFrame(() => positionLonglongPopover(elements.giftPopover));
  }
}

function showLonglongBondNotice(text) {
  const elements = getLonglongElements();
  if (!text) return;
  setLonglongBubbleText(text);
  if (!elements.bondNote) return;
  window.clearTimeout(longlongBondNoticeTimer);
  elements.bondNote.textContent = text;
  longlongBondNoticeTimer = window.setTimeout(() => {
    longlongBondNoticeTimer = null;
    renderLonglongBondState();
  }, 3600);
}

async function syncLonglongStudyCoins() {
  if (!window.mindStudy?.claimLonglongStudyCoins) return;
  const secondsPerCoin = longlongBondState.coinRule?.secondsPerCoin || LONGLONG_FALLBACK_COIN_SECONDS;
  const dateKey = studyTimerSnapshot.date || getTodayDateKey();
  const earnedBlock = Math.floor(Math.max(0, studyTimerSnapshot.seconds || 0) / secondsPerCoin);
  const syncKey = `${dateKey}:${earnedBlock}`;
  if (syncKey === longlongCoinSyncKey) return;
  longlongCoinSyncKey = syncKey;

  try {
    const snapshot = await window.mindStudy.claimLonglongStudyCoins({
      seconds: studyTimerSnapshot.seconds,
      date: dateKey,
    });
    setLonglongBondState(snapshot);
    if (snapshot?.claimedCoins > 0) {
      showLonglongBondNotice(`学习奖励 +${snapshot.claimedCoins} 龙币，龙龙记账成功。`);
    }
  } catch (error) {
    // 好感度奖励失败不影响学习计时继续运行。
  }
}

async function initLonglongBond() {
  try {
    const snapshot = await window.mindStudy?.getLonglongBond?.();
    if (snapshot) setLonglongBondState(snapshot);
  } catch (error) {
    renderLonglongBondState();
  }

  window.mindStudy?.onLonglongBondUpdate?.((snapshot) => {
    setLonglongBondState(snapshot);
  });
  syncLonglongStudyCoins();
}

async function addLonglongChatAffection(amount = LONGLONG_CHAT_AFFECTION) {
  if (!window.mindStudy?.addLonglongAffection) return;
  try {
    const snapshot = await window.mindStudy.addLonglongAffection({
      amount,
      reason: "chat",
    });
    setLonglongBondState(snapshot);
    showLonglongBondNotice(`聊天好感 +${amount}，龙龙偷偷开心了一下。`);
  } catch (error) {
    // 聊天加好感失败不影响问答结果。
  }
}

async function sendLonglongGift(giftId) {
  if (!window.mindStudy?.buyLonglongGift) return;

  try {
    const result = await window.mindStudy.buyLonglongGift(giftId);
    if (result?.snapshot) setLonglongBondState(result.snapshot);

    if (!result?.ok) {
      if (result?.reason === "insufficient-coins") {
        showLonglongBondNotice(`龙币还差 ${result.missingCoins}，龙龙先帮你存进愿望单。`);
      } else {
        showLonglongBondNotice("这个礼物龙龙暂时收不到。");
      }
      return;
    }

    playLonglongSprite("touch", 1500);
    updateLonglongMood(`好感度 +${result.gainedAffection}`, result.gift.line);
    playLonglongFixedLine(result.gift.line);
    setLonglongBubbleText(result.gift.line);
    const elements = getLonglongElements();
    if (elements.bondNote) {
      elements.bondNote.textContent = `${result.gift.name} 已送出，好感 +${result.gainedAffection}。`;
    }
  } catch (error) {
    showLonglongBondNotice("送礼失败了，龙龙把爪爪先收回来。");
  }
}

function applyStudyTimerSnapshot(snapshot) {
  studyTimerSnapshot = normalizeStudyTimerSnapshot(snapshot);
  renderStudyTimerSnapshot();
  syncLonglongStudyCoins();
  renderPlannerCalendar();
}

function startStudyTimerFallback() {
  const startedAt = Date.now();
  applyStudyTimerSnapshot({ seconds: 0 });

  window.setInterval(() => {
    applyStudyTimerSnapshot({
      seconds: Math.floor((Date.now() - startedAt) / 1000),
    });
  }, 1000);
}

async function initStudyTimer() {
  if (!window.mindStudy?.getStudyTimer) {
    startStudyTimerFallback();
    return;
  }

  try {
    applyStudyTimerSnapshot(await window.mindStudy.getStudyTimer());
  } catch (error) {
    applyStudyTimerSnapshot({ seconds: 0 });
  }

  window.mindStudy?.onStudyTimerUpdate?.(applyStudyTimerSnapshot);
}

function loadLonglongPosition() {
  try {
    const stored = JSON.parse(localStorage.getItem(LONGLONG_POSITION_STORAGE_KEY));
    if (Number.isFinite(stored?.left) && Number.isFinite(stored?.top)) {
      return {
        left: stored.left,
        top: stored.top,
      };
    }
  } catch (error) {
    localStorage.removeItem(LONGLONG_POSITION_STORAGE_KEY);
  }

  return null;
}

function saveLonglongPosition() {
  if (!longlongPosition) return;
  try {
    localStorage.setItem(LONGLONG_POSITION_STORAGE_KEY, JSON.stringify(longlongPosition));
  } catch (error) {
    // 位置记忆失败不影响龙龙本次拖拽使用。
  }
}

function clampLonglongPosition(left, top, root = getLonglongElements().root) {
  const margin = 8;
  const width = root?.offsetWidth || 190;
  const height = root?.offsetHeight || 128;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(margin, window.innerHeight - height - margin);

  return {
    left: Math.min(maxLeft, Math.max(margin, left)),
    top: Math.min(maxTop, Math.max(margin, top)),
  };
}

function applyLonglongPosition() {
  const root = getLonglongElements().root;
  if (!root) return;

  if (!longlongPosition) {
    root.style.left = "";
    root.style.top = "";
    root.style.right = "";
    root.style.bottom = "";
    return;
  }

  longlongPosition = clampLonglongPosition(longlongPosition.left, longlongPosition.top, root);
  root.style.left = `${longlongPosition.left}px`;
  root.style.top = `${longlongPosition.top}px`;
  root.style.right = "auto";
  root.style.bottom = "auto";
}

function setLonglongExpanded(expanded) {
  longlongState.expanded = Boolean(expanded);
  getLonglongElements().root?.classList.toggle("expanded", longlongState.expanded);
  if (!longlongState.expanded) {
    setLonglongGiftPopover(false);
    setLonglongChatPopover(false);
  }
  window.requestAnimationFrame(applyLonglongPosition);
}

function toggleLonglongPanel() {
  setLonglongExpanded(!longlongState.expanded);
}

function setLonglongSpriteState(state = "default") {
  const nextState = LONGLONG_ANIMATION_SPRITES[state] ? state : "default";
  const nextSource = LONGLONG_ANIMATION_SPRITES[nextState];
  const elements = getLonglongElements();
  longlongSpriteState = nextState;

  if (elements.avatarImage && elements.avatarImage.getAttribute("src") !== nextSource) {
    elements.avatarImage.setAttribute("src", nextSource);
  }

  elements.root?.classList.toggle("asset-motion", nextState !== "default");
  if (elements.root) elements.root.dataset.spriteState = nextState;
}

function enterLonglongSleep() {
  window.clearTimeout(longlongSleepTimer);
  window.clearTimeout(longlongSpriteRestoreTimer);
  setLonglongGiftPopover(false);
  setLonglongChatPopover(false);
  longlongState.expanded = false;
  getLonglongElements().root?.classList.remove("expanded");
  setLonglongSpriteState("sleep");
  setLonglongBubbleText(LONGLONG_SLEEP_LINE, { temporary: false });
  playLonglongFixedLine(LONGLONG_SLEEP_LINE);
}

function scheduleLonglongSleep() {
  window.clearTimeout(longlongSleepTimer);
  longlongSleepTimer = window.setTimeout(() => {
    enterLonglongSleep();
  }, LONGLONG_SLEEP_DELAY_MS);
}

function resetLonglongActivity() {
  window.clearTimeout(longlongSleepTimer);
  if (longlongSpriteState === "sleep") {
    setLonglongSpriteState("default");
  }
  scheduleLonglongSleep();
}

function playLonglongSprite(state, duration = 1300) {
  window.clearTimeout(longlongSleepTimer);
  window.clearTimeout(longlongSpriteRestoreTimer);
  setLonglongSpriteState(state);
  longlongSpriteRestoreTimer = window.setTimeout(() => {
    setLonglongSpriteState("default");
    scheduleLonglongSleep();
  }, duration);
}

function getLonglongMoveSprite(deltaX, deltaY) {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX < 0 ? "move-left" : "move-right";
  }

  return "move-up";
}

function beginLonglongDrag(event, mode = "pointer") {
  const avatar = event.target.closest?.(".longlong-avatar");
  const root = getLonglongElements().root;
  if (!avatar || !root) return;

  const rect = root.getBoundingClientRect();
  longlongDragState.active = true;
  longlongDragState.moved = false;
  longlongDragState.pointerId = event.pointerId ?? "mouse";
  longlongDragState.mode = mode;
  longlongDragState.startX = event.clientX;
  longlongDragState.startY = event.clientY;
  longlongDragState.startLeft = rect.left;
  longlongDragState.startTop = rect.top;
  root.classList.add("dragging");
  resetLonglongActivity();
  if (event.pointerId !== undefined) avatar.setPointerCapture?.(event.pointerId);
}

function updateLonglongDrag(event) {
  const pointerId = event.pointerId ?? "mouse";
  if (!longlongDragState.active || pointerId !== longlongDragState.pointerId) return;

  event.preventDefault?.();
  const deltaX = event.clientX - longlongDragState.startX;
  const deltaY = event.clientY - longlongDragState.startY;
  if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
    longlongDragState.moved = true;
    event.preventDefault?.();
    window.clearTimeout(longlongSleepTimer);
    window.clearTimeout(longlongSpriteRestoreTimer);
    setLonglongSpriteState(getLonglongMoveSprite(deltaX, deltaY));
  }

  longlongPosition = clampLonglongPosition(
    longlongDragState.startLeft + deltaX,
    longlongDragState.startTop + deltaY,
  );
  applyLonglongPosition();
}

function finishLonglongDrag(event) {
  const pointerId = event.pointerId ?? "mouse";
  if (!longlongDragState.active || pointerId !== longlongDragState.pointerId) return;

  const root = getLonglongElements().root;
  root?.classList.remove("dragging");
  if (longlongDragState.moved) {
    longlongDragState.suppressToggle = true;
    saveLonglongPosition();
    playLonglongSprite("default", 180);
    window.setTimeout(() => {
      longlongDragState.suppressToggle = false;
    }, 80);
  } else {
    scheduleLonglongSleep();
  }

  longlongDragState.active = false;
  longlongDragState.pointerId = null;
  longlongDragState.mode = "";
}

function beginLonglongMouseDrag(event) {
  if (event.button !== 0) return;
  beginLonglongDrag(event, "mouse");
}

function updateLonglongMouseDrag(event) {
  if (longlongDragState.mode !== "mouse") return;
  updateLonglongDrag(event);
}

function finishLonglongMouseDrag(event) {
  if (longlongDragState.mode !== "mouse") return;
  finishLonglongDrag(event);
}

function handleLonglongKeyboardToggle(event) {
  if (!event.target.closest?.(".longlong-avatar")) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleLonglongAction("poke");
}

function getTodayDateKey() {
  return toPlannerDateKey(new Date());
}

function formatLonglongDate(dateKey) {
  if (!dateKey) return "未排期";
  const today = getTodayDateKey();
  if (dateKey === today) return "今天";
  return dateKey.slice(5).replace("-", ".");
}

function getLonglongTodoReminders() {
  return (plannerState.items || [])
    .filter((item) => item.status !== "done")
    .sort((a, b) => Number(b.importance) - Number(a.importance) || Number(a.progress || 0) - Number(b.progress || 0))
    .slice(0, 2)
    .map((item) => ({
      type: "todo",
      title: item.title,
      detail: `${getPlannerStatusMeta(item.status).label} · ${item.progress || 0}% · ${item.importance || 0} 星`,
    }));
}

function getLonglongEventReminders() {
  const today = getTodayDateKey();
  return (plannerState.events || [])
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2)
    .map((event) => ({
      type: "event",
      title: event.title,
      detail: `${formatLonglongDate(event.date)} · ${event.type}`,
    }));
}

function getLonglongReminders() {
  return [...getLonglongEventReminders(), ...getLonglongTodoReminders()].slice(0, LONGLONG_REMINDER_LIMIT);
}

function getLonglongReminderText(reminders = getLonglongReminders()) {
  if (!reminders.length) return "今天没有紧急事项，适合整理笔记。";
  const first = reminders[0];
  return `${first.type === "event" ? "记得" : "先推进"}：${first.title}`;
}

function getLonglongDefaultBubbleText() {
  const levelName = longlongBondState.level?.name || "初识";
  if (longlongBondState.affection > 0 || longlongBondState.coins > 0) {
    return `${levelName} · ${longlongBondState.affection} 好感 · ${longlongBondState.coins} 龙币`;
  }
  return "今天也一起学一会儿吧。";
}

function updateLonglongMood(mood, detail, music = "") {
  longlongState.mood = mood || longlongState.mood;
  longlongState.moodDetail = detail || longlongState.moodDetail;
  if (music) longlongState.music = music;
  syncLonglongAssistant();
}

function getLonglongMusicForBrightness(normalized) {
  if (normalized < 22) return "自然白噪音 + 轻节拍，先开灯再继续读。";
  if (normalized > 82) return "舒缓钢琴 + 低音量，注意屏幕和环境光。";
  if (normalized > 55) return "白噪音 + 轻钢琴，适合继续专注阅读。";
  return "雨声 + 柔和钢琴，适合整理笔记和复盘。";
}

function getDocumentRagSnippet(documentMeta) {
  const snippets = [];
  const currentDoc = documentState.current;

  if (currentDoc?.meta?.id === documentMeta.id) {
    snippets.push(getCurrentReadingText(currentDoc));
  }

  snippets.push(documentMeta.editedText || "");
  snippets.push(documentMeta.extractedText || "");
  snippets.push(documentMeta.aiSource || "");

  const runtimeFile = runtimeFiles.get(documentMeta.id);
  if (runtimeFile?.base64 && String(documentMeta.extension || "").toUpperCase() === "MD") {
    try {
      snippets.push(stripMarkdown(base64ToText(runtimeFile.base64)));
    } catch (error) {
      snippets.push("");
    }
  }

  return normalizeExtractedPdfText(snippets.filter(Boolean).join("\n\n")).slice(0, LONGLONG_RAG_TEXT_LIMIT);
}

function buildLonglongRagRequest(question) {
  const activeCourse = getActiveCourse();
  const documents = (activeCourse.documents || []).map((documentMeta) => ({
    id: documentMeta.id,
    name: documentMeta.name,
    extension: documentMeta.extension,
    path: documentMeta.path,
    text: getDocumentRagSnippet(documentMeta),
  }));

  return {
    question,
    course: {
      id: activeCourse.id,
      name: activeCourse.name,
      description: activeCourse.description,
      activeDocumentId: activeCourse.activeDocumentId,
    },
    documents,
    interface: "longlong-rag-placeholder-v1",
  };
}

function formatLonglongRagResponse(response) {
  if (!response) return "龙龙的 RAG 接口已预留，但当前没有返回内容。";
  const sources = Array.isArray(response.sources) && response.sources.length
    ? `\n\n资料入口：${response.sources.map((source) => source.name).join("、")}`
    : "";
  return withLonglongAnswerLine(`${response.answer || "RAG 接口已收到请求。"}${sources}`);
}

async function submitLonglongRagQuestion(event) {
  event.preventDefault();
  const elements = getLonglongElements();
  const question = elements.question?.value.trim();

  if (!question) {
    setAiMarkdownContent(elements.ragOutput, "先告诉龙龙你想问资料库什么问题。");
    return;
  }

  setAiMarkdownContent(elements.ragOutput, LONGLONG_THINKING_LINE);
  playLonglongThinkingLine();

  try {
    const request = buildLonglongRagRequest(question);
    const response = window.mindStudy?.rag?.askLibrary
      ? await window.mindStudy.rag.askLibrary(request)
      : {
          answer:
            `龙龙已收到你的问题：${question}\n\n` +
            `浏览器预览环境中先使用占位接口。本次已准备 ${request.documents.length} 份资料，后续接入向量库即可检索回答。`,
          sources: request.documents.slice(0, 4),
        };
    longlongState.ragAnswer = formatLonglongRagResponse(response);
    playLonglongAnswerLine();
    addLonglongChatAffection();
  } catch (error) {
    longlongState.ragAnswer = `RAG 接口调用失败：${getAiErrorMessage(error)}`;
  }

  setAiMarkdownContent(elements.ragOutput, longlongState.ragAnswer);
  syncLonglongAssistant();
}

async function submitLonglongChat(event) {
  event.preventDefault();
  const elements = getLonglongElements();
  const text = elements.chatInput?.value.trim();
  if (!text) {
    elements.chatInput?.focus();
    return;
  }

  elements.chatInput.value = "";
  addLonglongChatMessage("user", text);
  longlongMainChatHistory.push({ role: "user", content: text });
  const thinking = addLonglongChatMessage("assistant", LONGLONG_THINKING_LINE);
  setLonglongBubbleText(LONGLONG_THINKING_LINE);
  playLonglongThinkingLine();

  try {
    const response = await window.mindStudy?.askLonglongCompanion?.({
      message: text,
      includeScreen: false,
      history: longlongMainChatHistory.slice(0, -1),
      options: {
        maxTokens: 900,
        temperature: 0.32,
      },
    });
    const rawAnswer = response?.answer || "龙龙没有收到有效回答。";
    const answer = withLonglongAnswerLine(rawAnswer);
    updateLonglongChatMessage(thinking, answer);
    setLonglongBubbleText(LONGLONG_ANSWER_LINE);
    playLonglongAnswerLine();
    addLonglongChatAffection();
    longlongMainChatHistory.push({ role: "assistant", content: rawAnswer });
    longlongMainChatHistory = longlongMainChatHistory.slice(-10);
  } catch (error) {
    const errorText = `龙龙这次没连上：${getAiErrorMessage(error)}`;
    updateLonglongChatMessage(thinking, errorText);
    setLonglongBubbleText("龙龙这次没连上，等一下再试。");
  }
}

function handleLonglongAction(action) {
  resetLonglongActivity();

  if (action === "poke") {
    setLonglongGiftPopover(false);
    setLonglongChatPopover(false);
    playLonglongSprite("touch", 1400);
    const text = pickLonglongItem(LONGLONG_MAIN_POKES);
    setLonglongBubbleText(text);
    playLonglongFixedLine(text);
    const affectionPromise = window.mindStudy?.addLonglongAffection?.({ amount: 1, reason: "poke" });
    affectionPromise?.then(setLonglongBondState).catch(() => {});
    return;
  }

  if (action === "tip") {
    setLonglongGiftPopover(false);
    setLonglongChatPopover(false);
    const text = pickLonglongItem(LONGLONG_MAIN_TIPS);
    setLonglongBubbleText(text);
    playLonglongFixedLine(text);
    return;
  }

  if (action === "quote") {
    setLonglongGiftPopover(false);
    setLonglongChatPopover(false);
    const text = pickLonglongItem(LONGLONG_MAIN_QUOTES);
    setLonglongBubbleText(text);
    playLonglongFixedLine(text);
    return;
  }

  if (action === "chat") {
    setLonglongGiftPopover(false);
    setLonglongChatPopover(!longlongState.chatOpen);
    if (longlongState.chatOpen) setLonglongBubbleText("龙龙在听。", { temporary: false });
    return;
  }

  if (action === "gift") {
    setLonglongChatPopover(false);
    const nextOpen = !longlongState.giftOpen;
    setLonglongGiftPopover(nextOpen);
    if (nextOpen) {
      setLonglongBubbleText("龙龙看看今天会收到什么。", { temporary: false });
    } else {
      setLonglongExpanded(false);
      syncLonglongAssistant();
    }
    return;
  }

  if (action === "close-gift") {
    setLonglongGiftPopover(false);
    setLonglongExpanded(false);
    syncLonglongAssistant();
    return;
  }

  if (action === "close-chat") {
    setLonglongChatPopover(false);
    setLonglongExpanded(false);
    syncLonglongAssistant();
    return;
  }

  if (action === "sleep") {
    enterLonglongSleep();
  }
}

function syncLonglongAssistant() {
  const elements = getLonglongElements();
  if (!elements.root) return;

  const reminderText = getLonglongDefaultBubbleText();

  elements.root.classList.toggle("expanded", longlongState.expanded);
  elements.root.classList.toggle("gift-open", longlongState.giftOpen);
  elements.root.classList.toggle("chat-open", longlongState.chatOpen);
  if (elements.giftPopover) elements.giftPopover.hidden = !longlongState.giftOpen;
  if (elements.chatPopover) elements.chatPopover.hidden = !longlongState.chatOpen;
  if (elements.bubble && !longlongBubbleTimer) elements.bubble.textContent = reminderText;
  if (elements.mood) elements.mood.textContent = longlongState.mood;
  if (elements.moodDetail) elements.moodDetail.textContent = longlongState.moodDetail;
  renderStudyTimerSnapshot();
  renderLonglongBondState();
  if (elements.music) elements.music.textContent = longlongState.music;
  setAiMarkdownContent(elements.ragOutput, longlongState.ragAnswer);
  if (elements.reminders) {
    const reminders = getLonglongReminders();
    elements.reminders.innerHTML = reminders.length
      ? reminders
          .map((item) => `
            <article class="longlong-reminder ${item.type}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.detail)}</span>
            </article>
          `)
          .join("")
      : `<article class="longlong-reminder"><strong>暂无紧急日程</strong><span>可以整理资料或复盘错题。</span></article>`;
  }

  const snapshot = {
    mood: longlongState.mood,
    reminder: reminderText,
    music: longlongState.music,
    studyTime: studyTimerSnapshot.formatted,
    studySeconds: studyTimerSnapshot.seconds,
  };
  const snapshotText = JSON.stringify(snapshot);
  if (snapshotText !== longlongSnapshotCache) {
    longlongSnapshotCache = snapshotText;
    window.mindStudy?.updateCompanionSnapshot?.(snapshot);
  }
}

function createDefaultCourse() {
  return {
    id: createId("course"),
    name: "用户交互技术",
    description: "第 5 周资料复习中",
    documents: [],
    activeDocumentId: "",
    studyModule: createDefaultStudyModule(),
    ragKnowledge: createDefaultRagKnowledge(),
    createdAt: Date.now(),
  };
}

function createDefaultRagKnowledge() {
  return {
    documents: [],
    messages: [],
    settings: {
      chunkSize: RAG_DEFAULT_CHUNK_SIZE,
      maxChunks: RAG_DEFAULT_MAX_CHUNKS,
      includeWeb: true,
    },
    updatedAt: 0,
  };
}

function createEmptyStudyGraph(course = {}) {
  return {
    nodes: [],
    edges: [],
    meta: {
      generatedBy: "empty",
      generatedAt: Date.now(),
      qualityScore: 0,
      fallbackUsed: false,
      empty: true,
      sourceDocuments: (course.documents || []).map((documentMeta) => documentMeta.title || documentMeta.name).filter(Boolean),
    },
  };
}

function createEmptyMindmap(course = {}) {
  return {
    id: "mindmap-root",
    title: course.name || "课程思维导图",
    summary: "导入资料后可独立生成层级式思维导图。",
    nodes: [],
    meta: {
      generatedBy: "empty",
      generatedAt: Date.now(),
      empty: true,
      sourceDocuments: (course.documents || []).map((documentMeta) => documentMeta.title || documentMeta.name).filter(Boolean),
    },
  };
}

function createFallbackMindmap(course = {}) {
  const title = course.name || "用户交互技术";
  return {
    id: "mindmap-root",
    title,
    summary: "按复习层级独立整理的课程脑图，不依赖知识图谱关系。",
    nodes: [
      {
        id: "mindmap-founder",
        label: "课程定位",
        summary: "明确课程讨论的人、系统与交互体验。",
        children: [
          { id: "mindmap-founder-1", label: "人机交互", summary: "研究人与计算系统之间的交互过程。" },
          { id: "mindmap-founder-2", label: "用户体验", summary: "关注使用前、使用中和使用后的整体感受。" },
        ],
      },
      {
        id: "mindmap-definition",
        label: "核心概念",
        summary: "建立后续评估和设计分析的基础术语。",
        children: [
          { id: "mindmap-definition-1", label: "可用性", summary: "有效性、效率和满意度共同构成评价基础。" },
          { id: "mindmap-definition-2", label: "认知负荷", summary: "界面理解和操作过程中的心理负担。" },
          { id: "mindmap-definition-3", label: "Fitts 定律", summary: "解释目标距离、大小与指向时间的关系。" },
        ],
      },
      {
        id: "mindmap-function",
        label: "评估方法",
        summary: "把概念转化为可观察、可记录的评价流程。",
        children: [
          { id: "mindmap-function-1", label: "SUS 量表", summary: "快速收集主观可用性评分。" },
          { id: "mindmap-function-2", label: "用户访谈", summary: "通过追问理解动机、痛点和真实场景。" },
          { id: "mindmap-function-3", label: "原型测试", summary: "用低成本原型尽早发现流程问题。" },
        ],
      },
      {
        id: "mindmap-metaphor",
        label: "复习线索",
        summary: "按问题、证据和例题组织复习路径。",
        children: [
          { id: "mindmap-metaphor-1", label: "定义辨析", summary: "区分概念边界和适用场景。" },
          { id: "mindmap-metaphor-2", label: "指标匹配", summary: "把方法与评价指标对应起来。" },
          { id: "mindmap-metaphor-3", label: "案例应用", summary: "用课堂案例解释方法选择理由。" },
        ],
      },
      {
        id: "mindmap-alias",
        label: "别名",
        summary: "常见表达与同义概念，便于检索和报告撰写。",
        children: [
          { id: "mindmap-alias-1", label: "脑图", summary: "强调发散式层级表达。" },
          { id: "mindmap-alias-2", label: "心智地图", summary: "强调思考主题和关键节点。" },
          { id: "mindmap-alias-3", label: "概念地图", summary: "强调概念组织，但本页不展示网状关系。" },
          { id: "mindmap-alias-4", label: "树状图", summary: "强调父子层级。" },
        ],
      },
    ],
    meta: {
      generatedBy: "local-mindmap-seed",
      generatedAt: Date.now(),
      empty: false,
      sourceDocuments: (course.documents || []).map((documentMeta) => documentMeta.title || documentMeta.name).filter(Boolean),
    },
  };
}

function createDefaultStudyModule(options = {}) {
  const useSeedGraph = options.seedGraph !== false;
  const graph = useSeedGraph ? createFallbackStudyGraph([]) : createEmptyStudyGraph(options.course);
  const mindmap = useSeedGraph ? createFallbackMindmap(options.course) : createEmptyMindmap(options.course);
  const questions = createFallbackQuizQuestions(graph.nodes);

  return {
    version: STUDY_MODULE_VERSION,
    selectedNodeId: graph.nodes[0]?.id || "",
    selectedMindmapNodeId: mindmap.nodes[0]?.id || mindmap.id || "",
    activeQuizTopic: graph.nodes[0]?.id || "all",
    quizCursor: 0,
    mapMode: "mastery",
    mindmapMode: "classic",
    mindmapZoom: 1,
    mindmapCollapsed: [],
    mindmapFocusId: "",
    graphFilters: {
      chapter: "all",
      difficulty: "all",
      mastery: "all",
    },
    graphViewport: { ...GRAPH_DEFAULT_VIEWPORT },
    generation: {
      state: "idle",
      engine: useSeedGraph ? "seed" : "empty",
      message: useSeedGraph ? "" : "当前课程还没有知识图谱，请导入资料后点击生成，或从 Neo4j 加载。",
      updatedAt: 0,
    },
    graph,
    mindmap,
    quiz: {
      scope: graph.nodes[0]?.id || "all",
      mode: "adaptive",
      difficulty: "all",
      questions,
      cursor: 0,
      generatedAt: Date.now(),
      source: "seed",
    },
    attempts: [],
    mistakes: [],
    progress: {
      studyMinutes: 0,
      trend: [],
    },
    recommendations: [],
  };
}

function getDefaultPlannerSeeds() {
  return [
    { phase: "1", type: "技术栈", title: "JavaSE", status: "done", timeline: "2025.9.24-2026.1.2", progress: 100, importance: 5, note: "快速过，后续算法练习加背八股即可" },
    { phase: "2", type: "技术栈", title: "MySQL", status: "done", timeline: "2026.4.24-2026.5.4", progress: 100, importance: 5, note: "数据库重点内容" },
    { phase: "3", type: "技术栈", title: "JDBC", status: "done", timeline: "2026.5.17-2026.5.18", progress: 100, importance: 2, note: "" },
    { phase: "4", type: "技术栈", title: "JavaWeb", status: "done", timeline: "2026.5.21-2026.5.31", progress: 100, importance: 4, note: "" },
    { phase: "5", type: "项目", title: "天幕", status: "doing", timeline: "2026.5.31", progress: 46, importance: 5, note: "" },
    { phase: "6", type: "技术栈", title: "Redis", status: "todo", timeline: "", progress: 0, importance: 5, note: "" },
    { phase: "7", type: "技术栈", title: "SpringBoot", status: "todo", timeline: "", progress: 0, importance: 4, note: "" },
    { phase: "8", type: "技术栈", title: "SSM框架", status: "done", timeline: "2026.5.28-2026.5.28", progress: 100, importance: 4, note: "快速看文档过" },
    { phase: "9", type: "项目", title: "千言", status: "todo", timeline: "", progress: 0, importance: 5, note: "" },
    { phase: "10", type: "技术栈", title: "Git版本项目", status: "done", timeline: "2026.6.1-2026.6.1", progress: 100, importance: 5, note: "" },
    { phase: "11", type: "技术栈", title: "Linux基本命令", status: "done", timeline: "2026.6.1-2026.6.1", progress: 100, importance: 4, note: "" },
    { phase: "12", type: "技术栈", title: "SpringCloud", status: "todo", timeline: "", progress: 0, importance: 4, note: "微服务框架快速过" },
    { phase: "13", type: "技术栈", title: "RocketMQ", status: "todo", timeline: "", progress: 0, importance: 5, note: "" },
    { phase: "14", type: "技术栈", title: "JVM虚拟机", status: "todo", timeline: "", progress: 0, importance: 5, note: "重点八股，没有天赋那就反复" },
    { phase: "15", type: "技术栈", title: "JUC并发编程", status: "todo", timeline: "", progress: 0, importance: 2, note: "重点八股，没有天赋那就反复" },
    { phase: "22", type: "计算机基础", title: "操作系统", status: "doing", timeline: "2026.3.2-", progress: 81, importance: 0, note: "" },
    { phase: "23", type: "计算机基础", title: "计算机网络", status: "doing", timeline: "2026.3.2-", progress: 73, importance: 0, note: "" },
    { phase: "17", type: "算法", title: "力扣 Hot 100", status: "doing", timeline: "everyday", progress: 38, importance: 5, note: "" },
    { phase: "18", type: "八股", title: "JavaGuide", status: "doing", timeline: "everyday", progress: 20, importance: 5, note: "" },
    { phase: "19", type: "八股", title: "小林Coding", status: "doing", timeline: "everyday", progress: 20, importance: 5, note: "" },
  ];
}

function createDefaultPlannerItems() {
  const now = Date.now();
  return getDefaultPlannerSeeds().map((item, index) => ({
    id: createId("plan"),
    ...item,
    order: index + 1,
    createdAt: now + index,
  }));
}

function createDefaultPlannerEvents() {
  return [
    {
      id: createId("event"),
      title: "用户交互技术项目展示",
      date: "2026-06-10",
      type: "答辩",
      importance: "high",
      note: "准备演示流程、README 和核心功能讲解。",
      createdAt: Date.now(),
    },
    {
      id: createId("event"),
      title: "数据库重点复盘",
      date: "2026-06-15",
      type: "考试",
      importance: "high",
      note: "MySQL、JDBC、索引和事务重点复习。",
      createdAt: Date.now() + 1,
    },
    {
      id: createId("event"),
      title: "操作系统阶段测验",
      date: "2026-06-22",
      type: "考试",
      importance: "medium",
      note: "进程、线程、内存管理和调度算法。",
      createdAt: Date.now() + 2,
    },
  ];
}

function normalizePlannerItem(item, index) {
  return {
    id: item.id || createId("plan"),
    phase: item.phase || String(index + 1),
    order: Number(item.order) || index + 1,
    type: item.type || "技术栈",
    title: item.title || "未命名任务",
    status: ["done", "doing", "todo"].includes(item.status) ? item.status : "todo",
    timeline: item.timeline || "",
    progress: Math.min(100, Math.max(0, Number(item.progress) || 0)),
    importance: Math.min(5, Math.max(0, Number(item.importance) || 0)),
    note: item.note || "",
    createdAt: item.createdAt || Date.now() + index,
  };
}

function normalizePlannerEvent(event, index) {
  return {
    id: event.id || createId("event"),
    title: event.title || "重要事件",
    date: event.date || new Date().toISOString().slice(0, 10),
    type: event.type || "考试",
    importance: ["high", "medium", "low"].includes(event.importance) ? event.importance : "medium",
    note: event.note || "",
    createdAt: event.createdAt || Date.now() + index,
  };
}

function mergePlannerItemsWithDefaults(items) {
  const normalized = items.map(normalizePlannerItem);
  const byTitle = new Map(normalized.map((item) => [item.title.trim().toLowerCase(), item]));

  createDefaultPlannerItems().forEach((defaultItem) => {
    const key = defaultItem.title.trim().toLowerCase();
    const existing = byTitle.get(key);
    if (!existing) {
      normalized.push(defaultItem);
      byTitle.set(key, defaultItem);
      return;
    }

    existing.phase = defaultItem.phase;
    existing.order = defaultItem.order;
    existing.type = existing.type || defaultItem.type;
    existing.timeline = existing.timeline || defaultItem.timeline;
    existing.note = existing.note || defaultItem.note;
  });

  return normalized.sort((a, b) => Number(a.order || 999) - Number(b.order || 999) || a.createdAt - b.createdAt);
}

function getCurrentCalendarMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function loadPlannerState() {
  try {
    const stored = JSON.parse(localStorage.getItem(PLANNER_STORAGE_KEY));
    if (Array.isArray(stored?.items)) {
      return {
        filter: stored.filter || "all",
        calendarMonth: stored.calendarMonth || getCurrentCalendarMonth(),
        items: mergePlannerItemsWithDefaults(stored.items),
        events: Array.isArray(stored.events) && stored.events.length
          ? stored.events.map(normalizePlannerEvent)
          : createDefaultPlannerEvents(),
      };
    }
  } catch {
    localStorage.removeItem(PLANNER_STORAGE_KEY);
  }

  return {
    filter: "all",
    calendarMonth: getCurrentCalendarMonth(),
    items: createDefaultPlannerItems(),
    events: createDefaultPlannerEvents(),
  };
}

function savePlannerState() {
  localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerState));
}

function loadWorkspace() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.courses?.length) {
      return sanitizeWorkspace(stored);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const course = createDefaultCourse();
  return {
    activeCourseId: course.id,
    courses: [course],
  };
}

function sanitizeWorkspace(nextWorkspace) {
  const courses = nextWorkspace.courses.map((course) => {
    const documents = (course.documents || []).filter((documentMeta) =>
      supportedDocumentExtensions.has(String(documentMeta.extension || "").toUpperCase()),
    );

    return {
      ...course,
      documents,
      activeDocumentId: documents.some((documentMeta) => documentMeta.id === course.activeDocumentId)
        ? course.activeDocumentId
        : documents[0]?.id || "",
      studyModule: sanitizeStudyModule(course.studyModule),
      ragKnowledge: sanitizeRagKnowledge(course.ragKnowledge),
    };
  });

  const activeCourseId = courses.some((course) => course.id === nextWorkspace.activeCourseId)
    ? nextWorkspace.activeCourseId
    : courses[0]?.id || "";

  return {
    ...nextWorkspace,
    activeCourseId,
    courses,
  };
}

function normalizeRagNumber(value, fallback, min, max) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

function sanitizeRagKnowledge(ragKnowledge = {}) {
  const defaults = createDefaultRagKnowledge();
  const settings = {
    chunkSize: normalizeRagNumber(
      ragKnowledge.settings?.chunkSize,
      defaults.settings.chunkSize,
      RAG_MIN_CHUNK_SIZE,
      RAG_MAX_CHUNK_SIZE,
    ),
    maxChunks: normalizeRagNumber(
      ragKnowledge.settings?.maxChunks,
      defaults.settings.maxChunks,
      RAG_MIN_MAX_CHUNKS,
      RAG_MAX_MAX_CHUNKS,
    ),
    includeWeb: ragKnowledge.settings?.includeWeb !== false,
  };

  const documents = (ragKnowledge.documents || [])
    .map((documentMeta, index) => {
      const text = normalizeExtractedPdfText(documentMeta.text || "").slice(0, RAG_KNOWLEDGE_TEXT_LIMIT);
      if (!text) return null;

      return {
        id: documentMeta.id || createId("ragdoc"),
        title: documentMeta.title || documentMeta.name || `Knowledge ${index + 1}`,
        extension: documentMeta.extension || "TXT",
        size: Number(documentMeta.size) || 0,
        text,
        textLength: text.length,
        chunkSize: normalizeRagNumber(documentMeta.chunkSize, settings.chunkSize, RAG_MIN_CHUNK_SIZE, RAG_MAX_CHUNK_SIZE),
        chunkCount: Math.max(1, Number(documentMeta.chunkCount) || splitRagText(text, settings.chunkSize).length),
        learnedAt: Number(documentMeta.learnedAt) || Date.now(),
        sourceType: documentMeta.sourceType || "course",
        ocrPageCount: Math.max(0, Number(documentMeta.ocrPageCount) || 0),
        ocrAttemptedPageCount: Math.max(0, Number(documentMeta.ocrAttemptedPageCount) || 0),
        ocrSkippedPageCount: Math.max(0, Number(documentMeta.ocrSkippedPageCount) || 0),
        pdfLearningComplete: Boolean(documentMeta.pdfLearningComplete),
        pdfLearningTextLimitReached: Boolean(documentMeta.pdfLearningTextLimitReached),
        pageRange: documentMeta.pageRange || null,
      };
    })
    .filter(Boolean);

  const messages = (ragKnowledge.messages || [])
    .filter((message) => message && ["user", "assistant", "system"].includes(message.role))
    .slice(-12)
    .map((message) => ({
      role: message.role,
      text: String(message.text || "").slice(0, 4000),
      createdAt: Number(message.createdAt) || Date.now(),
      sources: Array.isArray(message.sources) ? message.sources.slice(0, 8) : [],
      webSearch: message.webSearch || null,
    }));

  return {
    ...defaults,
    ...ragKnowledge,
    documents,
    messages,
    settings,
    updatedAt: Number(ragKnowledge.updatedAt) || 0,
  };
}

function sanitizeStudyModule(studyModule = {}) {
  const defaults = createDefaultStudyModule();
  const graph = sanitizeStudyGraph(studyModule.graph || defaults.graph);
  const mindmap = sanitizeMindmap(studyModule.mindmap || defaults.mindmap);
  const topicIds = new Set(graph.nodes.map((topic) => topic.id));
  const mindmapIds = new Set([mindmap.id, ...flattenMindmapNodes(mindmap).map((node) => node.id)]);
  const selectedNodeId = topicIds.has(studyModule.selectedNodeId) ? studyModule.selectedNodeId : graph.nodes[0]?.id || defaults.selectedNodeId;
  const selectedMindmapNodeId = mindmapIds.has(studyModule.selectedMindmapNodeId)
    ? studyModule.selectedMindmapNodeId
    : mindmap.nodes[0]?.id || mindmap.id || "";
  const activeQuizTopic = topicIds.has(studyModule.activeQuizTopic) ? studyModule.activeQuizTopic : selectedNodeId;
  const attempts = Array.isArray(studyModule.attempts) ? studyModule.attempts : [];
  const mistakes = Array.isArray(studyModule.mistakes)
    ? studyModule.mistakes
    : attempts.filter((attempt) => !attempt.correct).map((attempt) => ({
        id: createId("mistake"),
        attemptId: attempt.id,
        questionId: attempt.questionId,
        topic: attempt.topic,
        question: attempt.question,
        selectedAnswer: attempt.selectedAnswer,
        correctAnswer: attempt.correctAnswer || "",
        explanation: attempt.explanation,
        reviewed: false,
        createdAt: attempt.answeredAt || Date.now(),
      }));

  return {
    ...defaults,
    ...studyModule,
    version: STUDY_MODULE_VERSION,
    graph,
    mindmap,
    selectedNodeId,
    selectedMindmapNodeId,
    activeQuizTopic,
    mapMode: ["mastery", "chapter", "difficulty"].includes(studyModule.mapMode) ? studyModule.mapMode : defaults.mapMode,
    mindmapMode: ["classic", "compact", "chapter", "difficulty"].includes(studyModule.mindmapMode) ? studyModule.mindmapMode : defaults.mindmapMode,
    mindmapZoom: Math.min(1.8, Math.max(0.55, Number(studyModule.mindmapZoom) || defaults.mindmapZoom || 1)),
    mindmapCollapsed: Array.isArray(studyModule.mindmapCollapsed) ? studyModule.mindmapCollapsed.map(String).slice(0, 24) : [],
    mindmapFocusId: mindmapIds.has(studyModule.mindmapFocusId) ? studyModule.mindmapFocusId : "",
    graphFilters: {
      ...defaults.graphFilters,
      ...(studyModule.graphFilters || {}),
    },
    graphViewport: sanitizeGraphViewport(studyModule.graphViewport),
    quizCursor: Math.max(0, Number(studyModule.quizCursor ?? studyModule.quiz?.cursor) || 0),
    quiz: sanitizeStudyQuiz(studyModule.quiz, graph),
    attempts,
    mistakes,
    generation: sanitizeGenerationState({
      ...defaults.generation,
      ...(studyModule.generation || {}),
    }),
    progress: {
      ...defaults.progress,
      ...(studyModule.progress || {}),
      trend: Array.isArray(studyModule.progress?.trend) ? studyModule.progress.trend.slice(-14) : [],
    },
    recommendations: Array.isArray(studyModule.recommendations) ? studyModule.recommendations.slice(0, 8) : defaults.recommendations,
  };
}

function saveWorkspace() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function getActiveCourse() {
  return workspace.courses.find((course) => course.id === workspace.activeCourseId) || workspace.courses[0];
}

function getActiveDocumentMeta() {
  const course = getActiveCourse();
  return course?.documents.find((document) => document.id === course.activeDocumentId) || course?.documents[0] || null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "未知大小";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getExtension(fileName) {
  return fileName.split(".").pop()?.toUpperCase() || "";
}

function getDocumentKind(extension) {
  const normalized = extension.toUpperCase();
  if (normalized === "PDF") return "pdf";
  if (normalized === "MD") return "md";
  return "unknown";
}

function getTypeLabel(extension) {
  const normalized = extension.toUpperCase();
  if (normalized === "MD") return "Markdown";
  return normalized || "FILE";
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64ToText(base64) {
  return new TextDecoder("utf-8").decode(base64ToUint8Array(base64));
}

function bytesToDataUrl(bytes, mimeType) {
  return `data:${mimeType};base64,${uint8ArrayToBase64(bytes)}`;
}

function uint8ArrayToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

function writeAsciiToDataView(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function encodeMonoPcm16Wav(samples, sampleRate) {
  const clampedRate = Math.max(8000, Math.floor(Number(sampleRate) || 16000));
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAsciiToDataView(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAsciiToDataView(view, 8, "WAVE");
  writeAsciiToDataView(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, clampedRate, true);
  view.setUint32(28, clampedRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAsciiToDataView(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

async function audioBlobToWavPayload(blob) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("当前环境不支持音频解码。");
  }

  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
    const length = audioBuffer.length;
    const samples = new Float32Array(length);

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        samples[index] += channelData[index] / audioBuffer.numberOfChannels;
      }
    }

    const wavBytes = encodeMonoPcm16Wav(samples, audioBuffer.sampleRate);
    return {
      base64: uint8ArrayToBase64(wavBytes),
      mimeType: "audio/wav",
      byteLength: wavBytes.byteLength,
    };
  } finally {
    audioContext.close?.();
  }
}

function getMimeTypeFromName(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

async function dataUrlToArrayBuffer(dataUrl) {
  const response = await fetch(dataUrl);
  return response.arrayBuffer();
}

async function loadPdfJs() {
  if (!pdfJsLoadingPromise) {
    pdfJsLoadingPromise = import("./vendor/pdf.min.js").then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdf.worker.min.js", window.location.href).toString();
      return pdfjsLib;
    });
  }

  return pdfJsLoadingPromise;
}

function normalizeExtractedPdfText(text) {
  return String(text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTextFromPdfTextContent(textContent) {
  const rows = [];
  let currentY = null;
  let currentLine = [];

  const textItems = textContent.items
    .map((item) => ({
      text: item.str?.trim() || "",
      x: Math.round(item.transform?.[4] || 0),
      y: Math.round(item.transform?.[5] || 0),
    }))
    .filter((item) => item.text)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 4) return b.y - a.y;
      return a.x - b.x;
    });

  textItems.forEach((item) => {
    const y = item.y;

    if (currentY !== null && Math.abs(y - currentY) > 4) {
      rows.push(currentLine.join(" ").trim());
      currentLine = [];
    }

    currentY = y;
    currentLine.push(item.text);
  });

  if (currentLine.length) rows.push(currentLine.join(" ").trim());

  return normalizeExtractedPdfText(rows.filter(Boolean).join("\n"));
}

function getPdfOcrCandidatePageNumbers(extracted, options = {}) {
  const pageCount = Math.max(0, Number(extracted?.pageCount || options.pageCount) || 0);
  const pages = Array.isArray(extracted?.pages) ? extracted.pages : [];
  const textPageNumbers = new Set(
    pages
      .filter((page) => normalizeExtractedPdfText(page.text))
      .map((page) => Number(page.pageNumber)),
  );
  let candidates = Array.isArray(options.ocrPages)
    ? options.ocrPages.map(Number).filter(Number.isFinite)
    : [];

  if (!pageCount) {
    return {
      pageNumbers: [],
      skippedPageCount: 0,
    };
  }

  if (!candidates.length) {
    if (options.ocrMode === "always" || !normalizeExtractedPdfText(extracted?.text)) {
      candidates = Array.from({ length: pageCount }, (item, index) => index + 1);
    } else if (options.ocrMissingPages) {
      candidates = Array.from({ length: pageCount }, (item, index) => index + 1)
        .filter((pageNumber) => !textPageNumbers.has(pageNumber));
    }
  }

  const uniqueCandidates = Array.from(new Set(candidates))
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= pageCount)
    .filter((pageNumber) => options.ocrMode === "always" || !textPageNumbers.has(pageNumber));
  const maxPages = options.ocrAllPages || options.ocrMaxPages === "all"
    ? uniqueCandidates.length
    : Math.max(0, Number(options.ocrMaxPages) || PDF_OCR_AUTO_MAX_PAGES);

  return {
    pageNumbers: uniqueCandidates.slice(0, maxPages),
    skippedPageCount: Math.max(0, uniqueCandidates.length - maxPages),
  };
}

function getPdfOcrScale(page, options = {}) {
  const viewport = page.getViewport({ scale: 1 });
  const requestedScale = Number(options.ocrScale) || PDF_OCR_RENDER_SCALE;
  const sideScale = PDF_OCR_MAX_CANVAS_SIDE / Math.max(viewport.width, viewport.height, 1);

  return Math.max(1.1, Math.min(requestedScale, sideScale));
}

async function renderPdfPageToOcrDataUrl(page, options = {}) {
  const viewport = page.getViewport({ scale: getPdfOcrScale(page, options) });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("无法创建 OCR 渲染画布。");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
    background: "#ffffff",
  }).promise;

  const dataUrl = canvas.toDataURL("image/png");
  canvas.width = 1;
  canvas.height = 1;
  return dataUrl;
}

async function recognizePdfPageWithOcr(page, pageNumber, options = {}) {
  const recognizeImageText = window.mindStudy?.ai?.recognizeImageText;

  if (!recognizeImageText) {
    throw new Error("OCR 接口尚未可用。");
  }

  const dataUrl = await renderPdfPageToOcrDataUrl(page, options);
  const result = await recognizeImageText({
    dataUrl,
    options: {
      languages: options.ocrLanguages || PDF_OCR_LANGUAGES,
      pageNumber,
      textLimit: options.textLimit || PDF_PAGE_TEXT_LIMIT,
    },
  });
  const text = normalizeExtractedPdfText(result?.text).slice(0, options.textLimit || PDF_PAGE_TEXT_LIMIT);

  return {
    pageNumber,
    text,
    confidence: result?.confidence ?? null,
    source: "ocr",
  };
}

function mergePdfTextAndOcrExtraction(extracted, ocrPages, metadata = {}) {
  const pagesByNumber = new Map();

  for (const page of extracted?.pages || []) {
    const pageNumber = Number(page.pageNumber);
    if (!Number.isFinite(pageNumber)) continue;
    pagesByNumber.set(pageNumber, {
      ...page,
      source: page.source || "text-layer",
    });
  }

  for (const page of ocrPages || []) {
    if (!page.text) continue;
    pagesByNumber.set(Number(page.pageNumber), {
      pageNumber: Number(page.pageNumber),
      text: page.text.slice(0, PDF_PAGE_TEXT_LIMIT),
      confidence: page.confidence,
      source: "ocr",
    });
  }

  const pages = Array.from(pagesByNumber.values())
    .sort((left, right) => Number(left.pageNumber) - Number(right.pageNumber));
  const textLimit = Math.max(PDF_TEXT_LIMIT, Number(metadata.totalTextLimit) || PDF_TEXT_LIMIT);
  const mergedText = normalizeExtractedPdfText(
    pages
      .filter((page) => page.text)
      .map((page) => `第 ${page.pageNumber} 页\n${page.text}`)
      .join("\n\n"),
  );
  const text = mergedText.slice(0, textLimit);
  const ocrPageCount = pages.filter((page) => page.source === "ocr" && page.text).length;

  return {
    ...extracted,
    pages,
    text,
    extractedPageCount: pages.filter((page) => page.text).length,
    ocrPageCount,
    ocrAttemptedPageCount: Math.max(0, Number(metadata.attemptedPageCount) || ocrPageCount),
    ocrSkippedPageCount: metadata.skippedPageCount || 0,
    ocrErrors: metadata.ocrErrors || [],
    textLimitReached: mergedText.length > textLimit,
    extractionMethods: ocrPageCount ? ["text-layer", "ocr"] : ["text-layer"],
  };
}

async function appendOcrTextFromPdfPages(bytes, extracted, options = {}) {
  if (options.enableOcr === false) {
    return extracted;
  }

  const { pageNumbers, skippedPageCount } = getPdfOcrCandidatePageNumbers(extracted, options);
  const recognizeImageText = window.mindStudy?.ai?.recognizeImageText;
  if (!pageNumbers.length) {
    return {
      ...extracted,
      ocrAttemptedPageCount: 0,
      ocrSkippedPageCount: skippedPageCount,
    };
  }

  if (!recognizeImageText) {
    return {
      ...extracted,
      ocrAttemptedPageCount: 0,
      ocrSkippedPageCount: skippedPageCount + pageNumbers.length,
      ocrErrors: [
        {
          pageNumber: pageNumbers[0],
          message: "OCR 接口尚未可用。",
        },
      ],
    };
  }

  options.onOcrStart?.({
    total: pageNumbers.length,
    skippedPageCount,
  });

  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const ocrPages = [];
  const ocrErrors = [];

  try {
    for (const [index, pageNumber] of pageNumbers.entries()) {
      options.onOcrProgress?.({
        pageNumber,
        index: index + 1,
        total: pageNumbers.length,
      });

      try {
        const page = await pdf.getPage(pageNumber);
        const ocrPage = await recognizePdfPageWithOcr(page, pageNumber, options);
        if (ocrPage.text) ocrPages.push(ocrPage);
      } catch (error) {
        ocrErrors.push({
          pageNumber,
          message: error.message || String(error),
        });
      }
    }
  } finally {
    if (typeof pdf.destroy === "function") {
      await pdf.destroy();
    }
  }

  if (!ocrPages.length && !normalizeExtractedPdfText(extracted?.text) && ocrErrors.length) {
    throw new Error(`OCR 识别失败：${ocrErrors[0].message}`);
  }

  return mergePdfTextAndOcrExtraction(extracted, ocrPages, {
    attemptedPageCount: pageNumbers.length,
    skippedPageCount,
    ocrErrors,
    totalTextLimit: options.totalTextLimit,
  });
}

async function extractPdfTextFromBytes(bytes, options = {}) {
  if (window.mindStudy?.ai?.extractPdfText) {
    let extracted = null;

    try {
      extracted = await window.mindStudy.ai.extractPdfText({
        base64: uint8ArrayToBase64(bytes),
        options: {
          pageTextLimit: PDF_PAGE_TEXT_LIMIT,
          totalTextLimit: options.totalTextLimit || PDF_TEXT_LIMIT,
        },
      });
    } catch (error) {
      console.warn("Main-process PDF text extraction failed; falling back to renderer PDF.js.", error);
    }

    if (extracted?.pageCount || extracted?.text || extracted?.pages?.length) {
      return await appendOcrTextFromPdfPages(bytes, extracted, options);
    }
  }

  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const pageCount = pdf.numPages;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = extractTextFromPdfTextContent(textContent);
      pages.push({
        pageNumber,
        text: pageText.slice(0, PDF_PAGE_TEXT_LIMIT),
        source: "text-layer",
      });
    }
  } finally {
    if (typeof pdf.destroy === "function") {
      await pdf.destroy();
    }
  }

  const totalTextLimit = Math.max(PDF_TEXT_LIMIT, Number(options.totalTextLimit) || PDF_TEXT_LIMIT);
  const fullText = normalizeExtractedPdfText(
    pages
      .filter((page) => page.text)
      .map((page) => `第 ${page.pageNumber} 页\n${page.text}`)
      .join("\n\n"),
  );

  return await appendOcrTextFromPdfPages(bytes, {
    pageCount,
    pages,
    text: fullText.slice(0, totalTextLimit),
    textLimitReached: fullText.length > totalTextLimit,
    extractedAt: Date.now(),
  }, options);
}

function downloadInBrowser(fileName, content, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function saveTextFile(defaultPath, content) {
  if (window.mindStudy?.saveFile) {
    return window.mindStudy.saveFile({
      title: "保存学习笔记",
      defaultPath,
      data: content,
      encoding: "utf8",
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
  }

  downloadInBrowser(defaultPath, content, "text/markdown;charset=utf-8");
  return { name: defaultPath };
}

async function saveBinaryFile(defaultPath, bytes, filters) {
  if (window.mindStudy?.saveFile) {
    return window.mindStudy.saveFile({
      title: "保存编辑后的文件",
      defaultPath,
      data: uint8ArrayToBase64(bytes),
      encoding: "base64",
      filters,
    });
  }

  const mimeType = defaultPath.endsWith(".pdf")
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  downloadInBrowser(defaultPath, new Blob([bytes], { type: mimeType }), mimeType);
  return { name: defaultPath };
}

function getAiBridge() {
  return window.mindStudy?.ai || null;
}

function getAiErrorMessage(error) {
  const message = error?.message || String(error || "AI 调用失败");

  if (message.includes("DASHSCOPE_API_KEY") || message.includes("QWEN_API_KEY") || message.includes("API key")) {
    return "请先设置 Qwen API Key。";
  }

  return message;
}

async function getAiStatus() {
  const bridge = getAiBridge();

  if (!bridge?.getStatus) {
    return {
      configured: false,
      source: "missing",
      model: "",
      baseUrl: "",
      error: "当前环境没有 MindStudy AI 接口。",
    };
  }

  try {
    return await bridge.getStatus();
  } catch (error) {
    return {
      configured: false,
      source: "error",
      model: "",
      baseUrl: "",
      error: getAiErrorMessage(error),
    };
  }
}

function getAiStatusText(status) {
  if (status?.configured) {
    const sourceText = status.source === "environment" ? "环境变量" : "软件内保存";
    return `Qwen 已配置（${sourceText}，${status.model || "默认模型"}）`;
  }

  if (status?.error) {
    return status.error;
  }

  return "Qwen API Key 尚未设置。";
}

async function syncAiStatusButtons() {
  const status = await getAiStatus();

  document.querySelectorAll("[data-ai-action='settings']").forEach((button) => {
    button.classList.toggle("ai-ready", Boolean(status.configured));
    button.title = getAiStatusText(status);
  });

  return status;
}

async function ensureAiConfigured() {
  const status = await syncAiStatusButtons();

  if (!status.configured) {
    openAiSettingsDialog(status);
    throw new Error("请先设置 Qwen API Key。");
  }

  return status;
}

function formatAiSources(sources = []) {
  if (!sources.length) return "";

  return `\n\n来源：${sources.map((source) => `[${source.label}] ${source.title}`).join("；")}`;
}

function formatAiAnswer(result) {
  return withLonglongAnswerLine(`${result?.answer || "AI 没有返回内容。"}${formatAiSources(result?.sources)}`);
}

function formatAiSummary(result) {
  const parts = [];

  if (result?.summary) {
    parts.push(`总结：${result.summary}`);
  }

  if (result?.keywords?.length) {
    parts.push(`关键词：${result.keywords.join("、")}`);
  }

  if (result?.outline?.length) {
    const outline = result.outline
      .map((item) => {
        if (typeof item === "string") return `- ${item}`;
        const points = Array.isArray(item.points) ? item.points.map((point) => `  - ${point}`).join("\n") : "";
        return [`- ${item.heading || "要点"}`, points].filter(Boolean).join("\n");
      })
      .join("\n");
    parts.push(`大纲：\n${outline}`);
  }

  if (result?.takeaways?.length) {
    parts.push(`可加入笔记：\n${result.takeaways.map((item) => `- ${item}`).join("\n")}`);
  }

  return withLonglongAnswerLine(`${parts.join("\n\n") || result?.raw || "AI 没有返回内容。"}${formatAiSources(result?.sources)}`);
}

function getRuntimeDocumentAiText(doc) {
  if (!doc) return "";

  if (doc.kind === "md") {
    return stripMarkdown(doc.editedText || doc.text || "").slice(0, AI_CONTEXT_TEXT_LIMIT);
  }

  if (doc.kind === "pdf") {
    return (doc.meta.extractedText || getCurrentReadingText(doc)).slice(0, AI_CONTEXT_TEXT_LIMIT);
  }

  return String(doc.meta.aiSource || "").slice(0, AI_CONTEXT_TEXT_LIMIT);
}

async function buildAiDocumentFromMeta(meta, options = {}) {
  if (!meta) return null;

  const textLimit = Math.max(1000, Number(options.textLimit) || AI_CONTEXT_TEXT_LIMIT);
  const runtimeDoc = documentState.current?.meta?.id === meta.id ? documentState.current : null;
  if (runtimeDoc) {
    if (runtimeDoc.kind === "pdf" && options.requireCompletePdfOcr) {
      return {
        id: meta.id,
        title: meta.name,
        text: normalizeExtractedPdfText(await getRagDocumentText(meta, options)).slice(0, textLimit),
        mimeType: meta.mimeType,
        extension: meta.extension,
      };
    }

    return {
      id: meta.id,
      title: meta.name,
      text: getRuntimeDocumentAiText(runtimeDoc).slice(0, textLimit),
      mimeType: meta.mimeType,
      extension: meta.extension,
    };
  }

  const file = await readStoredFile(meta);
  const extension = String(file.extension || meta.extension || "").toUpperCase();

  if (extension === "MD") {
    return {
      id: meta.id,
      title: meta.name,
      text: stripMarkdown(base64ToText(file.base64 || "")).slice(0, textLimit),
      mimeType: file.mimeType,
      extension,
    };
  }

  if (extension === "PDF") {
    const extractedText = options.requireCompletePdfOcr
      ? await getRagDocumentText(meta, options)
      : (await extractPdfTextFromBytes(base64ToUint8Array(file.base64 || ""))).text;
    return {
      id: meta.id,
      title: meta.name,
      text: normalizeExtractedPdfText(extractedText).slice(0, textLimit),
      mimeType: file.mimeType,
      extension,
    };
  }

  return null;
}

async function buildActiveAiDocuments(sourceOverride = "") {
  const activeMeta = getActiveDocumentMeta();

  if (sourceOverride.trim()) {
    return [
      {
        id: activeMeta?.id || "manual-reading",
        title: activeMeta?.name || "当前阅读内容",
        text: sourceOverride.slice(0, AI_READING_TEXT_LIMIT),
        mimeType: "text/plain",
        extension: "TXT",
      },
    ];
  }

  const aiDocument = await buildAiDocumentFromMeta(activeMeta);

  if (!aiDocument?.text?.trim()) {
    throw new Error("当前课程还没有可用于 AI 的资料，请先导入或打开 PDF/Markdown。");
  }

  return [aiDocument];
}

function getRagKnowledge(course = getActiveCourse()) {
  course.ragKnowledge = sanitizeRagKnowledge(course.ragKnowledge);
  return course.ragKnowledge;
}

function splitRagText(text, chunkSize = RAG_DEFAULT_CHUNK_SIZE) {
  const normalized = normalizeExtractedPdfText(text);
  const size = normalizeRagNumber(chunkSize, RAG_DEFAULT_CHUNK_SIZE, RAG_MIN_CHUNK_SIZE, RAG_MAX_CHUNK_SIZE);

  if (!normalized) return [];

  const chunks = [];
  const paragraphs = normalized.split(/\n\s*\n/);
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= size) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (paragraph.length <= size) {
      current = paragraph;
      continue;
    }

    for (let index = 0; index < paragraph.length; index += size) {
      chunks.push(paragraph.slice(index, index + size));
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function getAiReadingChunkSettings() {
  const doc = documentState.current;
  const chunkInput = document.querySelector("#ai-reading-chunk-size");
  const maxChunksInput = document.querySelector("#ai-reading-max-chunks");
  const chunkSize = normalizeRagNumber(
    chunkInput?.value || doc?.meta?.aiChunkSize,
    RAG_DEFAULT_CHUNK_SIZE,
    RAG_MIN_CHUNK_SIZE,
    RAG_MAX_CHUNK_SIZE,
  );
  const maxChunks = normalizeRagNumber(
    maxChunksInput?.value || doc?.meta?.aiMaxChunks,
    RAG_DEFAULT_MAX_CHUNKS,
    RAG_MIN_MAX_CHUNKS,
    RAG_MAX_MAX_CHUNKS,
  );

  return {
    chunkSize,
    maxChunks,
    maxContextChars: Math.min(AI_READING_TEXT_LIMIT, chunkSize * maxChunks),
  };
}

function rememberAiChunkSettings() {
  const doc = documentState.current;
  if (!doc) return;
  const settings = getAiReadingChunkSettings();
  doc.meta.aiChunkSize = settings.chunkSize;
  doc.meta.aiMaxChunks = settings.maxChunks;
  saveWorkspace();
}

function getPdfRangeFromInputs(prefix, pageCount) {
  const startInput = document.querySelector(`#${prefix}-pdf-start-page`);
  const endInput = document.querySelector(`#${prefix}-pdf-end-page`);
  let startPage = Math.min(pageCount, Math.max(1, Number(startInput?.value) || 1));
  let endPage = Math.min(pageCount, Math.max(1, Number(endInput?.value) || startPage));

  if (endPage < startPage) {
    [startPage, endPage] = [endPage, startPage];
  }

  if (startInput) startInput.value = String(startPage);
  if (endInput) endInput.value = String(endPage);

  return {
    startPage,
    endPage,
  };
}

async function getActivePdfSource() {
  const meta = getActiveDocumentMeta();

  if (!meta || String(meta.extension || "").toUpperCase() !== "PDF") {
    throw new Error("请先选择一个 PDF 文件。");
  }

  if (documentState.current?.meta?.id === meta.id && documentState.current.kind === "pdf") {
    return {
      meta,
      bytes: documentState.current.bytes,
      pageCount: Math.max(1, documentState.current.pageCount || meta.pageCount || 1),
    };
  }

  const file = await readStoredFile(meta);
  const bytes = base64ToUint8Array(file.base64 || "");
  let pageCount = Math.max(1, meta.pageCount || 1);

  if (window.PDFLib) {
    try {
      const { PDFDocument } = window.PDFLib;
      const pdfDoc = await PDFDocument.load(bytes);
      pageCount = Math.max(1, pdfDoc.getPageCount());
      meta.pageCount = pageCount;
      saveWorkspace();
    } catch (error) {
      pageCount = Math.max(1, meta.pageCount || 1);
    }
  }

  return {
    meta,
    bytes,
    pageCount,
  };
}

async function createPdfRangeBytes(bytes, startPage, endPage) {
  if (!window.PDFLib) {
    throw new Error("PDF 编辑库尚未加载，请重新运行 npm install。");
  }

  const { PDFDocument } = window.PDFLib;
  const sourcePdf = await PDFDocument.load(bytes);
  const pageCount = sourcePdf.getPageCount();
  const safeStart = Math.min(pageCount, Math.max(1, Number(startPage) || 1));
  const safeEnd = Math.min(pageCount, Math.max(safeStart, Number(endPage) || safeStart));
  const targetPdf = await PDFDocument.create();
  const pageIndexes = [];

  for (let pageIndex = safeStart - 1; pageIndex <= safeEnd - 1; pageIndex += 1) {
    pageIndexes.push(pageIndex);
  }

  const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndexes);
  copiedPages.forEach((page) => targetPdf.addPage(page));

  return {
    bytes: await targetPdf.save(),
    startPage: safeStart,
    endPage: safeEnd,
    pageCount: copiedPages.length,
    originalPageCount: pageCount,
  };
}

async function exportActivePdfRange(prefix = "ai") {
  try {
    const source = await getActivePdfSource();
    const range = getPdfRangeFromInputs(prefix, source.pageCount);
    const subPdf = await createPdfRangeBytes(source.bytes, range.startPage, range.endPage);
    const baseName = source.meta.name.replace(/\.pdf$/i, "");

    await saveBinaryFile(`${baseName}-p${subPdf.startPage}-${subPdf.endPage}.pdf`, subPdf.bytes, [
      { name: "PDF", extensions: ["pdf"] },
    ]);

    if (prefix === "ai") {
      const doc = documentState.current;
      if (doc?.kind === "pdf") {
        doc.meta.pdfRangeStart = subPdf.startPage;
        doc.meta.pdfRangeEnd = subPdf.endPage;
        saveWorkspace();
      }
    }
  } catch (error) {
    if (prefix === "rag") {
      setRagStatus(getAiErrorMessage(error), "warning");
    } else {
      const output = document.querySelector("#ai-reading-output");
      setAiMarkdownContent(output, getAiErrorMessage(error));
    }
  }
}

function getRagSettingsFromInputs() {
  const knowledge = getRagKnowledge();
  const chunkSize = normalizeRagNumber(knowledge.settings.chunkSize, RAG_DEFAULT_CHUNK_SIZE, RAG_MIN_CHUNK_SIZE, RAG_MAX_CHUNK_SIZE);
  const maxChunks = normalizeRagNumber(knowledge.settings.maxChunks, RAG_DEFAULT_MAX_CHUNKS, RAG_MIN_MAX_CHUNKS, RAG_MAX_MAX_CHUNKS);

  return {
    chunkSize,
    maxChunks,
    includeWeb: document.querySelector("#rag-include-web")?.checked ?? knowledge.settings.includeWeb,
    maxContextChars: Math.min(18000, chunkSize * maxChunks),
  };
}

function rememberRagSettings() {
  const knowledge = getRagKnowledge();
  knowledge.settings = getRagSettingsFromInputs();
  knowledge.documents = knowledge.documents.map((documentMeta) => ({
    ...documentMeta,
    chunkSize: knowledge.settings.chunkSize,
    chunkCount: splitRagText(documentMeta.text, knowledge.settings.chunkSize).length,
  }));
  knowledge.updatedAt = Date.now();
  saveWorkspace();
  renderRagAssistant();
}

function setRagStatus(text, tone = "ready") {
  const status = document.querySelector("#rag-status");
  if (!status) return;
  status.textContent = text;
  status.className = `rag-status ${tone}`;
}

function isPdfMeta(meta) {
  return String(meta?.extension || "").toUpperCase() === "PDF";
}

function canUseCachedPdfText(meta, options = {}) {
  if (!isPdfMeta(meta) || !meta.extractedText || meta.pdfTextStale) return false;
  if (!options.requireCompletePdfOcr) return true;
  return Boolean(meta.pdfLearningComplete) && !meta.ocrSkippedPageCount;
}

function buildLearningPdfExtractionOptions(meta, callbacks = {}) {
  return {
    ocrMissingPages: true,
    ocrAllPages: true,
    totalTextLimit: callbacks.totalTextLimit || RAG_KNOWLEDGE_TEXT_LIMIT,
    onOcrStart: ({ total, skippedPageCount }) => {
      callbacks.onStatus?.(
        total
          ? `正在识别 ${meta.name} 的 ${total} 页扫描内容...`
          : `正在整理 ${meta.name} 的文字...`,
        { total, skippedPageCount },
      );
    },
    onOcrProgress: ({ index, total, pageNumber }) => {
      callbacks.onStatus?.(`正在识别 ${meta.name}：${index}/${total} 页（第 ${pageNumber} 页）`, {
        index,
        total,
        pageNumber,
      });
    },
  };
}

function compactExtractedPagesForStorage(pages = [], totalLimit = PDF_TEXT_LIMIT) {
  const storedPages = [];
  let storedLength = 0;

  for (const page of pages || []) {
    if (!page?.text) continue;
    const text = String(page.text || "").slice(0, PDF_PAGE_TEXT_LIMIT);
    if (storedLength + text.length > totalLimit && storedPages.length > 0) break;
    storedPages.push({
      pageNumber: page.pageNumber,
      text,
      source: page.source || "text-layer",
      confidence: page.confidence,
    });
    storedLength += text.length;
  }

  return storedPages;
}

function rememberPdfTextExtraction(meta, extracted, options = {}) {
  meta.extractedText = extracted.text;
  meta.extractedPages = compactExtractedPagesForStorage(extracted.pages || [], Math.min(RAG_KNOWLEDGE_TEXT_LIMIT, options.totalStoredPageTextLimit || RAG_KNOWLEDGE_TEXT_LIMIT));
  meta.extractedPageCount = extracted.extractedPageCount || meta.extractedPages.filter((page) => page.text).length;
  meta.ocrPageCount = extracted.ocrPageCount || 0;
  meta.ocrAttemptedPageCount = extracted.ocrAttemptedPageCount || 0;
  meta.ocrSkippedPageCount = extracted.ocrSkippedPageCount || 0;
  meta.ocrErrors = extracted.ocrErrors || [];
  meta.pdfLearningTextLimitReached = Boolean(extracted.textLimitReached);
  meta.pdfLearningComplete = Boolean(options.requireCompletePdfOcr)
    ? !extracted.ocrSkippedPageCount && !(extracted.ocrErrors || []).length
    : Boolean(meta.pdfLearningComplete && !extracted.ocrSkippedPageCount);
  meta.extractedAt = extracted.extractedAt || Date.now();
  meta.pdfTextStale = false;
}

function formatRagDate(value) {
  if (!value) return "尚未学习";
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderRagAssistant() {
  const root = document.querySelector("[data-view-panel='rag']");
  if (!root) return;

  const knowledge = getRagKnowledge();
  const settings = knowledge.settings;
  const chunkTotal = knowledge.documents.reduce((sum, documentMeta) => sum + (Number(documentMeta.chunkCount) || 0), 0);
  const stats = document.querySelector("#rag-knowledge-stats");
  const list = document.querySelector("#rag-learned-files");
  const includeWebInput = document.querySelector("#rag-include-web");
  const activePdf = documentState.current?.kind === "pdf" ? documentState.current : null;
  const activePage = activePdf ? getActivePdfPageNumber(activePdf) : 1;
  const activePageCount = activePdf ? Math.max(1, activePdf.pageCount || activePdf.meta.pageCount || 1) : 1;
  const rangeStartInput = document.querySelector("#rag-pdf-start-page");
  const rangeEndInput = document.querySelector("#rag-pdf-end-page");

  if (stats) {
    stats.textContent = `${knowledge.documents.length} 个文件 · ${chunkTotal} 段知识`;
  }

  if (includeWebInput) includeWebInput.checked = settings.includeWeb;
  if (rangeStartInput) {
    rangeStartInput.max = String(activePageCount);
    rangeStartInput.value = String(Math.min(activePageCount, Math.max(1, Number(rangeStartInput.value) || activePage)));
  }
  if (rangeEndInput) {
    rangeEndInput.max = String(activePageCount);
    rangeEndInput.value = String(Math.min(activePageCount, Math.max(1, Number(rangeEndInput.value) || activePage)));
  }

  if (list) {
    list.innerHTML = knowledge.documents.length
      ? knowledge.documents
          .map((documentMeta) => {
            const ocrPageTotal = Math.max(Number(documentMeta.ocrAttemptedPageCount) || 0, Number(documentMeta.ocrPageCount) || 0);
            const ocrLabel = ocrPageTotal ? ` · OCR ${ocrPageTotal} 页` : "";
            const completeLabel = documentMeta.pdfLearningComplete
              ? documentMeta.pdfLearningTextLimitReached ? " · 已全页识别（已压缩）" : " · 已全页识别"
              : "";
            return `
              <article class="rag-learned-card">
                <div>
                  <strong>${escapeHtml(documentMeta.title)}</strong>
                  <span>${escapeHtml(documentMeta.extension || "TXT")} · ${documentMeta.chunkCount} 段知识 · ${documentMeta.textLength} 字${ocrLabel}${completeLabel}</span>
                </div>
                <small>${escapeHtml(formatRagDate(documentMeta.learnedAt))}</small>
              </article>
            `;
          })
          .join("")
      : `<div class="rag-empty">还没有学习文件。先从当前资料或整个课程生成知识库。</div>`;
  }

  renderRagMessages();
  setRagStatus(knowledge.documents.length ? "知识库已就绪" : "等待学习资料", knowledge.documents.length ? "ready" : "working");
  window.lucide?.createIcons();
}

function renderRagMessages() {
  const chatList = document.querySelector("#rag-chat-list");
  if (!chatList) return;
  const messages = getRagKnowledge().messages;

  chatList.innerHTML = messages.length
    ? messages
        .map((message) => {
          const sourceMarkup = Array.isArray(message.sources) && message.sources.length
            ? `<div class="rag-source-list">${message.sources
                .map((source) => `<span>${escapeHtml(source.label || "")} ${escapeHtml(source.title || source.name || source.id || "")}</span>`)
                .join("")}</div>`
            : "";
          const webMarkup = message.webSearch
            ? `<small class="rag-web-note">${message.webSearch.error ? `联网搜索失败：${escapeHtml(message.webSearch.error)}` : `联网搜索：${message.webSearch.results?.length || 0} 条结果`}</small>`
            : "";
          const bodyMarkup = message.role === "assistant"
            ? renderAiMarkdown(message.text)
            : `<p>${escapeHtml(message.text)}</p>`;
          return `
            <article class="rag-message ${message.role}">
              ${bodyMarkup}
              ${sourceMarkup}
              ${webMarkup}
            </article>
          `;
        })
        .join("")
    : `<div class="rag-empty">学习文件后，在这里向知识库提问。</div>`;

  chatList.scrollTop = chatList.scrollHeight;
}

function addRagMessage(message) {
  const knowledge = getRagKnowledge();
  knowledge.messages = [
    ...knowledge.messages,
    {
      role: message.role,
      text: String(message.text || "").slice(0, 4000),
      createdAt: Date.now(),
      sources: Array.isArray(message.sources) ? message.sources : [],
      webSearch: message.webSearch || null,
    },
  ].slice(-12);
  knowledge.updatedAt = Date.now();
  saveWorkspace();
  renderRagMessages();
}

async function getRagDocumentText(meta, options = {}) {
  const activeDoc = documentState.current?.meta?.id === meta.id ? documentState.current : null;

  if (activeDoc?.kind === "md") {
    return stripMarkdown(activeDoc.editedText || activeDoc.text || "");
  }

  if (activeDoc?.kind === "pdf") {
    if (canUseCachedPdfText(activeDoc.meta, options)) {
      return activeDoc.meta.extractedText;
    }

    const extracted = await extractPdfTextFromBytes(activeDoc.bytes, {
      ...options.extractionOptions,
    });
    activeDoc.pdfText = extracted;
    rememberPdfTextExtraction(activeDoc.meta, extracted, options);
    saveWorkspace();
    return extracted.text;
  }

  const file = await readStoredFile(meta);
  const extension = String(file.extension || meta.extension || "").toUpperCase();

  if (extension === "MD") {
    return stripMarkdown(base64ToText(file.base64 || ""));
  }

  if (extension === "PDF") {
    if (canUseCachedPdfText(meta, options)) {
      return meta.extractedText;
    }

    const extracted = await extractPdfTextFromBytes(base64ToUint8Array(file.base64 || ""), {
      ...options.extractionOptions,
    });
    rememberPdfTextExtraction(meta, extracted, options);
    saveWorkspace();
    return extracted.text;
  }

  return "";
}

async function buildRagKnowledgeDocument(meta, options = {}) {
  const settings = getRagSettingsFromInputs();
  const text = normalizeExtractedPdfText(await getRagDocumentText(meta, options)).slice(0, RAG_KNOWLEDGE_TEXT_LIMIT);

  if (!text) {
    throw new Error(`${meta.name} 没有可学习的文本。`);
  }

  return {
    id: meta.id,
    title: meta.name,
    extension: meta.extension || "TXT",
    size: meta.size || 0,
    text,
    textLength: text.length,
    chunkSize: settings.chunkSize,
    chunkCount: splitRagText(text, settings.chunkSize).length,
    learnedAt: Date.now(),
    sourceType: "course",
    ocrPageCount: Math.max(0, Number(meta.ocrPageCount) || 0),
    ocrAttemptedPageCount: Math.max(0, Number(meta.ocrAttemptedPageCount) || 0),
    ocrSkippedPageCount: Math.max(0, Number(meta.ocrSkippedPageCount) || 0),
    pdfLearningComplete: Boolean(meta.pdfLearningComplete),
    pdfLearningTextLimitReached: Boolean(meta.pdfLearningTextLimitReached),
  };
}

function upsertRagKnowledgeDocument(documentMeta) {
  const knowledge = getRagKnowledge();
  const index = knowledge.documents.findIndex((item) => item.id === documentMeta.id);

  if (index >= 0) {
    knowledge.documents[index] = documentMeta;
  } else {
    knowledge.documents.unshift(documentMeta);
  }

  knowledge.updatedAt = Date.now();
}

async function learnRagKnowledge(scope) {
  const course = getActiveCourse();
  const metas = scope === "course" ? course.documents : [getActiveDocumentMeta()].filter(Boolean);

  if (!metas.length) {
    setRagStatus("当前课程没有可学习文件", "warning");
    return;
  }

  setRagStatus(scope === "course" ? "正在学习本课程..." : "正在学习当前文件...", "working");

  try {
    for (const [index, meta] of metas.entries()) {
      setRagStatus(scope === "course" ? `正在学习 ${index + 1}/${metas.length}：${meta.name}` : `正在学习 ${meta.name}`, "working");
      const learningOptions = isPdfMeta(meta)
        ? {
            requireCompletePdfOcr: true,
            extractionOptions: buildLearningPdfExtractionOptions(meta, {
              onStatus: (message) => setRagStatus(message, "working"),
            }),
          }
        : {};
      const learnedDocument = await buildRagKnowledgeDocument(meta, learningOptions);
      upsertRagKnowledgeDocument(learnedDocument);
    }

    saveWorkspace();
    renderRagAssistant();
    setRagStatus(scope === "course" ? `已学习 ${metas.length} 个文件` : "当前文件已学习", "ready");
  } catch (error) {
    setRagStatus(getAiErrorMessage(error), "warning");
  }
}

async function learnActivePdfRange() {
  setRagStatus("正在学习 PDF 页段...", "working");

  try {
    const source = await getActivePdfSource();
    const range = getPdfRangeFromInputs("rag", source.pageCount);
    const subPdf = await createPdfRangeBytes(source.bytes, range.startPage, range.endPage);
    const extracted = await extractPdfTextFromBytes(subPdf.bytes, {
      ocrMissingPages: true,
      ocrAllPages: true,
      totalTextLimit: RAG_KNOWLEDGE_TEXT_LIMIT,
      onOcrStart: ({ total }) => {
        setRagStatus(`正在识别 ${total} 页扫描内容...`, "working");
      },
      onOcrProgress: ({ index, total }) => {
        setRagStatus(`正在识别扫描内容 ${index}/${total}`, "working");
      },
    });
    const text = normalizeExtractedPdfText(extracted.text).slice(0, RAG_KNOWLEDGE_TEXT_LIMIT);

    if (!text) {
      throw new Error("这个页段没有提取到可学习文字，可能是扫描图片页。");
    }

    const settings = getRagSettingsFromInputs();
    upsertRagKnowledgeDocument({
      id: `${source.meta.id}:p${subPdf.startPage}-${subPdf.endPage}`,
      title: `${source.meta.name} P${subPdf.startPage}-${subPdf.endPage}`,
      extension: "PDF",
      size: subPdf.bytes.length || source.meta.size || 0,
      text,
      textLength: text.length,
      chunkSize: settings.chunkSize,
      chunkCount: splitRagText(text, settings.chunkSize).length,
      learnedAt: Date.now(),
      sourceType: "pdf-range",
      ocrPageCount: extracted.ocrPageCount || 0,
      ocrAttemptedPageCount: extracted.ocrAttemptedPageCount || 0,
      ocrSkippedPageCount: extracted.ocrSkippedPageCount || 0,
      pdfLearningComplete: !extracted.ocrSkippedPageCount && !(extracted.ocrErrors || []).length,
      pdfLearningTextLimitReached: Boolean(extracted.textLimitReached),
      pageRange: {
        startPage: subPdf.startPage,
        endPage: subPdf.endPage,
      },
    });

    saveWorkspace();
    renderRagAssistant();
    setRagStatus(`已学习第 ${subPdf.startPage}-${subPdf.endPage} 页`, "ready");
  } catch (error) {
    setRagStatus(getAiErrorMessage(error), "warning");
  }
}

function clearRagKnowledge() {
  const knowledge = getRagKnowledge();
  knowledge.documents = [];
  knowledge.messages = [];
  knowledge.updatedAt = Date.now();
  saveWorkspace();
  renderRagAssistant();
}

async function submitRagQuestion(event) {
  event.preventDefault();
  const input = document.querySelector("#rag-question-input");
  const question = input?.value.trim();

  if (!question) {
    setRagStatus("请先输入问题", "warning");
    input?.focus();
    return;
  }

  const knowledge = getRagKnowledge();
  const settings = getRagSettingsFromInputs();

  if (!knowledge.documents.length && !settings.includeWeb) {
    setRagStatus("请先学习文件，或开启联网搜索", "warning");
    return;
  }

  addRagMessage({ role: "user", text: question });
  input.value = "";
  setRagStatus(LONGLONG_THINKING_LINE, "working");
  playLonglongThinkingLine();

  try {
    await ensureAiConfigured();
    const response = await window.mindStudy.rag.askLibrary({
      question,
      documents: knowledge.documents,
      includeWeb: settings.includeWeb,
      options: {
        chunkSize: settings.chunkSize,
        maxChunks: settings.maxChunks,
        maxContextChars: settings.maxContextChars,
        webResults: 4,
        maxTokens: 1200,
      },
    });

    addRagMessage({
      role: "assistant",
      text: withLonglongAnswerLine(response.answer || "AI 没有返回内容。"),
      sources: response.sources || [],
      webSearch: response.webSearch || null,
    });
    playLonglongAnswerLine();
    setRagStatus("回答完成", "ready");
  } catch (error) {
    addRagMessage({
      role: "assistant",
      text: getAiErrorMessage(error),
    });
    setRagStatus("回答失败", "warning");
  }
}

function setCodingStatus(text, tone = "ready") {
  const status = document.querySelector("#coding-status");
  if (!status) return;
  status.textContent = text;
  status.className = `rag-status ${tone}`;
}

async function submitCodingAssistant(event) {
  event.preventDefault();
  const form = event.target;
  const problemInput = form.querySelector("#coding-problem");
  const codeInput = form.querySelector("#coding-code");
  const languageInput = form.querySelector("#coding-language");
  const output = document.querySelector("#coding-output");
  const problem = problemInput?.value.trim() || "";
  const code = codeInput?.value.trim() || "";
  const language = languageInput?.value || "auto";

  if (!problem && !code) {
    setCodingStatus("请先输入题目或代码", "warning");
    problemInput?.focus();
    return;
  }

  setCodingStatus(LONGLONG_THINKING_LINE, "working");
  playLonglongThinkingLine();
  if (output) {
    output.innerHTML = `
      <div class="coding-empty">
        <strong>${LONGLONG_THINKING_LINE}</strong>
        <span>${code ? "正在检查复杂度、可行性和优化空间。" : "正在整理思路并生成推荐代码。"}</span>
      </div>
    `;
  }

  try {
    await ensureAiConfigured();
    if (!window.mindStudy?.ai?.askCoding) {
      throw new Error("阿龙 coding 接口尚未可用。");
    }

    const response = await window.mindStudy.ai.askCoding({
      problem,
      code,
      language,
      options: {
        maxTokens: 2600,
        temperature: 0.18,
      },
    });

    setAiMarkdownContent(output, withLonglongAnswerLine(response.answer));
    playLonglongAnswerLine();
    setCodingStatus(code ? "代码分析完成" : "解法生成完成", "ready");
  } catch (error) {
    if (output) {
      output.innerHTML = `
        <div class="coding-empty">
          <strong>阿龙暂时没跑起来</strong>
          <span>${escapeHtml(getAiErrorMessage(error))}</span>
        </div>
      `;
    }
    setCodingStatus("请求失败", "warning");
  }
}

function clearCodingAssistant() {
  document.querySelector("#coding-form")?.reset();
  const output = document.querySelector("#coding-output");
  if (output) {
    output.innerHTML = `
      <div class="coding-empty">
        <strong>把题目或代码交给阿龙</strong>
        <span>支持复杂度分析、可行性判断、优化建议，以及根据题目生成一版推荐代码。</span>
      </div>
    `;
  }
  setCodingStatus("等待输入", "ready");
}

function normalizeSelectedFiles(result) {
  if (!result) return [];
  return Array.isArray(result) ? result : [result];
}

function openBrowserFilePicker() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.md,application/pdf,text/markdown";

    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) {
        resolve([]);
        return;
      }

      Promise.all(
        files.map(
          (file) =>
            new Promise((fileResolve) => {
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                const dataUrl = String(reader.result);
                fileResolve({
                  name: file.name,
                  extension: getExtension(file.name),
                  mimeType: file.type || "application/octet-stream",
                  size: file.size,
                  path: "",
                  updatedAt: file.lastModified,
                  dataUrl,
                  base64: dataUrl.split(",")[1],
                });
              });
              reader.readAsDataURL(file);
            }),
        ),
      ).then(resolve);
    });

    input.click();
  });
}

function openImageFilePicker() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const dataUrl = String(reader.result);
        resolve({
          name: file.name,
          mimeType: file.type || getMimeTypeFromName(file.name),
          size: file.size,
          dataUrl,
          base64: dataUrl.split(",")[1],
        });
      });
      reader.readAsDataURL(file);
    });

    input.click();
  });
}

async function selectCourseFiles() {
  if (window.mindStudy?.selectCourseFile) {
    return normalizeSelectedFiles(await window.mindStudy.selectCourseFile());
  }

  return openBrowserFilePicker();
}

async function readStoredFile(meta) {
  if (runtimeFiles.has(meta.id)) {
    return runtimeFiles.get(meta.id);
  }

  if (meta.path && window.mindStudy?.readCourseFile) {
    const file = await window.mindStudy.readCourseFile(meta.path);
    runtimeFiles.set(meta.id, file);
    return file;
  }

  throw new Error("该资料只有本次会话的临时内容。请重新导入一次，或使用 Electron 桌面端保存本机路径。");
}

function getReaderFullscreenButtonMarkup() {
  return `
    <button class="mini-button" id="toggle-reader-fullscreen">
      <i data-lucide="maximize-2"></i>
      <span>全屏阅读</span>
    </button>
  `;
}

function syncFullscreenButton() {
  const readerLayout = document.querySelector(".reader-layout");
  const buttons = document.querySelectorAll("#toggle-reader-fullscreen");
  if (!buttons.length) return;

  const isReaderFullscreen =
    document.fullscreenElement?.classList.contains("reader-layout") ||
    readerLayout?.classList.contains("reader-fullscreen-fallback");
  buttons.forEach((button) => {
    button.innerHTML = isReaderFullscreen
    ? `<i data-lucide="minimize-2"></i><span>退出全屏</span>`
    : `<i data-lucide="maximize-2"></i><span>全屏阅读</span>`;
  });
  window.lucide?.createIcons();
}

function rerenderCurrentPdfAfterReaderResize(delay = 120) {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  window.clearTimeout(pdfReaderResizeRenderTimer);
  pdfReaderResizeRenderTimer = window.setTimeout(() => {
    const currentDoc = documentState.current;
    if (!currentDoc || currentDoc.kind !== "pdf") return;

    rememberCurrentNotes();
    rememberCurrentAiReading();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        renderPdfPages(currentDoc);
      });
    });
  }, delay);
}

function exitReaderFullscreenFallback() {
  const readerLayout = document.querySelector(".reader-layout");
  readerLayout?.classList.remove("reader-fullscreen-fallback");
  document.body.classList.remove("reader-fullscreen-lock");
  syncFullscreenButton();
  rerenderCurrentPdfAfterReaderResize();
}

function enterReaderFullscreenFallback(readerLayout) {
  readerLayout.classList.add("reader-fullscreen-fallback");
  document.body.classList.add("reader-fullscreen-lock");
  syncFullscreenButton();
  rerenderCurrentPdfAfterReaderResize();
}

async function toggleReaderFullscreen() {
  const readerLayout = document.querySelector(".reader-layout");
  if (!readerLayout) return;

  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {
      // Keep the app-level reading mode responsive even when native fullscreen is blocked.
    }
  }

  if (readerLayout.classList.contains("reader-fullscreen-fallback")) {
    exitReaderFullscreenFallback();
  } else {
    enterReaderFullscreenFallback(readerLayout);
  }
}

function getCameraUi() {
  return {
    topButton: document.querySelector("#toggle-camera"),
    topText: document.querySelector("#camera-status-text"),
    video: document.querySelector("#camera-preview"),
    landmarkOverlay: document.querySelector("#camera-landmark-overlay"),
    landmarkToggle: document.querySelector("#toggle-camera-landmarks"),
    placeholder: document.querySelector("#camera-placeholder"),
    startButton: document.querySelector("#start-camera"),
    stopButton: document.querySelector("#stop-camera"),
    moodTitle: document.querySelector("#camera-mood-title"),
    modeBadge: document.querySelector("#camera-mode-badge"),
    focusScore: document.querySelector("#camera-focus-score"),
    focusLabel: document.querySelector("#camera-focus-label"),
    gestureTitle: document.querySelector("#gesture-status-title"),
    emotionDetail: document.querySelector("#camera-emotion-detail"),
    gestureDetail: document.querySelector("#camera-gesture-detail"),
  };
}

function setCameraStatus(status, detail = "") {
  const ui = getCameraUi();
  const isActive = status === "active";
  const labels = {
    idle: "摄像头未开启",
    pending: "请求摄像头中",
    active: "摄像头识别中",
    error: "摄像头不可用",
  };

  if (ui.topText) ui.topText.textContent = labels[status] || labels.idle;
  ui.topButton?.classList.toggle("active", isActive);
  if (ui.startButton) ui.startButton.disabled = isActive || status === "pending";
  if (ui.stopButton) ui.stopButton.disabled = !isActive;
  if (ui.placeholder) {
    ui.placeholder.classList.toggle("hidden", isActive);
    ui.placeholder.querySelector("span").textContent = detail || labels[status] || labels.idle;
  }
  if (ui.moodTitle) {
    ui.moodTitle.textContent = isActive ? "当前状态：摄像头识别中" : `当前状态：${detail || labels[status] || labels.idle}`;
  }
  if (ui.modeBadge) ui.modeBadge.textContent = isActive ? "实时识别" : status === "pending" ? "请求中" : "待开启";
  if (ui.gestureTitle) ui.gestureTitle.textContent = isActive ? "等待手势" : "等待摄像头";

  const mood = isActive ? "摄像头识别中" : detail || labels[status] || labels.idle;
  const moodDetailMap = {
    idle: "需要我观察学习状态时，可以让我开启摄像头。",
    pending: "我正在请求摄像头权限，稍等一下。",
    active: "我会观察光线和专注状态，并给出音乐建议。",
    error: "摄像头暂时不可用，我仍会提醒日程和资料库问题。",
  };
  updateLonglongMood(mood, moodDetailMap[status] || moodDetailMap.idle);
}

function updateCameraMetrics(brightness) {
  const ui = getCameraUi();
  const normalized = Math.max(0, Math.min(100, Math.round((brightness / 255) * 100)));
  if (cameraState.lastVisionResultAt && Date.now() - cameraState.lastVisionResultAt < 1200) return;

  let score = 74;
  let label = "光线良好";
  let title = "当前状态：专注识别中";

  if (normalized < 22) {
    score = 56;
    label = "画面偏暗";
    title = "当前状态：光线偏暗";
  } else if (normalized > 82) {
    score = 66;
    label = "光线偏强";
    title = "当前状态：光线偏强";
  } else if (normalized > 55) {
    score = 82;
    label = "识别稳定";
  }

  if (ui.focusScore) ui.focusScore.textContent = String(score);
  if (ui.focusLabel) ui.focusLabel.textContent = label;
  if (ui.moodTitle) ui.moodTitle.textContent = title;
  if (ui.gestureTitle) ui.gestureTitle.textContent = "摄像头已开启，等待手势";
  updateLonglongMood(
    title.replace("当前状态：", ""),
    `${label}，专注分 ${score}。${normalized < 22 ? "先把环境光补足再继续。" : normalized > 82 ? "光线偏强，可以降低屏幕亮度。" : "现在适合继续沉浸阅读。"}`,
    getLonglongMusicForBrightness(normalized),
  );
}

function getLonglongMusicForEmotion(emotionId, normalizedBrightness) {
  if (emotionId === "tired") return "雨声 + 低速钢琴，建议先休息 3 分钟再继续。";
  if (emotionId === "confused") return "低干扰白噪音，适合边听边让 AI 解释当前资料。";
  if (emotionId === "relaxed") return "轻钢琴 + 自然环境音，保持当前学习节奏。";
  if (emotionId === "away") return "暂停音乐，等你回到学习状态后继续。";
  return getLonglongMusicForBrightness(normalizedBrightness);
}

function readEnvNumber(env, key, fallback, min, max) {
  const value = Number(env?.[key]);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function readEnvBoolean(env, key, fallback) {
  const value = String(env?.[key] ?? "").trim().toLowerCase();
  if (!value) return fallback;
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return fallback;
}

async function loadGestureRuntimeConfig() {
  try {
    const env = await window.mindStudy?.getFrontendEnv?.();
    gestureRuntimeConfig.visionFrameIntervalMs = readEnvNumber(env, "VISION_FRAME_INTERVAL_MS", 180, 60, 2000);
    gestureRuntimeConfig.showVisionLandmarks = readEnvBoolean(env, "SHOW_VISION_LANDMARKS", false);
    window.MindStudyVision?.configure?.({
      frameIntervalMs: gestureRuntimeConfig.visionFrameIntervalMs,
    });
  } catch (error) {
    console.warn("Failed to load frontend gesture config.", error);
  }

  syncVisionLandmarkToggle();
  return { ...gestureRuntimeConfig };
}

function syncVisionLandmarkToggle() {
  const toggle = getCameraUi().landmarkToggle;
  if (!toggle) return;
  toggle.setAttribute("aria-pressed", gestureRuntimeConfig.showVisionLandmarks ? "true" : "false");
  toggle.title = gestureRuntimeConfig.showVisionLandmarks ? "关闭识别点阵" : "开启识别点阵";
}

function setVisionLandmarksVisible(visible) {
  gestureRuntimeConfig.showVisionLandmarks = Boolean(visible);
  if (!gestureRuntimeConfig.showVisionLandmarks) clearVisionLandmarks();
  syncVisionLandmarkToggle();
}

function toggleVisionLandmarks() {
  setVisionLandmarksVisible(!gestureRuntimeConfig.showVisionLandmarks);
}

function updateGestureCards(gestureId) {
  document.querySelectorAll("[data-gesture-id]").forEach((card) => {
    card.classList.toggle("active", card.dataset.gestureId === gestureId);
  });
}

function setupGestureCategoryLabels() {
  const labels = {
    "left-thumb-click": ["\u5de6\u624b\u70b9\u8d5e", "\u9f20\u6807\u5de6\u952e"],
    "right-index-pointer": ["\u53f3\u624b\u98df\u6307", "\u9f20\u6807\u79fb\u52a8"],
    "left-fist-right-index-scroll": ["\u5de6\u62f3 + \u53f3\u98df\u6307", "\u6eda\u8f6e\u6ed1\u52a8"],
  };

  Object.entries(labels).forEach(([gestureId, lines]) => {
    const card = document.querySelector(`[data-gesture-id="${gestureId}"]`);
    if (!card) return;
    card.replaceChildren(lines[0], document.createElement("br"), lines[1]);
  });
}

function resizeVisionOverlay(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  return { width: rect.width, height: rect.height, dpr };
}

function landmarkToCanvasPoint(landmark, width, height) {
  return {
    x: (1 - Number(landmark.x || 0)) * width,
    y: Number(landmark.y || 0) * height,
  };
}

function drawLandmarkPoint(context, landmark, width, height, color, radius = 2.8) {
  const point = landmarkToCanvasPoint(landmark, width, height);
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}

function drawLandmarkConnection(context, landmarks, from, to, width, height, color) {
  const start = landmarks?.[from];
  const end = landmarks?.[to];
  if (!start || !end) return;

  const startPoint = landmarkToCanvasPoint(start, width, height);
  const endPoint = landmarkToCanvasPoint(end, width, height);
  context.beginPath();
  context.moveTo(startPoint.x, startPoint.y);
  context.lineTo(endPoint.x, endPoint.y);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
}

function clearVisionLandmarks() {
  const canvas = getCameraUi().landmarkOverlay;
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function ensureGestureMouseCursor() {
  let cursor = document.querySelector("#gesture-mouse-cursor");
  if (cursor) return cursor;

  cursor = document.createElement("div");
  cursor.id = "gesture-mouse-cursor";
  cursor.className = "gesture-mouse-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  return cursor;
}

function setGestureMouseVisible(visible) {
  const cursor = ensureGestureMouseCursor();
  cameraState.mouse.visible = visible;
  cursor.classList.toggle("active", visible);
}

function moveGestureMouseTo(x, y) {
  const cursor = ensureGestureMouseCursor();
  const nextX = Math.max(8, Math.min(window.innerWidth - 8, x));
  const nextY = Math.max(8, Math.min(window.innerHeight - 8, y));
  cameraState.mouse.x = nextX;
  cameraState.mouse.y = nextY;
  cursor.style.transform = `translate(${nextX}px, ${nextY}px)`;
  setGestureMouseVisible(true);
}

function moveGestureMouseFromPoint(point) {
  if (!point) return;
  moveGestureMouseTo((1 - Number(point.x || 0)) * window.innerWidth, Number(point.y || 0) * window.innerHeight);
}

function clickGestureMouseTarget() {
  const now = Date.now();
  if (now - cameraState.mouse.lastClickAt < 650) return false;
  cameraState.mouse.lastClickAt = now;

  const x = cameraState.mouse.x || window.innerWidth / 2;
  const y = cameraState.mouse.y || window.innerHeight / 2;
  const target = document.elementFromPoint(x, y);
  const clickable = target?.closest?.("button, a, input, textarea, select, [role='button'], [data-node], [data-view], [data-view-jump]");
  if (!clickable || clickable.id === "gesture-mouse-cursor") return false;

  clickable.dispatchEvent(new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  }));
  return true;
}

function getGestureScrollTarget() {
  let element = document.elementFromPoint(cameraState.mouse.x || window.innerWidth / 2, cameraState.mouse.y || window.innerHeight / 2);
  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const canScroll = /(auto|scroll)/.test(`${style.overflowY} ${style.overflow}`);
    if (canScroll && element.scrollHeight > element.clientHeight) return element;
    element = element.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

function scrollByRightIndex(point) {
  if (!point) return false;
  const currentY = Number(point.y || 0);
  const previousY = cameraState.mouse.lastScrollY;
  cameraState.mouse.lastScrollY = currentY;
  if (previousY === null) return false;

  const delta = currentY - previousY;
  if (Math.abs(delta) < 0.018) return false;

  const now = Date.now();
  if (now - cameraState.mouse.lastScrollAt < 60) return false;
  cameraState.mouse.lastScrollAt = now;

  const scrollAmount = Math.max(-220, Math.min(220, delta * 1600));
  const target = getGestureScrollTarget();
  target.scrollBy({ top: scrollAmount, behavior: "auto" });
  return true;
}

function drawVisionLandmarks(result) {
  const canvas = getCameraUi().landmarkOverlay;
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  if (!gestureRuntimeConfig.showVisionLandmarks || !result) {
    clearVisionLandmarks();
    return;
  }

  const { width, height, dpr } = resizeVisionOverlay(canvas);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const handConnections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
  ];

  (result.hands || []).forEach((hand) => {
    const landmarks = hand.landmarks || [];
    handConnections.forEach(([from, to]) => {
      drawLandmarkConnection(context, landmarks, from, to, width, height, "rgba(24, 143, 132, 0.8)");
    });
    landmarks.forEach((landmark) => {
      drawLandmarkPoint(context, landmark, width, height, "#20d0bf", 3.2);
    });
  });

  (result.faceLandmarks || []).forEach((landmark) => {
    drawLandmarkPoint(context, landmark, width, height, "rgba(255, 190, 80, 0.78)", 1.45);
  });
}

function updateCameraVisionUi(result) {
  if (!result) return;
  cameraState.lastVisionResultAt = Date.now();

  const ui = getCameraUi();
  const emotion = result.emotion || {};
  const gesture = result.gesture || {};
  const normalizedBrightness = Math.max(0, Math.min(100, Math.round((cameraState.lastBrightness / 255) * 100)));
  const focusScore = Math.max(0, Math.min(100, Math.round(Number(emotion.focusScore) || 0)));
  const gestureConfidence = Math.round((Number(gesture.confidence) || 0) * 100);
  const emotionConfidence = Math.round((Number(emotion.confidence) || 0) * 100);

  if (ui.focusScore) ui.focusScore.textContent = String(focusScore || "--");
  if (ui.focusLabel) ui.focusLabel.textContent = emotion.label || "识别中";
  if (ui.moodTitle) ui.moodTitle.textContent = `当前状态：${emotion.label || "识别中"}`;
  if (ui.gestureTitle) {
    ui.gestureTitle.textContent = gesture.id && gesture.id !== "none"
      ? `${gesture.label} · ${gesture.action || "已识别"}`
      : "摄像头已开启，等待手势";
  }
  if (ui.emotionDetail) {
    ui.emotionDetail.textContent = `${emotion.detail || "正在分析面部状态"} · 置信度 ${emotionConfidence}%`;
  }
  if (ui.gestureDetail) {
    ui.gestureDetail.textContent = gesture.id && gesture.id !== "none"
      ? `${gesture.label}：${gesture.action || "仅展示"} · 置信度 ${gestureConfidence}%`
      : "未检测到稳定手势";
  }

  updateGestureCards(gesture.id || "none");
  updateLonglongMood(
    emotion.label || "摄像头识别中",
    emotion.detail || "我会结合表情和手势给出提醒。",
    getLonglongMusicForEmotion(emotion.id, normalizedBrightness),
  );
}

function rememberGestureAction(message) {
  const ui = getCameraUi();
  if (ui.gestureDetail) ui.gestureDetail.textContent = message;
  updateLonglongMood("手势已触发", message);
}

function handleMouseControlGesture(gesture) {
  if (!gesture?.id || gesture.id === "none") {
    cameraState.mouse.lastScrollY = null;
    return;
  }
  if ((Number(gesture.confidence) || 0) < 0.5) return;

  if (gesture.mode === "scroll") {
    moveGestureMouseFromPoint(gesture.point);
    if (scrollByRightIndex(gesture.point)) {
      rememberGestureAction("\u624b\u52bf\u89e6\u53d1\uff1a\u6eda\u8f6e\u4e0a\u4e0b\u6ed1\u52a8");
    }
    return;
  }

  cameraState.mouse.lastScrollY = null;

  if (gesture.mode === "click") {
    if (clickGestureMouseTarget()) {
      rememberGestureAction("\u624b\u52bf\u89e6\u53d1\uff1a\u9f20\u6807\u5de6\u952e");
    }
    return;
  }

  if (gesture.mode === "point") {
    moveGestureMouseFromPoint(gesture.point);
  }
}

async function updateVisionRecognition(video) {
  if (!window.MindStudyVision?.analyzeFrame || cameraState.visionInFlight) return;

  cameraState.visionInFlight = true;
  try {
    const result = await window.MindStudyVision.analyzeFrame(video, {
      brightness: cameraState.lastBrightness,
    });
    if (result) {
      cameraState.visionReady = true;
      cameraState.visionError = "";
      updateCameraVisionUi(result);
      drawVisionLandmarks(result);
      handleMouseControlGesture(result.gesture);
    }
  } catch (error) {
    cameraState.visionError = error.message || "视觉识别不可用";
    const ui = getCameraUi();
    if (ui.emotionDetail) ui.emotionDetail.textContent = `MediaPipe 加载失败：${cameraState.visionError}`;
  } finally {
    cameraState.visionInFlight = false;
  }
}

function sampleCameraFrame() {
  const ui = getCameraUi();
  const video = ui.video;
  if (!video || !cameraState.stream || video.readyState < 2) return;

  const canvas = cameraState.canvas || document.createElement("canvas");
  cameraState.canvas = canvas;
  canvas.width = 96;
  canvas.height = 54;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let total = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    total += (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
  }

  const brightness = total / (pixels.length / 4);
  cameraState.lastBrightness = brightness;
  updateCameraMetrics(brightness);
  updateVisionRecognition(video);
}

async function startCamera() {
  if (cameraState.stream) return;

  const ui = getCameraUi();
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("error", "当前环境不支持摄像头");
    return;
  }

  try {
    setCameraStatus("pending");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    cameraState.stream = stream;
    if (ui.video) {
      ui.video.srcObject = stream;
      await ui.video.play();
    }

    await loadGestureRuntimeConfig();
    setCameraStatus("active");
    if (window.MindStudyVision?.warmup) {
      window.MindStudyVision.warmup()
        .then(() => {
          cameraState.visionReady = true;
          const currentUi = getCameraUi();
          if (currentUi.emotionDetail) currentUi.emotionDetail.textContent = "MediaPipe 面部状态识别已就绪";
          if (currentUi.gestureDetail) currentUi.gestureDetail.textContent = "MediaPipe 手势识别已就绪";
        })
        .catch((error) => {
          cameraState.visionError = error.message || "MediaPipe 模型加载失败";
          const currentUi = getCameraUi();
          if (currentUi.emotionDetail) currentUi.emotionDetail.textContent = `MediaPipe 加载失败：${cameraState.visionError}`;
        });
    }
    window.clearInterval(cameraState.sampleTimer);
    cameraState.sampleTimer = window.setInterval(sampleCameraFrame, gestureRuntimeConfig.visionFrameIntervalMs);
    sampleCameraFrame();
  } catch (error) {
    stopCamera();
    setCameraStatus("error", error.name === "NotAllowedError" ? "摄像头权限被拒绝" : "无法打开摄像头");
  }
}

function stopCamera() {
  const ui = getCameraUi();

  window.clearInterval(cameraState.sampleTimer);
  cameraState.sampleTimer = null;
  cameraState.stream?.getTracks().forEach((track) => track.stop());
  cameraState.stream = null;
  cameraState.visionInFlight = false;
  cameraState.lastVisionResultAt = 0;

  if (ui.video) {
    ui.video.pause();
    ui.video.srcObject = null;
  }

  if (ui.focusScore) ui.focusScore.textContent = "--";
  if (ui.focusLabel) ui.focusLabel.textContent = "等待识别";
  if (ui.emotionDetail) ui.emotionDetail.textContent = "等待面部状态识别";
  if (ui.gestureDetail) ui.gestureDetail.textContent = "等待手势识别";
  updateGestureCards("none");
  clearVisionLandmarks();
  setGestureMouseVisible(false);
  cameraState.mouse.lastScrollY = null;
  setCameraStatus("idle");
}

function toggleCamera() {
  if (cameraState.stream) {
    stopCamera();
    return;
  }

  showView("focus");
  startCamera();
}

function getPdfTargetPage(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const input = document.querySelector("#pdf-target-page");
  const rawValue = Number(input?.value || doc.activePdfPage || 1);
  const pageNumber = Math.min(pageCount, Math.max(1, Number.isFinite(rawValue) ? rawValue : 1));
  doc.activePdfPage = pageNumber;
  doc.meta.activePdfPage = pageNumber;
  return pageNumber;
}

function updatePdfBytes(doc, bytes, pageCount, options = {}) {
  if (doc.blobUrl) URL.revokeObjectURL(doc.blobUrl);

  doc.bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  doc.file = {
    ...doc.file,
    base64: uint8ArrayToBase64(doc.bytes),
    dataUrl: bytesToDataUrl(doc.bytes, "application/pdf"),
    size: doc.bytes.byteLength,
  };
  doc.blobUrl = URL.createObjectURL(new Blob([doc.bytes], { type: "application/pdf" }));
  doc.pageCount = pageCount;
  doc.meta.pageCount = pageCount;
  doc.meta.size = doc.bytes.byteLength;
  doc.meta.pdfEdited = true;
  doc.meta.pdfTextStale = !options.keepTextExtraction;
  doc.pdfjsDocument = null;
  if (!options.keepTextExtraction) {
    doc.pdfText = null;
    doc.meta.extractedText = "";
    doc.meta.extractedPages = [];
    doc.meta.extractedPageCount = 0;
    doc.meta.pdfLearningComplete = false;
    doc.meta.aiSourcesByPage = {};
    doc.meta.aiOutputsByPage = {};
    doc.meta.aiSource = "";
    doc.meta.aiOutput = "";
  }
  doc.activePdfPage = Math.min(doc.activePdfPage || 1, pageCount);
  runtimeFiles.set(doc.meta.id, doc.file);
  saveWorkspace();
}

async function applyPdfTextExtraction(doc, shouldRender = true) {
  if (!doc || doc.kind !== "pdf") return;

  try {
    setParseStatus("提取文字中", "working");
    const extracted = await extractPdfTextFromBytes(doc.bytes, {
      onOcrStart: ({ total }) => {
        setParseStatus(`OCR 识别 ${total} 页`, "working");
      },
      onOcrProgress: ({ index, total }) => {
        setParseStatus(`OCR 识别中 ${index}/${total}`, "working");
      },
    });
    const textPages = extracted.pages.filter((page) => page.text);
    const storedPages = [];
    let storedTextLength = 0;

    for (const page of textPages) {
      const text = page.text.slice(0, 1600);
      if (storedTextLength + text.length > PDF_TEXT_LIMIT) break;
      storedPages.push({
        pageNumber: page.pageNumber,
        text,
      });
      storedTextLength += text.length;
    }

    doc.pdfText = extracted;
    doc.pageCount = extracted.pageCount || doc.pageCount;
    doc.meta.pageCount = doc.pageCount;
    doc.meta.extractedText = extracted.text;
    doc.meta.extractedPages = storedPages;
    doc.meta.extractedPageCount = textPages.length;
    doc.meta.ocrPageCount = extracted.ocrPageCount || 0;
    doc.meta.ocrAttemptedPageCount = extracted.ocrAttemptedPageCount || 0;
    doc.meta.ocrSkippedPageCount = extracted.ocrSkippedPageCount || 0;
    doc.meta.pdfLearningComplete = false;
    doc.meta.extractedAt = extracted.extractedAt;
    doc.meta.pdfExtractError = "";
    doc.meta.pdfTextStale = false;
    doc.meta.aiSourcesByPage = {};
    doc.meta.aiOutputsByPage = {};
    doc.meta.aiSource = getCurrentReadingText(doc);
    doc.meta.aiOutput = analyzeReadingText(doc.meta.aiSource);
    saveWorkspace();
    setParseStatus(
      textPages.length ? (extracted.ocrPageCount ? "OCR 文字已识别" : "文字已提取") : "未提取到文字",
      textPages.length ? "ready" : "working",
    );
  } catch (error) {
    doc.meta.pdfExtractError = "PDF 文字提取失败，可能是扫描版或加密文档。可以手动复制文字到 AI 阅读窗口。";
    doc.meta.pdfTextStale = false;
    saveWorkspace();
    setParseStatus("文字提取失败", "working");
  }

  if (shouldRender) {
    renderPdfReader(doc);
  } else if (documentState.current?.meta?.id === doc.meta.id) {
    updatePdfAiReadingPanel(doc);
    syncPdfPageControls(doc);
  }
}

function hydrateStoredPdfText(doc) {
  if (!doc || doc.kind !== "pdf" || !doc.meta.extractedText || doc.meta.pdfTextStale) return false;

  doc.pdfText = {
    pageCount: doc.meta.pageCount || doc.pageCount || 1,
    pages: doc.meta.extractedPages || [],
    text: doc.meta.extractedText,
    extractedAt: doc.meta.extractedAt || Date.now(),
  };

  const pageKey = getPdfPageKey(doc);
  const currentPageText = getPdfPageText(doc, Number(pageKey)).slice(0, 5000);

  if (currentPageText && !doc.meta.aiSourcesByPage?.[pageKey]) {
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};
    doc.meta.aiSourcesByPage[pageKey] = currentPageText;
    doc.meta.aiOutputsByPage[pageKey] = analyzeReadingText(currentPageText);
    doc.meta.aiSource = currentPageText;
    doc.meta.aiOutput = analyzeReadingText(doc.meta.aiSource);
    saveWorkspace();
  }

  return true;
}

function upsertPdfExtractedPage(doc, pageNumber, text, options = {}) {
  const nextPage = {
    pageNumber,
    text: text.slice(0, PDF_PAGE_TEXT_LIMIT),
    source: options.source || "text-layer",
  };
  if (Number.isFinite(options.confidence)) nextPage.confidence = options.confidence;
  const pages = Array.isArray(doc.meta.extractedPages) ? [...doc.meta.extractedPages] : [];
  const index = pages.findIndex((page) => Number(page.pageNumber) === Number(pageNumber));

  if (index >= 0) {
    pages[index] = nextPage;
  } else {
    pages.push(nextPage);
  }

  pages.sort((a, b) => Number(a.pageNumber) - Number(b.pageNumber));
  doc.meta.extractedPages = pages;
  doc.meta.extractedPageCount = pages.filter((page) => page.text).length;
  doc.meta.ocrPageCount = pages.filter((page) => page.source === "ocr" && page.text).length;
  doc.meta.extractedText = normalizeExtractedPdfText(
    pages
      .filter((page) => page.text)
      .map((page) => `第 ${page.pageNumber} 页\n${page.text}`)
      .join("\n\n"),
  ).slice(0, PDF_TEXT_LIMIT);
  doc.meta.extractedAt = Date.now();
  doc.meta.pdfExtractError = "";
  doc.meta.pdfTextStale = false;
  doc.pdfText = {
    pageCount: doc.pageCount || doc.meta.pageCount || 1,
    pages,
    text: doc.meta.extractedText,
    extractedAt: doc.meta.extractedAt,
  };
}

async function getPdfRuntimeDocument(doc) {
  if (doc.pdfjsDocument) return doc.pdfjsDocument;

  const pdfjsLib = await loadPdfJs();
  doc.pdfjsDocument = await pdfjsLib.getDocument({ data: doc.bytes.slice() }).promise;
  doc.pageCount = doc.pdfjsDocument.numPages || doc.pageCount || doc.meta.pageCount || 1;
  doc.meta.pageCount = doc.pageCount;
  return doc.pdfjsDocument;
}

async function extractCurrentPdfPageText(doc, options = {}) {
  if (!doc || doc.kind !== "pdf") return "";

  const pageNumber = Math.min(doc.pageCount || doc.meta.pageCount || 1, Math.max(1, Number(options.pageNumber || doc.activePdfPage || 1)));
  const pageKey = String(pageNumber);
  const hasCachedPage = Boolean(getPdfPageText(doc, pageNumber));

  if (hasCachedPage && !options.force) {
    updatePdfAiReadingPanel(doc);
    return getPdfPageText(doc, pageNumber);
  }

  try {
    setParseStatus("提取当前页文字", "working");
    const pdf = await getPdfRuntimeDocument(doc);
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    let pageText = extractTextFromPdfTextContent(textContent);
    let usedOcr = false;

    if (!pageText && window.mindStudy?.ai?.recognizeImageText) {
      setParseStatus("OCR 识别当前页", "working");
      const ocrPage = await recognizePdfPageWithOcr(page, pageNumber, {
        textLimit: PDF_AI_PAGE_TEXT_LIMIT,
        ocrMode: "always",
      });
      pageText = ocrPage.text;
      usedOcr = Boolean(pageText);
    }

    upsertPdfExtractedPage(doc, pageNumber, pageText, {
      source: usedOcr ? "ocr" : "text-layer",
    });
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};

    if (!Object.hasOwn(doc.meta.aiSourcesByPage, pageKey) || options.force) {
      doc.meta.aiSourcesByPage[pageKey] = pageText.slice(0, PDF_AI_PAGE_TEXT_LIMIT);
      doc.meta.aiOutputsByPage[pageKey] = analyzeReadingText(doc.meta.aiSourcesByPage[pageKey]);
    }

    doc.meta.aiSource = doc.meta.aiSourcesByPage[pageKey] || "";
    doc.meta.aiOutput = doc.meta.aiOutputsByPage[pageKey] || "";
    saveWorkspace();

    if (documentState.current?.meta?.id === doc.meta.id && getActivePdfPageNumber(doc) === pageNumber) {
      updatePdfAiReadingPanel(doc);
    }

    setParseStatus(pageText ? (usedOcr ? "OCR 当前页已识别" : "当前页文字已提取") : "当前页无可识别文字", pageText ? "ready" : "working");
    return pageText;
  } catch (error) {
    doc.meta.pdfExtractError = "当前页文字提取失败，可能是扫描版或加密文档。";
    saveWorkspace();
    updatePdfAiReadingPanel(doc);
    setParseStatus("当前页文字提取失败", "working");
    return "";
  }
}

function schedulePdfPageTextExtraction(doc, pageNumber = getActivePdfPageNumber(doc), delay = 180) {
  window.clearTimeout(pdfPageTextTimer);
  pdfPageTextTimer = window.setTimeout(() => {
    if (documentState.current?.meta?.id === doc?.meta?.id) {
      extractCurrentPdfPageText(doc, { pageNumber });
    }
  }, delay);
}

function getActivePdfPageNumber(doc) {
  const pageCount = Math.max(1, doc?.pageCount || doc?.meta?.pageCount || 1);
  const pageNumber = Math.min(pageCount, Math.max(1, Number(doc?.activePdfPage || doc?.meta?.activePdfPage || 1)));
  if (doc) {
    doc.activePdfPage = pageNumber;
    doc.meta.activePdfPage = pageNumber;
  }
  return pageNumber;
}

function getPdfPageText(doc, pageNumber = getActivePdfPageNumber(doc)) {
  const pages = doc?.pdfText?.pages?.length ? doc.pdfText.pages : doc?.meta?.extractedPages || [];
  const page = pages.find((item) => Number(item.pageNumber) === Number(pageNumber));
  return page?.text || "";
}

function getPdfPageKey(doc) {
  return String(getActivePdfPageNumber(doc));
}

function getPdfAiSource(doc) {
  const pageKey = getPdfPageKey(doc);
  const pageSource = doc.meta.aiSourcesByPage?.[pageKey];

  if (Object.hasOwn(doc.meta.aiSourcesByPage || {}, pageKey)) return pageSource;

  return getPdfPageText(doc, Number(pageKey)) || "";
}

function getPdfAiOutput(doc, sourceText) {
  const pageKey = getPdfPageKey(doc);
  if (Object.hasOwn(doc.meta.aiOutputsByPage || {}, pageKey)) {
    return doc.meta.aiOutputsByPage[pageKey];
  }

  return analyzeReadingText(sourceText);
}

function rememberCurrentAiReading() {
  const doc = documentState.current;
  const sourceInput = document.querySelector("#ai-reading-source");
  const output = document.querySelector("#ai-reading-output");
  if (!doc || !sourceInput) return;

  if (doc.kind === "pdf") {
    const pageKey = getPdfPageKey(doc);
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiSourcesByPage[pageKey] = sourceInput.value;
    doc.meta.aiSource = sourceInput.value;
    const storedMarkdown = doc.meta.aiOutputsByPage?.[pageKey] || doc.meta.aiOutput || "";
    const outputMarkdown = getAiMarkdownContent(output, storedMarkdown);
    if (outputMarkdown) {
      doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};
      doc.meta.aiOutputsByPage[pageKey] = outputMarkdown;
      doc.meta.aiOutput = outputMarkdown;
    }
    saveWorkspace();
  }
}

function getPdfInkStrokes(doc) {
  doc.meta.inkStrokes = Array.isArray(doc.meta.inkStrokes) ? doc.meta.inkStrokes : [];
  return doc.meta.inkStrokes;
}

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

function drawPdfInkStroke(context, canvas, stroke) {
  if (!stroke.points?.length) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalAlpha = stroke.tool === "highlight" ? 0.38 : 0.92;
  context.globalCompositeOperation = "source-over";
  context.strokeStyle = stroke.color || pdfInkState.color;
  context.lineWidth = Math.max(2, (stroke.widthRatio || 0.006) * canvas.width);
  context.beginPath();
  stroke.points.forEach((point, index) => {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  if (stroke.points.length === 1) {
    const point = stroke.points[0];
    const radius = context.lineWidth / 2;
    context.moveTo(point.x * canvas.width + radius, point.y * canvas.height);
    context.arc(point.x * canvas.width, point.y * canvas.height, radius, 0, Math.PI * 2);
  }

  context.stroke();
  context.restore();
}

function getInkToolDefaults(tool = pdfInkState.tool) {
  if (tool === "highlight") {
    return {
      color: "#f2c94c",
      width: Math.max(10, pdfInkState.width),
      label: "荧光笔",
    };
  }

  if (tool === "eraser") {
    return {
      color: "#ffffff",
      width: Math.max(18, pdfInkState.width * 2),
      label: "橡皮擦",
    };
  }

  return {
    color: pdfInkState.color,
    width: pdfInkState.width,
    label: "画笔",
  };
}

function drawPdfInkLayer(pageShell, doc) {
  const canvas = pageShell.querySelector(".pdf-ink-layer");
  if (!canvas || !doc) return;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  getPdfInkStrokes(doc)
    .filter((stroke) => Number(stroke.pageNumber) === Number(pageShell.dataset.pageNumber))
    .forEach((stroke) => drawPdfInkStroke(context, canvas, stroke));
}

function redrawPdfInkPage(pageNumber) {
  const doc = documentState.current;
  const pageShell = document.querySelector(`.pdf-rendered-page[data-page-number="${pageNumber}"]`);
  if (!doc || !pageShell) return;
  drawPdfInkLayer(pageShell, doc);
}

function redrawAllPdfInkLayers(doc = documentState.current) {
  if (!doc || doc.kind !== "pdf") return;
  document.querySelectorAll(".pdf-rendered-page").forEach((pageShell) => drawPdfInkLayer(pageShell, doc));
}

function syncPdfInkUi(doc = documentState.current) {
  const viewer = document.querySelector("#pdf-viewer");
  viewer?.classList.toggle("ink-active", pdfInkState.enabled);
  viewer?.classList.toggle("ink-eraser", pdfInkState.enabled && pdfInkState.tool === "eraser");
  document.querySelectorAll("[data-pdf-ink-tool]").forEach((button) => {
    const isActive = pdfInkState.enabled && button.dataset.pdfInkTool === pdfInkState.tool;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const colorInput = document.querySelector("#pdf-ink-color");
  const widthInput = document.querySelector("#pdf-ink-width");
  const widthValue = document.querySelector("#pdf-ink-width-value");
  const strokeCount = getPdfInkStrokes(doc || { meta: {} }).length;
  const countLabel = document.querySelector("#pdf-ink-count");
  const modeLabel = document.querySelector("#pdf-ink-mode");
  const toolDefaults = getInkToolDefaults();

  if (colorInput) colorInput.value = pdfInkState.color;
  if (widthInput) widthInput.value = String(pdfInkState.width);
  if (widthValue) widthValue.textContent = `${toolDefaults.width}px`;
  if (countLabel) countLabel.textContent = strokeCount ? `${strokeCount} 笔待写入` : "暂无画笔批注";
  if (modeLabel) modeLabel.textContent = pdfInkState.enabled ? `当前工具：${toolDefaults.label}` : "点击工具后在 PDF 上拖动批注";
}

function setPdfInkTool(tool) {
  pdfInkState.tool = tool;
  pdfInkState.enabled = true;
  if (tool === "pen" && pdfInkState.color === "#f2c94c") {
    pdfInkState.color = "#188f84";
  }
  if (tool === "highlight") {
    pdfInkState.color = "#f2c94c";
  }
  syncPdfInkUi();
}

function removeInkStrokesNearPoint(doc, canvas, pageNumber, point) {
  const radius = getInkToolDefaults("eraser").width / Math.max(1, canvas.getBoundingClientRect().width);
  const strokes = getPdfInkStrokes(doc);
  const remaining = strokes.filter((stroke) => {
    if (Number(stroke.pageNumber) !== Number(pageNumber)) return true;

    return !(stroke.points || []).some((strokePoint) => Math.hypot(strokePoint.x - point.x, strokePoint.y - point.y) <= radius);
  });

  if (remaining.length !== strokes.length) {
    doc.meta.inkStrokes = remaining;
    saveWorkspace();
    redrawPdfInkPage(pageNumber);
    syncPdfInkUi(doc);
  }
}

function beginPdfInkStroke(event) {
  const doc = documentState.current;
  const canvas = event.target.closest(".pdf-ink-layer");
  if (!doc || doc.kind !== "pdf" || !canvas || !pdfInkState.enabled) return;

  event.preventDefault();
  const pageShell = canvas.closest(".pdf-rendered-page");
  const point = getCanvasPoint(event, canvas);
  const pageNumber = Number(pageShell.dataset.pageNumber);
  pdfInkState.currentStroke = {
    id: createId("ink"),
    pageNumber,
    tool: pdfInkState.tool,
    color: getInkToolDefaults().color,
    widthRatio: getInkToolDefaults().width / Math.max(1, canvas.getBoundingClientRect().width),
    points: [point],
    createdAt: Date.now(),
  };
  pdfInkState.pointerId = event.pointerId;
  pdfInkState.activeCanvas = canvas;
  canvas.setPointerCapture?.(event.pointerId);

  if (pdfInkState.tool === "eraser") {
    pdfInkState.currentStroke = { pageNumber, points: [] };
    removeInkStrokesNearPoint(doc, canvas, pageNumber, point);
    setActivePdfPage(doc, pageNumber, false);
    return;
  }

  getPdfInkStrokes(doc).push(pdfInkState.currentStroke);
  setActivePdfPage(doc, pageNumber, false);
  redrawPdfInkPage(pageNumber);
}

function updatePdfInkStroke(event) {
  const doc = documentState.current;
  const stroke = pdfInkState.currentStroke;
  if (!doc || !stroke || event.pointerId !== pdfInkState.pointerId) return;

  const canvas = event.target.closest(".pdf-ink-layer") || pdfInkState.activeCanvas;
  if (!canvas) return;

  event.preventDefault();
  const point = getCanvasPoint(event, canvas);
  if (pdfInkState.tool === "eraser") {
    removeInkStrokesNearPoint(doc, canvas, stroke.pageNumber, point);
    return;
  }

  const lastPoint = stroke.points[stroke.points.length - 1];
  const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
  if (distance < 0.002) return;

  stroke.points.push(point);
  redrawPdfInkPage(stroke.pageNumber);
}

function finishPdfInkStroke(event) {
  const doc = documentState.current;
  const stroke = pdfInkState.currentStroke;
  if (!doc || !stroke || event.pointerId !== pdfInkState.pointerId) return;

  pdfInkState.currentStroke = null;
  pdfInkState.pointerId = null;
  pdfInkState.activeCanvas = null;
  doc.meta.pdfEdited = true;
  saveWorkspace();
  syncPdfInkUi(doc);
  setParseStatus(pdfInkState.tool === "eraser" ? "橡皮擦已处理" : "批注已记录", "ready");
}

function undoPdfInkStroke() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const activePage = getActivePdfPageNumber(doc);
  const strokes = getPdfInkStrokes(doc);
  const index = strokes.map((stroke, strokeIndex) => ({ stroke, strokeIndex })).reverse().find(
    ({ stroke }) => Number(stroke.pageNumber) === activePage,
  )?.strokeIndex;

  if (index === undefined) {
    setParseStatus("当前页暂无画笔", "working");
    return;
  }

  strokes.splice(index, 1);
  saveWorkspace();
  redrawPdfInkPage(activePage);
  syncPdfInkUi(doc);
  setParseStatus("已撤销一笔", "ready");
}

function clearCurrentPdfInkPage() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const activePage = getActivePdfPageNumber(doc);
  doc.meta.inkStrokes = getPdfInkStrokes(doc).filter((stroke) => Number(stroke.pageNumber) !== activePage);
  saveWorkspace();
  redrawPdfInkPage(activePage);
  syncPdfInkUi(doc);
  setParseStatus("已清空当前页画笔", "ready");
}

function parseInkColor(color) {
  const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color || "");
  if (!hex) return { r: 0.09, g: 0.56, b: 0.52 };
  return {
    r: parseInt(hex[1], 16) / 255,
    g: parseInt(hex[2], 16) / 255,
    b: parseInt(hex[3], 16) / 255,
  };
}

function drawInkStrokeOnPdfPage(page, stroke, rgb) {
  const { width, height } = page.getSize();
  const color = parseInkColor(stroke.color);
  const thickness = Math.max(0.8, (stroke.widthRatio || 0.006) * width);
  const opacity = stroke.tool === "highlight" ? 0.35 : 0.92;
  const points = stroke.points || [];
  if (!points.length) return;

  if (points.length === 1) {
    const point = points[0];
    page.drawCircle({
      x: point.x * width,
      y: height - point.y * height,
      size: thickness / 2,
      color: rgb(color.r, color.g, color.b),
      opacity,
    });
    return;
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    page.drawLine({
      start: { x: previous.x * width, y: height - previous.y * height },
      end: { x: current.x * width, y: height - current.y * height },
      thickness,
      color: rgb(color.r, color.g, color.b),
      opacity,
    });
  }
}

function drawInkStrokesOnPdf(pdfDoc, strokes, rgb) {
  const pages = pdfDoc.getPages();
  strokes.forEach((stroke) => {
    const page = pages[Number(stroke.pageNumber) - 1];
    if (page) drawInkStrokeOnPdfPage(page, stroke, rgb);
  });
}

function getPdfPageShell(pageNumber) {
  return document.querySelector(`.pdf-rendered-page[data-page-number="${pageNumber}"]`);
}

function removePdfImagePlacement() {
  document.querySelectorAll(".pdf-image-placement").forEach((element) => element.remove());
}

function renderPdfImagePlacement() {
  const placement = pdfImagePlacementState.current;
  removePdfImagePlacement();
  if (!placement) return;

  const pageShell = getPdfPageShell(placement.pageNumber);
  const stack = pageShell?.querySelector(".pdf-canvas-stack");
  if (!stack) return;

  const placementElement = document.createElement("div");
  placementElement.className = "pdf-image-placement";
  placementElement.dataset.pdfImagePlacement = placement.id;
  placementElement.style.left = `${placement.xRatio * 100}%`;
  placementElement.style.top = `${placement.yRatio * 100}%`;
  placementElement.style.width = `${placement.widthRatio * 100}%`;
  placementElement.style.height = `${placement.heightRatio * 100}%`;
  placementElement.innerHTML = `
    <img src="${placement.dataUrl}" alt="${escapeHtml(placement.name)}" draggable="false" />
    <div class="pdf-image-placement-toolbar">
      <button class="mini-button" data-pdf-image-action="apply">写入 PDF</button>
      <button class="mini-button light" data-pdf-image-action="cancel">取消</button>
    </div>
  `;
  stack.append(placementElement);
}

function beginPdfImagePlacementDrag(event) {
  const placementElement = event.target.closest(".pdf-image-placement");
  const placement = pdfImagePlacementState.current;
  if (!placementElement || !placement) return;
  if (event.target.closest("[data-pdf-image-action]")) return;

  event.preventDefault();
  const stack = placementElement.closest(".pdf-canvas-stack");
  const stackRect = stack.getBoundingClientRect();
  pdfImagePlacementState.pointerId = event.pointerId;
  pdfImagePlacementState.startX = event.clientX;
  pdfImagePlacementState.startY = event.clientY;
  pdfImagePlacementState.startLeft = placement.xRatio * stackRect.width;
  pdfImagePlacementState.startTop = placement.yRatio * stackRect.height;
  placementElement.setPointerCapture?.(event.pointerId);
  placementElement.classList.add("dragging");
}

function updatePdfImagePlacementDrag(event) {
  const placement = pdfImagePlacementState.current;
  if (!placement || event.pointerId !== pdfImagePlacementState.pointerId) return;

  const placementElement = document.querySelector(".pdf-image-placement");
  const stack = placementElement?.closest(".pdf-canvas-stack");
  if (!placementElement || !stack) return;

  event.preventDefault();
  const stackRect = stack.getBoundingClientRect();
  const nextLeft = pdfImagePlacementState.startLeft + event.clientX - pdfImagePlacementState.startX;
  const nextTop = pdfImagePlacementState.startTop + event.clientY - pdfImagePlacementState.startY;
  const maxLeft = stackRect.width * (1 - placement.widthRatio);
  const maxTop = stackRect.height * (1 - placement.heightRatio);

  placement.xRatio = Math.min(1 - placement.widthRatio, Math.max(0, nextLeft / Math.max(1, stackRect.width)));
  placement.yRatio = Math.min(1 - placement.heightRatio, Math.max(0, nextTop / Math.max(1, stackRect.height)));
  placementElement.style.left = `${placement.xRatio * 100}%`;
  placementElement.style.top = `${placement.yRatio * 100}%`;
  placementElement.style.transform = nextLeft < 0 || nextTop < 0 || nextLeft > maxLeft || nextTop > maxTop ? "scale(0.995)" : "";
}

function finishPdfImagePlacementDrag(event) {
  if (event.pointerId !== pdfImagePlacementState.pointerId) return;

  document.querySelector(".pdf-image-placement")?.classList.remove("dragging");
  pdfImagePlacementState.pointerId = null;
}

function cancelPdfImagePlacement() {
  pdfImagePlacementState.current = null;
  pdfImagePlacementState.pointerId = null;
  removePdfImagePlacement();
  setParseStatus("已取消插图", "ready");
}

async function applyPdfImagePlacement() {
  const doc = documentState.current;
  const placement = pdfImagePlacementState.current;
  if (!doc || doc.kind !== "pdf" || !placement) return;
  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("写入图片中", "working");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const imageBytes = base64ToUint8Array(placement.base64);
  const embeddedImage = placement.isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
  const page = pdfDoc.getPage(placement.pageNumber - 1);
  const { width, height } = page.getSize();
  const imageWidth = placement.widthRatio * width;
  const imageHeight = placement.heightRatio * height;

  page.drawImage(embeddedImage, {
    x: placement.xRatio * width,
    y: height - (placement.yRatio + placement.heightRatio) * height,
    width: imageWidth,
    height: imageHeight,
  });

  const editedBytes = await pdfDoc.save();
  pdfImagePlacementState.current = null;
  removePdfImagePlacement();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount(), { keepTextExtraction: true });
  setParseStatus("图片已写入 PDF", "ready");
  renderPdfReader(doc);
}

async function applyPdfInkToCurrentPdf() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const strokes = getPdfInkStrokes(doc);
  if (!strokes.length) {
    setParseStatus("暂无画笔批注", "working");
    return;
  }

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("写入画笔中", "working");
  const { PDFDocument, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  drawInkStrokesOnPdf(pdfDoc, strokes, rgb);
  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount(), { keepTextExtraction: true });
  doc.meta.inkStrokes = [];
  doc.meta.pdfTextStale = false;
  saveWorkspace();
  setParseStatus("画笔已写入 PDF", "ready");
  renderPdfReader(doc);
}

function setActivePdfPage(doc, pageNumber, shouldRender = true) {
  if (!doc || doc.kind !== "pdf") return;

  rememberCurrentAiReading();
  rememberCurrentNotes();
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const nextPage = Math.min(pageCount, Math.max(1, Number(pageNumber) || 1));
  doc.activePdfPage = nextPage;
  doc.meta.activePdfPage = nextPage;
  saveWorkspace();

  if (shouldRender) {
    syncPdfPageControls(doc);
    updatePdfAiReadingPanel(doc);
    schedulePdfPageTextExtraction(doc, nextPage);
    scrollPdfViewerToPage(nextPage);
  }
}

function syncPdfActivePageFromViewer(doc, pageNumber) {
  if (!doc || documentState.current?.meta?.id !== doc.meta.id) return;
  if (pdfInkState.currentStroke) return;

  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const nextPage = Math.min(pageCount, Math.max(1, Number(pageNumber) || 1));
  if (nextPage === doc.activePdfPage) return;

  rememberCurrentAiReading();
  rememberCurrentNotes();
  doc.activePdfPage = nextPage;
  doc.meta.activePdfPage = nextPage;
  saveWorkspace();
  syncPdfPageControls(doc);
  updatePdfAiReadingPanel(doc);
  schedulePdfPageTextExtraction(doc, nextPage);
}

function syncPdfPageControls(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const activePage = getActivePdfPageNumber(doc);
  const input = document.querySelector("#pdf-target-page");
  const previousButton = document.querySelector("[data-pdf-page-step='-1']");
  const nextButton = document.querySelector("[data-pdf-page-step='1']");

  if (input) {
    input.max = String(pageCount);
    input.value = String(activePage);
  }

  if (previousButton) previousButton.disabled = activePage <= 1;
  if (nextButton) nextButton.disabled = activePage >= pageCount;

  document.querySelectorAll(".pdf-rendered-page").forEach((page) => {
    const isActive = Number(page.dataset.pageNumber) === activePage;
    page.classList.toggle("active", isActive);
    page.toggleAttribute("aria-current", isActive);
  });
}

function scrollPdfViewerToPage(pageNumber) {
  const page = document.querySelector(`.pdf-rendered-page[data-page-number="${pageNumber}"]`);
  if (!page) return;
  page.scrollIntoView({ block: "start", behavior: "smooth" });
}

function showPdfNativeFallback(doc, viewer, message = "PDF 页面渲染失败，已切换到内置预览。") {
  pdfLazyRenderObserver?.disconnect();
  pdfPageObserver?.disconnect();
  pdfLazyRenderObserver = null;
  pdfPageObserver = null;
  viewer.innerHTML = `
    <div class="pdf-native-fallback">
      <p>${escapeHtml(message)}</p>
      <iframe class="pdf-native-frame" title="${escapeHtml(doc.meta.name)}" src="${doc.blobUrl}#page=${getActivePdfPageNumber(doc)}"></iframe>
    </div>
  `;
  setParseStatus("已切换 PDF 预览", "ready");
}

function updatePdfAiReadingPanel(doc) {
  if (!doc || doc.kind !== "pdf") return;

  const sourceInput = document.querySelector("#ai-reading-source");
  const output = document.querySelector("#ai-reading-output");
  const status = document.querySelector("#ai-reading-status");
  if (!sourceInput || !output) return;

  const sourceText = getCurrentReadingText(doc);
  sourceInput.value = sourceText;
  sourceInput.placeholder = `这里会跟随当前第 ${getActivePdfPageNumber(doc)} 页显示 PDF 提取文字。如果该页是扫描图片，可以手动粘贴文字。`;
  setAiMarkdownContent(output, getPdfAiOutput(doc, sourceText));

  if (status) {
    const extractStatus = getPdfExtractionStatus(doc);
    status.textContent = extractStatus.text;
    status.className = `ai-reading-status ${extractStatus.tone}`;
  }
}

function renderPdfInsightPanel(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);

  readerPanels.insight.innerHTML = `
    ${renderAiReadingWindow(doc)}
    <div class="panel-heading">
      <div>
        <span class="tag muted">PDF 批注</span>
        <h3>阅读与编辑</h3>
      </div>
    </div>
    <p class="summary-text">已载入 PDF 阅读器。滚动到不同页面时，AI 阅读窗口会自动切换到当前页文字。</p>
    <div class="pdf-toolbox">
      <div class="pdf-page-jump">
        <button class="mini-button" data-pdf-page-step="-1" ${doc.activePdfPage <= 1 ? "disabled" : ""} title="上一页">
          <i data-lucide="chevron-left"></i>
        </button>
        <label class="pdf-page-control">
          <span>当前页</span>
          <input id="pdf-target-page" type="number" min="1" max="${pageCount}" value="${doc.activePdfPage}" />
          <small>/ ${pageCount}</small>
        </label>
        <button class="mini-button" data-pdf-page-step="1" ${doc.activePdfPage >= pageCount ? "disabled" : ""} title="下一页">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
      <button class="ghost-action full" id="insert-pdf-image">
        <i data-lucide="image-plus"></i>
        <span>插入图片到当前页</span>
      </button>
      <button class="ghost-action full" id="add-pdf-page">
        <i data-lucide="file-plus-2"></i>
        <span>在当前页后加空白页</span>
      </button>
      <button class="danger-action full" id="delete-pdf-page">
        <i data-lucide="trash-2"></i>
        <span>删除当前页</span>
      </button>
      <div class="pdf-ink-tools">
        <button class="ghost-action compact" data-pdf-ink-tool="pen" aria-pressed="${pdfInkState.enabled && pdfInkState.tool === "pen"}">
          <i data-lucide="brush"></i>
          <span>画笔</span>
        </button>
        <button class="ghost-action compact" data-pdf-ink-tool="highlight" aria-pressed="${pdfInkState.enabled && pdfInkState.tool === "highlight"}">
          <i data-lucide="highlighter"></i>
          <span>荧光笔</span>
        </button>
        <button class="ghost-action compact" data-pdf-ink-tool="eraser" aria-pressed="${pdfInkState.enabled && pdfInkState.tool === "eraser"}">
          <i data-lucide="eraser"></i>
          <span>橡皮擦</span>
        </button>
        <button class="ghost-action compact" id="undo-pdf-ink">
          <i data-lucide="undo-2"></i>
          <span>撤销</span>
        </button>
        <button class="ghost-action compact" id="clear-pdf-ink-page">
          <i data-lucide="trash-2"></i>
          <span>清空本页</span>
        </button>
        <button class="primary-action compact" id="apply-pdf-ink">
          <i data-lucide="check"></i>
          <span>写入 PDF</span>
        </button>
        <label class="pdf-ink-color">
          <span>颜色</span>
          <input id="pdf-ink-color" type="color" value="${escapeHtml(pdfInkState.color)}" />
        </label>
        <label class="pdf-ink-width">
          <span>粗细 <b id="pdf-ink-width-value">${pdfInkState.width}px</b></span>
          <input id="pdf-ink-width" type="range" min="2" max="12" value="${pdfInkState.width}" />
        </label>
        <small id="pdf-ink-mode" class="pdf-ink-mode">点击工具后在 PDF 上拖动批注</small>
        <small id="pdf-ink-count" class="pdf-ink-count">${getPdfInkStrokes(doc).length ? `${getPdfInkStrokes(doc).length} 笔待写入` : "暂无画笔批注"}</small>
      </div>
    </div>
    <textarea id="document-notes" class="document-editor" placeholder="在这里写 PDF 批注、复习重点或待提问的问题...">${escapeHtml(doc.meta.notes || "")}</textarea>
    <button class="primary-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
    <button class="ghost-action full" id="export-annotated-pdf">
      <i data-lucide="file-output"></i>
      <span>导出当前 PDF 副本</span>
    </button>
    <p class="small-hint">说明：PDF 编辑会作用在当前副本上，导出后得到新 PDF；不会直接破坏原文件。</p>
  `;
  window.lucide?.createIcons();
  syncPdfPageControls(doc);
  syncPdfInkUi(doc);
}

async function renderPdfPageShell(pdf, pageShell, doc, viewer, renderToken) {
  if (pageShell.dataset.rendered === "true") return true;
  if (pageShell.dataset.rendering === "true") return false;

  pageShell.dataset.rendering = "true";

  try {
    const pageNumber = Number(pageShell.dataset.pageNumber);
    const page = await pdf.getPage(pageNumber);
    if (renderToken !== pdfRenderToken || documentState.current?.meta?.id !== doc.meta.id) return;

    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(320, viewer.clientWidth - 72);
    const scale = Math.min(1.45, Math.max(0.72, availableWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });
    const stack = pageShell.querySelector(".pdf-canvas-stack");
    const placeholder = pageShell.querySelector(".pdf-page-placeholder");
    const canvas = pageShell.querySelector(".pdf-page-canvas");
    const inkCanvas = pageShell.querySelector(".pdf-ink-layer");
    const context = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;

    stack.style.width = `${viewport.width}px`;
    stack.style.minHeight = `${viewport.height}px`;
    stack.style.height = `${viewport.height}px`;
    canvas.hidden = false;
    canvas.removeAttribute("hidden");
    canvas.style.display = "block";
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    inkCanvas.width = canvas.width;
    inkCanvas.height = canvas.height;
    inkCanvas.style.width = canvas.style.width;
    inkCanvas.style.height = canvas.style.height;
    inkCanvas.style.backgroundColor = "transparent";
    inkCanvas.style.zIndex = "30";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    await page.render({ canvasContext: context, viewport }).promise;
    if (renderToken !== pdfRenderToken || documentState.current?.meta?.id !== doc.meta.id) return;

    placeholder?.remove();
    drawPdfInkLayer(pageShell, doc);
    renderPdfImagePlacement();
    pageShell.classList.add("ready");
    pageShell.dataset.rendered = "true";
    return true;
  } catch {
    pageShell.dataset.rendered = "error";
    const placeholder = pageShell.querySelector(".pdf-page-placeholder");
    if (placeholder) placeholder.textContent = "该页渲染失败";
    return false;
  } finally {
    pageShell.dataset.rendering = "false";
  }
}

async function renderPdfPages(doc) {
  const viewer = document.querySelector("#pdf-viewer");
  if (!viewer || !doc?.bytes) return;

  const renderToken = (pdfRenderToken += 1);
  pdfPageObserver?.disconnect();
  pdfLazyRenderObserver?.disconnect();
  pdfPageObserver = null;
  pdfLazyRenderObserver = null;
  viewer.innerHTML = `<div class="pdf-render-state">正在准备 PDF 页面...</div>`;

  try {
    const pdf = await getPdfRuntimeDocument(doc);
    if (renderToken !== pdfRenderToken) return;

    const firstPage = await pdf.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1 });
    const availableWidth = Math.max(320, viewer.clientWidth - 72);
    const shellScale = Math.min(1.45, Math.max(0.72, availableWidth / firstViewport.width));
    const shellWidth = Math.floor(firstViewport.width * shellScale);
    const shellHeight = Math.floor(firstViewport.height * shellScale);

    doc.pageCount = pdf.numPages;
    doc.meta.pageCount = pdf.numPages;
    doc.activePdfPage = Math.min(doc.activePdfPage || doc.meta.activePdfPage || 1, pdf.numPages);
    doc.meta.activePdfPage = doc.activePdfPage;
    const pdfTitle = document.querySelector(".pdf-doc-title");
    if (pdfTitle) pdfTitle.textContent = `${doc.meta.name} · ${formatBytes(doc.meta.size)} · ${pdf.numPages} 页`;
    viewer.innerHTML = "";

    const pageShells = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const pageShell = document.createElement("section");
      pageShell.className = "pdf-rendered-page";
      pageShell.dataset.pageNumber = String(pageNumber);
      pageShell.dataset.rendered = "false";
      pageShell.innerHTML = `
        <div class="pdf-canvas-stack" style="width:${shellWidth}px; min-height:${shellHeight}px; height:${shellHeight}px">
          <div class="pdf-page-placeholder">第 ${pageNumber} 页</div>
          <canvas class="pdf-page-canvas" aria-label="PDF 第 ${pageNumber} 页" hidden></canvas>
          <canvas class="pdf-ink-layer" aria-label="第 ${pageNumber} 页画笔批注"></canvas>
        </div>
        <div class="pdf-page-caption">第 ${pageNumber} 页</div>
      `;
      viewer.append(pageShell);
      pageShells.push(pageShell);
    }

    syncPdfPageControls(doc);
    syncPdfInkUi(doc);
    updatePdfAiReadingPanel(doc);

    pdfLazyRenderObserver = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => renderPdfPageShell(pdf, entry.target, doc, viewer, renderToken));
      },
      {
        root: viewer,
        rootMargin: "900px 0px",
        threshold: 0.01,
      },
    );

    pdfPageObserver = new IntersectionObserver(
      (entries) => {
        const visiblePage = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visiblePage) {
          syncPdfActivePageFromViewer(doc, Number(visiblePage.target.dataset.pageNumber));
        }
      },
      {
        root: viewer,
        threshold: [0.25, 0.5, 0.75],
      },
    );

    pageShells.forEach((pageShell) => {
      pdfLazyRenderObserver.observe(pageShell);
      pdfPageObserver.observe(pageShell);
    });

    const firstPageRendered = await renderPdfPageShell(
      pdf,
      pageShells[Math.max(0, doc.activePdfPage - 1)],
      doc,
      viewer,
      renderToken,
    );
    if (!firstPageRendered && renderToken === pdfRenderToken) {
      showPdfNativeFallback(doc, viewer);
      return;
    }
    scrollPdfViewerToPage(doc.activePdfPage);
    schedulePdfPageTextExtraction(doc, doc.activePdfPage, 300);
  } catch (error) {
    showPdfNativeFallback(doc, viewer, "PDF.js 加载失败，已切换到内置 PDF 预览。");
  }
}

function getPdfExtractionStatus(doc) {
  const activePage = getActivePdfPageNumber(doc);
  const activePageText = getPdfPageText(doc, activePage);

  if (doc.meta.pdfTextStale && doc.meta.extractedText) {
    return {
      tone: "warning",
      text: "PDF 内容已更新，建议重新提取文字后再解析当前页。",
    };
  }

  if (activePageText) {
    return {
      tone: "ready",
      text: `当前第 ${activePage} 页已提取文字，可直接解析或翻译。`,
    };
  }

  if (doc.meta.extractedText) {
    return {
      tone: "warning",
      text: `整份 PDF 已提取文字，但第 ${activePage} 页没有可选择文字。`,
    };
  }

  if (doc.meta.pdfExtractError) {
    return {
      tone: "warning",
      text: doc.meta.pdfExtractError,
    };
  }

  return {
    tone: "working",
    text: "正在等待 PDF 文字提取",
  };
}

function showView(viewName) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === viewName);
  });

  title.textContent = viewTitles[viewName] || "MindStudy";

  if (viewName === "reader") {
    renderDocumentLibrary();
    const meta = getActiveDocumentMeta();
    if (meta && (!documentState.current || documentState.current.meta.id !== meta.id)) {
      loadDocumentById(meta.id);
    }
  }

  if (viewName === "rag") {
    renderRagAssistant();
  }

  if (viewName === "planner") {
    renderPlannerView();
  }

  if (viewName === "map") {
    renderKnowledgeModule();
  }

  if (viewName === "mindmap") {
    renderMindmapModule();
  }

  if (viewName === "quiz") {
    renderQuizModule();
  }

  if (viewName === "report") {
    renderReportModule();
  }
}

function getVoiceCommandElements() {
  return {
    toggle: document.querySelector("#voice-control-toggle"),
    toggleText: document.querySelector("#voice-control-status-text"),
    panel: document.querySelector("#voice-command-panel"),
    close: document.querySelector("#voice-control-close"),
    record: document.querySelector("#voice-command-record"),
    recordLabel: document.querySelector("#voice-command-record-label"),
    title: document.querySelector("#voice-command-title"),
    transcript: document.querySelector("#voice-command-transcript"),
  };
}

function setVoiceCommandStatus(titleText, detailText = "", tone = "ready") {
  const elements = getVoiceCommandElements();
  const titleValue = titleText || "持续监听中";

  if (elements.title) elements.title.textContent = titleValue;
  if (elements.transcript) elements.transcript.textContent = detailText || "只会响应可执行的控制指令。";
  if (elements.toggleText) {
    elements.toggleText.textContent = voiceCommandState.recognizing
      ? "识别中"
      : voiceCommandState.listening
        ? "监听中"
        : "语音控制";
  }
  if (elements.panel) {
    elements.panel.classList.toggle("listening", tone === "listening");
    elements.panel.classList.toggle("ready", tone === "ready");
    elements.panel.classList.toggle("warning", tone === "warning");
  }
  if (elements.toggle) {
    elements.toggle.classList.toggle("active", voiceCommandState.open || voiceCommandState.listening);
    elements.toggle.classList.toggle("recording", voiceCommandState.listening || voiceCommandState.recording);
  }
  if (elements.recordLabel) {
    elements.recordLabel.textContent = voiceCommandState.listening ? "暂停" : "开始";
  }
  if (elements.record) {
    elements.record.disabled = false;
    elements.record.classList.toggle("recording", voiceCommandState.listening || voiceCommandState.recording);
  }
  window.lucide?.createIcons();
}

function setVoiceCommandPanelOpen(open) {
  voiceCommandState.open = Boolean(open);
  const elements = getVoiceCommandElements();
  if (elements.panel) elements.panel.hidden = !voiceCommandState.open;

  if (voiceCommandState.open) {
    setVoiceCommandStatus(
      voiceCommandState.listening ? "持续监听中" : "等待语音指令",
      voiceCommandState.listening ? "说出控制指令即可执行。" : "按下开始进入持续监听。",
      voiceCommandState.listening ? "listening" : "ready",
    );
  } else {
    setVoiceCommandStatus("等待语音指令", "", "ready");
  }
}

function closeVoiceCommandPanel() {
  stopVoiceCommandListening({ keepPanel: true, cancel: true });
  voiceCommandState.open = false;
  voiceCommandState.recognizing = false;
  setVoiceCommandPanelOpen(false);
}

function getVoiceRecordingMimeType() {
  if (!window.MediaRecorder) return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];

  return candidates.find((mimeType) => MediaRecorder.isTypeSupported?.(mimeType)) || "";
}

function cleanupVoiceCommandRecorder() {
  window.clearTimeout(voiceCommandState.stopTimer);
  voiceCommandState.stopTimer = null;
  voiceCommandState.mediaRecorder = null;
  voiceCommandState.recording = false;
  voiceCommandState.recordingStartedAt = 0;
  voiceCommandState.hasSpeech = false;
}

function cleanupVoiceCommandStream() {
  window.clearTimeout(voiceCommandState.stopTimer);
  window.clearInterval(voiceCommandState.monitorTimer);
  voiceCommandState.stopTimer = null;
  voiceCommandState.monitorTimer = null;
  if (voiceCommandState.mediaRecorder && voiceCommandState.mediaRecorder.state !== "inactive") {
    try {
      voiceCommandState.mediaRecorder.stop();
    } catch (error) {
      console.warn("Failed to stop voice recorder", error);
    }
  }
  voiceCommandState.audioSource?.disconnect?.();
  voiceCommandState.audioContext?.close?.();
  voiceCommandState.stream?.getTracks?.().forEach((track) => track.stop());
  voiceCommandState.stream = null;
  voiceCommandState.audioContext = null;
  voiceCommandState.audioSource = null;
  voiceCommandState.analyser = null;
  voiceCommandState.audioLevelData = null;
  voiceCommandState.mediaRecorder = null;
  voiceCommandState.listening = false;
  voiceCommandState.recording = false;
  voiceCommandState.recognizing = false;
  voiceCommandState.chunks = [];
  voiceCommandState.cancelCurrentRecording = false;
}

async function setupVoiceCommandAudioAnalysis(stream) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("当前环境不支持持续语音监听。");
  }

  const audioContext = new AudioContextClass();
  const audioSource = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.25;
  audioSource.connect(analyser);

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  voiceCommandState.audioContext = audioContext;
  voiceCommandState.audioSource = audioSource;
  voiceCommandState.analyser = analyser;
  voiceCommandState.audioLevelData = new Uint8Array(analyser.fftSize);
}

function getVoiceInputLevel() {
  const analyser = voiceCommandState.analyser;
  const data = voiceCommandState.audioLevelData;

  if (!analyser || !data) return 0;

  analyser.getByteTimeDomainData(data);
  let sum = 0;

  for (const value of data) {
    const normalized = (value - 128) / 128;
    sum += normalized * normalized;
  }

  return Math.sqrt(sum / data.length);
}

function startVoiceCommandSegment(sessionId) {
  if (!voiceCommandState.listening || voiceCommandState.recording || voiceCommandState.recognizing) return;
  if (sessionId !== voiceCommandState.sessionId || !voiceCommandState.stream) return;

  try {
    const mimeType = getVoiceRecordingMimeType();
    const mediaRecorder = new MediaRecorder(voiceCommandState.stream, mimeType ? { mimeType } : undefined);
    const startedAt = Date.now();

    voiceCommandState.mediaRecorder = mediaRecorder;
    voiceCommandState.chunks = [];
    voiceCommandState.recording = true;
    voiceCommandState.cancelCurrentRecording = false;
    voiceCommandState.recordingStartedAt = startedAt;
    voiceCommandState.lastSpeechAt = startedAt;
    voiceCommandState.hasSpeech = true;

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (sessionId === voiceCommandState.sessionId && event.data?.size) {
        voiceCommandState.chunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", () => {
      handleVoiceCommandRecordingStopped(sessionId, mediaRecorder.mimeType || mimeType || "audio/webm");
    }, { once: true });

    mediaRecorder.start(250);
    voiceCommandState.stopTimer = window.setTimeout(() => {
      stopVoiceCommandRecording();
    }, VOICE_COMMAND_MAX_RECORDING_MS);
    setVoiceCommandStatus("正在听", "检测到语音，正在捕捉控制指令。", "listening");
  } catch (error) {
    stopVoiceCommandListening({ keepPanel: true, cancel: true });
    setVoiceCommandStatus("语音监听不可用", getAiErrorMessage(error), "warning");
  }
}

function monitorVoiceCommandInput(sessionId) {
  if (!voiceCommandState.listening || sessionId !== voiceCommandState.sessionId) return;
  if (voiceCommandState.recognizing) return;

  const level = getVoiceInputLevel();
  const now = Date.now();
  const hasSpeech = level >= VOICE_COMMAND_SPEECH_THRESHOLD;

  if (hasSpeech) {
    voiceCommandState.lastSpeechAt = now;
    voiceCommandState.hasSpeech = true;
    if (!voiceCommandState.recording) {
      startVoiceCommandSegment(sessionId);
    }
  }

  if (!voiceCommandState.recording) return;

  const elapsed = now - voiceCommandState.recordingStartedAt;
  const silenceElapsed = now - voiceCommandState.lastSpeechAt;
  const silenceReady = voiceCommandState.hasSpeech && silenceElapsed >= VOICE_COMMAND_SILENCE_GRACE_MS;
  const longEnough = elapsed >= VOICE_COMMAND_MIN_RECORDING_MS;
  const tooLong = elapsed >= VOICE_COMMAND_MAX_RECORDING_MS;

  if (tooLong || (longEnough && silenceReady)) {
    stopVoiceCommandRecording();
  }
}

function startVoiceCommandMonitor(sessionId) {
  window.clearInterval(voiceCommandState.monitorTimer);
  voiceCommandState.monitorTimer = window.setInterval(() => {
    monitorVoiceCommandInput(sessionId);
  }, VOICE_COMMAND_MONITOR_INTERVAL_MS);
}

async function startVoiceCommandListening() {
  if (voiceCommandState.listening) return;

  if (!window.mindStudy?.ai?.transcribeAudio) {
    throw new Error("当前环境没有语音识别接口。");
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    throw new Error("当前环境不支持麦克风录音。");
  }

  await ensureAiConfigured();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  const sessionId = voiceCommandState.sessionId + 1;

  voiceCommandState.sessionId = sessionId;
  voiceCommandState.stream = stream;
  voiceCommandState.chunks = [];
  voiceCommandState.listening = true;
  voiceCommandState.recording = false;
  voiceCommandState.recognizing = false;
  voiceCommandState.lastSpeechAt = 0;
  voiceCommandState.hasSpeech = false;

  await setupVoiceCommandAudioAnalysis(stream);
  setVoiceCommandPanelOpen(true);
  startVoiceCommandMonitor(sessionId);
  setVoiceCommandStatus("持续监听中", "说出控制指令即可执行，其他内容会被忽略。", "listening");
}

async function startVoiceCommandRecording() {
  return startVoiceCommandListening();
}

function stopVoiceCommandListening(options = {}) {
  voiceCommandState.sessionId += 1;
  if (voiceCommandState.recording) {
    stopVoiceCommandRecording({ cancel: options.cancel !== false });
  }
  cleanupVoiceCommandStream();

  if (options.keepPanel && voiceCommandState.open) {
    setVoiceCommandStatus("语音监听已暂停", "按开始恢复持续监听。", "ready");
  }
}

function stopVoiceCommandRecording(options = {}) {
  const recorder = voiceCommandState.mediaRecorder;
  window.clearTimeout(voiceCommandState.stopTimer);
  voiceCommandState.stopTimer = null;
  voiceCommandState.recording = false;
  voiceCommandState.cancelCurrentRecording = Boolean(options.cancel);

  if (options.cancel) {
    voiceCommandState.chunks = [];
  }

  if (recorder && recorder.state !== "inactive") {
    recorder.stop();
  } else {
    cleanupVoiceCommandRecorder();
  }

  if (!options.cancel && voiceCommandState.listening) {
    setVoiceCommandStatus("正在识别", "正在把刚才的语音转成控制指令。", "ready");
  }
}

async function handleVoiceCommandRecordingStopped(sessionId, mimeType) {
  const chunks = voiceCommandState.chunks;
  const isCurrentSession = sessionId === voiceCommandState.sessionId;
  const wasCanceled = voiceCommandState.cancelCurrentRecording;
  cleanupVoiceCommandRecorder();
  voiceCommandState.chunks = [];
  voiceCommandState.cancelCurrentRecording = false;

  if (!isCurrentSession || wasCanceled || !chunks.length) {
    voiceCommandState.recording = false;
    voiceCommandState.recognizing = false;
    if (voiceCommandState.listening) {
      setVoiceCommandStatus("持续监听中", "说出控制指令即可执行。", "listening");
    }
    return;
  }

  voiceCommandState.recording = false;
  voiceCommandState.recognizing = true;
  setVoiceCommandStatus("正在识别", "正在把刚才的语音转成控制指令。", "ready");

  try {
    const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
    const wavPayload = await audioBlobToWavPayload(blob);
    const result = await window.mindStudy.ai.transcribeAudio({
      base64: wavPayload.base64,
      mimeType: wavPayload.mimeType,
      options: {
        language: "zh",
        prompt: VOICE_COMMAND_TRANSCRIBE_PROMPT,
        maxTokens: 220,
      },
    });
    const transcript = normalizeVoiceCommandTranscript(result?.text);

    if (!transcript) {
      return;
    }

    if (isDuplicateVoiceCommand(transcript)) {
      return;
    }

    const commandResult = await executeVoiceCommand(transcript);
    rememberExecutedVoiceCommand(transcript);

    if (voiceCommandState.open) {
      setVoiceCommandStatus("已执行", `${transcript}\n${commandResult}`, "listening");
    }
  } catch (error) {
    if (isIgnorableVoiceCommandError(error)) {
      if (voiceCommandState.listening) {
        setVoiceCommandStatus("持续监听中", "说出控制指令即可执行，其他内容会被忽略。", "listening");
      }
      return;
    }

    if (voiceCommandState.open) {
      setVoiceCommandStatus("语音控制失败", getAiErrorMessage(error), "warning");
    }
  } finally {
    voiceCommandState.recognizing = false;
    if (voiceCommandState.listening && voiceCommandState.open) {
      setVoiceCommandStatus(
        document.querySelector("#voice-command-title")?.textContent || "持续监听中",
        document.querySelector("#voice-command-transcript")?.textContent || "说出控制指令即可执行。",
        document.querySelector("#voice-command-panel")?.classList.contains("warning") ? "warning" : "listening",
      );
    }
  }
}

function createIgnorableVoiceCommandError(message) {
  const error = new Error(message);
  error.code = "VOICE_COMMAND_IGNORED";
  return error;
}

function isIgnorableVoiceCommandError(error) {
  return error?.code === "VOICE_COMMAND_IGNORED";
}

function isDuplicateVoiceCommand(transcript) {
  const normalizedText = normalizeVoiceCommandText(transcript);
  return Boolean(
    normalizedText &&
      normalizedText === voiceCommandState.lastExecutedTranscript &&
      Date.now() - voiceCommandState.lastExecutedAt < VOICE_COMMAND_DUPLICATE_WINDOW_MS,
  );
}

function rememberExecutedVoiceCommand(transcript) {
  voiceCommandState.lastExecutedTranscript = normalizeVoiceCommandText(transcript);
  voiceCommandState.lastExecutedAt = Date.now();
}

function normalizeVoiceCommandTranscript(value) {
  return String(value || "")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVoiceCommandText(value) {
  return normalizeVoiceCommandTranscript(value)
    .toLowerCase()
    .replace(/[，。！？、,.!?;；:：“”"'\s]/g, "")
    .trim();
}

function parseChineseInteger(value) {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);

  const digits = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };
  let total = 0;
  let section = 0;
  let number = 0;

  for (const char of raw) {
    if (Object.hasOwn(digits, char)) {
      number = digits[char];
      continue;
    }
    if (char === "十") {
      section += (number || 1) * 10;
      number = 0;
      continue;
    }
    if (char === "百") {
      section += (number || 1) * 100;
      number = 0;
    }
  }

  total += section + number;
  return total;
}

function parseVoiceNumber(value) {
  const match = String(value || "").match(/[0-9一二两三四五六七八九十百零〇]+/);
  return match ? parseChineseInteger(match[0]) : 0;
}

function getDocumentIndexById(documents, documentId) {
  return Math.max(0, documents.findIndex((documentMeta) => documentMeta.id === documentId));
}

function resolveVoiceDocumentTarget(normalizedText) {
  const course = getActiveCourse();
  const documents = course?.documents || [];
  if (!documents.length) return null;

  const activeIndex = getDocumentIndexById(documents, course.activeDocumentId);
  if (/下(一个|一份|份|个)?(资料|文件|文档)/.test(normalizedText)) {
    return documents[Math.min(documents.length - 1, activeIndex + 1)];
  }
  if (/上(一个|一份|份|个)?(资料|文件|文档)/.test(normalizedText)) {
    return documents[Math.max(0, activeIndex - 1)];
  }

  const indexMatch =
    normalizedText.match(/第([0-9一二两三四五六七八九十百零〇]+)(个|份|篇)?(资料|文件|文档)/) ||
    normalizedText.match(/(资料|文件|文档)([0-9一二两三四五六七八九十百零〇]+)/);
  const indexValue = indexMatch ? parseVoiceNumber(indexMatch[1] || indexMatch[2]) : 0;
  if (indexValue >= 1 && indexValue <= documents.length) {
    return documents[indexValue - 1];
  }

  const nameCandidate = normalizedText
    .replace(/^(打开|进入|切换到|选择|查看)/, "")
    .replace(/(资料|文件|文档)/g, "")
    .trim();
  if (nameCandidate.length >= 2) {
    return documents.find((documentMeta) =>
      normalizeVoiceCommandText(documentMeta.name).includes(nameCandidate) ||
      nameCandidate.includes(normalizeVoiceCommandText(documentMeta.name).slice(0, 8)),
    ) || null;
  }

  return null;
}

function resolveVoiceView(normalizedText) {
  const viewMatchers = [
    { view: "dashboard", patterns: ["工作台", "首页", "主页"] },
    { view: "reader", patterns: ["资料阅读", "阅读区", "资料区", "文档区"] },
    { view: "rag", patterns: ["知识库", "问答", "rag"] },
    { view: "coding", patterns: ["coding", "代码", "编程"] },
    { view: "planner", patterns: ["todo", "待办", "计划", "日程"] },
    { view: "map", patterns: ["知识图谱", "图谱", "知识图"] },
    { view: "mindmap", patterns: ["思维导图", "脑图", "导图"] },
    { view: "quiz", patterns: ["测验", "测试", "刷题", "题目"] },
    { view: "report", patterns: ["报告", "学习报告"] },
    { view: "focus", patterns: ["状态", "摄像头", "音乐", "专注"] },
  ];

  return viewMatchers.find((item) => item.patterns.some((pattern) => normalizedText.includes(pattern)))?.view || "";
}

async function openVoiceDocumentTarget(documentMeta) {
  if (!documentMeta) throw new Error("没有找到要打开的资料。");
  await loadDocumentById(documentMeta.id);
  showView("reader");
  return `已打开资料：${documentMeta.name}`;
}

function executeVoicePdfPageCommand(normalizedText) {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return "";

  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  let pageNumber = 0;

  if (/(下一页|下页|后一页|往后翻)/.test(normalizedText)) {
    pageNumber = (doc.activePdfPage || 1) + 1;
  } else if (/(上一页|上页|前一页|往前翻)/.test(normalizedText)) {
    pageNumber = (doc.activePdfPage || 1) - 1;
  } else {
    const pageMatch = normalizedText.match(/(?:第|到|跳到|打开)?([0-9一二两三四五六七八九十百零〇]+)页/);
    pageNumber = pageMatch ? parseVoiceNumber(pageMatch[1]) : 0;
  }

  if (!pageNumber) return "";

  const safePage = Math.min(pageCount, Math.max(1, pageNumber));
  setActivePdfPage(doc, safePage);
  showView("reader");
  return `已跳到第 ${safePage} 页`;
}

async function executeVoiceCommand(transcript) {
  const normalizedText = normalizeVoiceCommandText(transcript);
  if (!normalizedText) throw createIgnorableVoiceCommandError("没有识别到有效语音指令。");

  if (/(关闭语音|退出语音|停止语音控制)/.test(normalizedText)) {
    closeVoiceCommandPanel();
    return "已关闭语音控制。";
  }

  if (/(导入|上传).*(资料|文件|文档)/.test(normalizedText)) {
    await handleCourseImport();
    return "已打开资料导入。";
  }

  if (/(学习|读取).*(全部|整门|整个|课程|所有).*(资料|文件|文档)?/.test(normalizedText)) {
    showView("rag");
    await learnRagKnowledge("course");
    return "已开始学习本课程资料。";
  }

  if (/(学习|读取).*(当前|这个|这份).*(资料|文件|文档)?/.test(normalizedText)) {
    showView("rag");
    await learnRagKnowledge("active");
    return "已开始学习当前资料。";
  }

  if (/(生成|创建|重建).*(知识图谱|图谱|知识图)/.test(normalizedText)) {
    showView("map");
    await generateStudyModuleFromUploads();
    return "已开始生成知识图谱。";
  }

  const documentTarget = resolveVoiceDocumentTarget(normalizedText);
  if (documentTarget && /(打开|进入|切换|选择|查看|上一个|下一个)/.test(normalizedText)) {
    return openVoiceDocumentTarget(documentTarget);
  }

  const pdfPageResult = executeVoicePdfPageCommand(normalizedText);
  if (pdfPageResult) return pdfPageResult;

  if (/(打开|开启).*(摄像头|状态识别)/.test(normalizedText)) {
    showView("focus");
    startCamera();
    return "已打开状态识别。";
  }

  if (/(关闭|停止).*(摄像头|状态识别)/.test(normalizedText)) {
    stopCamera();
    return "已关闭状态识别。";
  }

  if (/(龙龙|助手).*(聊天|对话)|聊天/.test(normalizedText)) {
    setLonglongChatPopover(true);
    setLonglongBubbleText("龙龙在听。", { temporary: false });
    return "已打开龙龙聊天。";
  }

  const view = resolveVoiceView(normalizedText);
  if (view) {
    showView(view);
    return `已切换到${viewTitles[view] || "目标模块"}。`;
  }

  throw createIgnorableVoiceCommandError("暂时没有匹配到可执行的语音控制指令。");
}

function setParseStatus(text, tone = "ready") {
  const status = document.querySelector("#parse-status");
  if (!status) return;

  status.textContent = text;
  status.style.background = tone === "working" ? "var(--yellow-soft)" : "var(--teal-soft)";
  status.style.color = tone === "working" ? "var(--yellow)" : "var(--teal)";
}

function updateImportedFileCard(meta, detailLines = []) {
  const fileTitle = document.querySelector(".upload-panel h3");
  const fileMeta = document.querySelector(".file-meta");

  if (!meta) {
    fileTitle.textContent = "尚未导入资料";
    fileMeta.innerHTML = `
      <strong>0 个</strong>
      <span>当前课程暂无资料</span>
      <span>点击右上角导入</span>
    `;
    return;
  }

  fileTitle.textContent = meta.name;
  fileMeta.innerHTML = `
    <strong>${escapeHtml(getTypeLabel(meta.extension))}</strong>
    <span>${escapeHtml(formatBytes(meta.size))}</span>
    ${detailLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
  `;
}

function renderCourseSwitcher() {
  const switchers = document.querySelectorAll(".course-switcher, .top-course-switcher");
  const activeCourse = getActiveCourse();

  const switcherMarkup = `
    <span>当前课程</span>
    <strong>${escapeHtml(activeCourse.name)}</strong>
    <small>${escapeHtml(activeCourse.description || `${activeCourse.documents.length} 个资料`)}</small>
    <select class="course-select" aria-label="切换课程">
      ${workspace.courses
        .map(
          (course) => `
            <option value="${course.id}" ${course.id === activeCourse.id ? "selected" : ""}>
              ${escapeHtml(course.name)}
            </option>
          `,
        )
        .join("")}
    </select>
    <div class="course-actions">
      <button class="course-button" data-course-action="create">新建</button>
      <button class="course-button" data-course-action="rename">编辑</button>
    </div>
  `;

  switchers.forEach((switcher) => {
    switcher.innerHTML = switcherMarkup;
  });
}

function updateDashboardForCourse() {
  const activeCourse = getActiveCourse();
  const activeMeta = getActiveDocumentMeta();
  const courseText = document.querySelector(".hero-copy p");

  if (courseText) {
    courseText.textContent = activeCourse.documents.length
      ? `当前课程已有 ${activeCourse.documents.length} 份资料，建议从资料阅读页切换文件复习。`
      : "当前课程还没有资料，请先导入 PDF 或 Markdown。";
  }

  updateImportedFileCard(activeMeta, activeMeta ? ["已加入课程资料库", activeMeta.path ? "已保存本机路径" : "临时导入"] : []);
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function createStudyNode(topic, index = 0, overrides = {}) {
  const position = defaultGraphPositions[topic.id] || {
    x: 140 + (index % 5) * 180,
    y: 110 + Math.floor(index / 5) * 150,
  };
  const label = overrides.label || topic.label || topic.id;

  return {
    id: overrides.id || topic.id,
    label,
    summary: overrides.summary || nodeContent[topic.id] || topic.source || "该知识点来自当前课程资料，可继续生成解释、例题和复习题。",
    chapter: topic.chapter || "课程资料",
    difficulty: topic.difficulty || "中等",
    source: overrides.source || topic.source || "课程资料",
    examples: overrides.examples || [`${topic.id} 可以结合当前资料中的定义、场景和评价方法复习。`],
    keywords: overrides.keywords || [topic.id, ...(topic.related || [])].slice(0, 5),
    sourceSnippets: Array.isArray(overrides.sourceSnippets) ? overrides.sourceSnippets : [],
    related: topic.related || [],
    mastery: clampPercent(overrides.mastery ?? topic.baseMastery ?? 58),
    status: overrides.status || ((topic.baseMastery || 58) < 60 ? "weak" : "learning"),
    x: Number(overrides.x) || position.x,
    y: Number(overrides.y) || position.y,
  };
}

function createFallbackStudyGraph(documents = []) {
  const documentTitles = documents.map((documentMeta) => documentMeta.title || documentMeta.name).filter(Boolean);
  const nodes = knowledgeTopics.map((topic, index) =>
    createStudyNode(topic, index, {
      source: documentTitles[0] || topic.source,
    }),
  );
  const edges = [
    ["人机交互", "可用性", "包含"],
    ["人机交互", "用户体验", "关注"],
    ["人机交互", "认知负荷", "影响"],
    ["可用性", "评估方法", "通过"],
    ["评估方法", "SUS 量表", "量化"],
    ["评估方法", "用户访谈", "补充"],
    ["可用性", "原型测试", "验证"],
    ["可用性", "Fitts 定律", "指导"],
    ["用户体验", "用户访谈", "理解"],
    ["用户体验", "原型测试", "验证"],
  ].map(([source, target, relation], index) => ({
    id: `edge-${index + 1}`,
    source,
    target,
    relation,
    weight: 0.7,
  }));

  return {
    nodes,
    edges,
    meta: {
      generatedBy: "local-fallback",
      generatedAt: Date.now(),
      qualityScore: 78,
      fallbackUsed: true,
      sourceDocuments: documentTitles,
    },
  };
}

function createFallbackQuizQuestions(nodes = createFallbackStudyGraph([]).nodes) {
  if (!nodes.length) return [];
  const topicSet = new Set(nodes.map((node) => node.id));
  const converted = quizBank
    .filter((question) => topicSet.has(question.topic))
    .map((question) => normalizeStudyQuestion(question, nodes));
  const multiQuestion = normalizeStudyQuestion(
    {
      id: "q-usability-multi",
      topic: "可用性",
      type: "multi",
      difficulty: "中等",
      prompt: "下列哪些属于可用性评估常关注的指标？",
      options: ["有效性", "效率", "满意度", "服务器机房面积"],
      answer: [0, 1, 2],
      explanation: "可用性常看有效性、效率和满意度，机房面积不是用户任务层面的评价指标。",
    },
    nodes,
  );

  return [...converted, multiQuestion].filter((question, index, list) =>
    question && list.findIndex((item) => item.id === question.id) === index,
  );
}

function normalizeComparableText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "");
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

function resolveQuestionTopic(rawTopic, nodes = []) {
  const topicText = String(rawTopic || "").trim();
  if (!topicText || !nodes.length) return null;
  const exact = nodes.find((node) => node.id === topicText || node.label === topicText);
  if (exact) return exact;
  const comparable = normalizeComparableText(topicText);
  if (!comparable) return null;
  return nodes.find((node) => {
    const id = normalizeComparableText(node.id);
    const label = normalizeComparableText(node.label);
    return id === comparable
      || label === comparable
      || (comparable.length >= 3 && (id.includes(comparable) || label.includes(comparable) || comparable.includes(label)));
  }) || null;
}

function getCourseStudyDocumentsSnapshot(course = getActiveCourse()) {
  return (course?.documents || [])
    .map((documentMeta) => ({
      id: documentMeta.id,
      title: documentMeta.title || documentMeta.name || "课程资料",
      text: cleanCourseTextForStudyGeneration(documentMeta.extractedText || documentMeta.text || documentMeta.content || ""),
      extension: documentMeta.extension || "",
    }))
    .filter((documentMeta) => documentMeta.text);
}

function rotateOptions(options = [], answerIndex = 0) {
  const unique = Array.from(new Set(options.filter(Boolean))).slice(0, 4);
  while (unique.length < 4) unique.push(["概念定义", "应用场景", "评价标准", "操作步骤"][unique.length]);
  const correct = unique[0];
  const targetIndex = Math.min(3, Math.max(0, answerIndex));
  const arranged = unique.slice(1);
  arranged.splice(targetIndex, 0, correct);
  return { options: arranged, answer: targetIndex };
}

function getNodeEvidenceText(node, documentText = "") {
  return String(
    (node.sourceSnippets || []).find(Boolean)
      || getSourceSnippetForLabel(node.label || node.id, documentText)
      || (node.examples || []).find(Boolean)
      || node.summary
      || "",
  ).trim();
}

function getNodeKeywords(node) {
  return Array.from(new Set([node.label, ...(node.keywords || [])]
    .map((keyword) => String(keyword || "").trim())
    .filter((keyword) => keyword && keyword.length <= 24)));
}

function createRuleBasedQuizQuestions(graph = getStudyModule().graph, documents = []) {
  const nodes = (graph.nodes || []).filter((node) => isLikelyCourseConceptLabel(node.label || node.id, node.summary || ""));
  if (!nodes.length) return [];
  const documentText = documents.map((documentMeta) => documentMeta.text).join("\n");
  const questions = [];

  nodes.slice(0, 18).forEach((node, index) => {
    const snippet = getNodeEvidenceText(node, documentText);
    const otherNodes = nodes.filter((item) => item.id !== node.id);
    const evidenceDistractors = otherNodes
      .map((item) => getNodeEvidenceText(item, documentText) || item.summary)
      .filter((summary) => summary && summary !== snippet)
      .slice(0, 3);
    const source = node.source || documents[0]?.title || "课程资料";

    if (index % 3 === 0) {
      const arrangement = rotateOptions([
        snippet || node.summary || `${node.label} 是资料中的核心概念。`,
        ...evidenceDistractors,
      ], index % 4);
      questions.push(normalizeStudyQuestion({
        id: `rq-${normalizeComparableText(node.id)}-choice`,
        topic: node.id,
        type: "choice",
        difficulty: node.difficulty || "中等",
        prompt: `根据资料，哪一项最能支持你理解“${node.label}”？`,
        options: arrangement.options,
        answer: arrangement.answer,
        explanation: `正确选项来自“${node.label}”对应的资料证据；其他选项来自相邻概念，容易混淆但不直接说明该知识点。`,
        source,
        sourceSnippet: snippet,
        keywords: getNodeKeywords(node),
      }, nodes));
      return;
    }

    const keywords = getNodeKeywords(node);
    if (index % 3 === 1 && keywords.length >= 2) {
      const correctKeywords = keywords.filter((keyword) => keyword !== node.label).slice(0, 3);
      const wrongKeywords = otherNodes.flatMap(getNodeKeywords).filter((keyword) => !correctKeywords.includes(keyword)).slice(0, 3);
      const options = Array.from(new Set([...correctKeywords, ...wrongKeywords])).slice(0, 4);
      questions.push(normalizeStudyQuestion({
        id: `rq-${normalizeComparableText(node.id)}-multi`,
        topic: node.id,
        type: "multi",
        difficulty: node.difficulty || "中等",
        prompt: `下列哪些关键词与“${node.label}”直接相关？`,
        options,
        answer: correctKeywords.map((keyword) => options.indexOf(keyword)).filter((value) => value >= 0),
        explanation: `这些关键词来自“${node.label}”的资料片段或概念摘要。`,
        source,
        sourceSnippet: snippet,
        keywords: correctKeywords,
      }, nodes));
      return;
    }

    questions.push(normalizeStudyQuestion({
      id: `rq-${normalizeComparableText(node.id)}-short`,
      topic: node.id,
      type: "short",
      difficulty: node.difficulty || "中等",
      prompt: `简述“${node.label}”的核心含义或作用。`,
      sampleAnswer: node.summary || snippet,
      explanation: `回答时应说明“${node.label}”的定义、作用，并尽量结合资料中的具体语境。`,
      source,
      sourceSnippet: snippet,
      keywords: getNodeKeywords(node).slice(0, 5),
    }, nodes));
  });

  (graph.edges || [])
    .filter((edge) => nodes.some((node) => node.id === edge.source) && nodes.some((node) => node.id === edge.target))
    .slice(0, 8)
    .forEach((edge, index) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (!sourceNode || !targetNode) return;
      questions.push(normalizeStudyQuestion({
        id: `rq-rel-${normalizeComparableText(edge.source)}-${normalizeComparableText(edge.target)}-${index}`,
        topic: sourceNode.id,
        type: "judge",
        difficulty: edge.relation === "前置" || edge.relation === "对比" ? "较难" : "中等",
        prompt: `资料图谱中，“${sourceNode.label}”与“${targetNode.label}”的关系可理解为“${edge.relation || "相关"}”。`,
        answer: true,
        explanation: `该判断来自知识图谱关系：${sourceNode.label} --${edge.relation || "相关"}--> ${targetNode.label}。复习时要能说明这条关系成立的原因。`,
        source: sourceNode.source || targetNode.source || documents[0]?.title || "课程资料",
        sourceSnippet: [getNodeEvidenceText(sourceNode, documentText), getNodeEvidenceText(targetNode, documentText)].filter(Boolean).join(" "),
        keywords: [sourceNode.label, targetNode.label, edge.relation || "相关"],
      }, nodes));
    });

  if (nodes.length >= 3) {
    questions.push(normalizeStudyQuestion({
      id: "rq-concept-match",
      topic: nodes[0].id,
      type: "match",
      difficulty: "中等",
      prompt: "将概念与其核心解释匹配。",
      pairs: nodes.slice(0, 4).map((node) => [node.label, node.summary || `${node.label} 的核心解释`]),
      explanation: "概念匹配题用于检查你是否能区分多个核心术语。",
      source: nodes[0].source || documents[0]?.title || "课程资料",
      sourceSnippet: nodes.slice(0, 3).map((node) => (node.sourceSnippets || [])[0]).filter(Boolean).join(" "),
    }, nodes));
  }

  return uniqueQuestions(questions.filter(Boolean));
}

function sanitizeGraphViewport(viewport = {}) {
  return {
    x: Number.isFinite(Number(viewport.x)) ? Number(viewport.x) : GRAPH_DEFAULT_VIEWPORT.x,
    y: Number.isFinite(Number(viewport.y)) ? Number(viewport.y) : GRAPH_DEFAULT_VIEWPORT.y,
    scale: Math.min(1.7, Math.max(0.65, Number(viewport.scale) || GRAPH_DEFAULT_VIEWPORT.scale)),
  };
}

function sanitizeStudyGraph(graph = {}) {
  if (graph?.meta?.empty || graph?.empty || graph?.meta?.generatedBy === "empty") {
    return {
      nodes: [],
      edges: [],
      meta: {
        generatedBy: "empty",
        generatedAt: Number(graph.meta?.generatedAt || graph.generatedAt) || Date.now(),
        qualityScore: 0,
        fallbackUsed: false,
        empty: true,
        sourceDocuments: Array.isArray(graph.meta?.sourceDocuments) ? graph.meta.sourceDocuments : [],
      },
    };
  }
  const rawNodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const nodes = rawNodes
    .slice(0, GRAPH_NODE_LIMIT)
    .map((node, index) => {
      const label = String(node.label || node.name || node.title || node.id || `知识点 ${index + 1}`).trim();
      const localId = String(node.id || node.localId || label).trim();
      const baseTopic = knowledgeTopics.find((topic) => topic.id === localId || topic.id === label) || {
        id: localId,
        chapter: node.chapter || "课程资料",
        difficulty: node.difficulty || "中等",
        baseMastery: Number(node.mastery) || 55,
        related: [],
        source: node.source || "上传资料",
      };
      return createStudyNode(baseTopic, index, {
        ...node,
        id: localId,
        label,
        mastery: node.mastery,
        examples: Array.isArray(node.examples) ? node.examples : node.example ? [node.example] : undefined,
        keywords: Array.isArray(node.keywords) ? node.keywords : undefined,
        sourceSnippets: Array.isArray(node.sourceSnippets) ? node.sourceSnippets : undefined,
      });
    });
  const conceptNodes = nodes.filter((node) => isLikelyCourseConceptLabel(node.label || node.id, `${node.summary || ""}\n${(node.keywords || []).join(" ")}`));
  const usableNodes = conceptNodes;
  const nodeIds = new Set(usableNodes.map((node) => node.id));
  const resolveGraphEndpoint = (value) => {
    const raw = String(value || "").trim();
    if (nodeIds.has(raw)) return raw;
    const comparable = normalizeComparableText(raw);
    const matched = usableNodes.find((node) =>
      normalizeComparableText(node.id) === comparable || normalizeComparableText(node.label) === comparable);
    return matched?.id || raw;
  };
  const edges = (Array.isArray(graph.edges) ? graph.edges : [])
    .map((edge, index) => ({
      id: edge.id || `edge-${index + 1}`,
      source: resolveGraphEndpoint(edge.source || edge.from),
      target: resolveGraphEndpoint(edge.target || edge.to),
      relation: edge.relation || edge.label || "相关",
      relationType: edge.relationType || edge.type || "",
      explanation: edge.explanation || edge.reason || "",
      weight: Math.min(1, Math.max(0.1, Number(edge.weight) || 0.55)),
    }))
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target) && edge.source !== edge.target);

  return {
    nodes: usableNodes,
    edges,
    meta: {
      generatedBy: graph.meta?.generatedBy || graph.generatedBy || (usableNodes.length ? "unknown" : "empty"),
      generatedAt: Number(graph.meta?.generatedAt || graph.generatedAt) || Date.now(),
      qualityScore: clampPercent(
        usableNodes.length === nodes.length
          ? graph.meta?.qualityScore ?? graph.qualityScore ?? estimateGraphQuality({ nodes: usableNodes, edges })
          : estimateGraphQuality({ nodes: usableNodes, edges }),
      ),
      fallbackUsed: Boolean(graph.meta?.fallbackUsed ?? graph.fallbackUsed),
      empty: !usableNodes.length,
      sourceDocuments: Array.isArray(graph.meta?.sourceDocuments) ? graph.meta.sourceDocuments : [],
    },
  };
}

function flattenMindmapNodes(mindmapOrNodes = []) {
  const roots = Array.isArray(mindmapOrNodes) ? mindmapOrNodes : mindmapOrNodes?.nodes || [];
  const result = [];
  const visit = (node, parent = null, depth = 1) => {
    if (!node) return;
    result.push({ ...node, parent, depth });
    (node.children || []).forEach((child) => visit(child, node, depth + 1));
  };
  roots.forEach((node) => visit(node));
  return result;
}

function createStableMindmapNodeId(label = "", prefix = "mindmap", index = 0, usedIds = new Set()) {
  const comparable = normalizeComparableText(label).slice(0, 28);
  const base = `${prefix}-${comparable || index + 1}`;
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}

function sanitizeMindmapNode(node = {}, index = 0, prefix = "mindmap", depth = 1, usedIds = new Set()) {
  const label = String(node.label || node.title || node.name || `主题 ${index + 1}`).trim().slice(0, 36);
  const rawId = String(node.id || "").trim();
  const id = rawId && !usedIds.has(rawId)
    ? (usedIds.add(rawId), rawId)
    : createStableMindmapNodeId(node.topicId || label, prefix, index, usedIds);
  const children = Array.isArray(node.children)
    ? node.children.slice(0, GRAPH_MINDMAP_CHILD_LIMIT).map((child, childIndex) => sanitizeMindmapNode(child, childIndex, id, depth + 1, usedIds)).filter(Boolean)
    : [];
  return {
    id,
    label,
    summary: String(node.summary || node.description || node.text || "").trim().slice(0, 120),
    source: String(node.source || "").trim().slice(0, 60),
    topicId: String(node.topicId || node.knowledgeId || node.nodeId || "").trim(),
    children: depth >= 4 ? [] : children,
  };
}

function sanitizeMindmap(mindmap = {}, course = {}) {
  if (mindmap?.meta?.empty || mindmap?.empty || mindmap?.meta?.generatedBy === "empty") {
    return createEmptyMindmap(course);
  }
  const rawNodes = Array.isArray(mindmap.nodes) && mindmap.nodes.length ? mindmap.nodes : [];
  const usedIds = new Set([String(mindmap.id || "mindmap-root")]);
  const nodes = rawNodes.slice(0, GRAPH_MINDMAP_BRANCH_LIMIT).map((node, index) => sanitizeMindmapNode(node, index, "mindmap", 1, usedIds)).filter(Boolean);
  return {
    id: String(mindmap.id || "mindmap-root"),
    title: String(mindmap.title || course.name || "课程思维导图").trim(),
    summary: String(mindmap.summary || "独立生成的层级复习导图。").trim().slice(0, 140),
    nodes,
    meta: {
      generatedBy: mindmap.meta?.generatedBy || mindmap.generatedBy || "local-mindmap",
      generatedAt: Number(mindmap.meta?.generatedAt || mindmap.generatedAt) || Date.now(),
      empty: !nodes.length,
      sourceDocuments: Array.isArray(mindmap.meta?.sourceDocuments) ? mindmap.meta.sourceDocuments : [],
    },
  };
}

function normalizeStudyQuestion(question, nodes = getStudyModule().graph.nodes) {
  if (!question) return null;
  const topic = String(question.topic || question.nodeId || question.knowledgePoint || nodes[0]?.id || "知识点").trim();
  const node = resolveQuestionTopic(topic, nodes);
  if (!node) return null;
  const type = question.type === "multiple" ? "multi" : question.type || "choice";
  const normalized = {
    id: question.id || createId("q"),
    topic: node?.id || topic,
    type,
    difficulty: question.difficulty || node?.difficulty || "中等",
    prompt: String(question.prompt || question.question || "").trim() || `请解释 ${node?.label || topic} 的核心含义。`,
    options: Array.isArray(question.options) ? question.options.map(String) : [],
    answer: question.answer,
    keywords: Array.isArray(question.keywords) ? question.keywords.map(String) : node?.keywords || [],
    pairs: Array.isArray(question.pairs) ? question.pairs : [],
    sampleAnswer: question.sampleAnswer || question.referenceAnswer || node?.summary || "",
    explanation: question.explanation || `这道题关联知识点：${node?.label || topic}。`,
    source: question.source || node?.source || "课程资料",
    sourceSnippet: question.sourceSnippet || question.snippet || (node?.sourceSnippets || [])[0] || "",
  };

  if (normalized.type === "judge" && typeof normalized.answer !== "boolean") {
    normalized.answer = String(normalized.answer).includes("true") || String(normalized.answer).includes("正确");
  }
  if (normalized.type === "choice") {
    normalized.options = normalized.options.filter(Boolean).slice(0, 4);
    const answerIndex = Number(normalized.answer);
    normalized.answer = Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < normalized.options.length ? answerIndex : 0;
    if (normalized.options.length < 2) return null;
  }
  if (normalized.type === "multi" && !Array.isArray(normalized.answer)) {
    normalized.answer = String(normalized.answer || "")
      .split(/[,，、\s]+/)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
  }
  if (normalized.type === "multi") {
    normalized.options = normalized.options.filter(Boolean).slice(0, 6);
    normalized.answer = (normalized.answer || []).map(Number).filter((value) => value >= 0 && value < normalized.options.length);
    if (normalized.options.length < 3 || !normalized.answer.length) return null;
  }
  if (normalized.type === "match" && !normalized.pairs.length) {
    normalized.pairs = (node?.keywords || []).slice(0, 3).map((keyword) => [keyword, `${keyword} 与 ${node.label} 的理解相关。`]);
  }
  if (normalized.type === "match") {
    normalized.pairs = normalized.pairs.filter((pair) => Array.isArray(pair) && pair[0] && pair[1]).slice(0, 5);
    if (normalized.pairs.length < 2) return null;
  }

  return normalized;
}

function normalizeGeneratedQuestionWithTopic(question, graph, documents = []) {
  const nodes = graph.nodes || [];
  const direct = normalizeStudyQuestion(question, nodes);
  if (direct) return direct;
  const rawTopic = String(question?.topic || question?.knowledgePoint || question?.nodeId || "").trim();
  const label = rawTopic || String(question?.keywords?.[0] || "").trim() || "资料主题";
  if (!isLikelyCourseConceptLabel(label, `${question?.prompt || ""}\n${question?.sourceSnippet || ""}`)) return null;
  const fallbackNode = {
    id: label,
    label,
    summary: question?.sampleAnswer || question?.explanation || `${label} 是资料中的测验主题。`,
    difficulty: question?.difficulty || "中等",
    source: question?.source || documents[0]?.title || "课程资料",
    keywords: Array.isArray(question?.keywords) ? question.keywords : [label],
    sourceSnippets: question?.sourceSnippet ? [question.sourceSnippet] : [],
  };
  return normalizeStudyQuestion(question, [fallbackNode]);
}

function sanitizeStudyQuiz(quiz = {}, graph = createFallbackStudyGraph([])) {
  if (graph.meta?.empty) {
    return {
      scope: "all",
      mode: ["adaptive", "diagnostic", "weak", "review", "exam"].includes(quiz?.mode) ? quiz.mode : "adaptive",
      difficulty: quiz?.difficulty || "all",
      questions: [],
      cursor: 0,
      generatedAt: Number(quiz?.generatedAt) || Date.now(),
      source: "empty",
    };
  }
  const fallbackQuestions = createRuleBasedQuizQuestions(graph);
  const questions = (Array.isArray(quiz?.questions) && quiz.questions.length ? quiz.questions : fallbackQuestions)
    .map((question) => normalizeGeneratedQuestionWithTopic(question, graph))
    .filter(Boolean);

  return {
    scope: quiz?.scope || graph.nodes[0]?.id || "all",
    mode: ["adaptive", "diagnostic", "weak", "review", "exam"].includes(quiz?.mode) ? quiz.mode : "adaptive",
    difficulty: quiz?.difficulty || "all",
    questions,
    cursor: Math.max(0, Number(quiz?.cursor) || 0),
    generatedAt: Number(quiz?.generatedAt) || Date.now(),
    source: quiz?.source || graph.meta.generatedBy || "local-fallback",
  };
}

function isDefaultSeedGraphForCourse(course, studyModule = {}) {
  const courseName = String(course?.name || "");
  if (!courseName || courseName.includes("用户交互")) return false;
  const graph = studyModule.graph || {};
  const nodeIds = new Set((graph.nodes || []).map((node) => node.id));
  const hasHciSeedNodes = ["人机交互", "可用性", "评估方法"].every((id) => nodeIds.has(id));
  return hasHciSeedNodes
    && (graph.meta?.generatedBy === "local-fallback" || graph.meta?.generatedBy === "seed")
    && (studyModule.quiz?.source === "seed" || !studyModule.quiz?.source)
    && !studyModule.attempts?.length
    && !studyModule.mistakes?.length;
}

function resetCourseSeedGraphIfNeeded(course) {
  if (!isDefaultSeedGraphForCourse(course, course.studyModule)) return false;
  course.studyModule.graph = createEmptyStudyGraph(course);
  course.studyModule.mindmap = createEmptyMindmap(course);
  course.studyModule.quiz = sanitizeStudyQuiz({ mode: course.studyModule.quiz?.mode }, course.studyModule.graph);
  course.studyModule.selectedNodeId = "";
  course.studyModule.selectedMindmapNodeId = "";
  course.studyModule.activeQuizTopic = "all";
  course.studyModule.graphViewport = { ...GRAPH_DEFAULT_VIEWPORT };
  course.studyModule.generation = {
    state: "idle",
    engine: "empty",
    message: `当前课程“${course.name}”还没有知识图谱，请导入资料后点击生成，或从 Neo4j 加载。`,
    updatedAt: Date.now(),
  };
  return true;
}

function sanitizeGenerationState(generation = {}) {
  const normalized = {
    state: generation.state || "idle",
    engine: generation.engine || "",
    message: generation.message || "",
    updatedAt: Number(generation.updatedAt) || 0,
  };
  const busy = ["extracting", "ai", "validating"].includes(normalized.state);
  const stale = busy && normalized.updatedAt && Date.now() - normalized.updatedAt > 5 * 60 * 1000;
  if (!stale) return normalized;
  return {
    ...normalized,
    state: "error",
    message: "上次知识图谱生成没有正常结束，已自动停止。请检查 Qwen / Neo4j 状态后重新生成。",
    updatedAt: Date.now(),
  };
}

function getStudyModule(course = getActiveCourse()) {
  const currentStudyModule = course.studyModule && typeof course.studyModule === "object" ? course.studyModule : {};
  course.studyModule = Object.assign(currentStudyModule, sanitizeStudyModule(currentStudyModule));
  resetCourseSeedGraphIfNeeded(course);
  return course.studyModule;
}

function getKnowledgeTopic(topicId) {
  const studyModule = getStudyModule();
  return studyModule.graph.nodes.find((topic) => topic.id === topicId) || studyModule.graph.nodes[0];
}

function getTopicAttempts(topicId) {
  return getStudyModule().attempts.filter((attempt) => attempt.topic === topicId);
}

function getTopicStats(topicId) {
  const topic = getKnowledgeTopic(topicId);
  const attempts = getTopicAttempts(topicId);
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const wrong = attempts.length - correct;
  const mastery = clampPercent((topic?.mastery || 55) + correct * 7 - wrong * 9 + Math.min(attempts.length, 4) * 2);

  return {
    total: attempts.length,
    correct,
    wrong,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
    mastery,
  };
}

function estimateGraphQuality(graph) {
  const nodeScore = Math.min(45, (graph.nodes?.length || 0) * 4);
  const edgeScore = Math.min(30, (graph.edges?.length || 0) * 3);
  const sourceScore = (graph.nodes || []).filter((node) => node.source).length >= Math.min(5, graph.nodes?.length || 0) ? 15 : 6;
  const detailScore = (graph.nodes || []).filter((node) => node.summary && node.examples?.length).length >= 4 ? 10 : 4;
  return clampPercent(nodeScore + edgeScore + sourceScore + detailScore);
}

function normalizeStudyTextLine(line = "") {
  return String(line || "")
    .replace(/\s+/g, " ")
    .replace(/[•●◆◇□■]+/g, "")
    .trim();
}

function isBoilerplateStudyLine(line = "") {
  const normalized = normalizeStudyTextLine(line);
  if (!normalized) return true;
  if (normalized.length < 2) return true;
  if (/^第?\s*\d+\s*页$/i.test(normalized)) return true;
  if (/^[\d\s\-–—_.:：@〇○oO]+$/.test(normalized)) return true;
  if (/\.pdf$/i.test(normalized)) return true;
  if (GRAPH_NOISE_LINE_PATTERN.test(normalized)) return true;
  const digitRatio = (normalized.match(/\d/g) || []).length / Math.max(1, normalized.length);
  const punctuationRatio = (normalized.match(/[^\u4e00-\u9fa5A-Za-z0-9\s]/g) || []).length / Math.max(1, normalized.length);
  return digitRatio > 0.45 || punctuationRatio > 0.35;
}

function cleanCourseTextForStudyGeneration(text = "") {
  const lines = String(text || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(normalizeStudyTextLine)
    .filter((line) => !isBoilerplateStudyLine(line));
  const deduped = [];
  const seen = new Map();
  lines.forEach((line) => {
    const key = normalizeComparableText(line);
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    if (count < 2) deduped.push(line);
  });
  return sampleTextWithinLimit(deduped.join("\n"), GRAPH_TEXT_LIMIT);
}

function cleanDocumentsForStudyGeneration(documents = []) {
  return documents
    .map((documentMeta) => {
      const cleanedText = cleanCourseTextForStudyGeneration(documentMeta.text || "");
      return {
        ...documentMeta,
        rawText: documentMeta.text || "",
        text: cleanedText || String(documentMeta.text || "").slice(0, GRAPH_TEXT_LIMIT),
      };
    })
    .filter((documentMeta) => documentMeta.text.trim());
}

function isLikelyNoiseConceptLabel(label = "") {
  const normalized = normalizeStudyTextLine(label);
  if (!normalized || normalized.length < 2 || normalized.length > 32) return true;
  if (GRAPH_GENERIC_NOISE_LABELS.has(normalized)) return true;
  if (GRAPH_LABEL_HARD_NOISE_PATTERN.test(normalized)) return true;
  if (GRAPH_LABEL_FRAGMENT_PATTERN.test(normalized)) return true;
  if (GRAPH_SENTENCE_LABEL_PATTERN.test(normalized) && normalized.length > 6) return true;
  if (/^[第\d一二三四五六七八九十]+[章节篇部分]/.test(normalized)) return true;
  if (/[。！？；;]$/.test(normalized)) return true;
  if (/\.pdf$/i.test(normalized) || GRAPH_NOISE_LINE_PATTERN.test(normalized)) return true;
  if (/^[\d\s\-–—_.:：@〇○oO\[\]()/\\]+$/.test(normalized)) return true;
  if (/^\d+%/.test(normalized) || /\[[A-Z]{1,3}\s*\[/.test(normalized)) return true;
  const digitRatio = (normalized.match(/\d/g) || []).length / Math.max(1, normalized.length);
  const letterCount = (normalized.match(/[A-Za-z\u4e00-\u9fa5]/g) || []).length;
  return digitRatio > 0.35 || letterCount < 2;
}

function isLikelyCourseConceptLabel(label = "", context = "") {
  const normalized = normalizeStudyTextLine(label);
  if (isLikelyNoiseConceptLabel(normalized)) return false;
  if (GRAPH_LABEL_HARD_NOISE_PATTERN.test(context) && !GRAPH_CONCEPT_SIGNAL_PATTERN.test(normalized)) return false;
  if (GRAPH_CONCEPT_SIGNAL_PATTERN.test(`${normalized}\n${context}`)) return true;
  if (/^[A-Z]{2,8}$/.test(normalized)) return true;
  return normalized.length >= 3 && normalized.length <= 18 && /[\u4e00-\u9fa5]/.test(normalized);
}

function isGraphNodeSupportedByDocuments(node, documents = []) {
  if (!documents.length) return true;
  const label = normalizeStudyTextLine(node.label || node.id);
  if (!label || isLikelyNoiseConceptLabel(label)) return false;
  const snippets = (node.sourceSnippets || []).join("\n");
  const evidenceText = `${snippets}\n${node.summary || ""}\n${(node.keywords || []).join(" ")}`;
  if (snippets && !GRAPH_LABEL_HARD_NOISE_PATTERN.test(snippets)) return true;
  const comparableLabel = normalizeComparableText(label);
  if (!comparableLabel || comparableLabel.length < 2) return false;
  const documentText = documents.map((documentMeta) => documentMeta.text || "").join("\n");
  const comparableDocs = normalizeComparableText(documentText);
  const comparableEvidence = normalizeComparableText(evidenceText);
  if (comparableDocs.includes(comparableLabel)) return true;
  if (comparableEvidence.includes(comparableLabel) && !GRAPH_LABEL_HARD_NOISE_PATTERN.test(evidenceText)) return true;
  return /^[A-Z]{2,8}$/.test(label) && comparableDocs.includes(label.toLowerCase());
}

function getSourceSnippetForLabel(label, text = "") {
  const lines = String(text || "").split("\n").map(normalizeStudyTextLine).filter(Boolean);
  const index = lines.findIndex((line) => line.includes(label));
  if (index < 0) return "";
  return lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).join(" ").slice(0, 180);
}

function getDomainConceptSeeds(documents = []) {
  const text = documents.map((documentMeta) => `${documentMeta.title}\n${documentMeta.text}`).join("\n").toLowerCase();
  if (!/(数据库|database|sql|关系模型|事务|索引|查询|schema|transaction|relational)/i.test(text)) return [];
  return [
    { id: "数据库系统", summary: "用于组织、存储、管理和查询数据的系统。", keywords: ["数据库", "DBMS", "数据管理"] },
    { id: "数据模型", summary: "描述数据结构、数据约束和数据操作方式的抽象模型。", keywords: ["结构", "约束", "操作"] },
    { id: "关系模型", summary: "用关系表表示数据和数据之间联系的数据库模型。", keywords: ["关系", "表", "元组"] },
    { id: "SQL", summary: "用于定义、查询和操作关系数据库的结构化查询语言。", keywords: ["查询", "DDL", "DML"] },
    { id: "实体-联系模型", summary: "用实体、属性和联系描述现实世界数据需求的概念模型。", keywords: ["实体", "属性", "联系"] },
    { id: "完整性约束", summary: "用于保证数据库中数据正确性和一致性的规则。", keywords: ["主键", "外键", "约束"] },
    { id: "范式", summary: "用于分析和改进关系模式、减少冗余和异常的设计准则。", keywords: ["规范化", "冗余", "依赖"] },
    { id: "索引", summary: "用于加速数据检索的数据结构。", keywords: ["检索", "查询优化", "B+树"] },
    { id: "事务", summary: "数据库中作为一个逻辑工作单元执行的一组操作。", keywords: ["ACID", "并发", "恢复"] },
    { id: "并发控制", summary: "协调多个事务同时执行以保持一致性的机制。", keywords: ["锁", "调度", "隔离性"] },
    { id: "恢复机制", summary: "在故障后利用日志等信息恢复数据库一致状态的机制。", keywords: ["日志", "故障", "恢复"] },
    { id: "查询处理", summary: "把用户查询解析、优化并执行得到结果的过程。", keywords: ["查询优化", "执行计划", "代价"] },
  ];
}

function getVisibleGraphNodes() {
  const studyModule = getStudyModule();
  return studyModule.graph.nodes.filter((node) => {
    const stats = getTopicStats(node.id);
    const filters = studyModule.graphFilters || {};
    if (filters.chapter && filters.chapter !== "all" && node.chapter !== filters.chapter) return false;
    if (filters.difficulty && filters.difficulty !== "all" && node.difficulty !== filters.difficulty) return false;
    if (filters.mastery === "weak" && stats.mastery >= 60) return false;
    if (filters.mastery === "learning" && (stats.mastery < 60 || stats.mastery >= 80)) return false;
    if (filters.mastery === "mastered" && stats.mastery < 80) return false;
    return true;
  });
}

function renderGraphFilters() {
  const studyModule = getStudyModule();
  const chapterSelect = document.querySelector("#graph-chapter-filter");
  const difficultySelect = document.querySelector("#graph-difficulty-filter");
  const masterySelect = document.querySelector("#graph-mastery-filter");
  const pathSourceSelect = document.querySelector("#graph-path-source");
  const pathTargetSelect = document.querySelector("#graph-path-target");
  const chapters = Array.from(new Set(studyModule.graph.nodes.map((node) => node.chapter))).filter(Boolean);
  const difficulties = Array.from(new Set(studyModule.graph.nodes.map((node) => node.difficulty))).filter(Boolean);
  const pathOptions = studyModule.graph.nodes
    .map((node) => `<option value="${escapeHtml(node.id)}">${escapeHtml(node.label)}</option>`)
    .join("");

  if (chapterSelect) {
    chapterSelect.innerHTML = `<option value="all">全部章节</option>${chapters.map((chapter) => `<option value="${escapeHtml(chapter)}">${escapeHtml(chapter)}</option>`).join("")}`;
    chapterSelect.value = studyModule.graphFilters.chapter || "all";
  }
  if (difficultySelect) {
    difficultySelect.innerHTML = `<option value="all">全部难度</option>${difficulties.map((difficulty) => `<option value="${escapeHtml(difficulty)}">${escapeHtml(difficulty)}</option>`).join("")}`;
    difficultySelect.value = studyModule.graphFilters.difficulty || "all";
  }
  if (masterySelect) masterySelect.value = studyModule.graphFilters.mastery || "all";
  if (pathSourceSelect) {
    const currentValue = pathSourceSelect.value || studyModule.selectedNodeId || studyModule.graph.nodes[0]?.id || "";
    pathSourceSelect.innerHTML = pathOptions;
    pathSourceSelect.value = studyModule.graph.nodes.some((node) => node.id === currentValue) ? currentValue : studyModule.graph.nodes[0]?.id || "";
  }
  if (pathTargetSelect) {
    const relatedTarget = studyModule.graph.edges.find((edge) => edge.source === studyModule.selectedNodeId || edge.target === studyModule.selectedNodeId);
    const currentValue = pathTargetSelect.value || (relatedTarget ? relatedTarget.source === studyModule.selectedNodeId ? relatedTarget.target : relatedTarget.source : "");
    pathTargetSelect.innerHTML = pathOptions;
    pathTargetSelect.value = studyModule.graph.nodes.some((node) => node.id === currentValue) ? currentValue : studyModule.graph.nodes[1]?.id || studyModule.graph.nodes[0]?.id || "";
  }
}

function setNeo4jStatus(status = {}) {
  const statusNode = document.querySelector("#neo4j-status");
  if (!statusNode) return;
  statusNode.classList.toggle("ready", Boolean(status.connected));
  statusNode.classList.toggle("warning", !status.connected);
  statusNode.textContent = status.connected
    ? `Neo4j 已连接 · ${status.version || status.uri || "本地数据库"}`
    : `Neo4j 未连接 · ${status.error || "请运行 npm run neo4j:start"}`;
}

async function refreshNeo4jStatus() {
  if (!window.mindStudy?.graph?.getStatus) {
    setNeo4jStatus({ connected: false, error: "当前环境没有图数据库接口" });
    return null;
  }
  const status = await window.mindStudy.graph.getStatus();
  setNeo4jStatus(status);
  return status;
}

function getGraphCoursePayload(course = getActiveCourse()) {
  return {
    id: course.id,
    name: course.name,
    description: course.description,
  };
}

function mergeGraphFragment(fragment = {}) {
  const studyModule = getStudyModule();
  const nodeMap = new Map(studyModule.graph.nodes.map((node) => [node.id, node]));
  (fragment.nodes || []).forEach((node) => {
    nodeMap.set(node.id, { ...(nodeMap.get(node.id) || {}), ...node });
  });
  const edgeMap = new Map(studyModule.graph.edges.map((edge) => [`${edge.source}->${edge.target}:${edge.relation}`, edge]));
  (fragment.edges || []).forEach((edge) => {
    edgeMap.set(`${edge.source}->${edge.target}:${edge.relation}`, edge);
  });
  studyModule.graph = sanitizeStudyGraph({
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
    meta: {
      ...studyModule.graph.meta,
      generatedBy: "neo4j",
      generatedAt: Date.now(),
    },
  });
}

function focusGraphNode(nodeId) {
  const studyModule = getStudyModule();
  const node = studyModule.graph.nodes.find((item) => item.id === nodeId);
  if (!node) return;
  const viewport = sanitizeGraphViewport(studyModule.graphViewport);
  viewport.x = 500 - node.x * viewport.scale;
  viewport.y = 330 - node.y * viewport.scale;
  studyModule.graphViewport = viewport;
  studyModule.selectedNodeId = node.id;
}

async function loadCourseGraphFromNeo4j() {
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  try {
    const graph = await window.mindStudy?.graph?.getCourseGraph?.({ courseId: course.id });
    if (!graph?.nodes?.length) throw new Error("Neo4j 中暂时没有当前课程图谱。");
    studyModule.graph = ensureGraphQuality(sanitizeStudyGraph(graph), [], "neo4j");
    studyModule.selectedNodeId = studyModule.graph.nodes[0]?.id || studyModule.selectedNodeId;
    studyModule.generation = {
      state: "done",
      engine: "Neo4j",
      message: `已从 Neo4j 加载 ${studyModule.graph.nodes.length} 个知识点、${studyModule.graph.edges.length} 条关系。`,
      updatedAt: Date.now(),
    };
    saveWorkspace();
    renderStudyModuleViews();
  } catch (error) {
    studyModule.generation = {
      state: "error",
      engine: "Neo4j",
      message: getAiErrorMessage(error),
      updatedAt: Date.now(),
    };
    saveWorkspace();
    renderKnowledgeModule();
  }
}

async function searchGraphNode() {
  const query = document.querySelector("#graph-search-input")?.value?.trim();
  if (!query) return;
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  let matches = [];
  try {
    matches = await window.mindStudy?.graph?.searchNodes?.({ courseId: course.id, query, limit: 8 }) || [];
  } catch {
    matches = [];
  }
  if (!matches.length) {
    matches = studyModule.graph.nodes.filter((node) =>
      [node.label, node.summary, ...(node.keywords || [])].join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  }
  if (!matches.length) {
    studyModule.generation = { state: "error", engine: "Neo4j", message: `没有找到“${query}”相关节点。`, updatedAt: Date.now() };
    renderGenerationStatus();
    return;
  }
  mergeGraphFragment({ nodes: matches, edges: [] });
  focusGraphNode(matches[0].id);
  saveWorkspace();
  renderKnowledgeModule();
}

async function expandSelectedGraphNode() {
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  const nodeId = studyModule.selectedNodeId;
  if (!nodeId) return;
  try {
    const fragment = await window.mindStudy?.graph?.getNodeNeighborhood?.({ courseId: course.id, nodeId, limit: 24 });
    if (!fragment?.nodes?.length) throw new Error("Neo4j 没有返回邻居节点。");
    mergeGraphFragment(fragment);
    studyModule.generation = {
      state: "done",
      engine: "Neo4j",
      message: `已展开“${getKnowledgeTopic(nodeId)?.label || nodeId}”的一度邻居。`,
      updatedAt: Date.now(),
    };
    saveWorkspace();
    renderKnowledgeModule();
  } catch (error) {
    studyModule.generation = { state: "error", engine: "Neo4j", message: getAiErrorMessage(error), updatedAt: Date.now() };
    saveWorkspace();
    renderKnowledgeModule();
  }
}

async function findGraphPath() {
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  const sourceId = document.querySelector("#graph-path-source")?.value;
  const targetId = document.querySelector("#graph-path-target")?.value;
  if (!sourceId || !targetId || sourceId === targetId) return;
  try {
    const pathFragment = await window.mindStudy?.graph?.findPath?.({ courseId: course.id, sourceId, targetId });
    if (!pathFragment?.nodes?.length) throw new Error("没有找到两个知识点之间的路径。");
    mergeGraphFragment(pathFragment);
    studyModule.pathNodeIds = pathFragment.nodes.map((node) => node.id);
    studyModule.pathEdgeIds = pathFragment.edges.map((edge) => edge.id);
    studyModule.pathEdgeKeys = pathFragment.edges.map((edge) => `${edge.source}->${edge.target}:${edge.relation}`);
    focusGraphNode(sourceId);
    studyModule.generation = {
      state: "done",
      engine: "Neo4j",
      message: `已高亮 ${pathFragment.nodes.length} 个节点的最短路径。`,
      updatedAt: Date.now(),
    };
    saveWorkspace();
    renderKnowledgeModule();
  } catch (error) {
    studyModule.generation = { state: "error", engine: "Neo4j", message: getAiErrorMessage(error), updatedAt: Date.now() };
    saveWorkspace();
    renderKnowledgeModule();
  }
}

function buildMermaidGraph(graph = getStudyModule().graph) {
  const safeId = (value) => `N${String(value || "").replace(/[^\u4e00-\u9fa5A-Za-z0-9_]/g, "_")}`;
  const lines = ["graph TD"];
  graph.nodes.forEach((node) => {
    lines.push(`  ${safeId(node.id)}["${String(node.label || node.id).replace(/"/g, "'")}"]`);
  });
  graph.edges.forEach((edge) => {
    lines.push(`  ${safeId(edge.source)} -->|"${String(edge.relation || "相关").replace(/"/g, "'")}"| ${safeId(edge.target)}`);
  });
  return lines.join("\n");
}

function openMermaidExportDialog() {
  closeModal();
  const mermaidText = buildMermaidGraph();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" data-modal="mermaid-export">
      <section class="course-modal" role="dialog" aria-modal="true" aria-labelledby="mermaid-export-title">
        <div class="modal-heading">
          <div>
            <span class="tag muted">Mermaid</span>
            <h2 id="mermaid-export-title">知识图谱 Mermaid 文本</h2>
          </div>
          <button class="icon-button light" data-modal-action="close" title="关闭">
            <i data-lucide="x"></i>
          </button>
        </div>
        <textarea class="mermaid-export-textarea" readonly>${escapeHtml(mermaidText)}</textarea>
        <div class="modal-actions">
          <button type="button" class="ghost-action compact" data-modal-action="close">关闭</button>
        </div>
      </section>
    </div>
  `);
  window.lucide?.createIcons();
}

function renderGenerationStatus() {
  const studyModule = getStudyModule();
  const status = GRAPH_GENERATION_STEPS[studyModule.generation?.state] || GRAPH_GENERATION_STEPS.idle;
  const titleNode = document.querySelector("#study-generation-title");
  const detailNode = document.querySelector("#study-generation-detail");
  const progressNode = document.querySelector("#study-generation-progress");

  if (titleNode) titleNode.textContent = status.title;
  if (detailNode) {
    const engine = studyModule.generation?.engine ? `来源：${studyModule.generation.engine}。` : "";
    detailNode.textContent = studyModule.generation?.message || `${status.detail}${engine}`;
  }
  if (progressNode) progressNode.style.width = `${status.progress}%`;
}

function renderKnowledgeModule() {
  const course = getActiveCourse();
  const studyModule = getStudyModule();
  const selectedTopic = getKnowledgeTopic(studyModule.selectedNodeId);
  const selectedStats = getTopicStats(selectedTopic?.id);
  const visibleNodes = getVisibleGraphNodes();
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const mapMode = studyModule.mapMode || "mastery";
  const pathNodeIds = new Set(studyModule.pathNodeIds || []);
  const pathEdgeIds = new Set(studyModule.pathEdgeIds || []);
  const pathEdgeKeys = new Set(studyModule.pathEdgeKeys || []);

  renderGenerationStatus();
  renderGraphFilters();
  const graphTitle = document.querySelector("#knowledge-graph-title");
  if (graphTitle) graphTitle.textContent = `${course.name || "当前课程"}知识图谱`;
  const generationBusy = ["extracting", "ai", "validating"].includes(studyModule.generation?.state);
  document.querySelectorAll("[data-study-action='generate']").forEach((button) => {
    button.disabled = generationBusy;
    button.querySelector("span").textContent = generationBusy ? "生成中" : "生成知识图谱";
  });
  document.querySelectorAll("[data-study-action='cancel-generation']").forEach((button) => {
    button.disabled = !generationBusy;
  });
  document.querySelectorAll("[data-map-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mapMode === mapMode);
  });

  const emptyState = document.querySelector("#graph-empty-state");
  const canvas = document.querySelector("#knowledge-map-canvas");
  const nodeLayer = document.querySelector("#knowledge-node-layer");
  const edgeLayer = document.querySelector("#knowledge-edge-layer");
  if (emptyState) emptyState.classList.toggle("show", !visibleNodes.length);
  if (canvas) {
    const viewport = sanitizeGraphViewport(studyModule.graphViewport);
    canvas.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
  }

  if (edgeLayer) {
    edgeLayer.innerHTML = studyModule.graph.edges
      .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
      .map((edge) => {
        const source = studyModule.graph.nodes.find((node) => node.id === edge.source);
        const target = studyModule.graph.nodes.find((node) => node.id === edge.target);
        if (!source || !target) return "";
        const highlighted = pathEdgeIds.has(edge.id) || pathEdgeKeys.has(`${edge.source}->${edge.target}:${edge.relation}`);
        return `
          <g class="graph-edge ${highlighted ? "highlight" : ""}">
            <line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}"></line>
            <text x="${(source.x + target.x) / 2}" y="${(source.y + target.y) / 2}">${escapeHtml(edge.relation)}</text>
          </g>
        `;
      })
      .join("");
  }

  if (nodeLayer) {
    nodeLayer.innerHTML = visibleNodes
      .map((node) => {
        const stats = getTopicStats(node.id);
        const tag = mapMode === "chapter" ? node.chapter : mapMode === "difficulty" ? node.difficulty : `${stats.mastery}%`;
        const stateClass = stats.mastery < 60 ? "weak" : stats.mastery >= 80 ? "mastered" : "learning";
        return `
          <button class="node graph-node ${stateClass} ${node.id === selectedTopic?.id ? "selected" : ""} ${pathNodeIds.has(node.id) ? "path-highlight" : ""}"
            data-node="${escapeHtml(node.id)}"
            style="left: ${node.x}px; top: ${node.y}px"
            title="${escapeHtml(node.label)} · 掌握度 ${stats.mastery}%">
            ${escapeHtml(node.label)}<small>${escapeHtml(tag)}</small>
          </button>
        `;
      })
      .join("");
  }

  const nodeTitle = document.querySelector("#node-title");
  const nodeDesc = document.querySelector("#node-desc");
  const nodeMeta = document.querySelector("#node-meta");
  const nodeRelated = document.querySelector("#node-related");
  const mastery = document.querySelector(".mastery-bar span");

  if (nodeTitle) nodeTitle.textContent = selectedTopic?.label || "知识点详情";
  if (nodeDesc) nodeDesc.textContent = selectedTopic?.summary || "点击图谱节点查看解释、例子和原文出处。";
  if (nodeMeta && selectedTopic) {
    nodeMeta.innerHTML = `
      <span>掌握度 ${selectedStats.mastery}%</span>
      <span>${escapeHtml(selectedTopic.chapter)}</span>
      <span>${escapeHtml(selectedTopic.difficulty)}</span>
      <span>${selectedStats.total ? `已答 ${selectedStats.total} 题` : "待练习"}</span>
      <span>来源：${escapeHtml(selectedTopic.source || "课程资料")}</span>
    `;
  } else if (nodeMeta) {
    nodeMeta.innerHTML = `<span>当前课程暂无图谱</span><span>请导入资料后生成</span>`;
  }
  if (nodeRelated && selectedTopic) {
    const related = studyModule.graph.edges
      .filter((edge) => edge.source === selectedTopic.id || edge.target === selectedTopic.id)
      .map((edge) => edge.source === selectedTopic.id ? edge.target : edge.source)
      .slice(0, 6);
    nodeRelated.innerHTML = [
      ...(selectedTopic.examples || []).slice(0, 2).map((example) => `<p class="node-example">${escapeHtml(example)}</p>`),
      ...(selectedTopic.sourceSnippets || []).slice(0, 2).map((snippet) => `<p class="node-source-snippet">${escapeHtml(snippet)}</p>`),
      ...related.map((relatedTopic) => `<button class="mini-button" data-map-related="${escapeHtml(relatedTopic)}">${escapeHtml(relatedTopic)}</button>`),
    ].join("");
  } else if (nodeRelated) {
    nodeRelated.innerHTML = `<p class="node-example">当前课程还没有可展示的知识点。请先导入数据库课程资料，再点击生成知识图谱；如果 Neo4j 已有数据，可以点击“从 Neo4j 加载”。</p>`;
  }
  if (mastery) {
    mastery.style.width = selectedTopic ? `${selectedStats.mastery}%` : "0%";
    mastery.style.background = selectedTopic && selectedStats.mastery < 60 ? "var(--coral)" : selectedTopic && selectedStats.mastery >= 80 ? "var(--teal)" : "var(--yellow)";
  }
  document.querySelectorAll("[data-quiz-action='generate-current']").forEach((button) => {
    button.dataset.quizTopic = selectedTopic?.id || "";
  });

  window.lucide?.createIcons();
}

function selectKnowledgeNode(topicId) {
  const studyModule = getStudyModule();
  const topic = getKnowledgeTopic(topicId);
  studyModule.selectedNodeId = topic?.id || studyModule.selectedNodeId;
  saveWorkspace();
  renderKnowledgeModule();
}

function showKnowledgeSource() {
  const topic = getKnowledgeTopic(getStudyModule().selectedNodeId);
  const nodeDesc = document.querySelector("#node-desc");
  if (nodeDesc && topic) {
    const snippet = (topic.sourceSnippets || [])[0];
    nodeDesc.textContent = `${topic.summary} 资料来源：${topic.source || "课程资料"}。${snippet ? `原文片段：${snippet}` : `例子：${(topic.examples || [])[0] || "建议结合原文片段和测验题继续复习。"}`}`;
  }
}

function getMindmapNodeById(nodeId, mindmap = getStudyModule().mindmap) {
  if (!nodeId) return null;
  if (nodeId === mindmap?.id) {
    return {
      id: mindmap.id,
      label: mindmap.title,
      summary: mindmap.summary,
      children: mindmap.nodes || [],
      isRoot: true,
    };
  }
  return flattenMindmapNodes(mindmap).find((node) => node.id === nodeId) || null;
}

function visitMindmapNodes(nodes = [], visitor, parent = null) {
  for (const node of nodes) {
    const result = visitor(node, parent);
    if (result === false) return false;
    if (visitMindmapNodes(node.children || [], visitor, node) === false) return false;
  }
  return true;
}

function createMindmapManualNode(label, summary = "", source = "手动编辑") {
  const cleanLabel = String(label || "").trim().slice(0, 36);
  if (!cleanLabel) return null;
  return {
    id: createId("mindmap-manual"),
    label: cleanLabel,
    summary: String(summary || `围绕“${cleanLabel}”整理复习内容。`).trim().slice(0, 120),
    source,
    children: [],
  };
}

function addMindmapChildNode(targetId, childNode, studyModule = getStudyModule()) {
  if (!childNode) return false;
  const mindmap = studyModule.mindmap;
  if (!targetId || targetId === mindmap.id) {
    mindmap.nodes = mindmap.nodes || [];
    mindmap.nodes.push(childNode);
    studyModule.selectedMindmapNodeId = childNode.id;
    return true;
  }
  let added = false;
  visitMindmapNodes(mindmap.nodes || [], (node) => {
    if (node.id !== targetId) return true;
    node.children = Array.isArray(node.children) ? node.children : [];
    node.children.push(childNode);
    added = true;
    return false;
  });
  if (added) studyModule.selectedMindmapNodeId = childNode.id;
  return added;
}

function updateMindmapNode(targetId, updates = {}, studyModule = getStudyModule()) {
  const mindmap = studyModule.mindmap;
  if (!targetId) return false;
  if (targetId === mindmap.id) {
    mindmap.title = updates.label || updates.title || mindmap.title;
    mindmap.summary = updates.summary || mindmap.summary;
    return true;
  }
  let updated = false;
  visitMindmapNodes(mindmap.nodes || [], (node) => {
    if (node.id !== targetId) return true;
    node.label = updates.label || node.label;
    node.summary = updates.summary || node.summary;
    node.source = updates.source || node.source;
    updated = true;
    return false;
  });
  return updated;
}

function deleteMindmapNode(targetId, studyModule = getStudyModule()) {
  const mindmap = studyModule.mindmap;
  if (!targetId || targetId === mindmap.id) return false;
  const removeFrom = (nodes = []) => {
    const index = nodes.findIndex((node) => node.id === targetId);
    if (index >= 0) {
      nodes.splice(index, 1);
      return true;
    }
    return nodes.some((node) => removeFrom(node.children || []));
  };
  const removed = removeFrom(mindmap.nodes || []);
  if (removed) {
    studyModule.selectedMindmapNodeId = mindmap.nodes?.[0]?.id || mindmap.id || "";
    if (studyModule.mindmapFocusId === targetId) studyModule.mindmapFocusId = "";
    studyModule.mindmapCollapsed = (studyModule.mindmapCollapsed || []).filter((id) => id !== targetId);
  }
  return removed;
}

async function regenerateMindmapFromUploads() {
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  if (["extracting", "ai", "validating"].includes(studyModule.generation?.state)) return;
  try {
    studyModule.generation = { state: "extracting", engine: "mindmap", message: "正在读取资料，准备重新生成思维导图。", updatedAt: Date.now() };
    saveWorkspace();
    renderStudyModuleViews();
    let documents = await withTimeout(buildStudyAiDocumentsForCourse({
      requireCompletePdfOcr: true,
      textLimit: GRAPH_TEXT_LIMIT,
    }), 60000, "思维导图资料读取");
    documents = cleanDocumentsForStudyGeneration(documents.map((documentMeta) => ({
      ...documentMeta,
      text: sampleTextWithinLimit(documentMeta.text || "", GRAPH_TEXT_LIMIT),
    })));
    if (!documents.length) throw new Error("没有可用于生成思维导图的资料文本。");
    studyModule.generation = { state: "ai", engine: "Qwen Mindmap", message: "正在根据资料大纲重新生成思维导图。", updatedAt: Date.now() };
    saveWorkspace();
    renderStudyModuleViews();
    let mindmap = null;
    try {
      mindmap = await generateMindmapFromDocumentsWithAi(documents, course);
    } catch {
      mindmap = null;
    }
    studyModule.mindmap = mindmap || createRuleBasedMindmapFromDocuments(documents, course);
    studyModule.selectedMindmapNodeId = studyModule.mindmap.nodes[0]?.id || studyModule.mindmap.id || "";
    studyModule.mindmapFocusId = "";
    studyModule.mindmapCollapsed = [];
    studyModule.generation = {
      state: "done",
      engine: mindmap ? "qwen-mindmap" : "local-mindmap-rules",
      message: `思维导图已重新生成：${studyModule.mindmap.nodes.length} 个主分支。`,
      updatedAt: Date.now(),
    };
    saveWorkspace();
    renderStudyModuleViews();
    showView("mindmap");
  } catch (error) {
    studyModule.generation = { state: "error", engine: "mindmap", message: getAiErrorMessage(error), updatedAt: Date.now() };
    saveWorkspace();
    renderStudyModuleViews();
  }
}

function addMindmapChildFromPrompt() {
  const studyModule = getStudyModule();
  const selectedNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, studyModule.mindmap);
  const label = window.prompt("请输入新子主题名称", "");
  if (!label?.trim()) return;
  const summary = window.prompt("请输入复习提示", `围绕“${label.trim()}”整理定义、例子和易错点。`) || "";
  const childNode = createMindmapManualNode(label, summary);
  const targetId = selectedNode?.id || studyModule.mindmap.id;
  if (!addMindmapChildNode(targetId, childNode, studyModule)) return;
  saveWorkspace();
  renderMindmapModule();
}

function editSelectedMindmapNodeFromPrompt() {
  const studyModule = getStudyModule();
  const selectedNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, studyModule.mindmap);
  if (!selectedNode) return;
  const label = window.prompt("编辑节点名称", selectedNode.label || selectedNode.title || "");
  if (!label?.trim()) return;
  const summary = window.prompt("编辑复习提示", selectedNode.summary || "") || "";
  updateMindmapNode(selectedNode.id, { label: label.trim(), summary: summary.trim() }, studyModule);
  saveWorkspace();
  renderMindmapModule();
}

function deleteSelectedMindmapNodeFromPrompt() {
  const studyModule = getStudyModule();
  const selectedNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, studyModule.mindmap);
  if (!selectedNode || selectedNode.isRoot) return;
  if (!window.confirm(`删除“${selectedNode.label}”及其所有子主题？`)) return;
  deleteMindmapNode(selectedNode.id, studyModule);
  saveWorkspace();
  renderMindmapModule();
}

function openMindmapNodeEditor(mode = "add") {
  const studyModule = getStudyModule();
  const mindmap = studyModule.mindmap || createEmptyMindmap(getActiveCourse());
  const selectedNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, mindmap) || getMindmapNodeById(mindmap.id, mindmap);
  const isEdit = mode === "edit";
  const targetNode = selectedNode || getMindmapNodeById(mindmap.id, mindmap);
  const targetId = targetNode?.id || mindmap.id;
  const label = isEdit ? targetNode?.label || targetNode?.title || "" : "";
  const summary = isEdit ? targetNode?.summary || "" : "";
  const title = isEdit ? "编辑导图节点" : "添加子主题";
  const submitText = isEdit ? "保存节点" : "添加节点";
  const parentLabel = targetNode?.label || targetNode?.title || mindmap.title || "当前导图";

  closeModal();
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="mindmap-node">
        <section class="course-modal mindmap-node-modal" role="dialog" aria-modal="true" aria-labelledby="mindmap-node-modal-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">${isEdit ? "Mind Map Node" : `父主题：${escapeHtml(parentLabel)}`}</span>
              <h2 id="mindmap-node-modal-title">${title}</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <form class="course-form" id="mindmap-node-form" data-mindmap-node-mode="${mode}" data-mindmap-node-target="${escapeHtml(targetId)}">
            <label>
              <span>节点名称</span>
              <input id="mindmap-node-label-input" name="label" type="text" value="${escapeHtml(label)}" maxlength="36" required />
            </label>
            <label>
              <span>复习提示</span>
              <textarea id="mindmap-node-summary-input" name="summary" rows="4" maxlength="120">${escapeHtml(summary)}</textarea>
            </label>
            <div class="modal-actions">
              <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
              <button type="submit" class="primary-action compact">${submitText}</button>
            </div>
          </form>
        </section>
      </div>
    `,
  );
  window.lucide?.createIcons();
  document.querySelector("#mindmap-node-label-input")?.focus();
}

function submitMindmapNodeForm(event) {
  event.preventDefault();
  const form = event.target;
  const studyModule = getStudyModule();
  const mode = form.dataset.mindmapNodeMode;
  const targetId = form.dataset.mindmapNodeTarget || studyModule.mindmap?.id;
  const labelInput = form.elements.label;
  const summaryInput = form.elements.summary;
  const label = labelInput.value.trim();
  const summary = summaryInput.value.trim();

  if (!label) {
    labelInput.focus();
    return;
  }

  const ok = mode === "edit"
    ? updateMindmapNode(targetId, { label, summary }, studyModule)
    : addMindmapChildNode(targetId, createMindmapManualNode(label, summary), studyModule);
  if (!ok) return;
  saveWorkspace();
  closeModal();
  renderMindmapModule();
}

function zoomMindmap(value = 0) {
  const studyModule = getStudyModule();
  const current = Number(studyModule.mindmapZoom) || 1;
  studyModule.mindmapZoom = value === "reset"
    ? 1
    : Math.min(1.8, Math.max(0.55, current + (Number(value) || 0)));
  saveWorkspace();
  renderMindmapModule();
}

function getFocusedMindmapRoot(studyModule = getStudyModule()) {
  const mindmap = studyModule.mindmap || createEmptyMindmap(getActiveCourse());
  const focused = getMindmapNodeById(studyModule.mindmapFocusId, mindmap);
  if (!focused || focused.isRoot) return { ...mindmap, nodes: mindmap.nodes || [] };
  return {
    id: focused.id,
    title: focused.label,
    summary: focused.summary,
    nodes: focused.children || [],
    meta: mindmap.meta,
  };
}

const MINDMAP_BRANCH_COLORS = ["#ff6b6b", "#4dabf7", "#ffc247", "#ef8ed5", "#58c4dc", "#7fc97f", "#9b8cff", "#ff9f43"];

function splitMindmapLabel(label = "主题", maxChars = 10, maxLines = 2) {
  const clean = String(label || "主题").replace(/\s+/g, " ").trim();
  if (!clean) return ["主题"];
  const lines = [];
  let cursor = 0;
  while (cursor < clean.length && lines.length < maxLines) {
    lines.push(clean.slice(cursor, cursor + maxChars));
    cursor += maxChars;
  }
  if (cursor < clean.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(1, maxChars - 1))}…`;
  }
  return lines;
}

function estimateMindmapTextWidth(lines = [], fontSize = 22) {
  return Math.max(44, ...lines.map((line) => {
    const wideChars = (String(line).match(/[\u4e00-\u9fa5]/g) || []).length;
    const narrowChars = Math.max(0, String(line).length - wideChars);
    return wideChars * fontSize + narrowChars * fontSize * 0.58;
  }));
}

function buildMindmapSvgLayout(root, selectedId = "", collapsed = new Set(), options = {}) {
  const compact = Boolean(options.compact);
  const sizes = compact
    ? { rootWidth: 210, rootFont: 30, branchFont: 23, nodeFont: 19, lineHeight: 28, leafHeight: 68, childGap: 22, branchGap: 30, levelGap: 300 }
    : { rootWidth: 260, rootFont: 36, branchFont: 28, nodeFont: 22, lineHeight: 34, leafHeight: 86, childGap: 28, branchGap: 42, levelGap: 370 };
  const rootNode = {
    id: root.id || "mindmap-root",
    label: root.title || root.label || "思维导图",
    summary: root.summary,
    children: root.nodes || root.children || [],
    isRoot: true,
  };
  const rootX = 190;
  const topPadding = 80;
  const bottomPadding = 80;

  const prepare = (node, depth = 0, color = MINDMAP_BRANCH_COLORS[0], branchIndex = 0) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const visibleChildren = hasChildren && !collapsed.has(node.id) ? node.children : [];
    const fontSize = depth === 0 ? sizes.rootFont : depth === 1 ? sizes.branchFont : sizes.nodeFont;
    const maxChars = depth === 0 ? 5 : depth === 1 ? 8 : 11;
    const lines = splitMindmapLabel(node.label || node.title, maxChars, depth === 0 ? 2 : 2);
    const textWidth = estimateMindmapTextWidth(lines, fontSize);
    const children = visibleChildren.map((child, index) =>
      prepare(child, depth + 1, depth === 0 ? MINDMAP_BRANCH_COLORS[index % MINDMAP_BRANCH_COLORS.length] : color, index));
    const ownHeight = Math.max(sizes.leafHeight, lines.length * sizes.lineHeight + 34);
    const childGap = depth === 0
      ? sizes.branchGap
      : sizes.childGap + Math.max(0, visibleChildren.length - 3) * 10;
    const childrenHeight = children.reduce((sum, child) => sum + child.height, 0) + Math.max(0, children.length - 1) * childGap;
    return {
      node,
      depth,
      color,
      branchIndex,
      lines,
      fontSize,
      textWidth,
      ownHeight,
      childGap,
      children,
      hasChildren,
      collapsed: hasChildren && collapsed.has(node.id),
      height: Math.max(ownHeight, childrenHeight),
    };
  };

  const layout = prepare(rootNode);
  const contentHeight = Math.max(520, layout.height);
  const svgHeight = Math.ceil(contentHeight + topPadding + bottomPadding);
  const rootY = svgHeight / 2;

  const assign = (item, x, topY) => {
    item.x = x;
    if (item.depth === 0) {
      item.y = rootY;
    } else if (item.children.length) {
      let childTop = topY + Math.max(0, (item.height - (item.children.reduce((sum, child) => sum + child.height, 0) + (item.children.length - 1) * item.childGap)) / 2);
      item.children.forEach((child) => {
        const parentTextExtra = item.depth > 0 ? Math.max(0, item.textWidth - (item.depth === 1 ? 140 : 110)) : 0;
        const denseBranchExtra = item.depth > 0 ? Math.max(0, item.children.length - 3) * 18 : 0;
        assign(child, x + sizes.levelGap + parentTextExtra + denseBranchExtra, childTop);
        childTop += child.height + item.childGap;
      });
      item.y = (item.children[0].y + item.children[item.children.length - 1].y) / 2;
    } else {
      item.y = topY + item.height / 2;
    }
    if (item.depth > 0) {
      const textPadding = item.depth === 1 ? 18 : 12;
      item.textX = x;
      item.textY = item.y - ((item.lines.length - 1) * sizes.lineHeight) / 2 - 10;
      item.lineY = item.y + (item.lines.length * sizes.lineHeight) / 2 + 6;
      item.lineStart = x - (item.depth === 1 ? 110 : 74);
      item.lineEnd = x + Math.max(item.textWidth, item.depth === 1 ? 150 : 128) + textPadding;
      item.foldX = item.lineStart - 28;
      item.foldY = item.lineY - 1;
    }
  };

  let childTop = topPadding + Math.max(0, (contentHeight - layout.height) / 2);
  layout.children.forEach((child) => {
    assign(child, rootX + sizes.levelGap + 90, childTop);
    childTop += child.height + layout.childGap;
  });
  layout.x = rootX;
  layout.y = rootY;
  layout.rootWidth = sizes.rootWidth;
  layout.rootHeight = Math.max(94, layout.lines.length * sizes.lineHeight + 46);
  const maxX = Math.max(...flattenMindmapNodes(rootNode.children).map(() => 0), ...(() => {
    const values = [];
    const collect = (item) => {
      values.push(item.depth === 0 ? item.x + item.rootWidth / 2 : item.lineEnd);
      item.children.forEach(collect);
    };
    collect(layout);
    return values;
  })());
  return {
    layout,
    width: Math.ceil(Math.max(1060, maxX + 96)),
    height: svgHeight,
    lineHeight: sizes.lineHeight,
  };
}

function renderMindmapSvgNode(item, selectedId, lineHeight) {
  const selected = item.node.id === selectedId ? " selected" : "";
  if (item.depth === 0) {
    const rectX = item.x - item.rootWidth / 2;
    const rectY = item.y - item.rootHeight / 2;
    const textStartY = item.y - ((item.lines.length - 1) * lineHeight) / 2 + 10;
    return `
      <g class="mindmap-svg-root${selected}" data-mindmap-node="${escapeHtml(item.node.id)}">
        <rect x="${rectX}" y="${rectY}" width="${item.rootWidth}" height="${item.rootHeight}" rx="36"></rect>
        <text x="${item.x}" y="${textStartY}" text-anchor="middle" style="font-size: ${item.fontSize}px">
          ${item.lines.map((line, index) => `<tspan x="${item.x}" dy="${index ? lineHeight : 0}">${escapeHtml(line)}</tspan>`).join("")}
        </text>
      </g>
    `;
  }
  return `
    <g class="mindmap-svg-topic${selected}" data-mindmap-node="${escapeHtml(item.node.id)}" style="--branch-color: ${item.color}">
      <title>${escapeHtml(item.node.label || item.node.title || "主题")}</title>
      <text x="${item.textX}" y="${item.textY}" style="font-size: ${item.fontSize}px">
        ${item.lines.map((line, index) => `<tspan x="${item.textX}" dy="${index ? lineHeight : 0}">${escapeHtml(line)}</tspan>`).join("")}
      </text>
    </g>
  `;
}

function renderMindmapSvgLinks(item) {
  const links = [];
  const visit = (parent) => {
    if (parent.depth > 0 && parent.children.length > 1) {
      const startX = parent.lineEnd;
      const startY = parent.lineY;
      const firstChild = parent.children[0];
      const trunkX = Math.max(startX + 64, Math.min(startX + 150, firstChild.lineStart - 56));
      const curveX = startX + Math.max(48, (trunkX - startX) * 0.65);
      links.push(`<path class="mindmap-svg-link" style="--branch-color: ${parent.color}" d="M ${startX} ${startY} C ${curveX} ${startY}, ${curveX} ${startY}, ${trunkX} ${startY}"></path>`);
      parent.children.forEach((child) => {
        const childCurveLimit = child.lineStart - 46;
        const childCurveX = childCurveLimit <= trunkX + 58
          ? (trunkX + child.lineStart) / 2
          : Math.min(childCurveLimit, trunkX + 116);
        const d = `M ${trunkX} ${startY} C ${childCurveX} ${startY}, ${childCurveX} ${child.lineY}, ${child.lineStart} ${child.lineY} L ${child.lineEnd} ${child.lineY}`;
        links.push(`<path class="mindmap-svg-link" style="--branch-color: ${child.color}" d="${d}"></path>`);
        visit(child);
      });
      return;
    }
    parent.children.forEach((child) => {
      const startX = parent.depth === 0 ? parent.x + parent.rootWidth / 2 - 4 : parent.lineEnd;
      const startY = parent.depth === 0 ? parent.y : parent.lineY;
      const endX = child.lineStart;
      const endY = child.lineY;
      const curveX = startX + Math.max(92, (endX - startX) * 0.5);
      const d = `M ${startX} ${startY} C ${curveX} ${startY}, ${curveX} ${endY}, ${endX} ${endY} L ${child.lineEnd} ${endY}`;
      links.push(`<path class="mindmap-svg-link" style="--branch-color: ${child.color}" d="${d}"></path>`);
      visit(child);
    });
  };
  visit(item);
  return links.join("");
}

function renderMindmapSvgFolds(item, collapsed = new Set()) {
  const folds = [];
  const visit = (nodeLayout) => {
    if (nodeLayout.depth > 0 && nodeLayout.hasChildren) {
      const isCollapsed = collapsed.has(nodeLayout.node.id);
      folds.push(`
        <g class="mindmap-svg-fold" data-mindmap-toggle="${escapeHtml(nodeLayout.node.id)}" style="--branch-color: ${nodeLayout.color}">
          <circle cx="${nodeLayout.foldX}" cy="${nodeLayout.foldY}" r="13"></circle>
          <line x1="${nodeLayout.foldX - 6}" y1="${nodeLayout.foldY}" x2="${nodeLayout.foldX + 6}" y2="${nodeLayout.foldY}"></line>
          ${isCollapsed ? `<line x1="${nodeLayout.foldX}" y1="${nodeLayout.foldY - 6}" x2="${nodeLayout.foldX}" y2="${nodeLayout.foldY + 6}"></line>` : ""}
        </g>
      `);
    }
    nodeLayout.children.forEach(visit);
  };
  visit(item);
  return folds.join("");
}

function renderMindmapSvg(mindmapRoot, selectedId = "", collapsed = new Set(), options = {}) {
  const { layout, width, height, lineHeight } = buildMindmapSvgLayout(mindmapRoot, selectedId, collapsed, options);
  const zoom = Math.min(1.8, Math.max(0.55, Number(options.zoom) || 1));
  const nodes = [];
  const collectNodes = (item) => {
    nodes.push(renderMindmapSvgNode(item, selectedId, lineHeight));
    item.children.forEach(collectNodes);
  };
  collectNodes(layout);
  return `
    <svg class="mindmap-svg" viewBox="0 0 ${width} ${height}" width="${Math.ceil(width * zoom)}" height="${Math.ceil(height * zoom)}" role="img" aria-label="${escapeHtml(mindmapRoot.title || "思维导图")}">
      <g class="mindmap-svg-links">${renderMindmapSvgLinks(layout)}</g>
      <g class="mindmap-svg-nodes">${nodes.join("")}</g>
      <g class="mindmap-svg-folds">${renderMindmapSvgFolds(layout, collapsed)}</g>
    </svg>
  `;
}

function renderMindmapChildNodes(nodes = [], selectedId = "", collapsed = new Set(), branchIndex = 0, depth = 2) {
  if (!nodes.length) return "";
  return `
    <div class="mindmap-child-list depth-${depth}">
      ${nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isCollapsed = collapsed.has(node.id);
        return `
          <div class="mindmap-child ${isCollapsed ? "collapsed" : ""}">
            <button class="mindmap-node ${node.id === selectedId ? "selected" : ""}" data-mindmap-node="${escapeHtml(node.id)}">
              <span>${escapeHtml(node.label)}</span>
            </button>
            ${hasChildren ? `
              <button class="mindmap-fold" data-mindmap-toggle="${escapeHtml(node.id)}" title="${isCollapsed ? "展开" : "收起"}">
                <i data-lucide="${isCollapsed ? "plus" : "minus"}"></i>
              </button>
              ${isCollapsed ? "" : renderMindmapChildNodes(node.children, selectedId, collapsed, branchIndex, depth + 1)}
            ` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderMindmapModule() {
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  const mindmap = studyModule.mindmap || createEmptyMindmap(course);
  const focusedMindmap = getFocusedMindmapRoot(studyModule);
  const selectedNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, mindmap) || getMindmapNodeById(mindmap.id, mindmap);
  const collapsed = new Set(studyModule.mindmapCollapsed || []);
  const titleNode = document.querySelector("#mindmap-title");
  const groupSelect = document.querySelector("#mindmap-group-select");
  const focusSelect = document.querySelector("#mindmap-focus-select");
  const tree = document.querySelector("#mindmap-tree");
  const emptyState = document.querySelector("#mindmap-empty-state");
  const detailTitle = document.querySelector("#mindmap-node-title");
  const detailDesc = document.querySelector("#mindmap-node-desc");
  const detailMeta = document.querySelector("#mindmap-node-meta");

  if (titleNode) titleNode.textContent = `${mindmap.title || course.name || "当前课程"}思维导图`;
  if (groupSelect) groupSelect.value = ["classic", "compact"].includes(studyModule.mindmapMode) ? studyModule.mindmapMode : "classic";
  if (focusSelect) {
    const options = flattenMindmapNodes(mindmap);
    focusSelect.innerHTML = `<option value="">全部主题</option>${options
      .map((node) => `<option value="${escapeHtml(node.id)}">${escapeHtml(node.label)}</option>`)
      .join("")}`;
    focusSelect.value = studyModule.mindmapFocusId || "";
  }
  if (emptyState) emptyState.classList.toggle("show", !mindmap.nodes.length);
  if (tree) {
    tree.classList.toggle("compact", studyModule.mindmapMode === "compact");
    tree.innerHTML = mindmap.nodes.length
      ? renderMindmapSvg(focusedMindmap, selectedNode?.id || focusedMindmap.id, collapsed, {
        compact: studyModule.mindmapMode === "compact",
        zoom: studyModule.mindmapZoom || 1,
      })
      : "";
  }
  document.querySelectorAll("[data-mindmap-zoom='reset']").forEach((button) => {
    button.textContent = `${Math.round((Number(studyModule.mindmapZoom) || 1) * 100)}%`;
  });
  document.querySelectorAll("[data-mindmap-action='delete-node']").forEach((button) => {
    button.disabled = Boolean(selectedNode?.isRoot);
  });

  if (detailTitle) detailTitle.textContent = selectedNode?.label || selectedNode?.title || "导图节点详情";
  if (detailDesc) detailDesc.textContent = selectedNode?.summary || "点击导图节点查看该主题的复习提示。";
  if (detailMeta) {
    const childCount = selectedNode?.children?.length || 0;
    const linkedTopicId = resolveMindmapTopicId(selectedNode, studyModule.graph);
    detailMeta.innerHTML = selectedNode
      ? `
        <span>${selectedNode.isRoot ? "中心主题" : "导图主题"}</span>
        <span>${childCount ? `${childCount} 个子主题` : "末级节点"}</span>
        <span>${linkedTopicId ? "已链接图谱" : "独立主题"}</span>
        <span>${escapeHtml(selectedNode.source || mindmap.meta?.sourceDocuments?.[0] || "独立导图")}</span>
      `
      : `<span>暂无选中节点</span>`;
  }
  window.lucide?.createIcons();
}

function sanitizeMermaidMindmapLabel(value = "主题") {
  return String(value || "主题")
    .replace(/[\r\n]+/g, " ")
    .replace(/[()\[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48) || "主题";
}

function appendMermaidMindmapNode(lines, node, depth = 2) {
  const indent = "  ".repeat(depth);
  lines.push(`${indent}${sanitizeMermaidMindmapLabel(node.label || "主题")}`);
  (node.children || []).forEach((child) => appendMermaidMindmapNode(lines, child, depth + 1));
}

function buildMermaidMindmap(mindmap = getStudyModule().mindmap, course = getActiveCourse()) {
  const safeTitle = sanitizeMermaidMindmapLabel(mindmap?.title || course.name || "课程思维导图");
  const lines = ["mindmap", `  root((${safeTitle}))`];
  (mindmap?.nodes || []).forEach((node) => appendMermaidMindmapNode(lines, node, 2));
  return lines.join("\n");
}

function openMindmapExportDialog() {
  closeModal();
  const mindmapText = buildMermaidMindmap();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" data-modal="mindmap-export">
      <section class="course-modal" role="dialog" aria-modal="true" aria-labelledby="mindmap-export-title">
        <div class="modal-heading">
          <div>
            <span class="tag muted">Mermaid Mindmap</span>
            <h2 id="mindmap-export-title">思维导图 Mermaid 文本</h2>
          </div>
          <button class="icon-button light" data-modal-action="close" title="关闭">
            <i data-lucide="x"></i>
          </button>
        </div>
        <textarea class="mermaid-export-textarea" readonly>${escapeHtml(mindmapText)}</textarea>
        <div class="modal-actions">
          <button type="button" class="ghost-action compact" data-modal-action="close">关闭</button>
        </div>
      </section>
    </div>
  `);
  window.lucide?.createIcons();
}

function getQuizModeLabel(mode = "adaptive") {
  return {
    adaptive: "自适应练习",
    diagnostic: "快速诊断",
    weak: "薄弱巩固",
    review: "今日复习",
    exam: "考前冲刺",
  }[mode] || "自适应练习";
}

function getQuestionAttemptHistory(questionId) {
  return getStudyModule().attempts.filter((attempt) => attempt.questionId === questionId);
}

function getDueReviewMistakes() {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return getStudyModule().mistakes
    .filter((mistake) => !mistake.reviewed && Number(mistake.nextReviewAt || mistake.createdAt || 0) <= endOfToday.getTime())
    .sort((a, b) => Number(a.nextReviewAt || 0) - Number(b.nextReviewAt || 0) || Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

function getQuestionPriority(question, context = {}) {
  const studyModule = getStudyModule();
  const mode = context.mode || studyModule.quiz.mode || "adaptive";
  const stats = getTopicStats(question.topic);
  const history = getQuestionAttemptHistory(question.id);
  const lastAttempt = history[history.length - 1];
  const dueMistake = studyModule.mistakes.find((mistake) => mistake.questionId === question.id && !mistake.reviewed);
  const difficultyBoost = mode === "exam"
    ? { 基础: 4, 中等: 8, 较难: 12 }[question.difficulty] || 6
    : { 基础: 8, 中等: 6, 较难: 4 }[question.difficulty] || 5;

  return [
    dueMistake ? 70 : 0,
    stats.mastery < 60 ? 34 : stats.mastery < 78 ? 18 : 4,
    lastAttempt && !lastAttempt.correct ? 26 : 0,
    history.length === 0 ? 18 : Math.max(0, 10 - history.length * 2),
    difficultyBoost,
    question.type === "short" && mode !== "diagnostic" ? 6 : 0,
  ].reduce((sum, value) => sum + value, 0);
}

function uniqueQuestions(questions = []) {
  const seen = new Set();
  return questions.filter((question) => {
    if (!question || seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
}

function sortQuestionsForMode(questions, context = {}) {
  return uniqueQuestions(questions)
    .map((question, index) => ({
      question,
      score: getQuestionPriority(question, context),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.question);
}

function getReviewQueueQuestions(questions, difficulty = "all") {
  const dueMistakes = getDueReviewMistakes();
  const byId = new Map(questions.map((question) => [question.id, question]));
  const reviewQuestions = dueMistakes
    .map((mistake) => byId.get(mistake.questionId) || normalizeStudyQuestion({
      id: mistake.questionId,
      topic: mistake.topic,
      type: "short",
      difficulty: "中等",
      prompt: mistake.question,
      sampleAnswer: mistake.correctAnswer,
      explanation: mistake.explanation,
      source: mistake.source,
      sourceSnippet: mistake.sourceSnippet,
    }))
    .filter((question) => question && (difficulty === "all" || question.difficulty === difficulty));
  return uniqueQuestions(reviewQuestions);
}

function getDiagnosticQuestions(questions, difficulty = "all") {
  const selected = [];
  const usedTopics = new Set();
  sortQuestionsForMode(questions, { mode: "diagnostic" }).forEach((question) => {
    if (usedTopics.has(question.topic)) return;
    if (difficulty !== "all" && question.difficulty !== difficulty) return;
    selected.push(question);
    usedTopics.add(question.topic);
  });
  return selected;
}

function getTopicQuestions(topicId, difficulty = "all") {
  const studyModule = getStudyModule();
  const questions = studyModule.quiz.questions.length ? studyModule.quiz.questions : createRuleBasedQuizQuestions(studyModule.graph);
  const topic = getKnowledgeTopic(topicId);
  const mode = studyModule.quiz.mode || "adaptive";
  if (mode === "review") {
    const reviewQuestions = getReviewQueueQuestions(questions, difficulty);
    if (reviewQuestions.length) return reviewQuestions.slice(0, 10);
  }
  if (mode === "diagnostic") {
    return getDiagnosticQuestions(questions, difficulty).slice(0, 12);
  }
  if (mode === "weak") {
    const weakTopics = new Set(studyModule.graph.nodes
      .filter((node) => getTopicStats(node.id).mastery < 72 || studyModule.mistakes.some((mistake) => mistake.topic === node.id && !mistake.reviewed))
      .map((node) => node.id));
    const weakQuestions = questions.filter((question) => weakTopics.has(question.topic) && (difficulty === "all" || question.difficulty === difficulty));
    if (weakQuestions.length) return sortQuestionsForMode(weakQuestions, { mode }).slice(0, 10);
  }
  if (topicId === "all") {
    const filtered = questions.filter((question) => difficulty === "all" || question.difficulty === difficulty);
    return sortQuestionsForMode(filtered, { mode }).slice(0, mode === "exam" ? 16 : 10);
  }

  const filtered = questions
    .filter((question) => question.topic === topic?.id)
    .filter((question) => difficulty === "all" || question.difficulty === difficulty);

  return sortQuestionsForMode(filtered, { mode }).slice(0, 10);
}

function getQuizTypeLabel(type) {
  return {
    choice: "单选题",
    multi: "多选题",
    judge: "判断题",
    short: "简答题",
    match: "概念匹配",
  }[type] || "自动题";
}

function renderQuizScopeControls() {
  const studyModule = getStudyModule();
  const modeSelect = document.querySelector("#quiz-mode-select");
  const scopeSelect = document.querySelector("#quiz-scope-select");
  const difficultySelect = document.querySelector("#quiz-difficulty-select");
  if (modeSelect) modeSelect.value = studyModule.quiz.mode || "adaptive";
  if (scopeSelect) {
    scopeSelect.innerHTML = `<option value="all">整份资料</option>${studyModule.graph.nodes.map((node) => `<option value="${escapeHtml(node.id)}">${escapeHtml(node.label)}</option>`).join("")}`;
    scopeSelect.value = studyModule.quiz.scope || studyModule.activeQuizTopic || "all";
  }
  if (difficultySelect) difficultySelect.value = studyModule.quiz.difficulty || "all";
}

function renderQuizModule() {
  const studyModule = getStudyModule();
  const questions = getCurrentQuizQuestions();
  const currentIndex = questions.length ? (Math.max(0, Number(studyModule.quiz.cursor) || 0) % questions.length) : 0;
  const question = questions[currentIndex];
  const titleNode = document.querySelector("#quiz-title");
  const difficultyNode = document.querySelector("#quiz-difficulty");
  const questionNode = document.querySelector("#quiz-question");
  const answerList = document.querySelector("#quiz-answer-list");
  const feedback = document.querySelector("#answer-feedback");

  renderQuizScopeControls();
  if (!question) {
    if (titleNode) titleNode.textContent = "自动测验 · 等待生成";
    if (questionNode) questionNode.textContent = "还没有题目，请先生成知识图谱或点击“生成题组”。";
    if (answerList) answerList.innerHTML = "";
    if (feedback) {
      feedback.textContent = "当前筛选条件下没有可用题目，请切换范围或难度后重试。";
      feedback.className = "answer-feedback";
    }
    renderQuizSidebar([]);
    renderQuizSessionReport([]);
    return;
  }

  studyModule.quiz.cursor = currentIndex;
  studyModule.quizCursor = currentIndex;
  if (titleNode) titleNode.textContent = `${question.topic} · 第 ${currentIndex + 1} 题`;
  if (difficultyNode) difficultyNode.textContent = `${getQuizModeLabel(studyModule.quiz.mode)} · ${getQuizTypeLabel(question.type)} · ${question.difficulty}`;
  if (questionNode) questionNode.textContent = question.prompt;
  if (feedback) {
    feedback.textContent = `来源：${question.source || "课程资料"}。提交后显示答案解析、来源片段和下一步建议。`;
    feedback.className = "answer-feedback";
  }

  if (answerList) {
    if (question.type === "choice") {
      answerList.innerHTML = question.options
        .map((option, index) => `<button class="answer-option" data-quiz-answer="${index}">${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</button>`)
        .join("");
    } else if (question.type === "multi") {
      answerList.innerHTML = question.options
        .map((option, index) => `<button class="answer-option multi" data-quiz-multi="${index}">${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</button>`)
        .join("") + `<button class="primary-action" data-quiz-action="submit-multi">提交多选</button>`;
    } else if (question.type === "judge") {
      answerList.innerHTML = `
        <button class="answer-option" data-quiz-answer="true">正确</button>
        <button class="answer-option" data-quiz-answer="false">错误</button>
      `;
    } else if (question.type === "short") {
      answerList.innerHTML = `
        <textarea class="quiz-short-answer" id="quiz-short-answer" rows="5" placeholder="写下关键词或一句完整解释"></textarea>
        <button class="primary-action" data-quiz-action="submit-short">提交简答</button>
        <div class="quiz-sample-answer">参考要点：${escapeHtml(question.sampleAnswer || question.explanation)}</div>
      `;
    } else if (question.type === "match") {
      const choices = question.pairs.map((pair) => pair[1]).sort((a, b) => a.localeCompare(b, "zh-CN"));
      answerList.innerHTML = question.pairs
        .map(
          (pair, index) => `
            <label class="match-row">
              <strong>${escapeHtml(pair[0])}</strong>
              <select data-match-index="${index}">
                <option value="">选择匹配解释</option>
                ${choices.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join("")}
              </select>
            </label>
          `,
        )
        .join("") + `<button class="primary-action" data-quiz-action="submit-match">提交匹配</button>`;
    }
  }

  renderQuizSidebar(questions);
  renderQuizSessionReport(questions);
  bindQuizActionButtons();
  window.lucide?.createIcons();
}

function getCurrentQuizQuestions() {
  const studyModule = getStudyModule();
  const questions = getTopicQuestions(studyModule.quiz.scope || studyModule.activeQuizTopic || "all", studyModule.quiz.difficulty || "all");
  return questions.length ? questions : studyModule.quiz.questions;
}

function renderQuizSidebar(questions = getCurrentQuizQuestions()) {
  const studyModule = getStudyModule();
  const scoreValue = document.querySelector("#quiz-score-value");
  const scoreLabel = document.querySelector("#quiz-score-label");
  const topicList = document.querySelector("#quiz-topic-list");
  const scope = studyModule.quiz.scope || studyModule.activeQuizTopic;
  const quizStats = getQuizAttemptStats(scope, questions);

  if (scoreValue) scoreValue.textContent = `${quizStats.answeredQuestionIds.size} / ${questions.length}`;
  if (scoreLabel) {
    scoreLabel.textContent = quizStats.total
      ? `正确率 ${quizStats.accuracy}% · 已练 ${quizStats.total} 次`
      : `题组来源：${studyModule.quiz.source || studyModule.graph.meta.generatedBy}`;
  }
  if (topicList) {
    topicList.innerHTML = studyModule.graph.nodes
      .map((topic) => {
        const stats = getTopicStats(topic.id);
        const className = [
          topic.id === scope ? "current" : "",
          stats.mastery >= 80 ? "done" : "",
          stats.mastery < 60 ? "weak-topic" : "",
        ].filter(Boolean).join(" ");
        return `<button class="${className}" data-report-review-topic="${escapeHtml(topic.id)}">${escapeHtml(topic.label)} ${stats.mastery}%</button>`;
      })
      .join("");
  }

  const reviewList = document.querySelector("#quiz-review-list");
  if (reviewList) {
    const dueMistakes = getDueReviewMistakes().slice(0, 5);
    reviewList.innerHTML = `
      <span class="tag muted">今日复习</span>
      ${dueMistakes.length
        ? dueMistakes.map((mistake) => `
          <button class="quiz-review-item" data-report-review-topic="${escapeHtml(mistake.topic)}">
            <strong>${escapeHtml(getKnowledgeTopic(mistake.topic)?.label || mistake.topic)}</strong>
            <span>${escapeHtml(mistake.question || "重做错题")}</span>
          </button>
        `).join("")
        : `<p>当前没有待复习错题，继续完成本组练习即可。</p>`}
    `;
  }
}

function renderQuizSessionReport(questions = getCurrentQuizQuestions()) {
  const studyModule = getStudyModule();
  const reportNode = document.querySelector("#quiz-session-report");
  if (!reportNode) return;
  const stats = getQuizAttemptStats(studyModule.quiz.scope || "all", questions);
  const weakTopics = studyModule.graph.nodes
    .map((node) => ({ node, stats: getTopicStats(node.id) }))
    .sort((a, b) => a.stats.mastery - b.stats.mastery)
    .slice(0, 3);
  const dueCount = getDueReviewMistakes().length;

  reportNode.innerHTML = `
    <div>
      <strong>${getQuizModeLabel(studyModule.quiz.mode)}</strong>
      <span>${stats.total ? `本组正确率 ${stats.accuracy}%` : "完成第一题后生成本组诊断"}</span>
    </div>
    <div>
      <strong>${dueCount}</strong>
      <span>今日待复习</span>
    </div>
    <div>
      <strong>${weakTopics[0]?.node.label || "暂无"}</strong>
      <span>优先补强</span>
    </div>
    <div class="quiz-report-actions">
      ${weakTopics.map(({ node }) => `<button class="mini-button" data-report-review-topic="${escapeHtml(node.id)}">${escapeHtml(node.label)}</button>`).join("")}
    </div>
  `;
}

function getQuizAttemptStats(scope, questions = getCurrentQuizQuestions()) {
  const studyModule = getStudyModule();
  const questionIds = new Set((questions || []).map((question) => question.id));
  const attempts = studyModule.attempts.filter((attempt) => {
    if (questionIds.size) return questionIds.has(attempt.questionId);
    if (scope === "all") return true;
    return attempt.topic === scope;
  });
  const correct = attempts.filter((attempt) => attempt.correct).length;

  return {
    total: attempts.length,
    correct,
    wrong: attempts.length - correct,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
    answeredQuestionIds: new Set(attempts.map((attempt) => attempt.questionId)),
  };
}

function getCurrentQuizQuestion() {
  const questions = getCurrentQuizQuestions();
  if (!questions.length) return null;
  const cursor = Math.max(0, Number(getStudyModule().quiz.cursor) || 0);
  return questions[cursor % questions.length];
}

function getQuestionCorrectAnswer(question) {
  if (!question) return "";
  if (question.type === "choice") return question.options[Number(question.answer)] || "";
  if (question.type === "multi") return (question.answer || []).map((index) => question.options[index]).join("、");
  if (question.type === "judge") return question.answer ? "正确" : "错误";
  if (question.type === "match") return question.pairs.map((pair) => `${pair[0]} -> ${pair[1]}`).join("；");
  return question.sampleAnswer || question.explanation || "";
}

function getSelectedObjectiveAnswerText(question, selectedValue) {
  if (!question) return "";
  if (question.type === "choice") {
    const index = Number(selectedValue);
    return question.options[index] ? `${String.fromCharCode(65 + index)}. ${question.options[index]}` : String(selectedValue);
  }
  if (question.type === "judge") return selectedValue === "true" ? "正确" : "错误";
  return String(selectedValue);
}

function getSelectedMultiAnswerText(question, selected) {
  if (!question) return "";
  return selected.length
    ? selected.map((index) => `${String.fromCharCode(65 + index)}. ${question.options[index] || index}`).join("、")
    : "未选择";
}

function inferQuizMistakeReason(question, selectedAnswer = "") {
  if (question.type === "short") return "要点缺失";
  if (question.type === "match") return "概念匹配混淆";
  if (question.type === "multi") return "多选条件遗漏";
  if (String(selectedAnswer).includes("未选择") || String(selectedAnswer).includes("未填写")) return "未完成作答";
  return "概念判断偏差";
}

function recordQuizAnswer(selectedAnswer, correct, meta = {}) {
  const studyModule = getStudyModule();
  const question = getCurrentQuizQuestion();
  if (!question) return null;
  const attempt = {
    id: createId("attempt"),
    questionId: question.id,
    topic: question.topic,
    type: question.type,
    question: question.prompt,
    selectedAnswer,
    correct,
    correctAnswer: getQuestionCorrectAnswer(question),
    explanation: question.explanation,
    source: question.source,
    sourceSnippet: question.sourceSnippet,
    aiScore: Number.isFinite(meta.score) ? meta.score : null,
    feedback: meta.feedback || "",
    missingPoints: Array.isArray(meta.missingPoints) ? meta.missingPoints : [],
    answeredAt: Date.now(),
  };

  studyModule.attempts.push(attempt);
  studyModule.progress.studyMinutes = Math.max(0, Number(studyModule.progress.studyMinutes) || 0) + 3;
  const existing = studyModule.mistakes.find((mistake) => mistake.questionId === question.id);
  if (!correct) {
    const nextReviewAt = Date.now();
    if (existing) {
      existing.selectedAnswer = selectedAnswer;
      existing.reviewed = false;
      existing.attemptId = attempt.id;
      existing.correctAnswer = attempt.correctAnswer;
      existing.explanation = question.explanation;
      existing.source = question.source;
      existing.sourceSnippet = question.sourceSnippet;
      existing.reason = meta.reason || inferQuizMistakeReason(question, selectedAnswer);
      existing.nextReviewAt = nextReviewAt;
      existing.reviewLevel = 0;
      existing.createdAt = Date.now();
    } else {
      studyModule.mistakes.unshift({
        id: createId("mistake"),
        attemptId: attempt.id,
        questionId: question.id,
        topic: question.topic,
        question: question.prompt,
        selectedAnswer,
        correctAnswer: attempt.correctAnswer,
        explanation: question.explanation,
        source: question.source,
        sourceSnippet: question.sourceSnippet,
        reason: meta.reason || inferQuizMistakeReason(question, selectedAnswer),
        nextReviewAt,
        reviewLevel: 0,
        reviewed: false,
        createdAt: Date.now(),
      });
    }
  } else if (existing) {
    existing.reviewLevel = Math.min(2, Number(existing.reviewLevel || 0) + 1);
    existing.reviewed = existing.reviewLevel >= 2;
    existing.reviewedAt = Date.now();
    existing.lastCorrectAttemptId = attempt.id;
    existing.nextReviewAt = existing.reviewed ? 0 : Date.now() + 2 * 24 * 60 * 60 * 1000;
  }
  updateStudyRecommendations();
  saveWorkspace();
  return attempt;
}

function refreshAfterQuizAnswer() {
  renderQuizSidebar();
  renderQuizSessionReport();
  renderReportModule();
  renderKnowledgeModule();
}

function getQuestionSourceSnippet(question) {
  if (!question) return "";
  const topic = getKnowledgeTopic(question.topic);
  return question.sourceSnippet || (topic?.sourceSnippets || [])[0] || (topic?.examples || [])[0] || "";
}

function showQuizFeedback(correct, explanation, correctAnswer = "", meta = {}) {
  const feedback = document.querySelector("#answer-feedback");
  if (!feedback) return;
  const question = meta.question || getCurrentQuizQuestion();
  const sourceSnippet = meta.sourceSnippet || getQuestionSourceSnippet(question);
  const missingPoints = Array.isArray(meta.missingPoints) ? meta.missingPoints.filter(Boolean) : [];
  const scoreText = Number.isFinite(meta.score) ? `<small>智能评分：${meta.score} / 100</small>` : "";

  feedback.innerHTML = `
    <strong>${correct ? "回答正确" : "这次答错了"}</strong>
    <span>${escapeHtml(explanation || "")}</span>
    ${correctAnswer ? `<small>正确答案：${escapeHtml(correctAnswer)}</small>` : ""}
    ${scoreText}
    ${missingPoints.length ? `<small>缺失要点：${missingPoints.map(escapeHtml).join("、")}</small>` : ""}
    ${sourceSnippet ? `<blockquote>来源片段：${escapeHtml(sourceSnippet)}</blockquote>` : ""}
    <div class="quiz-feedback-actions">
      <button class="mini-button" data-quiz-action="open-topic">查看图谱节点</button>
      <button class="mini-button" data-quiz-action="review-mode">今日复习</button>
    </div>
  `;
  feedback.className = `answer-feedback ${correct ? "correct" : "wrong"}`;
  bindQuizActionButtons(feedback);
}

function submitObjectiveQuizAnswer(answerButton) {
  const question = getCurrentQuizQuestion();
  if (!question) return;
  const selectedValue = answerButton.dataset.quizAnswer;
  const correct = question.type === "choice"
    ? Number(selectedValue) === Number(question.answer)
    : (selectedValue === "true") === Boolean(question.answer);

  document.querySelectorAll(".answer-option").forEach((button) => {
    button.classList.remove("selected", "correct", "wrong");
    if (button === answerButton) button.classList.add("selected", correct ? "correct" : "wrong");
  });

  recordQuizAnswer(getSelectedObjectiveAnswerText(question, selectedValue), correct);
  showQuizFeedback(correct, question.explanation, getQuestionCorrectAnswer(question));
  refreshAfterQuizAnswer();
}

function submitMultiQuizAnswer() {
  const question = getCurrentQuizQuestion();
  if (!question) return;
  const selected = Array.from(document.querySelectorAll("[data-quiz-multi].selected")).map((button) => Number(button.dataset.quizMulti)).sort();
  const expected = [...(question.answer || [])].map(Number).sort();
  const correct = selected.length === expected.length && selected.every((value, index) => value === expected[index]);
  recordQuizAnswer(getSelectedMultiAnswerText(question, selected), correct);
  showQuizFeedback(correct, question.explanation, getQuestionCorrectAnswer(question));
  refreshAfterQuizAnswer();
}

function buildShortAnswerGradePrompt(question, answer) {
  return [
    "请作为课程助教评分这道简答题，只返回严格 JSON，不要 Markdown。",
    "评分要宽容但有依据，重点看学生是否表达了核心含义，不要求逐字一致。",
    "JSON 格式：",
    '{"score":0,"correct":false,"feedback":"一句具体反馈","matchedPoints":["命中的要点"],"missingPoints":["缺失的要点"],"reason":"错因标签"}',
    `题目：${question.prompt}`,
    `学生答案：${answer || "未填写"}`,
    `参考答案：${question.sampleAnswer || getQuestionCorrectAnswer(question)}`,
    `解析：${question.explanation || ""}`,
    `关键词：${(question.keywords || []).join("、")}`,
    `来源片段：${getQuestionSourceSnippet(question) || question.source || "课程资料"}`,
  ].join("\n");
}

async function gradeShortAnswerWithAi(question, answer) {
  if (!window.mindStudy?.ai?.askQuestion || !answer.trim()) return null;
  await ensureAiConfigured();
  const response = await window.mindStudy.ai.askQuestion({
    question: buildShortAnswerGradePrompt(question, answer),
    documents: [{
      title: question.source || "课程资料",
      text: [getQuestionSourceSnippet(question), question.sampleAnswer, question.explanation].filter(Boolean).join("\n\n"),
    }],
    options: {
      maxChunks: 3,
      maxContextChars: 4000,
      maxTokens: 700,
      temperature: 0.05,
      persona: false,
      multimodal: false,
    },
  });
  const parsed = extractJsonFromAiText(response.answer);
  if (!parsed) return null;
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  return {
    score,
    correct: Boolean(parsed.correct) || score >= 70,
    feedback: String(parsed.feedback || "").slice(0, 240),
    matchedPoints: Array.isArray(parsed.matchedPoints) ? parsed.matchedPoints.map(String).slice(0, 4) : [],
    missingPoints: Array.isArray(parsed.missingPoints) ? parsed.missingPoints.map(String).slice(0, 4) : [],
    reason: parsed.reason || "",
  };
}

async function submitShortQuizAnswer() {
  const question = getCurrentQuizQuestion();
  if (!question) return;
  const answer = document.querySelector("#quiz-short-answer")?.value.trim() || "";
  const submitButton = document.querySelector("[data-quiz-action='submit-short']");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "正在评分";
  }

  let grading = null;
  try {
    grading = await gradeShortAnswerWithAi(question, answer);
  } catch {
    grading = null;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "提交简答";
    }
  }

  const normalizedAnswer = answer.toLowerCase();
  const hitCount = (question.keywords || []).filter((keyword) => normalizedAnswer.includes(keyword.toLowerCase())).length;
  const fallbackCorrect = hitCount >= Math.min(2, Math.max(1, question.keywords.length));
  const correct = grading ? grading.correct : fallbackCorrect;
  const feedbackText = grading?.feedback || `${question.explanation} 参考答案：${question.sampleAnswer}`;
  const score = grading?.score ?? Math.min(100, Math.round((hitCount / Math.max(1, question.keywords.length)) * 100));

  recordQuizAnswer(answer || "未填写", correct, {
    score,
    feedback: feedbackText,
    missingPoints: grading?.missingPoints || [],
    reason: grading?.reason || "",
  });
  showQuizFeedback(correct, feedbackText, getQuestionCorrectAnswer(question), {
    question,
    score,
    missingPoints: grading?.missingPoints || [],
  });
  refreshAfterQuizAnswer();
}

function submitMatchQuizAnswer() {
  const question = getCurrentQuizQuestion();
  if (!question) return;
  const selects = Array.from(document.querySelectorAll("[data-match-index]"));
  const correct = selects.every((select) => question.pairs[Number(select.dataset.matchIndex)]?.[1] === select.value);
  const selectedAnswer = selects.map((select) => `${question.pairs[Number(select.dataset.matchIndex)]?.[0]} -> ${select.value || "未选择"}`).join("; ");

  recordQuizAnswer(selectedAnswer, correct);
  showQuizFeedback(correct, question.explanation, getQuestionCorrectAnswer(question));
  refreshAfterQuizAnswer();
}

function withTimeout(promise, timeoutMs, label) {
  let timer = null;
  const guarded = Promise.resolve(promise);
  guarded.catch(() => {});
  return Promise.race([
    guarded,
    new Promise((resolve, reject) => {
      timer = window.setTimeout(() => reject(new Error(`${label} 超时，请检查网络、模型额度或稍后重试。`)), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) window.clearTimeout(timer);
  });
}

function isCurrentGraphGeneration(runId, courseId) {
  return graphGenerationRunId === runId && getActiveCourse()?.id === courseId;
}

function generateQuizForTopic(topicId, difficulty = "all") {
  const studyModule = getStudyModule();
  const topic = topicId === "all" ? null : getKnowledgeTopic(topicId);
  studyModule.quiz.scope = topicId === "all" ? "all" : topic?.id || "all";
  studyModule.quiz.difficulty = difficulty;
  studyModule.quiz.cursor = 0;
  studyModule.activeQuizTopic = studyModule.quiz.scope;
  if (topic?.id) studyModule.selectedNodeId = topic.id;
  saveWorkspace();
  renderStudyModuleViews();
  showView("quiz");
}

function buildQuizGenerationPrompt(graph, context = {}, documents = []) {
  const nodes = (graph.nodes || []).slice(0, 40).map((node) => ({
    id: node.id,
    label: node.label,
    summary: node.summary,
    keywords: node.keywords,
    sourceSnippets: node.sourceSnippets,
  }));
  const edges = (graph.edges || []).slice(0, 60).map((edge) => ({
    source: edge.source,
    target: edge.target,
    relation: edge.relation,
    explanation: edge.explanation,
  }));
  const outline = extractDocumentOutlineForAi(documents, 60);
  return [
    "请基于课程资料独立生成自动测验题库，只返回严格 JSON，不要 Markdown。",
    "优先依据资料正文和资料大纲出题；可参考知识图谱节点，但不要依赖知识图谱质量。",
    "JSON 格式：{\"questions\":[{\"id\":\"q1\",\"topic\":\"短主题名或图谱节点id\",\"type\":\"choice|multi|judge|short|match\",\"difficulty\":\"基础|中等|较难\",\"prompt\":\"题干\",\"options\":[\"A\",\"B\"],\"answer\":0,\"pairs\":[[\"概念\",\"解释\"]],\"keywords\":[\"关键词\"],\"sampleAnswer\":\"参考答案\",\"explanation\":\"解析，说明正确依据和错选项问题\",\"source\":\"资料出处\",\"sourceSnippet\":\"原文证据片段\"}]}",
    "要求：生成 12-20 道题，覆盖定义理解、关系判断、应用场景、易混概念和简答；不要生成脱离资料的通用模板题；每题必须有 sourceSnippet；不要把“本书/网址/版次/作者/目录项”当成考点。",
    `练习模式：${context.mode || "adaptive"}；范围：${context.scope || "all"}；难度：${context.difficulty || "all"}`,
    `资料大纲候选：${JSON.stringify(outline)}`,
    `图谱节点：${JSON.stringify(nodes)}`,
    `图谱关系：${JSON.stringify(edges)}`,
  ].join("\n");
}

async function regenerateQuizQuestionsFromCurrentGraph(source = "local-quiz-rules", context = {}) {
  const studyModule = getStudyModule();
  const documents = getCourseStudyDocumentsSnapshot();
  let questions = [];
  let quizSource = source;
  if (window.mindStudy?.ai?.askQuestion && documents.length) {
    try {
      await ensureAiConfigured();
      const response = await withTimeout(window.mindStudy.ai.askQuestion({
        question: buildQuizGenerationPrompt(studyModule.graph, context, documents),
        documents,
        options: {
          maxChunks: 10,
          maxContextChars: GRAPH_TEXT_LIMIT,
          maxTokens: 1800,
          temperature: 0.12,
          persona: false,
          multimodal: true,
        },
      }), GRAPH_SECONDARY_AI_TIMEOUT_MS, "AI 题库生成");
      const parsed = extractJsonFromAiText(response.answer);
      const rawQuestions = parsed?.quiz?.questions || parsed?.questions || [];
      questions = rawQuestions.map((question) => normalizeGeneratedQuestionWithTopic(question, studyModule.graph, documents)).filter(Boolean);
      if (questions.length) quizSource = "qwen-quiz";
    } catch {
      questions = [];
    }
  }
  if (!questions.length) {
    questions = createRuleBasedQuizQuestions(studyModule.graph, documents);
    quizSource = source;
  }
  if (!questions.length) return false;
  studyModule.quiz.questions = questions;
  studyModule.quiz.generatedAt = Date.now();
  studyModule.quiz.source = quizSource;
  studyModule.quiz.cursor = 0;
  return true;
}

function moveQuizCursor(step = 1) {
  const studyModule = getStudyModule();
  const questions = getCurrentQuizQuestions();
  if (!questions.length) {
    studyModule.quiz.cursor = 0;
    studyModule.quizCursor = 0;
    saveWorkspace();
    renderQuizModule();
    return;
  }
  const currentCursor = Math.max(0, Number(studyModule.quiz.cursor) || 0);
  studyModule.quiz.cursor = (currentCursor + step + questions.length) % questions.length;
  studyModule.quizCursor = studyModule.quiz.cursor;
  saveWorkspace();
  renderQuizModule();
}

async function handleQuizActionButton(quizActionButton) {
  const action = quizActionButton?.dataset.quizAction;
  if (!action) return;

  if (action === "generate-current") {
    const currentNodeTitle = quizActionButton.dataset.quizTopic || document.querySelector("#node-title")?.textContent?.trim() || getStudyModule().selectedNodeId;
    generateQuizForTopic(currentNodeTitle);
  }
  if (action === "generate-filtered") {
    const mode = document.querySelector("#quiz-mode-select")?.value || getStudyModule().quiz.mode || "adaptive";
    const scope = document.querySelector("#quiz-scope-select")?.value || getStudyModule().selectedNodeId;
    const difficulty = document.querySelector("#quiz-difficulty-select")?.value || "all";
    const studyModule = getStudyModule();
    if (!studyModule.graph.nodes.length && getCourseStudyDocumentsSnapshot().length) {
      await generateStudyModuleFromUploads();
      return;
    }
    quizActionButton.disabled = true;
    quizActionButton.querySelector("span").textContent = "生成中";
    try {
      studyModule.quiz.mode = mode;
      await regenerateQuizQuestionsFromCurrentGraph("local-quiz-rules", { mode, scope, difficulty });
      generateQuizForTopic(scope || "all", difficulty);
    } finally {
      quizActionButton.disabled = false;
      quizActionButton.querySelector("span").textContent = "生成题组";
    }
  }
  if (action === "next") moveQuizCursor(1);
  if (action === "reset") generateQuizForTopic(getStudyModule().quiz.scope || getStudyModule().selectedNodeId);
  if (action === "open-topic") {
    const question = getCurrentQuizQuestion();
    if (question?.topic) selectKnowledgeNode(question.topic);
    showView("map");
  }
  if (action === "review-mode") {
    const studyModule = getStudyModule();
    studyModule.quiz.mode = "review";
    studyModule.quiz.scope = "all";
    studyModule.quiz.cursor = 0;
    saveWorkspace();
    renderQuizModule();
  }
  if (action === "submit-multi") submitMultiQuizAnswer();
  if (action === "submit-short") submitShortQuizAnswer();
  if (action === "submit-match") submitMatchQuizAnswer();
}

function bindQuizActionButtons(root = document) {
  root.querySelectorAll("[data-quiz-action]").forEach((button) => {
    if (button.dataset.quizActionBound === "true") return;
    button.dataset.quizActionBound = "true";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      handleQuizActionButton(button);
    });
  });
}

function getReportStats() {
  const studyModule = getStudyModule();
  const attempts = studyModule.attempts;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const wrong = attempts.length - correct;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const weakTopics = studyModule.graph.nodes
    .map((topic) => ({ ...topic, stats: getTopicStats(topic.id) }))
    .sort((a, b) => a.stats.mastery - b.stats.mastery);
  const completedChapters = new Set(
    studyModule.graph.nodes.filter((node) => getTopicStats(node.id).total > 0).map((node) => node.chapter),
  ).size;
  const allChapters = new Set(studyModule.graph.nodes.map((node) => node.chapter)).size || 1;

  return {
    attempts,
    correct,
    wrong,
    accuracy,
    studyHours: ((Number(studyModule.progress.studyMinutes) || attempts.length * 3) / 60 + 0.8).toFixed(1),
    weakTopics,
    chapterCompletion: Math.round((completedChapters / allChapters) * 100),
  };
}

function updateStudyRecommendations() {
  const studyModule = getStudyModule();
  const weakTopics = studyModule.graph.nodes
    .map((node) => ({ node, stats: getTopicStats(node.id) }))
    .sort((a, b) => a.stats.mastery - b.stats.mastery)
    .slice(0, 4);
  studyModule.recommendations = weakTopics.map(({ node, stats }) => ({
    id: createId("rec"),
    topic: node.id,
    title: `复习 ${node.label}`,
    detail: stats.total
      ? `当前掌握度 ${stats.mastery}%，建议重做错题并补看原文出处。`
      : `尚未练习，建议先完成 3 道相关题。`,
    action: "quiz",
  }));
}

function renderReportModule() {
  const studyModule = getStudyModule();
  const stats = getReportStats();
  const weakest = stats.weakTopics[0];
  const reportTitle = document.querySelector("#report-title");
  const studyTime = document.querySelector("#report-study-time");
  const accuracy = document.querySelector("#report-accuracy");
  const mistakes = document.querySelector("#report-mistakes");
  const trendChart = document.querySelector("#report-trend-chart");
  const reviewPanel = document.querySelector("#report-review-panel");
  const mistakeCount = document.querySelector("#mistake-book-count");
  const mistakeList = document.querySelector("#mistake-book-list");

  if (reportTitle) {
    reportTitle.textContent = stats.attempts.length
      ? `已完成 ${stats.attempts.length} 次练习，建议优先补强${weakest?.label || "薄弱知识点"}。`
      : "还没有新的答题记录，建议先生成图谱并完成一组自测。";
  }
  if (studyTime) studyTime.textContent = `${stats.studyHours}h`;
  if (accuracy) accuracy.textContent = `${stats.accuracy}%`;
  if (mistakes) mistakes.textContent = String(studyModule.mistakes.filter((mistake) => !mistake.reviewed).length);

  if (trendChart) {
    const now = new Date();
    const dayValues = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - index));
      const key = day.toISOString().slice(0, 10);
      return stats.attempts.filter((attempt) => new Date(attempt.answeredAt).toISOString().slice(0, 10) === key).length;
    });
    const maxValue = Math.max(3, ...dayValues);
    trendChart.innerHTML = dayValues
      .map((value) => `<span style="--h: ${Math.max(18, Math.round((value / maxValue) * 100))}%" title="${value} 次练习"></span>`)
      .join("");
  }

  if (reviewPanel) {
    const recommendations = studyModule.recommendations.length ? studyModule.recommendations : stats.weakTopics.slice(0, 4).map((topic) => ({
      topic: topic.id,
      title: `复习 ${topic.label}`,
      detail: `掌握度 ${topic.stats.mastery}%`,
    }));
    reviewPanel.innerHTML = `
      <span class="tag muted">推荐复习</span>
      <div class="chapter-progress">
        <strong>${stats.chapterCompletion}%</strong>
        <span>章节完成度</span>
      </div>
      ${recommendations
        .slice(0, 4)
        .map(
          (item) => `
            <button class="review-row" data-report-review-topic="${escapeHtml(item.topic)}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.detail)}</span>
            </button>
          `,
        )
        .join("")}
    `;
  }

  if (mistakeCount) mistakeCount.textContent = `${studyModule.mistakes.length} 题`;
  if (mistakeList) {
    mistakeList.innerHTML = studyModule.mistakes.length
      ? studyModule.mistakes
          .slice(0, 8)
          .map((mistake) => `
            <article class="mistake-card ${mistake.reviewed ? "reviewed" : ""}">
              <strong>${escapeHtml(mistake.question)}</strong>
              <span>你的答案：${escapeHtml(mistake.selectedAnswer || "未作答")}</span>
              <span>正确答案：${escapeHtml(mistake.correctAnswer || "")}</span>
              <p>${escapeHtml(mistake.explanation || "")}</p>
              <div>
                <button class="mini-button" data-mistake-review="${mistake.id}">${mistake.reviewed ? "已复习" : "标记复习"}</button>
                <button class="mini-button" data-report-review-topic="${escapeHtml(mistake.topic)}">重新练习</button>
              </div>
            </article>
          `)
          .join("")
      : `<article class="mistake-card"><strong>暂无错题</strong><span>答错的题目会自动记录在这里。</span></article>`;
  }
}

function renderStudyModuleViews() {
  renderKnowledgeModule();
  renderMindmapModule();
  renderQuizModule();
  renderReportModule();
}

function extractJsonFromAiText(text) {
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

async function buildStudyAiDocumentsForCourse(options = {}) {
  const course = getActiveCourse();
  const documents = [];

  for (const [index, meta] of (course.documents || []).entries()) {
    try {
      options.onStatus?.(`正在读取 ${index + 1}/${course.documents.length}：${meta.name}`);
      const extractionOptions = isPdfMeta(meta) && options.requireCompletePdfOcr
        ? {
            ...options,
            extractionOptions: buildLearningPdfExtractionOptions(meta, {
              totalTextLimit: RAG_KNOWLEDGE_TEXT_LIMIT,
              onStatus: options.onStatus,
            }),
            textLimit: options.textLimit || GRAPH_TEXT_LIMIT,
          }
        : options;
      const aiDocument = await buildAiDocumentFromMeta(meta, extractionOptions);
      if (aiDocument?.text?.trim()) documents.push(aiDocument);
    } catch {
      // 单个资料读取失败时继续处理其他资料，避免整门课生成中断。
    }
  }

  if (!documents.length) {
    const active = await buildActiveAiDocuments().catch(() => []);
    return active;
  }

  return documents;
}

function buildStudyGenerationPrompt(documents) {
  const titles = documents.map((documentMeta) => documentMeta.title).join("、") || "课程资料";
  return [
    "请基于课程资料生成 MindStudy 学习图谱和自动测验数据。",
    "必须返回严格 JSON，不要 Markdown，不要解释。",
    "只抽取正文里的课程概念、原理、方法、模型、术语、流程和约束。",
    "禁止把 PDF 文件名、书名、作者、学校、学院、出版社、版次、ISBN、CIP、版权声明、页码、目录项、封面/封底信息、人名、机构名、本书说明、网址、参考文献、习题说明当作知识点。",
    "负例：不要输出“本书”“本书中”“本书英文版网站的网址”“第7版是”“方面由”“目前的研究领域”“表和例子来说明为什么结论”“的工作提出建议或给予了”这类节点。",
    "节点必须是可考试、可复习的短概念或短主题，例如“事务”“并发控制”“关系模型”“SQL”“完整性约束”。",
    "JSON 结构：",
    "{",
    '  "graph": {',
    '    "nodes": [{"id":"知识点唯一中文名","label":"显示名","summary":"60字内解释","chapter":"章节","difficulty":"基础|中等|较难","source":"资料出处","sourceSnippets":["原文证据片段"],"examples":["例子"],"keywords":["关键词"],"mastery":40}],',
    '    "edges": [{"source":"节点id","target":"节点id","relation":"前置|包含|应用|对比|因果|证据|示例|相关","weight":0.6,"explanation":"为什么成立"}]',
    "  },",
    '  "quiz": {',
    '    "questions": [',
    '      {"id":"q1","topic":"节点id","type":"choice|multi|judge|short|match","difficulty":"基础|中等|较难","prompt":"题干","options":["A","B"],"answer":0,"keywords":["关键词"],"sampleAnswer":"参考答案","explanation":"解析","source":"资料出处","sourceSnippet":"原文证据片段"},',
    '      {"id":"q2","topic":"节点id","type":"multi","difficulty":"中等","prompt":"题干","options":["A","B","C"],"answer":[0,2],"explanation":"解析"},',
    '      {"id":"q3","topic":"节点id","type":"match","difficulty":"中等","prompt":"题干","pairs":[["概念","解释"]],"explanation":"解析"}',
    "    ]",
    "  },",
    '  "recommendations": [{"topic":"节点id","title":"复习建议标题","detail":"具体建议"}]',
    "}",
    "质量要求：优先生成 24-64 个节点，边数不少于节点数的 1.2 倍；必须覆盖章节层级、核心概念、方法/模型、约束、流程、应用和对比关系。",
    "证据要求：每个核心节点必须有 sourceSnippets；每条非“相关”关系必须能用节点证据或 explanation 解释。",
    "题目要求：生成 12-20 道题，题型覆盖 choice/multi/judge/short/match；必须直接来自课程资料内容；topic 必须等于某个 graph.nodes[].id；每道题都要有 source/sourceSnippet，解析要说明正确依据和错选项为什么不合适；不要为了配合知识图谱关系而编造题目。",
    `资料标题：${titles}`,
  ].join("\n");
}

function adaptExternalGraphPayload(payload, documents = [], engine = "ai") {
  const graphSource = payload?.graph || payload;
  const rawNodes = graphSource?.nodes || graphSource?.vertices || [];
  const rawEdges = graphSource?.edges || graphSource?.links || [];
  const sourceDocuments = documents.map((documentMeta) => documentMeta.title).filter(Boolean);
  const nodes = rawNodes.map((node, index) => {
    const label = String(node.label || node.name || node.title || node.id || `知识点 ${index + 1}`).trim();
    return {
      id: label,
      label,
      summary: node.summary || node.description || node.text || `围绕 ${label} 的课程知识点。`,
      chapter: node.chapter || node.community || node.group || "课程资料",
      difficulty: ["基础", "中等", "较难"].includes(node.difficulty) ? node.difficulty : index < 4 ? "基础" : index < 10 ? "中等" : "较难",
      source: node.source || node.file || sourceDocuments[0] || "上传资料",
      examples: Array.isArray(node.examples) ? node.examples : node.example ? [node.example] : [`${label} 可结合资料原文、例题和相关概念复习。`],
      keywords: Array.isArray(node.keywords) ? node.keywords : [label],
      sourceSnippets: Array.isArray(node.sourceSnippets)
        ? node.sourceSnippets.map(String).filter(Boolean).slice(0, 4)
        : node.sourceSnippet
          ? [String(node.sourceSnippet)]
          : [],
      mastery: Number(node.mastery) || 50 + (index % 5) * 6,
      x: Number(node.x) || 130 + (index % 5) * 180,
      y: Number(node.y) || 110 + Math.floor(index / 5) * 150,
    };
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = rawEdges
    .map((edge, index) => {
      const source = edge.source || edge.from || edge.sourceId || edge.start;
      const target = edge.target || edge.to || edge.targetId || edge.end;
      return {
        id: edge.id || `edge-${index + 1}`,
        source,
        target,
        relation: edge.relation || edge.label || edge.type || "相关",
        relationType: edge.relationType || edge.type || "",
        explanation: edge.explanation || edge.reason || "",
        weight: Number(edge.weight) || 0.6,
      };
    })
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  return sanitizeStudyGraph({
    nodes,
    edges,
    meta: {
      generatedBy: engine,
      generatedAt: Date.now(),
      sourceDocuments,
      fallbackUsed: false,
    },
  });
}

function ensureGraphQuality(graph, documents = [], engine = "local-fallback") {
  const normalized = sanitizeStudyGraph(graph);
  normalized.nodes = normalized.nodes.filter((node) =>
    isLikelyCourseConceptLabel(node.label || node.id, [node.summary, node.keywords?.join(" ")].filter(Boolean).join("\n"))
    && isGraphNodeSupportedByDocuments(node, documents));
  const nodeIds = new Set(normalized.nodes.map((node) => node.id));
  normalized.edges = normalized.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  const needsFallback = normalized.nodes.length < GRAPH_QUALITY_MIN_NODES || normalized.edges.length < GRAPH_QUALITY_MIN_EDGES;
  if (!needsFallback) {
    normalized.meta.qualityScore = estimateGraphQuality(normalized);
    normalized.meta.fallbackUsed = false;
    return normalized;
  }

  const rebuilt = documents.length ? createRuleBasedGraphFromDocuments(documents, { skipQualityCheck: true }) : createEmptyStudyGraph({ documents });
  const replacement = rebuilt.nodes.length >= normalized.nodes.length ? rebuilt : normalized;
  replacement.meta = {
    ...(replacement.meta || {}),
    generatedBy: rebuilt === replacement ? `${engine}+local-rebuild` : engine,
    generatedAt: Date.now(),
    qualityScore: estimateGraphQuality(replacement),
    fallbackUsed: true,
    qualityIssue: `节点或关系不足：${normalized.nodes.length} 个节点，${normalized.edges.length} 条关系。`,
    sourceDocuments: documents.map((documentMeta) => documentMeta.title),
  };
  return sanitizeStudyGraph(replacement);
}

function createRuleBasedGraphFromDocuments(documents = [], options = {}) {
  if (!documents.length) return createFallbackStudyGraph([]);
  const cleanedDocuments = cleanDocumentsForStudyGeneration(documents);
  const candidateMap = new Map();
  const addCandidate = (label, context = "", source = "", weight = 1) => {
    const normalized = normalizeStudyTextLine(label).replace(/^[#\d.、\s]+/, "").replace(/[：:。；;，,]+$/g, "");
    if (!isLikelyCourseConceptLabel(normalized, context)) return;
    const key = normalized;
    const current = candidateMap.get(key) || { label: normalized, contexts: [], source, score: 0 };
    current.contexts.push(context);
    current.source = current.source || source;
    current.score += weight + (GRAPH_CONCEPT_SIGNAL_PATTERN.test(context) ? 2 : 0);
    candidateMap.set(key, current);
  };

  cleanedDocuments.forEach((documentMeta) => {
    const lines = documentMeta.text.split("\n").map(normalizeStudyTextLine).filter((line) => !isBoilerplateStudyLine(line));
    lines.forEach((line, index) => {
      const context = lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).join(" ");
      const heading = line.match(/^(?:#{1,4}\s*|第[一二三四五六七八九十\d]+[章节]\s*|[一二三四五六七八九十\d]+[.、]\s*)([A-Za-z0-9\u4e00-\u9fa5][^\n]{1,24})$/);
      if (heading) addCandidate(heading[1], context, documentMeta.title, 4);
      const definition = line.match(/^([\u4e00-\u9fa5A-Za-z0-9 SQLER\-]{2,24})(?:是|指|表示|定义为|用于|包括|分为|由|称为)/);
      if (definition) addCandidate(definition[1], context, documentMeta.title, 5);
    });
  });

  getDomainConceptSeeds(cleanedDocuments).forEach((seed) => {
    const sourceText = cleanedDocuments.map((documentMeta) => documentMeta.text).join("\n");
    const snippet = getSourceSnippetForLabel(seed.id, sourceText);
    addCandidate(seed.id, snippet || seed.summary, cleanedDocuments[0]?.title || "课程资料", snippet ? 6 : 3);
    const current = candidateMap.get(seed.id);
    if (current) {
      current.seed = seed;
      current.contexts.unshift(snippet || seed.summary);
    }
  });

  let candidates = Array.from(candidateMap.values())
    .filter((candidate) => candidate.score >= 3)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "zh-CN"))
    .slice(0, GRAPH_NODE_LIMIT);

  if (candidates.length < GRAPH_QUALITY_MIN_NODES) {
    cleanedDocuments.forEach((documentMeta) => {
      documentMeta.text.split("\n").forEach((line) => {
        const label = normalizeStudyTextLine(line).replace(/^[#\d.、\s]+/, "").replace(/[：:。；;，,]+$/g, "");
        if (candidateMap.has(label) || !isLikelyCourseConceptLabel(label, line)) return;
        if (GRAPH_SENTENCE_LABEL_PATTERN.test(label) || GRAPH_LABEL_HARD_NOISE_PATTERN.test(label)) return;
        if (label.length > 18) return;
        addCandidate(label, line, documentMeta.title, 3);
      });
    });
    candidates = Array.from(candidateMap.values())
      .filter((candidate) => candidate.score >= 3)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "zh-CN"))
      .slice(0, GRAPH_NODE_LIMIT);
  }

  if (!candidates.length) {
    return createEmptyStudyGraph({ documents: cleanedDocuments });
  }

  const nodes = candidates.map((candidate, index) => {
    const seed = candidate.seed || {};
    const snippet = candidate.contexts.find(Boolean) || seed.summary || "";
    const summary = seed.summary || `${candidate.label} 是资料中需要掌握的课程概念，建议结合原文定义、作用和相关例题复习。`;
    return {
      id: candidate.label,
      label: candidate.label,
      summary,
      chapter: candidate.source || cleanedDocuments[Math.min(cleanedDocuments.length - 1, Math.floor(index / 5))]?.title || "上传资料",
      difficulty: index < 5 ? "基础" : index < 12 ? "中等" : "较难",
      source: candidate.source || cleanedDocuments[0]?.title || "上传资料",
      examples: [`在资料中定位“${candidate.label}”相关段落，理解定义、作用和应用场景。`],
      keywords: Array.from(new Set([candidate.label, ...(seed.keywords || [])])).slice(0, 6),
      sourceSnippets: snippet ? [snippet.slice(0, 180)] : [],
      mastery: 48 + (index % 5) * 6,
      x: 130 + (index % 5) * 180,
      y: 110 + Math.floor(index / 5) * 150,
    };
  });

  const root = nodes[0];
  const edges = [];
  nodes.slice(1).forEach((node, index) => {
    const source = index < 4 && root ? root.id : nodes[Math.max(0, Math.floor((index + 1) / 2))]?.id || root?.id;
    if (!source || source === node.id) return;
    edges.push({
      id: `edge-${index + 1}`,
      source,
      target: node.id,
      relation: index < 4 ? "包含" : "相关",
      weight: 0.62,
    });
  });

  const graph = sanitizeStudyGraph({
    nodes,
    edges,
    meta: {
      generatedBy: "local-rules",
      generatedAt: Date.now(),
      sourceDocuments: cleanedDocuments.map((documentMeta) => documentMeta.title),
      fallbackUsed: true,
    },
  });
  return options.skipQualityCheck ? graph : ensureGraphQuality(graph, cleanedDocuments, "local-rules");
}

function extractMindmapLabelsFromText(text = "", limit = 18) {
  const normalized = String(text || "").replace(/\r/g, "");
  const headingLabels = Array.from(normalized.matchAll(/^(?:#{1,4}\s*|第[一二三四五六七八九十\d]+[章节]\s*|[一二三四五六七八九十\d]+[.、]\s*)([A-Za-z0-9\u4e00-\u9fa5][^\n]{1,26})$/gm))
    .map((match) => match[1].replace(/[：:，,。；;、\-\s]+$/g, "").trim())
    .filter((label) => label.length >= 2 && label.length <= 24 && isLikelyCourseConceptLabel(label, label));
  const keywordLabels = Array.from(new Set((normalized.match(/[\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9 ]{1,12}/g) || [])
    .map((label) => label.trim())
    .filter((label) => label.length >= 2 && label.length <= 14 && isLikelyCourseConceptLabel(label, label) && !/^(the|and|for|with|this|that)$/i.test(label))));
  return Array.from(new Set([...headingLabels, ...keywordLabels])).slice(0, limit);
}

function createRuleBasedMindmapFromDocuments(documents = [], course = getActiveCourse()) {
  if (!documents.length) return createEmptyMindmap(course);
  const sourceDocuments = documents.map((documentMeta) => documentMeta.title || documentMeta.name).filter(Boolean);
  const branches = [];

  documents.slice(0, 6).forEach((documentMeta, documentIndex) => {
    const labels = extractMindmapLabelsFromText(documentMeta.text, 16);
    const branchLabel = labels[0] || `资料主题 ${documentIndex + 1}`;
    const childLabels = labels.slice(1, 7);
    branches.push({
      id: `mindmap-doc-${documentIndex + 1}`,
      label: branchLabel,
      summary: `来自 ${documentMeta.title || "课程资料"} 的独立导图分支。`,
      source: documentMeta.title || "课程资料",
      children: childLabels.map((label, childIndex) => ({
        id: `mindmap-doc-${documentIndex + 1}-${childIndex + 1}`,
        label,
        summary: `围绕“${label}”整理定义、例子和复习提示。`,
        source: documentMeta.title || "课程资料",
      })),
    });
  });

  const allLabels = extractMindmapLabelsFromText(documents.map((documentMeta) => documentMeta.text).join("\n\n"), 32);
  while (branches.length < 5 && allLabels.length) {
    const branchIndex = branches.length;
    const label = allLabels.shift();
    branches.push({
      id: `mindmap-auto-${branchIndex + 1}`,
      label,
      summary: "从资料关键词中整理出的复习主题。",
      source: sourceDocuments[0] || "课程资料",
      children: allLabels.splice(0, 3).map((childLabel, childIndex) => ({
        id: `mindmap-auto-${branchIndex + 1}-${childIndex + 1}`,
        label: childLabel,
        summary: `补充理解“${childLabel}”的定义、场景和易错点。`,
        source: sourceDocuments[0] || "课程资料",
      })),
    });
  }

  const fallbackBranches = [
    ["核心概念", ["定义", "关键特征", "适用场景"]],
    ["方法流程", ["步骤", "工具", "产出"]],
    ["复习重点", ["易错点", "例题", "原文证据"]],
  ];
  fallbackBranches.forEach(([label, children]) => {
    if (branches.length >= 5) return;
    const branchIndex = branches.length;
    branches.push({
      id: `mindmap-fallback-${branchIndex + 1}`,
      label,
      summary: "用于补齐导图层级的复习分支。",
      source: sourceDocuments[0] || "课程资料",
      children: children.map((childLabel, childIndex) => ({
        id: `mindmap-fallback-${branchIndex + 1}-${childIndex + 1}`,
        label: childLabel,
        summary: `整理“${childLabel}”相关内容。`,
        source: sourceDocuments[0] || "课程资料",
      })),
    });
  });

  return sanitizeMindmap({
    id: "mindmap-root",
    title: course.name || "课程思维导图",
    summary: "根据导入资料独立生成的层级脑图。",
    nodes: branches,
    meta: {
      generatedBy: "local-mindmap-rules",
      generatedAt: Date.now(),
      empty: false,
      sourceDocuments,
    },
  }, course);
}

function extractDocumentOutlineForAi(documents = [], maxItems = 80) {
  const items = [];
  documents.forEach((documentMeta, documentIndex) => {
    const lines = String(documentMeta.text || "")
      .split("\n")
      .map(normalizeStudyTextLine)
      .filter((line) => line && !isBoilerplateStudyLine(line));
    lines.forEach((line, lineIndex) => {
      if (items.length >= maxItems) return;
      const heading = line.match(/^(?:#{1,5}\s*|第[一二三四五六七八九十\d]+[章节篇]\s*|[一二三四五六七八九十\d]+(?:\.\d+)*[.、\s]+)([A-Za-z0-9\u4e00-\u9fa5][^\n]{1,42})$/);
      const definition = line.match(/^([\u4e00-\u9fa5A-Za-z0-9 SQLER+\-#]{2,24})(?:是|指|表示|定义为|用于|包括|分为|由|称为)/);
      const label = normalizeStudyTextLine((heading?.[1] || definition?.[1] || "").replace(/[：:。；;，,]+$/g, ""));
      if (!label || !isLikelyCourseConceptLabel(label, line)) return;
      items.push({
        title: label,
        source: documentMeta.title || `资料 ${documentIndex + 1}`,
        snippet: lines.slice(Math.max(0, lineIndex - 1), Math.min(lines.length, lineIndex + 2)).join(" ").slice(0, 220),
      });
    });
  });
  return items;
}

function buildMindmapGenerationPrompt(documents = [], course = getActiveCourse()) {
  const outline = extractDocumentOutlineForAi(documents);
  const documentBrief = documents.map((documentMeta, index) => ({
    id: `D${index + 1}`,
    title: documentMeta.title,
    excerpt: sampleTextWithinLimit(documentMeta.text || "", Math.floor(GRAPH_TEXT_LIMIT / Math.max(1, documents.length))).slice(0, 12000),
  }));
  return [
    "请基于课程资料生成独立思维导图 JSON。不要依赖知识图谱，不要返回 Markdown，不要解释。",
    "只保留正文中的课程知识主题、章节主题、核心概念、方法、模型、流程、约束和应用场景。",
    "禁止使用 PDF 文件名、书名、作者、出版社、版次、网址、本书/本章说明、目录页、版权信息、参考文献、残缺句作为节点。",
    "JSON 格式：",
    '{"mindmap":{"id":"mindmap-root","title":"课程主题","summary":"一句导图说明","nodes":[{"id":"稳定id","label":"一级主题","summary":"复习提示","source":"资料出处","children":[{"id":"稳定id","label":"二级主题","summary":"复习提示","source":"资料出处","children":[{"id":"稳定id","label":"三级主题","summary":"复习提示","source":"资料出处"}]}]}]}}',
    "质量要求：5-8 个一级主题；每个一级主题 3-6 个子主题；节点标签必须是短概念或短主题，不要超过 12 个汉字；不要出现“本书”“网址”“第7版”“方面由”“目前研究领域”等教材元信息。",
    `课程：${course.name || "当前课程"}`,
    `资料大纲候选：${JSON.stringify(outline)}`,
    `资料正文摘录：${JSON.stringify(documentBrief)}`,
  ].join("\n");
}

async function generateMindmapFromDocumentsWithAi(documents = [], course = getActiveCourse()) {
  if (!window.mindStudy?.ai?.askQuestion || !documents.length) return null;
  await ensureAiConfigured();
  const response = await withTimeout(window.mindStudy.ai.askQuestion({
    question: buildMindmapGenerationPrompt(documents, course),
    documents,
    options: {
      maxChunks: 12,
      maxContextChars: GRAPH_TEXT_LIMIT,
      maxTokens: 1800,
      temperature: 0.12,
      persona: false,
      multimodal: true,
    },
  }), GRAPH_SECONDARY_AI_TIMEOUT_MS, "Qwen 思维导图生成");
  const parsed = extractJsonFromAiText(response.answer);
  const mindmapPayload = parsed?.mindmap || parsed;
  if (!mindmapPayload?.nodes?.length) return null;
  return sanitizeMindmap({
    ...mindmapPayload,
    meta: {
      ...(mindmapPayload.meta || {}),
      generatedBy: "qwen-mindmap",
      generatedAt: Date.now(),
      sourceDocuments: documents.map((documentMeta) => documentMeta.title),
    },
  }, course);
}

function createMindmapFromGraph(graph = getStudyModule().graph, documents = [], course = getActiveCourse()) {
  const nodes = (graph.nodes || []).filter((node) => isLikelyCourseConceptLabel(node.label || node.id, node.summary || ""));
  if (!nodes.length) return createRuleBasedMindmapFromDocuments(documents, course);
  const sourceDocuments = documents.map((documentMeta) => documentMeta.title || documentMeta.name).filter(Boolean);
  const chapterMap = new Map();
  nodes.forEach((node) => {
    const chapter = String(node.chapter || node.source || "课程资料").trim() || "课程资料";
    if (!chapterMap.has(chapter)) chapterMap.set(chapter, []);
    chapterMap.get(chapter).push(node);
  });

  const branches = Array.from(chapterMap.entries())
    .slice(0, GRAPH_MINDMAP_BRANCH_LIMIT)
    .map(([chapter, chapterNodes], branchIndex) => {
      const sortedNodes = [...chapterNodes].sort((a, b) => {
        const aDegree = (graph.edges || []).filter((edge) => edge.source === a.id || edge.target === a.id).length;
        const bDegree = (graph.edges || []).filter((edge) => edge.source === b.id || edge.target === b.id).length;
        return bDegree - aDegree || String(a.label).localeCompare(String(b.label), "zh-CN");
      });
      return {
        id: `mindmap-chapter-${branchIndex + 1}-${normalizeComparableText(chapter).slice(0, 16) || "course"}`,
        label: chapter,
        summary: `围绕 ${chapter} 整理的课程概念分支。`,
        source: chapter,
        children: sortedNodes.slice(0, GRAPH_MINDMAP_CHILD_LIMIT).map((node) => {
          const relationHints = (graph.edges || [])
            .filter((edge) => edge.source === node.id || edge.target === node.id)
            .slice(0, 3)
            .map((edge) => {
              const otherId = edge.source === node.id ? edge.target : edge.source;
              const otherNode = nodes.find((item) => item.id === otherId);
              return otherNode ? `${edge.relation || "相关"}：${otherNode.label}` : "";
            })
            .filter(Boolean);
          return {
            id: `mindmap-topic-${normalizeComparableText(node.id).slice(0, 28)}`,
            topicId: node.id,
            label: node.label || node.id,
            summary: [node.summary, relationHints.join("；")].filter(Boolean).join(" "),
            source: node.source || chapter,
          };
        }),
      };
    });

  return sanitizeMindmap({
    id: "mindmap-root",
    title: course.name || "课程思维导图",
    summary: "根据知识图谱按章节与概念关系生成的层级复习导图。",
    nodes: branches,
    meta: {
      generatedBy: "graph-linked-mindmap",
      generatedAt: Date.now(),
      empty: false,
      sourceDocuments: sourceDocuments.length ? sourceDocuments : graph.meta?.sourceDocuments || [],
    },
  }, course);
}

function resolveMindmapTopicId(mindmapNode, graph = getStudyModule().graph) {
  if (!mindmapNode) return "";
  if (mindmapNode.topicId && graph.nodes.some((node) => node.id === mindmapNode.topicId)) return mindmapNode.topicId;
  const comparableLabel = normalizeComparableText(mindmapNode.label);
  const matched = (graph.nodes || []).find((node) => {
    const id = normalizeComparableText(node.id);
    const label = normalizeComparableText(node.label);
    return id === comparableLabel || label === comparableLabel;
  });
  return matched?.id || "";
}

async function generateStudyModuleFromUploads() {
  const course = getActiveCourse();
  const studyModule = getStudyModule(course);
  if (["extracting", "ai", "validating"].includes(studyModule.generation?.state)) return;
  const runId = ++graphGenerationRunId;
  const courseId = course.id;
  let documents = [];
  let graph = null;
  let mindmap = null;
  let questions = [];
  let engine = "local-rules";

  try {
    resetCourseSeedGraphIfNeeded(course);
    studyModule.generation = { state: "extracting", engine: "", message: "", updatedAt: Date.now() };
    saveWorkspace();
    renderStudyModuleViews();

    documents = await withTimeout(buildStudyAiDocumentsForCourse({
      requireCompletePdfOcr: true,
      textLimit: GRAPH_TEXT_LIMIT,
      onStatus: (message) => {
        if (!isCurrentGraphGeneration(runId, courseId)) return;
        studyModule.generation = { state: "extracting", engine: "", message, updatedAt: Date.now() };
        saveWorkspace();
        renderStudyModuleViews();
      },
    }), 60000, "资料文本提取");
    if (!isCurrentGraphGeneration(runId, courseId)) return;
    if (!documents.length) throw new Error("没有可用于生成的资料文本。");
    documents = documents.map((documentMeta) => ({
      ...documentMeta,
      text: sampleTextWithinLimit(documentMeta.text || "", GRAPH_TEXT_LIMIT),
    }));
    documents = cleanDocumentsForStudyGeneration(documents);
    if (window.mindStudy?.ai?.askQuestion) {
      studyModule.generation = { state: "ai", engine: "Qwen Mindmap", message: "正在根据资料大纲独立生成思维导图。", updatedAt: Date.now() };
      saveWorkspace();
      renderStudyModuleViews();
      try {
        mindmap = await generateMindmapFromDocumentsWithAi(documents, course);
      } catch (error) {
        studyModule.generation.message = `思维导图 AI 生成不可用，使用本地大纲规则：${getAiErrorMessage(error)}`;
      }
    }
    if (!mindmap) mindmap = createRuleBasedMindmapFromDocuments(documents, course);

    if (!graph && window.mindStudy?.graph?.generateFromDocuments) {
      studyModule.generation = { state: "ai", engine: "Qwen + Neo4j", message: "正在抽取知识点、写入 Neo4j 并生成可交互图谱。", updatedAt: Date.now() };
      saveWorkspace();
      renderStudyModuleViews();
      try {
        const response = await withTimeout(window.mindStudy.graph.generateFromDocuments({
          course: getGraphCoursePayload(course),
          documents,
          options: {
            maxTokens: 2200,
            temperature: 0.12,
          },
        }), GRAPH_GENERATION_TIMEOUT_MS, "Qwen + Neo4j 知识图谱生成");
        if (!isCurrentGraphGeneration(runId, courseId)) return;
        if (response?.graph?.nodes?.length) {
          graph = sanitizeStudyGraph(response.graph);
          questions = (response.quiz?.questions || []).map((question) => normalizeStudyQuestion(question, graph.nodes)).filter(Boolean);
          studyModule.recommendations = Array.isArray(response.recommendations) ? response.recommendations : [];
          engine = "qwen+neo4j";
        }
      } catch (error) {
        studyModule.generation.message = `Qwen + Neo4j 不可用，继续尝试原有生成链路：${getAiErrorMessage(error)}`;
      }
    }

    if (!graph && window.mindStudy?.ai?.askQuestion) {
      studyModule.generation = { state: "ai", engine: "Qwen", message: "", updatedAt: Date.now() };
      saveWorkspace();
      renderStudyModuleViews();
      try {
        await ensureAiConfigured();
        const response = await withTimeout(window.mindStudy.ai.askQuestion({
          question: buildStudyGenerationPrompt(documents),
          documents,
          options: {
            maxChunks: 10,
            maxContextChars: GRAPH_TEXT_LIMIT,
            maxTokens: 2000,
            temperature: 0.15,
            persona: false,
            multimodal: true,
          },
        }), GRAPH_SECONDARY_AI_TIMEOUT_MS, "Qwen 备用图谱生成");
        if (!isCurrentGraphGeneration(runId, courseId)) return;
        const parsed = extractJsonFromAiText(response.answer);
        if (parsed) {
          graph = adaptExternalGraphPayload(parsed, documents, "qwen");
          questions = (parsed.quiz?.questions || []).map((question) => normalizeStudyQuestion(question, graph.nodes)).filter(Boolean);
          studyModule.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
          engine = "qwen";
        }
      } catch (error) {
        studyModule.generation.message = `AI 生成不可用，使用本地规则：${getAiErrorMessage(error)}`;
      }
    }

    studyModule.generation = { state: "validating", engine, message: "", updatedAt: Date.now() };
    saveWorkspace();
    renderStudyModuleViews();
    if (!isCurrentGraphGeneration(runId, courseId)) return;

    if (!graph) {
      graph = createRuleBasedGraphFromDocuments(documents);
      engine = "local-rules";
    }

    graph = ensureGraphQuality(graph, documents, engine);
    if (engine === "local-rules" && window.mindStudy?.graph?.saveCourseGraph) {
      try {
        const saved = await withTimeout(window.mindStudy.graph.saveCourseGraph({
          course: getGraphCoursePayload(course),
          documents,
          graph,
        }), 30000, "本地图谱写入 Neo4j");
        if (!isCurrentGraphGeneration(runId, courseId)) return;
        if (saved?.graph?.nodes?.length) {
          graph = ensureGraphQuality(sanitizeStudyGraph(saved.graph), documents, "local-rules+neo4j");
          engine = "local-rules+neo4j";
        }
      } catch (error) {
        studyModule.generation.message = `本地图谱已生成，但写入 Neo4j 失败：${getAiErrorMessage(error)}`;
      }
    }
    if (window.mindStudy?.ai?.askQuestion) {
      try {
        const previousGraph = studyModule.graph;
        studyModule.graph = graph;
        await regenerateQuizQuestionsFromCurrentGraph("local-quiz-rules", { mode: "adaptive", scope: "all", difficulty: "all" });
        questions = studyModule.quiz.questions;
        studyModule.graph = previousGraph;
      } catch {
        questions = [];
      }
    }
    if (!questions.length) {
      questions = createRuleBasedQuizQuestions(graph, documents).map((question) => ({ ...question, source: question.source || "local-quiz-rules" }));
    }
    studyModule.graph = graph;
    studyModule.mindmap = mindmap || createRuleBasedMindmapFromDocuments(documents, course);
    studyModule.quiz = sanitizeStudyQuiz({
      scope: graph.nodes[0]?.id || "all",
      difficulty: "all",
      questions,
      cursor: 0,
      generatedAt: Date.now(),
      source: engine,
    }, graph);
    studyModule.selectedNodeId = graph.nodes[0]?.id || studyModule.selectedNodeId;
    studyModule.selectedMindmapNodeId = studyModule.mindmap.nodes[0]?.id || studyModule.mindmap.id || "";
    studyModule.mindmapFocusId = "";
    studyModule.mindmapCollapsed = [];
    studyModule.activeQuizTopic = studyModule.quiz.scope;
    studyModule.graphViewport = { ...GRAPH_DEFAULT_VIEWPORT };
    studyModule.generation = {
      state: graph.meta.fallbackUsed ? "fallback" : "done",
      engine,
      message: `${graph.nodes.length} 个知识点，${graph.edges.length} 条关系，独立导图 ${studyModule.mindmap.nodes.length} 个主分支，${studyModule.quiz.questions.length} 道题。`,
      updatedAt: Date.now(),
    };
    updateStudyRecommendations();
    saveWorkspace();
    renderStudyModuleViews();
    showView("map");
  } catch (error) {
    if (!isCurrentGraphGeneration(runId, courseId)) return;
    studyModule.generation = {
      state: "error",
      engine,
      message: error.message || "生成失败，已保留原有学习数据。",
      updatedAt: Date.now(),
    };
    saveWorkspace();
    renderStudyModuleViews();
  }
}

async function cancelStudyGeneration() {
  graphGenerationRunId += 1;
  const studyModule = getStudyModule();
  studyModule.generation = {
    state: "idle",
    engine: studyModule.generation?.engine || "",
    message: "已取消本次生成，可以稍后重试。",
    updatedAt: Date.now(),
  };
  saveWorkspace();
  renderStudyModuleViews();
}

function zoomGraph(delta) {
  const studyModule = getStudyModule();
  const viewport = sanitizeGraphViewport(studyModule.graphViewport);
  viewport.scale = Math.min(1.7, Math.max(0.65, viewport.scale + delta));
  studyModule.graphViewport = viewport;
  saveWorkspace();
  renderKnowledgeModule();
}

function resetGraphView() {
  getStudyModule().graphViewport = { ...GRAPH_DEFAULT_VIEWPORT };
  saveWorkspace();
  renderKnowledgeModule();
}

function beginGraphPan(event) {
  const stage = event.target.closest?.("#knowledge-map-stage");
  const node = event.target.closest?.(".graph-node, button, select");
  if (!stage || node || graphNodeDragState.active) return;

  const viewport = sanitizeGraphViewport(getStudyModule().graphViewport);
  graphPanState.active = true;
  graphPanState.pointerId = event.pointerId ?? "mouse";
  graphPanState.startX = event.clientX;
  graphPanState.startY = event.clientY;
  graphPanState.startViewportX = viewport.x;
  graphPanState.startViewportY = viewport.y;
  stage.classList.add("panning");
  stage.setPointerCapture?.(event.pointerId);
}

function updateGraphPan(event) {
  const pointerId = event.pointerId ?? "mouse";
  if (!graphPanState.active || pointerId !== graphPanState.pointerId) return;

  const studyModule = getStudyModule();
  const viewport = sanitizeGraphViewport(studyModule.graphViewport);
  viewport.x = graphPanState.startViewportX + event.clientX - graphPanState.startX;
  viewport.y = graphPanState.startViewportY + event.clientY - graphPanState.startY;
  studyModule.graphViewport = viewport;
  renderKnowledgeModule();
}

function finishGraphPan(event) {
  const pointerId = event.pointerId ?? "mouse";
  if (!graphPanState.active || pointerId !== graphPanState.pointerId) return;

  graphPanState.active = false;
  graphPanState.pointerId = null;
  event.target.closest?.("#knowledge-map-stage")?.classList.remove("panning");
  saveWorkspace();
}

function handleGraphWheel(event) {
  if (!event.target.closest?.("#knowledge-map-stage")) return;
  if (event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  zoomGraph(event.deltaY > 0 ? -0.08 : 0.08);
}

function beginGraphNodeDrag(event) {
  const button = event.target.closest?.(".graph-node");
  if (!button) return;
  const topic = getKnowledgeTopic(button.dataset.node);
  if (!topic) return;
  graphNodeDragState.active = true;
  graphNodeDragState.pointerId = event.pointerId ?? "mouse";
  graphNodeDragState.nodeId = topic.id;
  graphNodeDragState.moved = false;
  graphNodeDragState.startX = event.clientX;
  graphNodeDragState.startY = event.clientY;
  graphNodeDragState.startNodeX = topic.x;
  graphNodeDragState.startNodeY = topic.y;
  button.setPointerCapture?.(event.pointerId);
}

function updateGraphNodeDrag(event) {
  const pointerId = event.pointerId ?? "mouse";
  if (!graphNodeDragState.active || pointerId !== graphNodeDragState.pointerId) return;
  const studyModule = getStudyModule();
  const node = studyModule.graph.nodes.find((item) => item.id === graphNodeDragState.nodeId);
  if (!node) return;
  const viewport = sanitizeGraphViewport(studyModule.graphViewport);
  const dx = (event.clientX - graphNodeDragState.startX) / viewport.scale;
  const dy = (event.clientY - graphNodeDragState.startY) / viewport.scale;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) graphNodeDragState.moved = true;
  node.x = Math.min(960, Math.max(40, Math.round(graphNodeDragState.startNodeX + dx)));
  node.y = Math.min(640, Math.max(40, Math.round(graphNodeDragState.startNodeY + dy)));
  renderKnowledgeModule();
}

function finishGraphNodeDrag(event) {
  const pointerId = event.pointerId ?? "mouse";
  if (!graphNodeDragState.active || pointerId !== graphNodeDragState.pointerId) return;
  graphNodeDragState.active = false;
  graphNodeDragState.pointerId = null;
  graphNodeDragState.nodeId = "";
  saveWorkspace();
}

function getPlannerStatusMeta(status) {
  return {
    done: { label: "已完成", next: "doing" },
    doing: { label: "进行中", next: "todo" },
    todo: { label: "待开始", next: "done" },
  }[status] || { label: "待开始", next: "done" };
}

function getPlannerTypeClass(type) {
  const typeMap = {
    技术栈: "tech",
    项目: "project",
    计算机基础: "base",
    算法: "algo",
    八股: "interview",
  };
  return typeMap[type] || "default";
}

function getFilteredPlannerItems() {
  const filter = plannerState.filter || "all";
  return plannerState.items
    .filter((item) => filter === "all" || item.status === filter)
    .sort((a, b) => a.createdAt - b.createdAt);
}

function renderPlannerStars(item) {
  return Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    const active = value <= item.importance;
    return `
      <button class="planner-star ${active ? "active" : ""}" data-planner-star="${value}" data-planner-id="${item.id}" title="${value} 星">
        <i data-lucide="star"></i>
      </button>
    `;
  }).join("");
}

function renderPlannerStats() {
  const stats = document.querySelector("#planner-stats");
  if (!stats) return;

  const total = plannerState.items.length;
  const done = plannerState.items.filter((item) => item.status === "done").length;
  const doing = plannerState.items.filter((item) => item.status === "doing").length;
  const average = total
    ? Math.round(plannerState.items.reduce((sum, item) => sum + Number(item.progress || 0), 0) / total)
    : 0;

  stats.innerHTML = `
    <div><span>总任务</span><strong>${total}</strong></div>
    <div><span>进行中</span><strong>${doing}</strong></div>
    <div><span>已完成</span><strong>${done}</strong></div>
    <div><span>平均进度</span><strong>${average}%</strong></div>
  `;
}

function renderPlannerTable() {
  const body = document.querySelector("#planner-table-body");
  if (!body) return;

  const rows = getFilteredPlannerItems();
  body.innerHTML = rows.length
    ? rows
        .map((item, index) => {
          const statusMeta = getPlannerStatusMeta(item.status);
          return `
            <tr data-planner-id="${item.id}">
              <td class="planner-row-index">${escapeHtml(item.phase || index + 1)}</td>
              <td><span class="planner-type ${getPlannerTypeClass(item.type)}">${escapeHtml(item.type)}</span></td>
              <td class="planner-title-cell">${escapeHtml(item.title)}</td>
              <td>
                <button class="planner-status ${item.status}" data-planner-status="${item.id}">
                  ${statusMeta.label}
                </button>
              </td>
              <td class="planner-timeline">${escapeHtml(item.timeline || "未排期")}</td>
              <td class="planner-progress-cell">
                <input class="planner-progress" data-planner-progress="${item.id}" type="range" min="0" max="100" value="${item.progress}" />
                <span>${item.progress}%</span>
              </td>
              <td class="planner-stars">${renderPlannerStars(item)}</td>
              <td class="planner-note">${escapeHtml(item.note || "")}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="8" class="planner-empty">当前筛选下没有任务。</td></tr>`;
}

function renderPlannerTodos() {
  const list = document.querySelector("#planner-todo-list");
  const openCount = document.querySelector("#planner-open-count");
  if (!list) return;

  const todos = plannerState.items
    .filter((item) => item.status !== "done")
    .sort((a, b) => Number(b.importance) - Number(a.importance) || Number(b.progress) - Number(a.progress))
    .slice(0, 8);

  if (openCount) openCount.textContent = `${todos.length} 项`;

  list.innerHTML = todos.length
    ? todos
        .map((item) => `
          <article class="planner-todo-card">
            <button class="planner-check" data-planner-toggle="${item.id}" title="标记完成">
              <i data-lucide="check"></i>
            </button>
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.type)} · ${escapeHtml(getPlannerStatusMeta(item.status).label)} · ${item.progress}%</span>
              ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
            </div>
          </article>
        `)
        .join("")
    : `<div class="planner-empty-card">今天没有待办，状态很好。</div>`;
}

function getPlannerMonthParts(monthKey = plannerState.calendarMonth) {
  const [year, month] = String(monthKey || getCurrentCalendarMonth()).split("-").map(Number);
  return {
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    month: Number.isFinite(month) ? month : new Date().getMonth() + 1,
  };
}

function toPlannerDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPlannerEventsForDate(dateKey) {
  return (plannerState.events || []).filter((event) => event.date === dateKey);
}

function getStudySecondsForDate(dateKey) {
  return Math.max(0, Math.floor(Number(studyTimerSnapshot.dailySeconds?.[dateKey]) || 0));
}

function getStudyHeatLevel(seconds) {
  if (seconds >= 3 * 3600) return 5;
  if (seconds >= 90 * 60) return 4;
  if (seconds >= 45 * 60) return 3;
  if (seconds >= 15 * 60) return 2;
  if (seconds > 0) return 1;
  return 0;
}

function formatStudyDurationText(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const restSeconds = totalSeconds % 60;

  if (!hours && !minutes && restSeconds) return "不足 1 分钟";
  if (!hours) return `${minutes} 分钟`;
  if (!minutes) return `${hours} 小时`;
  return `${hours} 小时 ${minutes} 分钟`;
}

function formatStudyDurationCompact(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours) return `${hours}h${minutes ? `${minutes}m` : ""}`;
  if (minutes) return `${minutes}m`;
  return totalSeconds ? "<1m" : "0m";
}

function getPlannerEventImportanceLabel(importance) {
  return {
    high: "高",
    medium: "中",
    low: "普",
  }[importance] || "中";
}

function renderPlannerCalendar() {
  const grid = document.querySelector("#planner-calendar-grid");
  const title = document.querySelector("#planner-calendar-title");
  if (!grid) return;

  const { year, month } = getPlannerMonthParts();
  const monthIndex = month - 1;
  const firstDate = new Date(year, monthIndex, 1);
  const firstWeekday = (firstDate.getDay() + 6) % 7;
  const startDate = new Date(year, monthIndex, 1 - firstWeekday);
  const todayKey = toPlannerDateKey(new Date());

  if (title) title.textContent = `${year} 年 ${month} 月`;

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const dateKey = toPlannerDateKey(date);
    const events = getPlannerEventsForDate(dateKey);
    const inMonth = date.getMonth() === monthIndex;
    const studySeconds = getStudySecondsForDate(dateKey);
    const studyHeatLevel = getStudyHeatLevel(studySeconds);
    const studyTimeText = formatStudyDurationText(studySeconds);
    const studyTitle = `${dateKey} 今日学习：${studyTimeText}`;
    cells.push(`
      <button
        class="calendar-day ${inMonth ? "" : "muted"} ${dateKey === todayKey ? "today" : ""} study-heat-${studyHeatLevel}"
        data-calendar-date="${dateKey}"
        data-study-seconds="${studySeconds}"
        title="${escapeHtml(studyTitle)}"
      >
        <span class="calendar-day-number">${date.getDate()}</span>
        <span class="calendar-study-heat">
          <span class="calendar-study-dot"></span>
          <small>${formatStudyDurationCompact(studySeconds)}</small>
        </span>
        <span class="calendar-day-events">
          ${events
            .slice(0, 3)
            .map((event) => `<em class="${escapeHtml(event.importance)}">${escapeHtml(event.title)}</em>`)
            .join("")}
          ${events.length > 3 ? `<small>+${events.length - 3}</small>` : ""}
        </span>
        <span class="calendar-study-tooltip">今日学习 ${escapeHtml(studyTimeText)}</span>
      </button>
    `);
  }

  grid.innerHTML = cells.join("");
}

function renderPlannerEventList() {
  const list = document.querySelector("#planner-event-list");
  if (!list) return;

  const events = [...(plannerState.events || [])].sort((a, b) => a.date.localeCompare(b.date));
  list.innerHTML = events.length
    ? events
        .map((event) => `
          <article class="planner-event-card ${escapeHtml(event.importance)}">
            <div>
              <strong>${escapeHtml(event.title)}</strong>
              <span>${escapeHtml(event.date)} · ${escapeHtml(event.type)} · ${getPlannerEventImportanceLabel(event.importance)}优先级</span>
              ${event.note ? `<p>${escapeHtml(event.note)}</p>` : ""}
            </div>
            <button class="icon-button" data-planner-event-delete="${event.id}" title="删除事件">
              <i data-lucide="x"></i>
            </button>
          </article>
        `)
        .join("")
    : `<div class="planner-empty-card">还没有重要事件，可以记录考试、DDL 或答辩。</div>`;
}

function syncPlannerFilters() {
  document.querySelectorAll("[data-planner-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.plannerFilter === (plannerState.filter || "all"));
  });
}

function renderPlannerView() {
  renderPlannerStats();
  renderPlannerTable();
  renderPlannerTodos();
  renderPlannerCalendar();
  renderPlannerEventList();
  syncPlannerFilters();
  syncLonglongAssistant();
  window.lucide?.createIcons();
}

function findPlannerItem(itemId) {
  return plannerState.items.find((item) => item.id === itemId);
}

function cyclePlannerStatus(itemId) {
  const item = findPlannerItem(itemId);
  if (!item) return;

  const nextStatus = getPlannerStatusMeta(item.status).next;
  item.status = nextStatus;
  if (nextStatus === "done") item.progress = 100;
  if (nextStatus === "todo" && item.progress === 100) item.progress = 0;
  savePlannerState();
  renderPlannerView();
}

function setPlannerDone(itemId) {
  const item = findPlannerItem(itemId);
  if (!item) return;

  item.status = "done";
  item.progress = 100;
  savePlannerState();
  renderPlannerView();
}

function setPlannerProgress(itemId, progress, shouldRender = true) {
  const item = findPlannerItem(itemId);
  if (!item) return;

  item.progress = Math.min(100, Math.max(0, Number(progress) || 0));
  if (item.progress >= 100) item.status = "done";
  if (item.progress > 0 && item.progress < 100 && item.status === "todo") item.status = "doing";
  savePlannerState();

  if (shouldRender) {
    renderPlannerView();
  }
}

function setPlannerImportance(itemId, importance) {
  const item = findPlannerItem(itemId);
  if (!item) return;

  item.importance = Math.min(5, Math.max(0, Number(importance) || 0));
  savePlannerState();
  renderPlannerView();
}

function addPlannerItem(event) {
  event.preventDefault();
  const form = event.target;
  const titleInput = form.querySelector("#planner-title-input");
  const titleValue = titleInput?.value.trim();
  if (!titleValue) return;

  plannerState.items.unshift({
    id: createId("plan"),
    type: form.querySelector("#planner-type-select")?.value || "技术栈",
    title: titleValue,
    status: form.querySelector("#planner-status-select")?.value || "todo",
    timeline: form.querySelector("#planner-timeline-input")?.value.trim() || "",
    progress: form.querySelector("#planner-status-select")?.value === "done" ? 100 : 0,
    importance: 4,
    note: form.querySelector("#planner-note-input")?.value.trim() || "",
    order: plannerState.items.length + 1,
    createdAt: Date.now(),
  });

  savePlannerState();
  form.reset();
  plannerState.filter = "all";
  savePlannerState();
  renderPlannerView();
}

function changePlannerCalendarMonth(step) {
  const offset = Number(step) || 0;
  if (offset === 0) {
    plannerState.calendarMonth = getCurrentCalendarMonth();
  } else {
    const { year, month } = getPlannerMonthParts();
    const nextDate = new Date(year, month - 1 + offset, 1);
    plannerState.calendarMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
  }

  savePlannerState();
  renderPlannerView();
}

function selectPlannerCalendarDate(dateKey) {
  const dateInput = document.querySelector("#planner-event-date");
  if (dateInput) {
    dateInput.value = dateKey;
  }
  document.querySelector("#planner-event-title")?.focus();
}

function addPlannerEvent(event) {
  event.preventDefault();
  const form = event.target;
  const titleValue = form.querySelector("#planner-event-title")?.value.trim();
  const dateValue = form.querySelector("#planner-event-date")?.value;
  if (!titleValue || !dateValue) return;

  plannerState.events = plannerState.events || [];
  plannerState.events.push({
    id: createId("event"),
    title: titleValue,
    date: dateValue,
    type: form.querySelector("#planner-event-type")?.value || "考试",
    importance: form.querySelector("#planner-event-importance")?.value || "medium",
    note: form.querySelector("#planner-event-note")?.value.trim() || "",
    createdAt: Date.now(),
  });
  plannerState.calendarMonth = dateValue.slice(0, 7);

  savePlannerState();
  form.reset();
  renderPlannerView();
}

function deletePlannerEvent(eventId) {
  plannerState.events = (plannerState.events || []).filter((event) => event.id !== eventId);
  savePlannerState();
  renderPlannerView();
}

function renderDocumentLibrary() {
  const activeCourse = getActiveCourse();
  const activeDocId = activeCourse.activeDocumentId;

  readerPanels.library.innerHTML = `
    <div class="panel-heading library-heading">
      <div>
        <span class="tag muted">课程资料库</span>
        <h3>${escapeHtml(activeCourse.name)}</h3>
      </div>
      <button class="icon-button" data-library-import="true" title="上传资料">
        <i data-lucide="plus"></i>
      </button>
    </div>
    <p class="library-subtitle">${escapeHtml(activeCourse.description || "每门课程拥有独立资料库")}</p>
    <div class="document-list">
      ${
        activeCourse.documents.length
          ? activeCourse.documents
              .map(
                (documentMeta) => `
                  <article class="document-item ${documentMeta.id === activeDocId ? "active" : ""}">
                    <button class="document-open" data-document-id="${documentMeta.id}">
                      <span class="document-type">${escapeHtml(getTypeLabel(documentMeta.extension))}</span>
                      <strong>${escapeHtml(documentMeta.name)}</strong>
                      <small>${documentMeta.path ? "本机路径已保存" : "临时资料"} · ${escapeHtml(formatBytes(documentMeta.size))}</small>
                    </button>
                    <button class="document-delete" data-delete-document-id="${documentMeta.id}" title="从课程资料库移除">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </article>
                `,
              )
              .join("")
          : `<div class="library-empty">还没有资料。点击右上角或此处上传 PDF、MD。</div>`
      }
    </div>
  `;

  window.lucide?.createIcons();
}

function showReaderEmpty() {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="empty-document">
      <strong>选择或上传课程资料</strong>
      <span>每门课程都有独立资料库。已导入资料会保存本机路径，重启后可以继续打开。</span>
    </div>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">资料说明</span>
        <h3>支持格式</h3>
      </div>
    </div>
    <p class="summary-text">当前资料库仅支持 PDF 阅读批注和 Markdown 阅读编辑。</p>
    <button class="primary-action full" data-library-import="true">
      <i data-lucide="upload-cloud"></i>
      <span>上传课程资料</span>
    </button>
  `;
  window.lucide?.createIcons();
}

function showReaderError(message) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `<div class="empty-document">${escapeHtml(message)}</div>`;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">建议</span>
        <h3>检查文件</h3>
      </div>
    </div>
    <p class="summary-text">如果文件被移动或删除，请重新导入一次。MindStudy 保存的是本机路径，不会复制原文件。</p>
  `;
}

function markdownPathToFileUrl(filePath) {
  if (!filePath) return "";

  const normalized = String(filePath).replaceAll("\\", "/");
  const trailingSlash = normalized.endsWith("/") ? "/" : "";
  if (/^[a-z]:\//i.test(normalized)) {
    const drive = normalized.slice(0, 2);
    const rest = normalized
      .slice(2)
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");
    return `file:///${drive}/${rest}${trailingSlash}`;
  }

  if (normalized.startsWith("/")) {
    const rest = normalized
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");
    return `file:///${rest}${trailingSlash}`;
  }

  return "";
}

function getMarkdownBaseUrl(doc) {
  const filePath = doc?.meta?.path || "";
  if (!filePath) return "";

  const normalized = filePath.replaceAll("\\", "/");
  const directory = normalized.slice(0, normalized.lastIndexOf("/") + 1);
  return markdownPathToFileUrl(directory);
}

function resolveMarkdownUrl(rawUrl, doc) {
  const cleanUrl = String(rawUrl || "").trim().replace(/^['"]|['"]$/g, "");
  if (!cleanUrl) return "";
  if (/^(https?:|data:|blob:|file:|mailto:|#)/i.test(cleanUrl)) return cleanUrl;

  const baseUrl = getMarkdownBaseUrl(doc);
  if (!baseUrl) return cleanUrl;

  try {
    return new URL(cleanUrl.replaceAll("\\", "/"), baseUrl).href;
  } catch {
    return cleanUrl;
  }
}

function parseMarkdownLinkTarget(rawTarget) {
  const match = String(rawTarget || "").trim().match(/^<?([^>\s]+)>?(?:\s+["']([^"']+)["'])?$/);
  return {
    url: match?.[1] || String(rawTarget || "").trim(),
    title: match?.[2] || "",
  };
}

const MATH_SYMBOLS = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  vartheta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  phi: "φ",
  varphi: "φ",
  omega: "ω",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Omega: "Ω",
  times: "×",
  cdot: "·",
  div: "÷",
  pm: "±",
  mp: "∓",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  neq: "≠",
  ne: "≠",
  approx: "≈",
  equiv: "≡",
  infty: "∞",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  cup: "∪",
  cap: "∩",
  forall: "∀",
  exists: "∃",
  partial: "∂",
  nabla: "∇",
  sum: "∑",
  prod: "∏",
  int: "∫",
  lim: "lim",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  log: "log",
  ln: "ln",
  max: "max",
  min: "min",
};

const MATH_TEXT_COMMANDS = new Set(["text", "mathrm", "operatorname"]);
const MATH_STYLE_COMMANDS = new Set(["mathbf", "boldsymbol"]);

function isEscapedMarkdownDelimiter(source, index) {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function findMathDelimiter(source, delimiter, startIndex) {
  for (let index = startIndex; index < source.length; index += 1) {
    if (source.startsWith(delimiter, index) && !isEscapedMarkdownDelimiter(source, index)) {
      return index;
    }
  }
  return -1;
}

function looksLikeMathExpression(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^\d+(?:\.\d+)?$/.test(text)) return false;
  return /[A-Za-z]|\\(?:frac|sqrt|sum|prod|int|alpha|beta|gamma|delta|theta|lambda|pi|sigma|omega|leq|geq|neq|times|cdot)|[_^=<>+\-*/]/.test(text);
}

function skipMathSpaces(source, index) {
  let cursor = index;
  while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
  return cursor;
}

function readMathCommand(source, index) {
  if (source[index] !== "\\") return null;
  let cursor = index + 1;

  if (cursor >= source.length) {
    return { name: "", raw: "\\", endIndex: cursor };
  }

  if (/[A-Za-z]/.test(source[cursor])) {
    while (cursor < source.length && /[A-Za-z]/.test(source[cursor])) cursor += 1;
  } else {
    cursor += 1;
  }

  return {
    name: source.slice(index + 1, cursor),
    raw: source.slice(index, cursor),
    endIndex: cursor,
  };
}

function readMathGroup(source, index, opener = "{", closer = "}") {
  let cursor = skipMathSpaces(source, index);
  if (source[cursor] !== opener) return null;

  let depth = 1;
  const start = cursor + 1;
  cursor += 1;

  while (cursor < source.length) {
    if (source[cursor] === "\\" && cursor + 1 < source.length) {
      cursor += 2;
      continue;
    }
    if (source[cursor] === opener) depth += 1;
    if (source[cursor] === closer) depth -= 1;
    if (depth === 0) {
      return {
        content: source.slice(start, cursor),
        endIndex: cursor + 1,
      };
    }
    cursor += 1;
  }

  return {
    content: source.slice(start),
    endIndex: source.length,
  };
}

function readMathAtom(source, index) {
  const cursor = skipMathSpaces(source, index);
  const group = readMathGroup(source, cursor);
  if (group) return group;

  const command = readMathCommand(source, cursor);
  if (command) {
    return {
      content: command.raw,
      endIndex: command.endIndex,
    };
  }

  return {
    content: source[cursor] || "",
    endIndex: Math.min(source.length, cursor + 1),
  };
}

function renderMathExpression(expression) {
  const source = String(expression || "").replace(/\r/g, "").trim();
  let html = "";
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (source.startsWith("\\\\", index)) {
      html += "<br />";
      index += 2;
      continue;
    }

    if (char === "\\") {
      const command = readMathCommand(source, index);
      index = command.endIndex;

      if (command.name === "left" || command.name === "right") {
        continue;
      }

      if (command.name === "begin" || command.name === "end") {
        const group = readMathGroup(source, index);
        index = group ? group.endIndex : index;
        continue;
      }

      if (command.name === "frac" || command.name === "dfrac" || command.name === "tfrac") {
        const numerator = readMathGroup(source, index);
        const denominator = numerator ? readMathGroup(source, numerator.endIndex) : null;
        if (numerator && denominator) {
          html += `<span class="math-frac"><span>${renderMathExpression(numerator.content)}</span><span>${renderMathExpression(denominator.content)}</span></span>`;
          index = denominator.endIndex;
          continue;
        }
      }

      if (command.name === "sqrt") {
        const root = readMathGroup(source, index, "[", "]");
        const radicand = readMathGroup(source, root ? root.endIndex : index);
        if (radicand) {
          html += `<span class="math-sqrt">${root ? `<sup>${renderMathExpression(root.content)}</sup>` : ""}<span>${renderMathExpression(radicand.content)}</span></span>`;
          index = radicand.endIndex;
          continue;
        }
      }

      if (MATH_TEXT_COMMANDS.has(command.name) || MATH_STYLE_COMMANDS.has(command.name)) {
        const group = readMathGroup(source, index);
        if (group) {
          const className = MATH_STYLE_COMMANDS.has(command.name) ? "math-bold" : "math-text";
          const content = MATH_TEXT_COMMANDS.has(command.name)
            ? escapeHtml(group.content)
            : renderMathExpression(group.content);
          html += `<span class="${className}">${content}</span>`;
          index = group.endIndex;
          continue;
        }
      }

      if (Object.hasOwn(MATH_SYMBOLS, command.name)) {
        html += `<span class="math-symbol">${escapeHtml(MATH_SYMBOLS[command.name])}</span>`;
        continue;
      }

      if ([",", ";", ":", "!", " "].includes(command.name)) {
        html += " ";
        continue;
      }

      html += escapeHtml(command.raw.replace(/^\\/, ""));
      continue;
    }

    if (char === "^" || char === "_") {
      const atom = readMathAtom(source, index + 1);
      const tag = char === "^" ? "sup" : "sub";
      html += `<${tag}>${renderMathExpression(atom.content)}</${tag}>`;
      index = atom.endIndex;
      continue;
    }

    if (char === "{") {
      const group = readMathGroup(source, index);
      html += renderMathExpression(group?.content || "");
      index = group?.endIndex || index + 1;
      continue;
    }

    if (char === "&") {
      index += 1;
      continue;
    }

    html += /\s/.test(char) ? " " : escapeHtml(char);
    index += 1;
  }

  return html;
}

function renderMathInline(expression) {
  return `<span class="math-inline">${renderMathExpression(expression)}</span>`;
}

function renderMathBlock(expression) {
  return `<div class="math-display">${renderMathExpression(expression)}</div>`;
}

function collectMarkdownMathBlock(lines, startIndex, opener, closer) {
  const firstLine = lines[startIndex].trim();
  const firstContent = firstLine.slice(opener.length);
  const sameLineEnd = firstContent.lastIndexOf(closer);

  if (sameLineEnd >= 0 && firstContent.slice(sameLineEnd + closer.length).trim() === "") {
    return {
      content: firstContent.slice(0, sameLineEnd).trim(),
      endIndex: startIndex,
    };
  }

  const mathLines = [firstContent];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index];
    const endIndex = line.indexOf(closer);
    if (endIndex !== -1) {
      mathLines.push(line.slice(0, endIndex));
      return {
        content: mathLines.join("\n").trim(),
        endIndex: index,
      };
    }
    mathLines.push(line);
    index += 1;
  }

  return {
    content: mathLines.join("\n").trim(),
    endIndex: lines.length - 1,
  };
}

function renderMarkdownInline(text, doc) {
  const source = String(text || "");
  let html = "";
  let index = 0;

  const appendText = (value) => {
    html += escapeHtml(value);
  };

  while (index < source.length) {
    if (source[index] === "`") {
      const endIndex = source.indexOf("`", index + 1);
      if (endIndex !== -1) {
        html += `<code>${escapeHtml(source.slice(index + 1, endIndex))}</code>`;
        index = endIndex + 1;
        continue;
      }
    }

    if (source.startsWith("\\(", index)) {
      const endIndex = findMathDelimiter(source, "\\)", index + 2);
      if (endIndex !== -1) {
        html += renderMathInline(source.slice(index + 2, endIndex));
        index = endIndex + 2;
        continue;
      }
    }

    if (source.startsWith("\\[", index)) {
      const endIndex = findMathDelimiter(source, "\\]", index + 2);
      if (endIndex !== -1) {
        html += renderMathInline(source.slice(index + 2, endIndex));
        index = endIndex + 2;
        continue;
      }
    }

    if (source.startsWith("$$", index)) {
      const endIndex = findMathDelimiter(source, "$$", index + 2);
      if (endIndex !== -1) {
        const expression = source.slice(index + 2, endIndex);
        if (looksLikeMathExpression(expression)) {
          html += renderMathInline(expression);
          index = endIndex + 2;
          continue;
        }
      }
    }

    if (source[index] === "$" && source[index + 1] !== "$" && !isEscapedMarkdownDelimiter(source, index)) {
      const endIndex = findMathDelimiter(source, "$", index + 1);
      if (endIndex !== -1) {
        const expression = source.slice(index + 1, endIndex);
        if (looksLikeMathExpression(expression)) {
          html += renderMathInline(expression);
          index = endIndex + 1;
          continue;
        }
      }
    }

    if (source.startsWith("![", index)) {
      const altEnd = source.indexOf("]", index + 2);
      const targetStart = altEnd !== -1 ? source.indexOf("(", altEnd) : -1;
      const targetEnd = targetStart !== -1 ? source.indexOf(")", targetStart) : -1;
      if (altEnd !== -1 && targetStart === altEnd + 1 && targetEnd !== -1) {
        const target = parseMarkdownLinkTarget(source.slice(targetStart + 1, targetEnd));
        const src = resolveMarkdownUrl(target.url, doc);
        const alt = source.slice(index + 2, altEnd);
        html += `<img class="markdown-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
        index = targetEnd + 1;
        continue;
      }
    }

    if (source[index] === "[") {
      const textEnd = source.indexOf("]", index + 1);
      const targetStart = textEnd !== -1 ? source.indexOf("(", textEnd) : -1;
      const targetEnd = targetStart !== -1 ? source.indexOf(")", targetStart) : -1;
      if (textEnd !== -1 && targetStart === textEnd + 1 && targetEnd !== -1) {
        const target = parseMarkdownLinkTarget(source.slice(targetStart + 1, targetEnd));
        const href = resolveMarkdownUrl(target.url, doc);
        const title = target.title ? ` title="${escapeHtml(target.title)}"` : "";
        html += `<a href="${escapeHtml(href)}"${title} target="_blank" rel="noreferrer">${renderMarkdownInline(source.slice(index + 1, textEnd), doc)}</a>`;
        index = targetEnd + 1;
        continue;
      }
    }

    const strongMarker = source.startsWith("**", index) ? "**" : source.startsWith("__", index) ? "__" : "";
    if (strongMarker) {
      const endIndex = source.indexOf(strongMarker, index + 2);
      if (endIndex !== -1) {
        html += `<strong>${renderMarkdownInline(source.slice(index + 2, endIndex), doc)}</strong>`;
        index = endIndex + 2;
        continue;
      }
    }

    if (source[index] === "*" || source[index] === "_") {
      const marker = source[index];
      const endIndex = source.indexOf(marker, index + 1);
      if (endIndex !== -1 && endIndex > index + 1) {
        html += `<em>${renderMarkdownInline(source.slice(index + 1, endIndex), doc)}</em>`;
        index = endIndex + 1;
        continue;
      }
    }

    if (source.startsWith("~~", index)) {
      const endIndex = source.indexOf("~~", index + 2);
      if (endIndex !== -1) {
        html += `<del>${renderMarkdownInline(source.slice(index + 2, endIndex), doc)}</del>`;
        index = endIndex + 2;
        continue;
      }
    }

    appendText(source[index]);
    index += 1;
  }

  return html;
}

function isMarkdownTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitMarkdownTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdownTable(lines, doc) {
  const header = splitMarkdownTableRow(lines[0]);
  const rows = lines.slice(2).map(splitMarkdownTableRow);
  return `
    <div class="markdown-table-wrap">
      <table>
        <thead><tr>${header.map((cell) => `<th>${renderMarkdownInline(cell, doc)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${row.map((cell) => `<td>${renderMarkdownInline(cell, doc)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMarkdownPreview(markdown, doc = documentState.current) {
  const lines = String(markdown || "").split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderMarkdownInline(paragraph.join(" "), doc)}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const tag = listType === "ol" ? "ol" : "ul";
    blocks.push(`<${tag}>${listItems.map((item) => `<li>${renderMarkdownInline(item, doc)}</li>`).join("")}</${tag}>`);
    listItems = [];
    listType = "";
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      flushParagraph();
      flushList();
      const language = trimmed.replace(/^```/, "").trim();
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }
      const langLabel = language ? `<span>${escapeHtml(language)}</span>` : "";
      blocks.push(`<pre class="markdown-code-block">${langLabel}<code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (trimmed.startsWith("$$")) {
      flushParagraph();
      flushList();
      const mathBlock = collectMarkdownMathBlock(lines, index, "$$", "$$");
      blocks.push(renderMathBlock(mathBlock.content));
      index = mathBlock.endIndex;
      continue;
    }

    if (trimmed.startsWith("\\[")) {
      flushParagraph();
      flushList();
      const mathBlock = collectMarkdownMathBlock(lines, index, "\\[", "\\]");
      blocks.push(renderMathBlock(mathBlock.content));
      index = mathBlock.endIndex;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (index + 1 < lines.length && isMarkdownTableDivider(lines[index + 1])) {
      flushParagraph();
      flushList();
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      blocks.push(renderMarkdownTable(tableLines, doc));
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(6, heading[1].length + 1);
      blocks.push(`<h${level}>${renderMarkdownInline(heading[2], doc)}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push("<hr />");
      continue;
    }

    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${renderMarkdownInline(quote[1], doc)}</blockquote>`);
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = ordered ? "ol" : "ul";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks.join("") || `<p class="markdown-empty">当前 Markdown 没有可预览内容。</p>`;
}

function renderAiMarkdown(markdown) {
  return `<div class="ai-markdown">${renderMarkdownPreview(markdown || "AI 没有返回内容。", null)}</div>`;
}

function setAiMarkdownContent(element, markdown) {
  if (!element) return;
  const rawMarkdown = String(markdown || "");
  element.dataset.markdown = rawMarkdown;
  element.innerHTML = renderAiMarkdown(rawMarkdown);
}

function getAiMarkdownContent(element, fallback = "") {
  if (!element) return fallback;
  if (Object.hasOwn(element.dataset || {}, "markdown")) return element.dataset.markdown;
  return fallback || element.textContent || "";
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .trim();
}

function getCurrentReadingText(doc) {
  if (!doc) return "";

  if (doc.kind === "md") {
    return stripMarkdown(doc.editedText || doc.text || "").slice(0, 5000);
  }

  if (doc.kind === "pdf") {
    return getPdfAiSource(doc).slice(0, 5000);
  }

  return doc.meta.aiSource || "";
}

function getEnglishRatio(text) {
  const letters = (text.match(/[a-z]/gi) || []).length;
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  return letters / Math.max(1, letters + chinese);
}

function translateEnglishToChinese(text) {
  if (!text.trim()) return "请先粘贴或输入需要翻译的英文内容。";

  const phraseMap = [
    ["human-computer interaction", "人机交互"],
    ["user experience", "用户体验"],
    ["user interface", "用户界面"],
    ["usability testing", "可用性测试"],
    ["cognitive load", "认知负荷"],
    ["information architecture", "信息架构"],
    ["interaction design", "交互设计"],
    ["mental model", "心理模型"],
    ["task analysis", "任务分析"],
    ["accessibility", "无障碍性"],
    ["efficiency", "效率"],
    ["effectiveness", "有效性"],
    ["satisfaction", "满意度"],
    ["prototype", "原型"],
    ["feedback", "反馈"],
    ["affordance", "可供性"],
    ["learnability", "易学性"],
    ["consistency", "一致性"],
  ];
  const wordMap = {
    user: "用户",
    users: "用户",
    system: "系统",
    design: "设计",
    interface: "界面",
    task: "任务",
    tasks: "任务",
    goal: "目标",
    goals: "目标",
    error: "错误",
    errors: "错误",
    test: "测试",
    testing: "测试",
    data: "数据",
    method: "方法",
    methods: "方法",
    model: "模型",
    process: "过程",
    performance: "表现",
    time: "时间",
    cost: "成本",
    context: "情境",
    behavior: "行为",
    study: "研究",
    analysis: "分析",
    evaluate: "评估",
    evaluation: "评估",
    measure: "衡量",
    important: "重要",
    interaction: "交互",
    computer: "计算机",
    visual: "视觉",
    content: "内容",
    page: "页面",
    information: "信息",
  };

  const translated = text
    .split(/\n+/)
    .map((line) => {
      let nextLine = line.trim();
      if (!nextLine) return "";

      phraseMap.forEach(([english, chinese]) => {
        nextLine = nextLine.replace(new RegExp(english, "gi"), chinese);
      });

      nextLine = nextLine.replace(/\b[a-z][a-z-]*\b/gi, (word) => {
        const normalized = word.toLowerCase();
        return wordMap[normalized] || word;
      });

      return nextLine;
    })
    .filter(Boolean)
    .join("\n");

  return translated || "没有检测到可翻译的英文内容。";
}

function analyzeReadingText(text) {
  const cleaned = stripMarkdown(text || "");
  if (!cleaned) {
    return "请先输入或粘贴当前阅读内容。Markdown 会自动带入正文；PDF 会自动提取可选择的文字。";
  }

  const sentences = cleaned
    .split(/(?<=[。！？.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const keywords = Array.from(
    new Set(
      cleaned
        .match(/[A-Za-z][A-Za-z-]{3,}|[\u4e00-\u9fa5]{2,}/g)
        ?.map((word) => word.toLowerCase())
        .filter((word) => !["this", "that", "with", "from", "have", "will", "into"].includes(word)) || [],
    ),
  ).slice(0, 8);
  const englishHint = getEnglishRatio(cleaned) > 0.35 ? "检测到英文内容，建议点击“英文转中文”获得中文版本。" : "当前内容以中文为主，可以直接整理成笔记。";

  return [
    `阅读要点：${sentences.slice(0, 3).join(" ") || cleaned.slice(0, 180)}`,
    `关键词：${keywords.join("、") || "暂无明显关键词"}`,
    englishHint,
  ].join("\n\n");
}

function renderAiReadingWindow(doc) {
  const sourceText = doc.kind === "pdf" ? getCurrentReadingText(doc) : doc.meta.aiSource || getCurrentReadingText(doc);
  const output = doc.kind === "pdf" ? getPdfAiOutput(doc, sourceText) : doc.meta.aiOutput || analyzeReadingText(sourceText);
  const placeholder =
    doc.kind === "pdf"
      ? `这里会跟随当前第 ${getActivePdfPageNumber(doc)} 页显示 PDF 提取文字。如果该页是扫描图片，可以手动粘贴文字。`
      : "这里会自动带入当前 Markdown 正文，也可以手动修改需要解析或翻译的段落。";
  const extractStatus =
    doc.kind === "pdf" ? getPdfExtractionStatus(doc) : null;
  const pdfPageCount = doc.kind === "pdf" ? Math.max(1, doc.pageCount || doc.meta.pageCount || 1) : 1;
  const rangeStart = Math.min(pdfPageCount, Math.max(1, Number(doc.meta.pdfRangeStart || getActivePdfPageNumber(doc) || 1)));
  const rangeEnd = Math.min(pdfPageCount, Math.max(rangeStart, Number(doc.meta.pdfRangeEnd || rangeStart)));

  return `
    <section class="ai-reading-card">
      <div class="panel-heading compact-heading">
        <div>
          <span class="tag muted">AI 阅读窗口</span>
          <h3>解析与翻译</h3>
        </div>
        <button class="mini-button" data-ai-action="settings" title="设置 Qwen API Key">
          <i data-lucide="key-round"></i>
          <span>Key</span>
        </button>
      </div>
      ${
        extractStatus
          ? `<p id="ai-reading-status" class="ai-reading-status ${escapeHtml(extractStatus.tone)}">${escapeHtml(extractStatus.text)}</p>`
          : ""
      }
      ${
        doc.kind === "pdf"
          ? `<div class="pdf-range-controls">
              <label>
                <span>起始页</span>
                <input id="ai-pdf-start-page" type="number" min="1" max="${pdfPageCount}" value="${rangeStart}" />
              </label>
              <label>
                <span>结束页</span>
                <input id="ai-pdf-end-page" type="number" min="1" max="${pdfPageCount}" value="${rangeEnd}" />
              </label>
              <button class="ghost-action compact" id="export-ai-pdf-range" type="button">
                <i data-lucide="file-output"></i>
                <span>生成子 PDF</span>
              </button>
            </div>`
          : ""
      }
      <textarea id="ai-reading-source" class="ai-reading-source" placeholder="${escapeHtml(placeholder)}">${escapeHtml(sourceText)}</textarea>
      <div class="ai-reading-actions">
        <button class="primary-action compact" id="ai-analyze-reading">
          <i data-lucide="sparkles"></i>
          <span>解析当前内容</span>
        </button>
        <button class="ghost-action compact" id="ai-translate-reading">
          <i data-lucide="languages"></i>
          <span>英文转中文</span>
        </button>
        ${
          doc.kind === "pdf"
            ? `<button class="ghost-action compact wide" id="extract-pdf-text"><i data-lucide="scan-text"></i><span>重新提取当前页文字</span></button>`
            : ""
        }
      </div>
      <div class="ai-reading-output" id="ai-reading-output">${renderAiMarkdown(output)}</div>
    </section>
  `;
}

async function updateAiReadingOutput(mode) {
  const doc = documentState.current;
  const sourceInput = document.querySelector("#ai-reading-source");
  const output = document.querySelector("#ai-reading-output");
  if (!doc || !sourceInput || !output) return;

  const source = sourceInput.value.trim();
  if (!source) {
    setAiMarkdownContent(output, analyzeReadingText(source));
    return;
  }

  setAiMarkdownContent(output, LONGLONG_THINKING_LINE);
  playLonglongThinkingLine();

  let result = "";
  let answeredWithAi = false;

  try {
    await ensureAiConfigured();
    const chunkSettings = getAiReadingChunkSettings();
    const documents = await buildActiveAiDocuments(source);

    if (mode === "translate") {
      const response = await window.mindStudy.ai.askQuestion({
        question: "请将当前阅读内容翻译成自然、准确的中文。只输出译文，必要时保留术语英文原文。",
        documents,
        options: {
          chunkSize: chunkSettings.chunkSize,
          maxChunks: chunkSettings.maxChunks,
          maxContextChars: chunkSettings.maxContextChars,
          maxTokens: 1200,
        },
      });
      result = formatAiAnswer(response);
      answeredWithAi = true;
    } else {
      const response = await window.mindStudy.ai.summarizeDocuments({
        topic: "解析当前阅读内容，提炼学习要点、关键词和可加入笔记的内容",
        documents,
        options: {
          chunkSize: chunkSettings.chunkSize,
          maxChunks: chunkSettings.maxChunks,
          maxContextChars: chunkSettings.maxContextChars,
          maxTokens: 1200,
        },
      });
      result = formatAiSummary(response);
      answeredWithAi = true;
    }
  } catch (error) {
    const fallback = mode === "translate" ? translateEnglishToChinese(source) : analyzeReadingText(source);
    result = `${getAiErrorMessage(error)}\n\n本地备用结果：\n${fallback}`;
  }

  if (doc.kind === "pdf") {
    const pageKey = getPdfPageKey(doc);
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};
    doc.meta.aiSourcesByPage[pageKey] = source;
    doc.meta.aiOutputsByPage[pageKey] = result;
    doc.meta.aiSource = source;
    doc.meta.aiOutput = result;
  } else {
    doc.meta.aiSource = source;
    doc.meta.aiOutput = result;
  }
  setAiMarkdownContent(output, result);
  if (answeredWithAi) playLonglongAnswerLine();
  saveWorkspace();
}

function buildDocumentMarkdown() {
  const doc = documentState.current;
  if (!doc) return "# MindStudy 学习笔记\n\n当前没有导入资料。\n";

  const notes = document.querySelector("#document-notes")?.value || doc.meta.notes || "";

  return [
    `# ${doc.meta.name}`,
    "",
    `- 文件类型：${doc.meta.extension}`,
    `- 文件大小：${formatBytes(doc.meta.size)}`,
    doc.meta.path ? `- 本机路径：${doc.meta.path}` : "",
    "",
    "## 学习批注",
    "",
    notes || "暂无批注。",
  ]
    .filter(Boolean)
    .join("\n");
}

function rememberCurrentNotes() {
  const doc = documentState.current;
  if (!doc) return;

  const notesInput = document.querySelector("#document-notes");
  if (notesInput) {
    doc.meta.notes = notesInput.value;
  }

  if (doc.kind === "md") {
    const markdownEditor = document.querySelector("#markdown-editor");
    if (markdownEditor) {
      doc.meta.editedText = markdownEditor.value;
      doc.editedText = markdownEditor.value;
    }
  }

  saveWorkspace();
}

function renderPdfReader(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  doc.activePdfPage = Math.min(doc.activePdfPage || doc.meta.activePdfPage || 1, pageCount);
  doc.meta.activePdfPage = doc.activePdfPage;
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span class="pdf-doc-title">${escapeHtml(doc.meta.name)} · ${escapeHtml(formatBytes(doc.meta.size))} · ${pageCount} 页</span>
      <div class="toolbar-actions">
        <button class="mini-button" id="save-notes-top">
          <i data-lucide="save"></i>
          <span>保存笔记</span>
        </button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div id="pdf-viewer" class="pdf-viewer" aria-label="${escapeHtml(doc.meta.name)}"></div>
  `;
  renderPdfInsightPanel(doc);
  window.lucide?.createIcons();
  syncFullscreenButton();
  renderPdfPages(doc);
}

function renderMarkdownReader(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · Markdown 阅读</span>
      <div class="toolbar-actions">
        <button class="mini-button" id="save-markdown-original">
          <i data-lucide="save"></i>
          <span>保存原文件</span>
        </button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div class="markdown-preview">
      ${renderMarkdownPreview(doc.editedText || doc.text, doc)}
    </div>
  `;
  readerPanels.insight.innerHTML = `
    ${renderAiReadingWindow(doc)}
    <div class="panel-heading">
      <div>
        <span class="tag muted">Markdown 编辑</span>
        <h3>当前文件</h3>
      </div>
    </div>
    <textarea id="markdown-editor" class="document-editor" placeholder="编辑 Markdown 内容...">${escapeHtml(doc.editedText || doc.text)}</textarea>
    <button class="primary-action full" id="apply-markdown-edit">
      <i data-lucide="check"></i>
      <span>应用预览</span>
    </button>
    <button class="ghost-action full" id="save-markdown-original">
      <i data-lucide="save"></i>
      <span>保存到原 MD</span>
    </button>
    <button class="ghost-action full" id="save-markdown-copy">
      <i data-lucide="file-output"></i>
      <span>另存为副本</span>
    </button>
  `;
  window.lucide?.createIcons();
  syncFullscreenButton();
}

function renderUnsupportedPowerPoint(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · 旧版 PPT</span>
      <div class="toolbar-actions">
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div class="empty-document">
      <strong>暂不支持直接读取旧版 .ppt</strong>
      <span>请在 PowerPoint 中另存为 .pptx 后重新导入。新版 PPTX 可以读取每页文字并导出编辑后的副本。</span>
    </div>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">学习笔记</span>
        <h3>仍可记录批注</h3>
      </div>
    </div>
    <textarea id="document-notes" class="document-editor" placeholder="记录这份 PPT 的学习重点...">${escapeHtml(doc.meta.notes || "")}</textarea>
    <button class="primary-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
  `;
  window.lucide?.createIcons();
  syncFullscreenButton();
}

function getFirstXmlNode(parent, names) {
  for (const name of names) {
    const node = parent.getElementsByTagName(name)[0];
    if (node) return node;
  }

  return null;
}

function getLocalName(node) {
  return node?.localName || node?.tagName?.split(":").pop() || "";
}

function readXmlNumber(node, attribute, fallback = 0) {
  const value = Number(node?.getAttribute(attribute));
  return Number.isFinite(value) ? value : fallback;
}

function extractNodeText(node) {
  const textNodes = Array.from(node.getElementsByTagName("a:t"));
  const fallbackNodes = textNodes.length > 0 ? textNodes : Array.from(node.getElementsByTagName("t"));
  return fallbackNodes
    .map((textNode) => textNode.textContent.trim())
    .filter(Boolean)
    .join("\n");
}

function getSlideFrame(node, slideSize, fallbackIndex = 0) {
  const transform = getFirstXmlNode(node, ["a:xfrm"]);
  const offset = transform ? getFirstXmlNode(transform, ["a:off"]) : null;
  const extent = transform ? getFirstXmlNode(transform, ["a:ext"]) : null;

  if (!offset || !extent) {
    return {
      x: 7,
      y: 7 + (fallbackIndex % 5) * 15,
      width: 86,
      height: 12,
    };
  }

  return {
    x: (readXmlNumber(offset, "x") / slideSize.width) * 100,
    y: (readXmlNumber(offset, "y") / slideSize.height) * 100,
    width: Math.max(3, (readXmlNumber(extent, "cx") / slideSize.width) * 100),
    height: Math.max(3, (readXmlNumber(extent, "cy") / slideSize.height) * 100),
  };
}

function getSchemeColor(scheme) {
  const schemeColors = {
    accent1: "#188f84",
    accent2: "#df695d",
    accent3: "#d6a62d",
    accent4: "#5267d6",
    accent5: "#8f79d6",
    accent6: "#6aa66a",
    bg1: "#ffffff",
    bg2: "#f7f9f6",
    dk1: "#202623",
    dk2: "#18322d",
    lt1: "#ffffff",
    lt2: "#f7f9f6",
    tx1: "#202623",
    tx2: "#65716b",
  };

  return schemeColors[scheme] || "";
}

function extractColorFromFill(fillNode, fallback = "") {
  const colorNode = fillNode ? getFirstXmlNode(fillNode, ["a:srgbClr"]) : null;
  const colorValue = colorNode?.getAttribute("val");

  if (colorValue && /^[0-9a-f]{6}$/i.test(colorValue)) {
    return `#${colorValue}`;
  }

  const schemeNode = fillNode ? getFirstXmlNode(fillNode, ["a:schemeClr"]) : null;
  return getSchemeColor(schemeNode?.getAttribute("val")) || fallback;
}

function extractShapeFill(shapeNode, hasText) {
  const shapeProperties = getFirstXmlNode(shapeNode, ["p:spPr", "spPr"]) || shapeNode;

  if (getFirstXmlNode(shapeProperties, ["a:noFill"])) {
    return { color: "transparent", hasFill: false };
  }

  const solidFill = getFirstXmlNode(shapeProperties, ["a:solidFill"]);
  const color = extractColorFromFill(solidFill);

  if (color) {
    return { color, hasFill: true };
  }

  return hasText
    ? { color: "transparent", hasFill: false }
    : { color: "#f7f9f6", hasFill: true };
}

function extractSlideBackground(slideDocument) {
  const backgroundNode = getFirstXmlNode(slideDocument, ["p:bg", "bg"]);
  const solidFill = backgroundNode ? getFirstXmlNode(backgroundNode, ["a:solidFill"]) : null;
  return extractColorFromFill(solidFill, "#ffffff");
}

function extractTextStyle(shapeNode, frame, role) {
  const runProperties = getFirstXmlNode(shapeNode, ["a:rPr"]) || getFirstXmlNode(shapeNode, ["a:defRPr"]);
  const sizeValue = readXmlNumber(runProperties, "sz", role === "title" ? 3200 : 1800);
  const pointSize = Math.max(10, Math.min(44, sizeValue / 100));
  const solidFill = runProperties ? getFirstXmlNode(runProperties, ["a:solidFill"]) : null;
  const color = extractColorFromFill(solidFill, "");
  const paragraphProperties = getFirstXmlNode(shapeNode, ["a:pPr"]);
  const alignment = paragraphProperties?.getAttribute("algn");
  const cssAlignments = {
    ctr: "center",
    r: "right",
    l: "left",
    just: "justify",
  };

  return {
    bold: runProperties?.getAttribute("b") === "1" || role === "title",
    color,
    align: cssAlignments[alignment] || "left",
    fontSize: `${Math.max(1.25, Math.min(5.6, pointSize / 7)).toFixed(2)}cqw`,
    titleLike: role === "title" || frame.height > 13 || pointSize >= 26,
  };
}

function getShapeRole(shapeNode) {
  const placeholder = getFirstXmlNode(shapeNode, ["p:ph", "ph"]);
  const type = placeholder?.getAttribute("type");
  if (["title", "ctrTitle", "subTitle"].includes(type)) return "title";
  return "body";
}

function normalizePptxTarget(baseFile, target) {
  if (!target) return "";
  const cleanTarget = target.replace(/^\/+/, "");
  if (cleanTarget.startsWith("ppt/")) return cleanTarget;

  const parts = baseFile.split("/").slice(0, -1);
  cleanTarget.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      parts.pop();
      return;
    }
    parts.push(part);
  });

  return parts.join("/");
}

function getSlideRelsPath(slideFile) {
  const fileName = slideFile.split("/").pop();
  return slideFile.replace(fileName, `_rels/${fileName}.rels`);
}

async function extractPptxRels(zip, slideFile) {
  const relsPath = getSlideRelsPath(slideFile);
  const relsFile = zip.file(relsPath);
  if (!relsFile) return new Map();

  const relsXml = await relsFile.async("string");
  const relsDocument = new DOMParser().parseFromString(relsXml, "application/xml");
  return new Map(
    Array.from(relsDocument.getElementsByTagName("Relationship")).map((relationship) => [
      relationship.getAttribute("Id"),
      relationship.getAttribute("Target"),
    ]),
  );
}

async function extractPptxSlideSize(zip) {
  const presentationFile = zip.file("ppt/presentation.xml");
  if (!presentationFile) {
    return { width: 9144000, height: 5143500 };
  }

  const presentationXml = await presentationFile.async("string");
  const presentationDocument = new DOMParser().parseFromString(presentationXml, "application/xml");
  const sizeNode = getFirstXmlNode(presentationDocument, ["p:sldSz", "sldSz"]);

  return {
    width: readXmlNumber(sizeNode, "cx", 9144000),
    height: readXmlNumber(sizeNode, "cy", 5143500),
  };
}

async function extractPptxVisuals(zip, slideFile, xml, slideSize) {
  const slideDocument = new DOMParser().parseFromString(xml, "application/xml");
  const relationships = await extractPptxRels(zip, slideFile);
  const visuals = [];
  const shapeTree = getFirstXmlNode(slideDocument, ["p:spTree", "spTree"]);
  const drawableNodes = shapeTree
    ? Array.from(shapeTree.childNodes || []).filter((node) => node.nodeType === 1 && ["sp", "pic"].includes(getLocalName(node)))
    : [
        ...Array.from(slideDocument.getElementsByTagName("p:sp")),
        ...Array.from(slideDocument.getElementsByTagName("p:pic")),
      ];

  for (const [index, node] of drawableNodes.entries()) {
    if (getLocalName(node) === "sp") {
      const text = extractNodeText(node);
      const frame = getSlideFrame(node, slideSize, index);
      const role = getShapeRole(node);
      const fill = extractShapeFill(node, Boolean(text));
      const textStyle = extractTextStyle(node, frame, role);

      if (!text && !fill.hasFill) continue;

      visuals.push({
        type: "shape",
        text,
        role,
        fill: fill.color,
        hasFill: fill.hasFill,
        textStyle,
        ...frame,
      });
      continue;
    }

    if (getLocalName(node) === "pic") {
      const frame = getSlideFrame(node, slideSize, index);
      const blip = getFirstXmlNode(node, ["a:blip"]);
      const relationshipId = blip?.getAttribute("r:embed") || blip?.getAttribute("embed");
      const target = relationships.get(relationshipId);
      const mediaPath = normalizePptxTarget(slideFile, target);
      const mediaFile = mediaPath ? zip.file(mediaPath) : null;

      if (!mediaFile) continue;

      const base64 = await mediaFile.async("base64");
      visuals.push({
        type: "image",
        src: `data:${getMimeTypeFromName(mediaPath)};base64,${base64}`,
        alt: mediaPath.split("/").pop() || "PPTX 图片",
        ...frame,
      });
    }
  }

  return {
    background: extractSlideBackground(slideDocument),
    visuals,
  };
}

function renderPptxVisualElement(element, index) {
  const style = `left:${element.x.toFixed(3)}%;top:${element.y.toFixed(3)}%;width:${element.width.toFixed(3)}%;height:${element.height.toFixed(3)}%;`;

  if (element.type === "image") {
    return `<img class="pptx-image" src="${element.src}" alt="${escapeHtml(element.alt)}" style="${style}" />`;
  }

  const fill = /^#[0-9a-f]{6}$/i.test(element.fill) ? element.fill : "#f7f9f6";
  const isTransparent = !element.hasFill || fill === "transparent";
  const isDark = ["#188f84", "#df695d", "#5267d6", "#202623", "#8f79d6"].includes(fill.toLowerCase());
  const textColor = element.textStyle?.color || (isDark ? "#fff" : "var(--ink)");
  const shapeClasses = [
    "pptx-shape",
    element.role === "title" || element.textStyle?.titleLike ? "title" : "",
    isTransparent ? "text-box" : "filled",
    element.text ? "" : "empty",
  ]
    .filter(Boolean)
    .join(" ");
  const textStyle = [
    style,
    `background:${isTransparent ? "transparent" : fill};`,
    `color:${textColor};`,
    `text-align:${element.textStyle?.align || "left"};`,
    `--pptx-font-size:${element.textStyle?.fontSize || "2.2cqw"};`,
    element.textStyle?.bold ? "font-weight:800;" : "font-weight:600;",
  ].join("");

  return `
    <div class="${shapeClasses}" style="${textStyle}">
      ${element.text ? escapeHtml(element.text) : `<span>形状 ${index + 1}</span>`}
    </div>
  `;
}

function renderGeneratedSlide(slide, slideLines) {
  const title = slideLines[0] || slide.title || "未命名页面";
  const bodyLines = slideLines.slice(1);

  return `
    <div class="pptx-stage-shell">
      <div class="pptx-visual-stage generated" style="aspect-ratio:${slide.size.width} / ${slide.size.height};">
        <div class="generated-slide-content">
          <span class="slide-kicker">PowerPoint Slide</span>
          <h2>${escapeHtml(title)}</h2>
          <div class="generated-bullets">
            ${bodyLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("") || "<p>该页没有提取到文字内容。</p>"}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPowerPointStage(renderedSlide) {
  return `
    <div class="pptx-stage-shell powerpoint-exact">
      <div class="pptx-visual-stage powerpoint-render" style="aspect-ratio:${renderedSlide.width} / ${renderedSlide.height};">
        <img class="pptx-rendered-slide" src="${renderedSlide.dataUrl}" alt="${escapeHtml(renderedSlide.name)}" />
      </div>
    </div>
  `;
}

function renderPptxVisualStage(slide, slideLines, renderedSlide) {
  if (renderedSlide) {
    return renderPowerPointStage(renderedSlide);
  }

  const hasVisuals = slide.visuals?.length > 0;

  if (!hasVisuals) {
    return renderGeneratedSlide(slide, slideLines);
  }

  return `
    <div class="pptx-stage-shell">
      <div class="pptx-visual-stage" style="aspect-ratio:${slide.size.width} / ${slide.size.height};background:${slide.background || "#fff"};">
        ${slide.visuals.map((element, index) => renderPptxVisualElement(element, index)).join("")}
      </div>
    </div>
  `;
}

function renderPptxReader() {
  const doc = documentState.current;
  const activeSlide = doc.slides[doc.activeSlideIndex];
  const renderedSlide = doc.powerPointPreview?.slides?.[doc.activeSlideIndex];
  const slideLines = (activeSlide.editedText || activeSlide.text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>第 ${doc.activeSlideIndex + 1} / ${doc.slides.length} 页 · ${escapeHtml(doc.meta.name)}</span>
      <div class="toolbar-actions">
        <button class="icon-button" title="上一页" data-slide-move="-1"><i data-lucide="chevron-left"></i></button>
        <button class="icon-button" title="下一页" data-slide-move="1"><i data-lucide="chevron-right"></i></button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div class="slide-canvas pptx-canvas">
      ${renderPptxVisualStage(activeSlide, slideLines, renderedSlide)}
      <div class="highlight-strip">
        <span>${renderedSlide ? "当前页面由本机 PowerPoint 原样渲染，显示效果按 PowerPoint 为准。" : "未能调用 PowerPoint 原样渲染，已切换到内置 PPTX 预览。"}右侧可编辑当前页文字并导出新的 PPTX 副本。</span>
      </div>
    </div>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">PPTX 编辑</span>
        <h3>当前页文字</h3>
      </div>
    </div>
    <textarea id="slide-editor" class="document-editor" placeholder="编辑当前页文字...">${escapeHtml(activeSlide.editedText || activeSlide.text)}</textarea>
    <button class="primary-action full" id="apply-slide-edit">
      <i data-lucide="check"></i>
      <span>应用到当前页</span>
    </button>
    <button class="ghost-action full" id="export-edited-pptx">
      <i data-lucide="file-output"></i>
      <span>导出编辑 PPTX</span>
    </button>
    <button class="ghost-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
    <textarea id="document-notes" class="document-editor compact" placeholder="整份 PPTX 的学习批注...">${escapeHtml(doc.meta.notes || "")}</textarea>
  `;
  window.lucide?.createIcons();
  syncFullscreenButton();
}

function extractSlideText(xml) {
  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "application/xml");
  const textNodes = Array.from(documentXml.getElementsByTagName("a:t"));
  const fallbackNodes = textNodes.length > 0 ? textNodes : Array.from(documentXml.getElementsByTagName("t"));
  return fallbackNodes
    .map((node) => node.textContent.trim())
    .filter(Boolean)
    .join("\n");
}

function replaceSlideText(xml, text) {
  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "application/xml");
  const textNodes = Array.from(documentXml.getElementsByTagName("a:t"));
  const fallbackNodes = textNodes.length > 0 ? textNodes : Array.from(documentXml.getElementsByTagName("t"));
  const cleanedText = text.trim() || " ";

  if (fallbackNodes.length === 0) return xml;

  fallbackNodes.forEach((node, index) => {
    node.textContent = index === 0 ? cleanedText : "";
  });

  return new XMLSerializer().serializeToString(documentXml);
}

async function loadPptxDocument(file, meta) {
  if (!window.JSZip) throw new Error("PPTX 解析库未加载，请重新运行 npm install。");

  const arrayBuffer = await dataUrlToArrayBuffer(file.dataUrl);
  const zip = await window.JSZip.loadAsync(arrayBuffer);
  const slideSize = await extractPptxSlideSize(zip);
  let powerPointPreview = null;
  let powerPointPreviewError = "";

  if (meta.path && window.mindStudy?.renderPptxSlides) {
    try {
      setParseStatus("PowerPoint 渲染中", "working");
      powerPointPreview = await window.mindStudy.renderPptxSlides(meta.path);
    } catch (error) {
      powerPointPreviewError = error.message || "PowerPoint 原样预览不可用。";
    }
  }

  const slideFiles = Object.keys(zip.files)
    .filter((fileName) => /^ppt\/slides\/slide\d+\.xml$/.test(fileName))
    .sort((first, second) => Number(first.match(/\d+/)[0]) - Number(second.match(/\d+/)[0]));

  const slides = [];

  for (const [index, slideFile] of slideFiles.entries()) {
    const xml = await zip.file(slideFile).async("string");
    const text = extractSlideText(xml);
    const title = text.split(/\n+/).find(Boolean) || slideFile.replace("ppt/slides/", "").replace(".xml", "");
    const visualModel = await extractPptxVisuals(zip, slideFile, xml, slideSize);

    slides.push({
      fileName: slideFile,
      originalXml: xml,
      title,
      text: text || "该页没有提取到文字内容。",
      editedText: meta.editedSlides?.[index] || text || "该页没有提取到文字内容。",
      visuals: visualModel.visuals,
      background: visualModel.background,
      size: slideSize,
    });
  }

  documentState.current = {
    kind: "pptx",
    meta,
    file,
    arrayBuffer,
    slides,
    powerPointPreview,
    powerPointPreviewError,
    activeSlideIndex: 0,
  };

  meta.slideCount = slides.length;
  updateImportedFileCard(meta, [
    `${slides.length} 页幻灯片`,
    powerPointPreview ? "PowerPoint 原样预览" : "内置预览",
    meta.path ? "已保存路径" : "临时导入",
  ]);
  renderPptxReader();
}

async function loadPdfDocument(file, meta) {
  const bytes = base64ToUint8Array(file.base64);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  let pageCount = meta.pageCount || 1;

  documentState.current = {
    kind: "pdf",
    meta,
    file,
    bytes,
    blobUrl,
    pageCount,
    activePdfPage: Math.min(pageCount, Math.max(1, Number(meta.activePdfPage || 1))),
  };

  meta.pageCount = pageCount;
  updateImportedFileCard(meta, ["PDF 阅读器", `${pageCount} 页`, "自动提取文字", meta.path ? "已保存路径" : "临时导入"]);
  hydrateStoredPdfText(documentState.current);
  renderPdfReader(documentState.current);
}

async function loadMarkdownDocument(file, meta) {
  const text = base64ToText(file.base64);

  documentState.current = {
    kind: "md",
    meta,
    file,
    text,
    editedText: meta.editedText || text,
  };

  updateImportedFileCard(meta, ["Markdown 阅读器", "支持编辑保存", meta.path ? "已保存路径" : "临时导入"]);
  renderMarkdownReader(documentState.current);
}

async function loadUnsupportedPpt(file, meta) {
  documentState.current = {
    kind: "ppt",
    meta,
    file,
  };

  updateImportedFileCard(meta, ["旧版 PPT", "建议转为 PPTX", meta.path ? "已保存路径" : "临时导入"]);
  renderUnsupportedPowerPoint(documentState.current);
}

async function loadDocumentById(documentId) {
  const course = getActiveCourse();
  const meta = course.documents.find((documentMeta) => documentMeta.id === documentId);
  if (!meta) return;

  try {
    rememberCurrentNotes();
    setParseStatus("读取中", "working");
    course.activeDocumentId = meta.id;
    saveWorkspace();
    renderCourseSwitcher();
    renderDocumentLibrary();

    const file = await readStoredFile(meta);
    const kind = getDocumentKind(meta.extension);

    if (kind === "pdf") {
      await loadPdfDocument(file, meta);
    } else if (kind === "md") {
      await loadMarkdownDocument(file, meta);
    } else {
      throw new Error("暂不支持该文件格式。当前只支持 PDF 和 Markdown。");
    }

    setParseStatus("已解析", "ready");
    saveWorkspace();
  } catch (error) {
    setParseStatus("读取失败", "working");
    showReaderError(error.message || "文件读取失败。");
  }
}

function createDocumentMeta(file) {
  return {
    id: createId("doc"),
    name: file.name,
    extension: file.extension || getExtension(file.name),
    mimeType: file.mimeType || "",
    size: file.size || 0,
    path: file.path || "",
    notes: "",
    editedText: "",
    addedAt: Date.now(),
    updatedAt: file.updatedAt || Date.now(),
  };
}

function scheduleStudyGenerationAfterImport(courseId) {
  window.setTimeout(() => {
    if (getActiveCourse()?.id !== courseId) return;
    const studyModule = getStudyModule();
    if (["extracting", "ai", "validating"].includes(studyModule.generation?.state)) return;
    generateStudyModuleFromUploads().catch((error) => {
      studyModule.generation = {
        state: "error",
        engine: studyModule.generation?.engine || "",
        message: getAiErrorMessage(error),
        updatedAt: Date.now(),
      };
      saveWorkspace();
      renderStudyModuleViews();
    });
  }, 350);
}

async function handleCourseImport() {
  try {
    const files = (await selectCourseFiles()).filter((file) =>
      supportedDocumentExtensions.has(String(file.extension || getExtension(file.name)).toUpperCase()),
    );
    if (!files.length) return;

    const course = getActiveCourse();
    setParseStatus("解析中", "working");

    const newMetas = files.map((file) => {
      const existing = file.path ? course.documents.find((documentMeta) => documentMeta.path === file.path) : null;
      const meta = existing || createDocumentMeta(file);

      if (!existing) course.documents.unshift(meta);

      meta.name = file.name;
      meta.extension = file.extension || getExtension(file.name);
      meta.mimeType = file.mimeType || "";
      meta.size = file.size || 0;
      meta.path = file.path || meta.path || "";
      meta.updatedAt = file.updatedAt || Date.now();
      runtimeFiles.set(meta.id, file);
      return meta;
    });

    course.activeDocumentId = newMetas[0].id;
    saveWorkspace();
    renderCourseSwitcher();
    await loadDocumentById(newMetas[0].id);
    showView("reader");
    scheduleStudyGenerationAfterImport(course.id);
  } catch (error) {
    setParseStatus("解析失败", "working");
    showView("reader");
    showReaderError(error.message || "文件读取失败。");
  }
}

async function saveDocumentNotes() {
  const doc = documentState.current;
  if (!doc) return;

  rememberCurrentNotes();
  saveWorkspace();
  setParseStatus("笔记已保存", "ready");
}

async function exportAnnotatedPdf() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();

  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width } = firstPage.getSize();
  const safeNote = doc.meta.notes
    ? `MindStudy annotated copy. Note length: ${doc.meta.notes.length} chars.`
    : "MindStudy annotated copy.";

  firstPage.drawText(safeNote, {
    x: 36,
    y: 28,
    size: 10,
    font,
    color: rgb(0.09, 0.32, 0.29),
    maxWidth: width - 72,
  });
  drawInkStrokesOnPdf(pdfDoc, getPdfInkStrokes(doc), rgb);

  const editedBytes = await pdfDoc.save();
  const baseName = doc.meta.name.replace(/\.pdf$/i, "");
  await saveBinaryFile(`${baseName}-MindStudy-annotated.pdf`, editedBytes, [
    { name: "PDF", extensions: ["pdf"] },
  ]);

  if (doc.meta.notes) {
    await saveTextFile(`${baseName}-MindStudy-notes.md`, buildDocumentMarkdown());
  }
}

async function addPdfPage() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("编辑中", "working");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const targetIndex = getPdfTargetPage(doc) - 1;
  const basePage = pdfDoc.getPage(targetIndex);
  const { width, height } = basePage.getSize();

  if (typeof pdfDoc.insertPage === "function") {
    pdfDoc.insertPage(targetIndex + 1, [width, height]);
  } else {
    pdfDoc.addPage([width, height]);
  }

  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount());
  doc.activePdfPage = Math.min(targetIndex + 2, doc.pageCount);
  renderPdfReader(doc);
}

function openDeletePdfPageDialog() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const pageNumber = getPdfTargetPage(doc);
  closeModal();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="delete-pdf-page">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-pdf-page-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">PDF 编辑</span>
              <h2 id="delete-pdf-page-title">删除第 ${pageNumber} 页？</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <p>这只会删除当前 PDF 副本中的页面，不会删除电脑上的原始文件。导出后可得到新的 PDF。</p>
          <div class="modal-actions">
            <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
            <button type="button" class="danger-action compact" data-confirm-delete-pdf-page="${pageNumber}">删除页面</button>
          </div>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
}

async function deletePdfPage() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("编辑中", "working");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const pageCount = pdfDoc.getPageCount();

  if (pageCount <= 1) {
    closeModal();
    setParseStatus("至少保留 1 页", "working");
    return;
  }

  const targetIndex = getPdfTargetPage(doc) - 1;
  pdfDoc.removePage(targetIndex);
  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount());
  doc.activePdfPage = Math.min(targetIndex + 1, doc.pageCount);
  closeModal();
  renderPdfReader(doc);
}

async function insertImageIntoPdf() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const imageFile = await openImageFilePicker();
  if (!imageFile) return;

  const isPng = imageFile.mimeType === "image/png" || /\.png$/i.test(imageFile.name);
  const isJpeg = imageFile.mimeType === "image/jpeg" || /\.jpe?g$/i.test(imageFile.name);

  if (!isPng && !isJpeg) {
    setParseStatus("仅支持 PNG/JPG", "working");
    return;
  }

  rememberCurrentNotes();
  pdfInkState.enabled = false;
  syncPdfInkUi(doc);

  const pageNumber = getPdfTargetPage(doc);
  const pageShell = getPdfPageShell(pageNumber);
  const stack = pageShell?.querySelector(".pdf-canvas-stack");
  if (!stack || pageShell.dataset.rendered !== "true") {
    setParseStatus("请等当前页加载完成后再插图", "working");
    return;
  }

  const image = new Image();
  image.src = imageFile.dataUrl;
  await new Promise((resolve) => {
    if (image.complete) {
      resolve();
      return;
    }

    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });

  const stackRect = stack.getBoundingClientRect();
  const maxWidth = stackRect.width * 0.56;
  const maxHeight = stackRect.height * 0.44;
  const naturalWidth = image.naturalWidth || maxWidth;
  const naturalHeight = image.naturalHeight || maxHeight;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  const widthRatio = Math.max(0.08, (naturalWidth * scale) / Math.max(1, stackRect.width));
  const heightRatio = Math.max(0.06, (naturalHeight * scale) / Math.max(1, stackRect.height));

  pdfImagePlacementState.current = {
    id: createId("pdf-image"),
    pageNumber,
    name: imageFile.name,
    dataUrl: imageFile.dataUrl,
    base64: imageFile.base64,
    isPng,
    widthRatio: Math.min(0.9, widthRatio),
    heightRatio: Math.min(0.9, heightRatio),
    xRatio: Math.max(0, (1 - Math.min(0.9, widthRatio)) / 2),
    yRatio: Math.max(0, (1 - Math.min(0.9, heightRatio)) / 2),
  };

  renderPdfImagePlacement();
  setParseStatus("拖动图片到目标位置后点击写入 PDF", "ready");
}

function applySlideEdit() {
  const doc = documentState.current;
  const editor = document.querySelector("#slide-editor");
  if (!doc || doc.kind !== "pptx" || !editor) return;

  doc.slides[doc.activeSlideIndex].editedText = editor.value;
  rememberCurrentNotes();
  renderPptxReader();
}

async function exportEditedPptx() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pptx") return;

  applySlideEdit();

  const zip = await window.JSZip.loadAsync(doc.arrayBuffer.slice(0));

  for (const slide of doc.slides) {
    zip.file(slide.fileName, replaceSlideText(slide.originalXml, slide.editedText));
  }

  const editedBytes = await zip.generateAsync({ type: "uint8array" });
  const baseName = doc.meta.name.replace(/\.pptx$/i, "");
  await saveBinaryFile(`${baseName}-MindStudy-edited.pptx`, editedBytes, [
    { name: "PowerPoint", extensions: ["pptx"] },
  ]);
}

function moveSlide(direction) {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pptx") return;

  rememberCurrentNotes();
  doc.activeSlideIndex = Math.min(doc.slides.length - 1, Math.max(0, doc.activeSlideIndex + direction));
  renderPptxReader();
}

function applyMarkdownEdit() {
  const doc = documentState.current;
  const editor = document.querySelector("#markdown-editor");
  if (!doc || doc.kind !== "md" || !editor) return;

  doc.editedText = editor.value;
  doc.meta.editedText = editor.value;
  saveWorkspace();
  renderMarkdownReader(doc);
}

async function saveMarkdownOriginal() {
  const doc = documentState.current;
  const editor = document.querySelector("#markdown-editor");
  if (!doc || doc.kind !== "md") return;

  const content = editor?.value ?? doc.editedText;
  doc.editedText = content;
  doc.meta.editedText = content;
  saveWorkspace();

  if (doc.meta.path && window.mindStudy?.saveMarkdown) {
    await window.mindStudy.saveMarkdown({ path: doc.meta.path, data: content });
    return;
  }

  await saveTextFile(doc.meta.name, content);
}

async function saveMarkdownCopy() {
  const doc = documentState.current;
  const editor = document.querySelector("#markdown-editor");
  if (!doc || doc.kind !== "md") return;

  const content = editor?.value ?? doc.editedText;
  doc.editedText = content;
  doc.meta.editedText = content;
  saveWorkspace();
  const baseName = doc.meta.name.replace(/\.md$/i, "");
  await saveTextFile(`${baseName}-MindStudy-edited.md`, content);
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

async function openAiSettingsDialog(preloadedStatus = null) {
  closeModal();

  const status = preloadedStatus || (await getAiStatus());
  const statusClass = status.configured ? "ready" : "warning";
  const placeholder = status.configured ? "已配置，输入新的 Key 可覆盖" : "sk-...";

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="ai-settings">
        <section class="course-modal" role="dialog" aria-modal="true" aria-labelledby="ai-settings-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">Qwen</span>
              <h2 id="ai-settings-title">AI API Key</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <form class="course-form" id="ai-settings-form">
            <label>
              <span>Qwen / DashScope API Key</span>
              <input id="qwen-api-key-input" name="apiKey" type="password" placeholder="${escapeHtml(placeholder)}" autocomplete="off" />
            </label>
            <p class="ai-settings-note">Key 会保存在本机应用数据目录，不会写入 Git 仓库。环境变量 DASHSCOPE_API_KEY 或 QWEN_API_KEY 优先级更高。</p>
            <p class="ai-status-line ${statusClass}" id="ai-settings-status">${escapeHtml(getAiStatusText(status))}</p>
            <div class="modal-actions">
              <button type="button" class="ghost-action compact" data-ai-action="clear-key">清除本地 Key</button>
              <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
              <button type="submit" class="primary-action compact">保存 Key</button>
            </div>
          </form>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
  document.querySelector("#qwen-api-key-input")?.focus();
}

async function submitAiSettingsForm(event) {
  event.preventDefault();

  const input = event.target.elements.apiKey;
  const statusLine = document.querySelector("#ai-settings-status");
  const apiKey = input.value.trim();

  if (!apiKey) {
    input.focus();
    if (statusLine) {
      statusLine.textContent = "请输入 Qwen API Key。";
      statusLine.className = "ai-status-line warning";
    }
    return;
  }

  try {
    const status = await window.mindStudy.ai.saveApiKey(apiKey);
    if (statusLine) {
      statusLine.textContent = getAiStatusText(status);
      statusLine.className = `ai-status-line ${status.configured ? "ready" : "warning"}`;
    }
    input.value = "";
    await syncAiStatusButtons();
    window.setTimeout(closeModal, 450);
  } catch (error) {
    if (statusLine) {
      statusLine.textContent = getAiErrorMessage(error);
      statusLine.className = "ai-status-line warning";
    }
  }
}

async function clearAiApiKey() {
  const statusLine = document.querySelector("#ai-settings-status");

  try {
    const status = await window.mindStudy.ai.clearApiKey();
    if (statusLine) {
      statusLine.textContent = getAiStatusText(status);
      statusLine.className = `ai-status-line ${status.configured ? "ready" : "warning"}`;
    }
    await syncAiStatusButtons();
  } catch (error) {
    if (statusLine) {
      statusLine.textContent = getAiErrorMessage(error);
      statusLine.className = "ai-status-line warning";
    }
  }
}

function openCourseDialog(mode) {
  closeModal();

  const isEdit = mode === "edit";
  const course = getActiveCourse();
  const titleText = isEdit ? "编辑课程" : "新建课程";
  const name = isEdit ? course.name : "新课程";
  const description = isEdit ? course.description || "" : "课程资料复习中";

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="course">
        <section class="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">课程资料库</span>
              <h2 id="course-modal-title">${titleText}</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <form class="course-form" id="course-form" data-course-mode="${mode}">
            <label>
              <span>课程名称</span>
              <input id="course-name-input" name="courseName" type="text" value="${escapeHtml(name)}" maxlength="32" required />
            </label>
            <label>
              <span>课程说明</span>
              <textarea id="course-description-input" name="courseDescription" rows="3" maxlength="80">${escapeHtml(description)}</textarea>
            </label>
            <div class="modal-actions">
              <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
              <button type="submit" class="primary-action compact">${isEdit ? "保存课程" : "创建课程"}</button>
            </div>
          </form>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
  document.querySelector("#course-name-input")?.focus();
}

function submitCourseForm(event) {
  event.preventDefault();

  const form = event.target;
  const nameInput = form.elements.courseName;
  const descriptionInput = form.elements.courseDescription;
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!name) {
    nameInput.focus();
    return;
  }

  if (form.dataset.courseMode === "edit") {
    const course = getActiveCourse();
    course.name = name;
    course.description = description;
    saveWorkspace();
    closeModal();
    renderAllCourseViews();
    return;
  }

  const course = {
    id: createId("course"),
    name,
    description,
    documents: [],
    activeDocumentId: "",
    studyModule: createDefaultStudyModule({ seedGraph: name.includes("用户交互"), course: { name, description, documents: [] } }),
    ragKnowledge: createDefaultRagKnowledge(),
    createdAt: Date.now(),
  };

  workspace.courses.unshift(course);
  workspace.activeCourseId = course.id;
  documentState.current = null;
  saveWorkspace();
  closeModal();
  renderAllCourseViews();
  showView("reader");
}

function createCourse() {
  openCourseDialog("create");
}

function renameCourse() {
  const course = getActiveCourse();
  if (!course) return;
  openCourseDialog("edit");
}

function openDeleteDocumentDialog(documentId) {
  closeModal();

  const course = getActiveCourse();
  const meta = course.documents.find((documentMeta) => documentMeta.id === documentId);
  if (!meta) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="delete-document">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-document-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">移除资料</span>
              <h2 id="delete-document-title">从当前课程移除？</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <p>“${escapeHtml(meta.name)}” 会从 ${escapeHtml(course.name)} 的资料库中移除，本地原文件不会被删除。</p>
          <div class="modal-actions">
            <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
            <button type="button" class="danger-action compact" data-confirm-delete-document="${meta.id}">移除资料</button>
          </div>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
}

function removeDocument(documentId) {
  const course = getActiveCourse();
  const removedDocument = course.documents.find((documentMeta) => documentMeta.id === documentId);
  if (!removedDocument) return;

  const wasActive = course.activeDocumentId === documentId;
  course.documents = course.documents.filter((documentMeta) => documentMeta.id !== documentId);
  runtimeFiles.delete(documentId);

  if (wasActive) {
    course.activeDocumentId = course.documents[0]?.id || "";
    documentState.current = null;
  }

  saveWorkspace();
  closeModal();
  renderAllCourseViews();

  if (wasActive && course.activeDocumentId) {
    loadDocumentById(course.activeDocumentId);
    return;
  }

  if (!course.documents.length) {
    setParseStatus("待导入", "working");
    showReaderEmpty();
    return;
  }

  renderDocumentLibrary();
}

function switchCourse(courseId) {
  rememberCurrentNotes();
  graphGenerationRunId += 1;
  workspace.activeCourseId = courseId;
  const course = getActiveCourse();
  getStudyModule(course);
  course.activeDocumentId = course.activeDocumentId || course.documents[0]?.id || "";
  documentState.current = null;
  saveWorkspace();
  renderAllCourseViews();
  if (course.activeDocumentId) {
    loadDocumentById(course.activeDocumentId);
  } else {
    showReaderEmpty();
  }
}

function renderAllCourseViews() {
  renderCourseSwitcher();
  renderDocumentLibrary();
  updateDashboardForCourse();
  renderRagAssistant();
  renderStudyModuleViews();
  renderPlannerView();
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

document.querySelectorAll("[data-view-jump]").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.viewJump));
});

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", async () => {
    const chatList = document.querySelector("#chat-list");
    const userBubble = document.createElement("div");
    const aiBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    aiBubble.className = "chat-bubble ai";
    userBubble.textContent = chip.dataset.prompt;
    setAiMarkdownContent(aiBubble, LONGLONG_THINKING_LINE);
    playLonglongThinkingLine();
    chatList.append(userBubble, aiBubble);
    chatList.scrollTop = chatList.scrollHeight;
    chip.disabled = true;

    try {
      await ensureAiConfigured();
      const documents = await buildActiveAiDocuments();
      const response = await window.mindStudy.ai.askQuestion({
        question: chip.dataset.prompt,
        documents,
        options: {
          maxChunks: 6,
          maxContextChars: AI_CONTEXT_TEXT_LIMIT,
          maxTokens: 1000,
        },
      });
      setAiMarkdownContent(aiBubble, formatAiAnswer(response));
      playLonglongAnswerLine();
    } catch (error) {
      setAiMarkdownContent(aiBubble, getAiErrorMessage(error));
    } finally {
      chip.disabled = false;
      chatList.scrollTop = chatList.scrollHeight;
    }
  });
});

document.querySelectorAll(".node").forEach((node) => {
  node.addEventListener("click", () => {
    selectKnowledgeNode(node.dataset.node);
    showView("map");
  });
});

document.addEventListener("change", (event) => {
  if (event.target.matches(".course-select")) {
    switchCourse(event.target.value);
  }

  if (event.target.matches("#pdf-target-page")) {
    const doc = documentState.current;
    if (doc?.kind === "pdf") {
      setActivePdfPage(doc, Number(event.target.value));
    }
  }

  if (event.target.matches("#pdf-ink-color")) {
    pdfInkState.color = event.target.value || pdfInkState.color;
    syncPdfInkUi();
  }

  if (event.target.matches("#rag-include-web")) {
    rememberRagSettings();
  }

  if (event.target.matches("#graph-chapter-filter, #graph-difficulty-filter, #graph-mastery-filter")) {
    const studyModule = getStudyModule();
    studyModule.graphFilters.chapter = document.querySelector("#graph-chapter-filter")?.value || "all";
    studyModule.graphFilters.difficulty = document.querySelector("#graph-difficulty-filter")?.value || "all";
    studyModule.graphFilters.mastery = document.querySelector("#graph-mastery-filter")?.value || "all";
    saveWorkspace();
    renderKnowledgeModule();
  }

  if (event.target.matches("#mindmap-group-select")) {
    const studyModule = getStudyModule();
    studyModule.mindmapMode = document.querySelector("#mindmap-group-select")?.value || "classic";
    studyModule.mindmapCollapsed = [];
    saveWorkspace();
    renderMindmapModule();
  }

  if (event.target.matches("#quiz-mode-select, #quiz-scope-select, #quiz-difficulty-select")) {
    const studyModule = getStudyModule();
    studyModule.quiz.mode = document.querySelector("#quiz-mode-select")?.value || "adaptive";
    studyModule.quiz.scope = document.querySelector("#quiz-scope-select")?.value || "all";
    studyModule.quiz.difficulty = document.querySelector("#quiz-difficulty-select")?.value || "all";
    studyModule.quiz.cursor = 0;
    studyModule.activeQuizTopic = studyModule.quiz.scope;
    saveWorkspace();
    renderQuizModule();
  }

  if (event.target.matches("[data-planner-progress]")) {
    setPlannerProgress(event.target.dataset.plannerProgress, event.target.value);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("#document-notes, #markdown-editor, #slide-editor")) {
    window.clearTimeout(event.target.dataset.saveTimer);
    event.target.dataset.saveTimer = window.setTimeout(rememberCurrentNotes, 250);
  }

  if (event.target.matches("#ai-reading-source")) {
    const doc = documentState.current;
    if (doc) {
      if (doc.kind === "pdf") {
        const pageKey = getPdfPageKey(doc);
        doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
        doc.meta.aiSourcesByPage[pageKey] = event.target.value;
        doc.meta.aiSource = event.target.value;
      } else {
        doc.meta.aiSource = event.target.value;
      }
      window.clearTimeout(event.target.dataset.saveTimer);
      event.target.dataset.saveTimer = window.setTimeout(saveWorkspace, 250);
    }
  }

  if (event.target.matches("#ai-pdf-start-page, #ai-pdf-end-page")) {
    const doc = documentState.current;
    if (doc?.kind === "pdf") {
      const range = getPdfRangeFromInputs("ai", Math.max(1, doc.pageCount || doc.meta.pageCount || 1));
      doc.meta.pdfRangeStart = range.startPage;
      doc.meta.pdfRangeEnd = range.endPage;
      saveWorkspace();
    }
  }

  if (event.target.matches("#rag-pdf-start-page, #rag-pdf-end-page")) {
    const activePdf = documentState.current?.kind === "pdf" ? documentState.current : null;
    if (activePdf) {
      getPdfRangeFromInputs("rag", Math.max(1, activePdf.pageCount || activePdf.meta.pageCount || 1));
    }
  }

  if (event.target.matches("#pdf-ink-width")) {
    pdfInkState.width = Number(event.target.value) || pdfInkState.width;
    syncPdfInkUi();
  }

  if (event.target.matches("[data-planner-progress]")) {
    setPlannerProgress(event.target.dataset.plannerProgress, event.target.value, false);
    const valueLabel = event.target.closest(".planner-progress-cell")?.querySelector("span");
    if (valueLabel) valueLabel.textContent = `${event.target.value}%`;
  }
});

document.addEventListener("pointerdown", beginLonglongDrag);
document.addEventListener("pointermove", updateLonglongDrag);
document.addEventListener("pointerup", finishLonglongDrag);
document.addEventListener("pointercancel", finishLonglongDrag);
document.addEventListener("pointerdown", beginGraphNodeDrag);
document.addEventListener("pointermove", updateGraphNodeDrag);
document.addEventListener("pointerup", finishGraphNodeDrag);
document.addEventListener("pointercancel", finishGraphNodeDrag);
document.addEventListener("pointerdown", beginGraphPan);
document.addEventListener("pointermove", updateGraphPan);
document.addEventListener("pointerup", finishGraphPan);
document.addEventListener("pointercancel", finishGraphPan);
document.addEventListener("mousedown", beginLonglongMouseDrag);
document.addEventListener("mousemove", updateLonglongMouseDrag);
document.addEventListener("mouseup", finishLonglongMouseDrag);
document.addEventListener("keydown", handleLonglongKeyboardToggle);
document.addEventListener("pointerdown", beginPdfInkStroke);
document.addEventListener("pointerdown", beginPdfImagePlacementDrag);
document.addEventListener("pointermove", updatePdfInkStroke);
document.addEventListener("pointermove", updatePdfImagePlacementDrag);
document.addEventListener("pointerup", finishPdfInkStroke);
document.addEventListener("pointerup", finishPdfImagePlacementDrag);
document.addEventListener("pointercancel", finishPdfInkStroke);
document.addEventListener("pointercancel", finishPdfImagePlacementDrag);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target?.matches?.("input, textarea, select, [contenteditable='true']");
  if (target?.matches?.("#graph-search-input") && event.key === "Enter") {
    event.preventDefault();
    searchGraphNode();
    return;
  }
  if (!isTyping && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "x") {
    toggleVisionLandmarks();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "0") {
    event.preventDefault();
    setAppZoom(1, {
      persist: true,
      announce: true,
      rerenderReader: true,
    });
    return;
  }

  if (event.key === "Escape") {
    exitReaderFullscreenFallback();
  }
});

document.addEventListener("wheel", handleAppZoomWheel, { passive: false });
document.addEventListener("wheel", handleGraphWheel, { passive: false });

document.addEventListener("submit", (event) => {
  if (event.target.matches("#rag-question-form")) {
    submitRagQuestion(event);
  }

  if (event.target.matches("#coding-form")) {
    submitCodingAssistant(event);
  }

  if (event.target.matches("#ai-settings-form")) {
    submitAiSettingsForm(event);
  }

  if (event.target.matches("#course-form")) {
    submitCourseForm(event);
  }

  if (event.target.matches("#mindmap-node-form")) {
    submitMindmapNodeForm(event);
  }

  if (event.target.matches("#planner-form")) {
    addPlannerItem(event);
  }

  if (event.target.matches("#planner-event-form")) {
    addPlannerEvent(event);
  }

  if (event.target.matches("#longlong-chat-form")) {
    submitLonglongChat(event);
  }

});

document.addEventListener("click", (event) => {
  const modalCloseButton = event.target.closest("[data-modal-action='close']");
  const modalBackdrop = event.target.matches(".modal-backdrop");
  const aiSettingsButton = event.target.closest("[data-ai-action='settings']");
  const aiClearKeyButton = event.target.closest("[data-ai-action='clear-key']");
  const voiceControlToggleButton = event.target.closest("#voice-control-toggle");
  const voiceControlCloseButton = event.target.closest("#voice-control-close");
  const voiceCommandRecordButton = event.target.closest("#voice-command-record");
  const deleteDocumentButton = event.target.closest("[data-delete-document-id]");
  const confirmDeleteDocumentButton = event.target.closest("[data-confirm-delete-document]");
  const confirmDeletePdfPageButton = event.target.closest("[data-confirm-delete-pdf-page]");
  const documentButton = event.target.closest("[data-document-id]");
  const slideButton = event.target.closest("[data-slide-index]");
  const slideMoveButton = event.target.closest("[data-slide-move]");
  const pdfPageStepButton = event.target.closest("[data-pdf-page-step]");
  const pdfInkToolButton = event.target.closest("[data-pdf-ink-tool]");
  const pdfImageActionButton = event.target.closest("[data-pdf-image-action]");
  const plannerStatusButton = event.target.closest("[data-planner-status]");
  const plannerToggleButton = event.target.closest("[data-planner-toggle]");
  const plannerStarButton = event.target.closest("[data-planner-star]");
  const plannerFilterButton = event.target.closest("[data-planner-filter]");
  const calendarMonthButton = event.target.closest("[data-calendar-month-step]");
  const calendarDateButton = event.target.closest("[data-calendar-date]");
  const plannerEventDeleteButton = event.target.closest("[data-planner-event-delete]");
  const ragActionButton = event.target.closest("[data-rag-action]");
  const codingActionButton = event.target.closest("[data-coding-action]");
  const longlongToggleButton = event.target.closest("[data-longlong-toggle]");
  const longlongActionButton = event.target.closest("[data-longlong-action]");
  const longlongGiftButton = event.target.closest("[data-longlong-gift]");
  const mapModeButton = event.target.closest("[data-map-mode]");
  const graphNodeButton = event.target.closest("[data-node]");
  const mapRelatedButton = event.target.closest("[data-map-related]");
  const mapActionButton = event.target.closest("[data-map-action]");
  const mindmapActionButton = event.target.closest("[data-mindmap-action]");
  const mindmapNodeButton = event.target.closest("[data-mindmap-node]");
  const mindmapToggleButton = event.target.closest("[data-mindmap-toggle]");
  const mindmapZoomButton = event.target.closest("[data-mindmap-zoom]");
  const quizAnswerButton = event.target.closest("[data-quiz-answer]");
  const quizMultiButton = event.target.closest("[data-quiz-multi]");
  const quizActionButton = event.target.closest("[data-quiz-action]");
  const reportReviewButton = event.target.closest("[data-report-review-topic]");
  const studyActionButton = event.target.closest("[data-study-action]");
  const graphActionButton = event.target.closest("[data-graph-action]");
  const graphZoomButton = event.target.closest("[data-graph-zoom]");
  const mistakeReviewButton = event.target.closest("[data-mistake-review]");
  const actionButton = event.target.closest("button");

  if (voiceControlToggleButton) {
    if (voiceCommandState.open || voiceCommandState.listening) {
      closeVoiceCommandPanel();
    } else {
      startVoiceCommandRecording().catch((error) => {
        cleanupVoiceCommandStream();
        setVoiceCommandPanelOpen(true);
        setVoiceCommandStatus("语音控制不可用", getAiErrorMessage(error), "warning");
      });
    }
    return;
  }

  if (voiceControlCloseButton) {
    closeVoiceCommandPanel();
    return;
  }

  if (voiceCommandRecordButton) {
    if (voiceCommandState.listening || voiceCommandState.recording) {
      stopVoiceCommandListening({ keepPanel: true, cancel: true });
    } else {
      startVoiceCommandRecording().catch((error) => {
        cleanupVoiceCommandStream();
        setVoiceCommandStatus("语音控制不可用", getAiErrorMessage(error), "warning");
      });
    }
    return;
  }

  if (ragActionButton) {
    const action = ragActionButton.dataset.ragAction;
    if (action === "learn-active") learnRagKnowledge("active");
    if (action === "learn-course") learnRagKnowledge("course");
    if (action === "learn-range") learnActivePdfRange();
    if (action === "export-range") exportActivePdfRange("rag");
    if (action === "clear-library") clearRagKnowledge();
    return;
  }

  if (codingActionButton) {
    if (codingActionButton.dataset.codingAction === "clear") clearCodingAssistant();
    return;
  }

  if (quizAnswerButton) {
    submitObjectiveQuizAnswer(quizAnswerButton);
    return;
  }

  if (quizMultiButton) {
    quizMultiButton.classList.toggle("selected");
    return;
  }

  if (quizActionButton) {
    handleQuizActionButton(quizActionButton).catch((error) => {
      const feedback = document.querySelector("#answer-feedback");
      if (feedback) feedback.textContent = getAiErrorMessage(error);
    });
    return;
  }

  if (studyActionButton) {
    const action = studyActionButton.dataset.studyAction;
    if (action === "generate") generateStudyModuleFromUploads();
    if (action === "cancel-generation") cancelStudyGeneration();
    if (action === "reset-graph-view") resetGraphView();
    return;
  }

  if (graphZoomButton) {
    zoomGraph(Number(graphZoomButton.dataset.graphZoom) || 0);
    return;
  }

  if (mindmapZoomButton) {
    zoomMindmap(mindmapZoomButton.dataset.mindmapZoom);
    return;
  }

  if (graphActionButton) {
    const action = graphActionButton.dataset.graphAction;
    if (action === "check-status") refreshNeo4jStatus();
    if (action === "load-neo4j") loadCourseGraphFromNeo4j();
    if (action === "search-node") searchGraphNode();
    if (action === "expand-node") expandSelectedGraphNode();
    if (action === "find-path") findGraphPath();
    if (action === "export-mermaid") openMermaidExportDialog();
    return;
  }

  if (mapModeButton) {
    getStudyModule().mapMode = mapModeButton.dataset.mapMode;
    saveWorkspace();
    renderKnowledgeModule();
    return;
  }

  if (graphNodeButton) {
    selectKnowledgeNode(graphNodeButton.dataset.node);
    showView("map");
    return;
  }

  if (mapRelatedButton) {
    selectKnowledgeNode(mapRelatedButton.dataset.mapRelated);
    return;
  }

  if (mapActionButton?.dataset.mapAction === "show-source") {
    showKnowledgeSource();
    return;
  }

  if (mindmapToggleButton) {
    const studyModule = getStudyModule();
    const key = mindmapToggleButton.dataset.mindmapToggle;
    const collapsed = new Set(studyModule.mindmapCollapsed || []);
    if (collapsed.has(key)) collapsed.delete(key);
    else collapsed.add(key);
    studyModule.mindmapCollapsed = Array.from(collapsed);
    saveWorkspace();
    renderMindmapModule();
    return;
  }

  if (mindmapNodeButton) {
    const studyModule = getStudyModule();
    studyModule.selectedMindmapNodeId = mindmapNodeButton.dataset.mindmapNode;
    const selectedMindmapNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, studyModule.mindmap);
    const topicId = resolveMindmapTopicId(selectedMindmapNode, studyModule.graph);
    if (topicId) studyModule.selectedNodeId = topicId;
    saveWorkspace();
    renderMindmapModule();
    return;
  }

  if (mindmapActionButton) {
    const action = mindmapActionButton.dataset.mindmapAction;
    const studyModule = getStudyModule();
    if (action === "export") {
      openMindmapExportDialog();
      return;
    }
    if (action === "export-current") {
      openMindmapExportDialog();
      return;
    }
    if (action === "regenerate") {
      regenerateMindmapFromUploads();
      return;
    }
    if (action === "add-child") {
      openMindmapNodeEditor("add");
      return;
    }
    if (action === "edit-node") {
      openMindmapNodeEditor("edit");
      return;
    }
    if (action === "delete-node") {
      deleteSelectedMindmapNodeFromPrompt();
      return;
    }
    if (action === "practice") {
      const selectedMindmapNode = getMindmapNodeById(studyModule.selectedMindmapNodeId, studyModule.mindmap);
      const topicId = resolveMindmapTopicId(selectedMindmapNode, studyModule.graph);
      generateQuizForTopic(topicId || studyModule.selectedNodeId || "all");
      return;
    }
    if (action === "expand-all") studyModule.mindmapCollapsed = [];
    if (action === "collapse-all") studyModule.mindmapCollapsed = flattenMindmapNodes(studyModule.mindmap)
      .filter((node) => node.children?.length)
      .map((node) => node.id);
    if (action === "focus") studyModule.mindmapFocusId = document.querySelector("#mindmap-focus-select")?.value || "";
    if (action === "reset-focus") studyModule.mindmapFocusId = "";
    saveWorkspace();
    renderMindmapModule();
    return;
  }

  if (reportReviewButton) {
    generateQuizForTopic(reportReviewButton.dataset.reportReviewTopic);
    return;
  }

  if (mistakeReviewButton) {
    const studyModule = getStudyModule();
    const mistake = studyModule.mistakes.find((item) => item.id === mistakeReviewButton.dataset.mistakeReview);
    if (mistake) {
      mistake.reviewed = true;
      saveWorkspace();
      renderReportModule();
    }
    return;
  }

  if (longlongToggleButton) {
    if (longlongDragState.suppressToggle) return;
    hideLonglongActions();
    handleLonglongAction("poke");
    return;
  }

  if (longlongActionButton) {
    hideLonglongActions();
    handleLonglongAction(longlongActionButton.dataset.longlongAction);
    return;
  }

  if (longlongGiftButton) {
    sendLonglongGift(longlongGiftButton.dataset.longlongGift);
    return;
  }

  if (actionButton?.id === "toggle-reader-fullscreen") {
    toggleReaderFullscreen();
    return;
  }

  if (aiSettingsButton) {
    openAiSettingsDialog();
    return;
  }

  if (aiClearKeyButton) {
    clearAiApiKey();
    return;
  }

  if (modalCloseButton || modalBackdrop) {
    closeModal();
    return;
  }

  if (confirmDeletePdfPageButton) {
    deletePdfPage();
    return;
  }

  if (confirmDeleteDocumentButton) {
    removeDocument(confirmDeleteDocumentButton.dataset.confirmDeleteDocument);
    return;
  }

  if (deleteDocumentButton) {
    openDeleteDocumentDialog(deleteDocumentButton.dataset.deleteDocumentId);
    return;
  }

  if (documentButton) {
    loadDocumentById(documentButton.dataset.documentId);
    return;
  }

  if (slideButton) {
    const doc = documentState.current;
    if (doc?.kind === "pptx") {
      rememberCurrentNotes();
      doc.activeSlideIndex = Number(slideButton.dataset.slideIndex);
      renderPptxReader();
    }
    return;
  }

  if (slideMoveButton) {
    moveSlide(Number(slideMoveButton.dataset.slideMove));
    return;
  }

  if (pdfPageStepButton) {
    const doc = documentState.current;
    if (doc?.kind === "pdf") {
      setActivePdfPage(doc, (doc.activePdfPage || 1) + Number(pdfPageStepButton.dataset.pdfPageStep || 0));
    }
    return;
  }

  if (pdfInkToolButton) {
    setPdfInkTool(pdfInkToolButton.dataset.pdfInkTool);
    return;
  }

  if (pdfImageActionButton) {
    if (pdfImageActionButton.dataset.pdfImageAction === "apply") applyPdfImagePlacement();
    if (pdfImageActionButton.dataset.pdfImageAction === "cancel") cancelPdfImagePlacement();
    return;
  }

  if (plannerStatusButton) {
    cyclePlannerStatus(plannerStatusButton.dataset.plannerStatus);
    return;
  }

  if (plannerToggleButton) {
    setPlannerDone(plannerToggleButton.dataset.plannerToggle);
    return;
  }

  if (plannerStarButton) {
    setPlannerImportance(plannerStarButton.dataset.plannerId, plannerStarButton.dataset.plannerStar);
    return;
  }

  if (plannerFilterButton) {
    plannerState.filter = plannerFilterButton.dataset.plannerFilter;
    savePlannerState();
    renderPlannerView();
    return;
  }

  if (calendarMonthButton) {
    changePlannerCalendarMonth(calendarMonthButton.dataset.calendarMonthStep);
    return;
  }

  if (calendarDateButton) {
    selectPlannerCalendarDate(calendarDateButton.dataset.calendarDate);
    return;
  }

  if (plannerEventDeleteButton) {
    deletePlannerEvent(plannerEventDeleteButton.dataset.plannerEventDelete);
    return;
  }

  if (!actionButton) return;

  if (actionButton.dataset.courseAction === "create") createCourse();
  if (actionButton.dataset.courseAction === "rename") renameCourse();
  if (actionButton.id === "toggle-camera") toggleCamera();
  if (actionButton.id === "toggle-camera-landmarks") toggleVisionLandmarks();
  if (actionButton.id === "start-camera") startCamera();
  if (actionButton.id === "stop-camera") stopCamera();
  if (actionButton.id === "simulate-upload" || actionButton.dataset.libraryImport === "true") handleCourseImport();
  if (actionButton.id === "save-document-notes" || actionButton.id === "save-notes-top") saveDocumentNotes();
  if (actionButton.id === "export-annotated-pdf") exportAnnotatedPdf();
  if (actionButton.id === "insert-pdf-image") insertImageIntoPdf();
  if (actionButton.id === "add-pdf-page") addPdfPage();
  if (actionButton.id === "delete-pdf-page") openDeletePdfPageDialog();
  if (actionButton.id === "undo-pdf-ink") undoPdfInkStroke();
  if (actionButton.id === "clear-pdf-ink-page") clearCurrentPdfInkPage();
  if (actionButton.id === "apply-pdf-ink") applyPdfInkToCurrentPdf();
  if (actionButton.id === "ai-analyze-reading") updateAiReadingOutput("analyze");
  if (actionButton.id === "ai-translate-reading") updateAiReadingOutput("translate");
  if (actionButton.id === "export-ai-pdf-range") exportActivePdfRange("ai");
  if (actionButton.id === "extract-pdf-text") {
    const doc = documentState.current;
    if (doc?.kind === "pdf") extractCurrentPdfPageText(doc, { force: true });
  }
  if (actionButton.id === "apply-slide-edit") applySlideEdit();
  if (actionButton.id === "export-edited-pptx") exportEditedPptx();
  if (actionButton.id === "apply-markdown-edit") applyMarkdownEdit();
  if (actionButton.id === "save-markdown-original") saveMarkdownOriginal();
  if (actionButton.id === "save-markdown-copy") saveMarkdownCopy();
});

window.addEventListener("DOMContentLoaded", () => {
  loadGestureRuntimeConfig();
  setupGestureCategoryLabels();
  applyAppZoom();
  initStudyTimer();
  initLonglongBond();
  initLonglongActionHover();
  applyLonglongPosition();
  renderAllCourseViews();
  setCameraStatus("idle");

  if (getActiveDocumentMeta()) {
    renderDocumentLibrary();
  } else {
    showReaderEmpty();
  }

  window.lucide?.createIcons();
  syncAiStatusButtons();
  syncLonglongAssistant();
  refreshNeo4jStatus();
  scheduleLonglongSleep();
  showView("focus");
  startCamera();

  window.mindStudy?.getAppInfo?.().then((info) => {
    document.body.dataset.platform = info.platform;
  });
});

document.addEventListener("fullscreenchange", () => {
  syncFullscreenButton();
  rerenderCurrentPdfAfterReaderResize();
});
window.addEventListener("resize", () => {
  applyLonglongPosition();
  positionOpenLonglongPopovers();
  rerenderCurrentPdfAfterReaderResize(220);
});
window.addEventListener("beforeunload", stopCamera);
