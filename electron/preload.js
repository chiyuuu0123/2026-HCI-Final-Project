const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mindStudy", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  selectCourseFile: () => ipcRenderer.invoke("dialog:open-course-file"),
  readCourseFile: (filePath) => ipcRenderer.invoke("file:read-course-file", filePath),
  saveFile: (options) => ipcRenderer.invoke("dialog:save-file", options),
  saveMarkdown: (options) => ipcRenderer.invoke("file:save-markdown", options),
  ai: {
    getStatus: () => ipcRenderer.invoke("b:ai:get-status"),
    saveApiKey: (apiKey) => ipcRenderer.invoke("b:ai:save-api-key", apiKey),
    clearApiKey: () => ipcRenderer.invoke("b:ai:clear-api-key"),
    askQuestion: (request) => ipcRenderer.invoke("b:ai:ask-question", request),
    summarizeDocuments: (request) => ipcRenderer.invoke("b:ai:summarize-documents", request),
    extractPdfText: (payload) => ipcRenderer.invoke("b:ai:extract-pdf-text", payload),
  },
});
