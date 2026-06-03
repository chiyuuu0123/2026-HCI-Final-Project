const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mindStudy", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  selectCourseFile: () => ipcRenderer.invoke("dialog:open-course-file"),
});
