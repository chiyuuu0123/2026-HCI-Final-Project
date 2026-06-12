const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("mindStudy", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  getFrontendEnv: () => ipcRenderer.invoke("app:get-frontend-env"),
  getMusicLibrary: () => ipcRenderer.invoke("app:get-music-library"),
  logToTerminal: (scope, payload) => ipcRenderer.send("app:renderer-log", scope, payload),
  wakeMainWindow: () => ipcRenderer.send("companion:wake-main"),
  setCompanionMode: (mode) => ipcRenderer.invoke("companion:set-mode", mode),
  getCompanionBounds: () => ipcRenderer.invoke("companion:get-bounds"),
  moveCompanionTo: (bounds) => ipcRenderer.send("companion:move-to", bounds),
  askLonglongCompanion: (request) => ipcRenderer.invoke("companion:ask-longlong", request),
  getLonglongChatState: () => ipcRenderer.invoke("longlong-chat:get"),
  clearLonglongChat: () => ipcRenderer.invoke("longlong-chat:clear"),
  addLonglongMemory: (text) => ipcRenderer.invoke("longlong-memory:add", text),
  deleteLonglongMemory: (memoryId) => ipcRenderer.invoke("longlong-memory:delete", memoryId),
  getLonglongBond: () => ipcRenderer.invoke("longlong-bond:get"),
  addLonglongAffection: (request) => ipcRenderer.invoke("longlong-bond:add-affection", request),
  claimLonglongStudyCoins: (request) => ipcRenderer.invoke("longlong-bond:claim-study-coins", request),
  buyLonglongGift: (giftId) => ipcRenderer.invoke("longlong-bond:buy-gift", giftId),
  updateCompanionSnapshot: (snapshot) => ipcRenderer.send("companion:update-snapshot", snapshot),
  hideCompanion: () => ipcRenderer.send("companion:hide"),
  getStudyTimer: () => ipcRenderer.invoke("study-timer:get"),
  onStudyTimerUpdate: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("study-timer:update", listener);
    return () => ipcRenderer.removeListener("study-timer:update", listener);
  },
  onCompanionSnapshot: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("companion:snapshot", listener);
    return () => ipcRenderer.removeListener("companion:snapshot", listener);
  },
  onCompanionMode: (callback) => {
    const listener = (event, mode) => callback(mode);
    ipcRenderer.on("companion:mode", listener);
    return () => ipcRenderer.removeListener("companion:mode", listener);
  },
  onCompanionDragMotion: (callback) => {
    const listener = (event, motion) => callback(motion);
    ipcRenderer.on("companion:drag-motion", listener);
    return () => ipcRenderer.removeListener("companion:drag-motion", listener);
  },
  onLonglongBondUpdate: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("longlong-bond:update", listener);
    return () => ipcRenderer.removeListener("longlong-bond:update", listener);
  },
  onLonglongChatUpdate: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("longlong-chat:update", listener);
    return () => ipcRenderer.removeListener("longlong-chat:update", listener);
  },
  getZoomFactor: () => webFrame.getZoomFactor(),
  setZoomFactor: (factor) => {
    const numericFactor = Number(factor);
    if (!Number.isFinite(numericFactor)) return webFrame.getZoomFactor();

    const nextFactor = Math.min(1.4, Math.max(0.75, numericFactor));
    webFrame.setZoomFactor(nextFactor);
    return webFrame.getZoomFactor();
  },
  selectCourseFile: () => ipcRenderer.invoke("dialog:open-course-file"),
  readCourseFile: (filePath) => ipcRenderer.invoke("file:read-course-file", filePath),
  saveFile: (options) => ipcRenderer.invoke("dialog:save-file", options),
  saveMarkdown: (options) => ipcRenderer.invoke("file:save-markdown", options),
  ai: {
    getStatus: () => ipcRenderer.invoke("b:ai:get-status"),
    saveApiKey: (apiKey) => ipcRenderer.invoke("b:ai:save-api-key", apiKey),
    clearApiKey: () => ipcRenderer.invoke("b:ai:clear-api-key"),
    askQuestion: (request) => ipcRenderer.invoke("b:ai:ask-question", request),
    askMusicRecommendation: (request) => ipcRenderer.invoke("b:ai:ask-music-recommendation", request),
    askCoding: (request) => ipcRenderer.invoke("b:ai:ask-coding", request),
    summarizeDocuments: (request) => ipcRenderer.invoke("b:ai:summarize-documents", request),
    extractPdfText: (payload) => ipcRenderer.invoke("b:ai:extract-pdf-text", payload),
    recognizeImageText: (payload) => ipcRenderer.invoke("b:ai:recognize-image-text", payload),
    transcribeAudio: (payload) => ipcRenderer.invoke("b:ai:transcribe-audio", payload),
  },
  rag: {
    askLibrary: (request) => ipcRenderer.invoke("b:rag:ask-library", request),
    cancelAsk: (requestId) => ipcRenderer.invoke("b:rag:cancel-ask", requestId),
  },
  graph: {
    getStatus: () => ipcRenderer.invoke("graph:get-status"),
    saveConfig: (config) => ipcRenderer.invoke("graph:save-config", config),
    generateFromDocuments: (request) => ipcRenderer.invoke("graph:generate-from-documents", request),
    saveCourseGraph: (request) => ipcRenderer.invoke("graph:save-course-graph", request),
    getCourseGraph: (request) => ipcRenderer.invoke("graph:get-course-graph", request),
    getNodeNeighborhood: (request) => ipcRenderer.invoke("graph:get-node-neighborhood", request),
    searchNodes: (request) => ipcRenderer.invoke("graph:search-nodes", request),
    findPath: (request) => ipcRenderer.invoke("graph:find-path", request),
    clearCourseGraph: (request) => ipcRenderer.invoke("graph:clear-course-graph", request),
  },
});
