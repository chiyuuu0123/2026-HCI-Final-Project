const viewTitles = {
  dashboard: "学习工作台",
  reader: "资料阅读",
  map: "知识图谱",
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

const title = document.querySelector("#view-title");
const navItems = document.querySelectorAll("[data-view]");
const panels = document.querySelectorAll("[data-view-panel]");

function showView(viewName) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === viewName);
  });

  title.textContent = viewTitles[viewName] || "MindStudy";
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

document.querySelectorAll("[data-view-jump]").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.viewJump));
});

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const chatList = document.querySelector("#chat-list");
    const userBubble = document.createElement("div");
    const aiBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    aiBubble.className = "chat-bubble ai";
    userBubble.textContent = chip.dataset.prompt;
    aiBubble.textContent = "已根据当前课程资料整理好回答，并自动标记可加入笔记的重点句。";
    chatList.append(userBubble, aiBubble);
    chatList.scrollTop = chatList.scrollHeight;
  });
});

document.querySelectorAll(".node").forEach((node) => {
  node.addEventListener("click", () => {
    const nodeName = node.dataset.node;
    const nodeTitle = document.querySelector("#node-title");
    const nodeDesc = document.querySelector("#node-desc");
    const mastery = document.querySelector(".mastery-bar span");

    if (!nodeTitle || !nodeDesc || !mastery) {
      showView("map");
      return;
    }

    nodeTitle.textContent = nodeName;
    nodeDesc.textContent = nodeContent[nodeName] || "该知识点已加入当前课程结构，可继续生成解释、例题和复习题。";
    mastery.style.width = node.classList.contains("weak") ? "46%" : "78%";
    showView("map");
  });
});

document.querySelectorAll(".answer-option").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".answer-option").forEach((item) => item.classList.remove("selected"));
    option.classList.add("selected");
    const feedback = document.querySelector("#answer-feedback");
    const isCorrect = option.textContent.includes("用户主观评分");
    feedback.textContent = isCorrect
      ? "回答正确。满意度更偏向用户主观评价，常通过问卷、评分和访谈反馈获得。"
      : "这个选项更接近效率或性能指标。满意度通常来自用户主观评分和反馈。";
    feedback.style.background = isCorrect ? "var(--teal-soft)" : "var(--coral-soft)";
    feedback.style.color = isCorrect ? "var(--teal)" : "var(--coral)";
  });
});

async function handleCourseImport() {
  const status = document.querySelector("#parse-status");
  const fileTitle = document.querySelector(".upload-panel h3");

  if (window.mindStudy?.selectCourseFile) {
    const file = await window.mindStudy.selectCourseFile();
    if (!file) {
      return;
    }

    fileTitle.textContent = file.name;
  }

  status.textContent = "解析中";
  status.style.background = "var(--yellow-soft)";
  status.style.color = "var(--yellow)";

  window.setTimeout(() => {
    status.textContent = "已解析";
    status.style.background = "var(--teal-soft)";
    status.style.color = "var(--teal)";
  }, 900);
}

document.querySelector("#simulate-upload")?.addEventListener("click", handleCourseImport);

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  window.mindStudy?.getAppInfo?.().then((info) => {
    document.body.dataset.platform = info.platform;
  });
});
