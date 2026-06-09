import {
  FaceLandmarker,
  FilesetResolver,
  GestureRecognizer,
} from "./vendor/mediapipe-vision/vision_bundle.mjs";

const MODEL_PATHS = {
  gesture: "./assets/models/gesture_recognizer.task",
  face: "./assets/models/face_landmarker.task",
  wasm: "./vendor/mediapipe-vision/wasm",
};

const visionRuntimeConfig = {
  frameIntervalMs: 180,
};

let visionFilesetPromise = null;
let gestureRecognizerPromise = null;
let faceLandmarkerPromise = null;
let lastVideoTime = -1;
let lastFrameAt = 0;

function getVisionFileset() {
  if (!visionFilesetPromise) {
    visionFilesetPromise = FilesetResolver.forVisionTasks(MODEL_PATHS.wasm);
  }
  return visionFilesetPromise;
}

async function getGestureRecognizer() {
  if (!gestureRecognizerPromise) {
    gestureRecognizerPromise = getVisionFileset().then((vision) =>
      GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATHS.gesture,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      }),
    );
  }
  return gestureRecognizerPromise;
}

async function getFaceLandmarker() {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = getVisionFileset().then((vision) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATHS.face,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
      }),
    );
  }
  return faceLandmarkerPromise;
}

function topCategory(categories = []) {
  const category = categories[0];
  if (!category) return null;
  return {
    name: category.categoryName || category.displayName || "Unknown",
    score: Number(category.score) || 0,
  };
}

function getBlendshapeScore(blendshapeMap, name) {
  return Number(blendshapeMap.get(name)) || 0;
}

function landmarkDistance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function isFingerExtended(landmarks, tipIndex, pipIndex, mcpIndex) {
  const wrist = landmarks?.[0];
  const tip = landmarks?.[tipIndex];
  const pip = landmarks?.[pipIndex];
  const mcp = landmarks?.[mcpIndex];
  if (!wrist || !tip || !pip || !mcp) return false;

  const tipDistance = landmarkDistance(tip, wrist);
  const pipDistance = landmarkDistance(pip, wrist);
  const tipToPip = landmarkDistance(tip, pip);
  const pipToMcp = landmarkDistance(pip, mcp);
  const straightness = pipToMcp ? tipToPip / pipToMcp : 0;
  return tipDistance > pipDistance * 1.05 && straightness > 0.72;
}

function normalizeHandedness(rawHandedness) {
  const name = rawHandedness?.name || "";
  if (name.toLowerCase() === "left") return "left";
  if (name.toLowerCase() === "right") return "right";
  return "unknown";
}

function createMouseGesture(hands) {
  const leftHand = hands.find((hand) => hand.handedness === "left");
  const rightHand = hands.find((hand) => hand.handedness === "right");
  const leftRawName = leftHand?.rawGesture?.name;
  const leftScore = Number(leftHand?.rawGesture?.score) || 0;
  const rightIndexTip = rightHand?.indexTip || null;

  if (leftRawName === "Thumb_Up" && leftScore >= 0.5) {
    return {
      id: "left-thumb-click",
      label: "\u5de6\u624b\u70b9\u8d5e",
      action: "\u9f20\u6807\u5de6\u952e",
      mode: "click",
      confidence: leftScore,
    };
  }

  if (leftRawName === "Closed_Fist" && leftScore >= 0.5 && rightIndexTip) {
    return {
      id: "left-fist-right-index-scroll",
      label: "\u5de6\u624b\u63e1\u62f3 + \u53f3\u624b\u98df\u6307",
      action: "\u6eda\u8f6e\u4e0a\u4e0b\u6ed1\u52a8",
      mode: "scroll",
      point: rightIndexTip,
      confidence: leftScore,
    };
  }

  if (rightIndexTip) {
    return {
      id: "right-index-pointer",
      label: "\u53f3\u624b\u98df\u6307",
      action: "\u9f20\u6807\u79fb\u52a8",
      mode: "point",
      point: rightIndexTip,
      confidence: Math.max(0.62, Number(rightHand?.rawGesture?.score) || 0),
    };
  }

  return {
    id: "none",
    label: "\u672a\u68c0\u6d4b\u5230\u9f20\u6807\u63a7\u5236\u624b\u52bf",
    action: "",
    mode: "idle",
    confidence: 0,
  };
}

function classifyEmotion(faceResult, brightness) {
  const blendshapes = faceResult?.faceBlendshapes?.[0]?.categories || [];
  const landmarks = faceResult?.faceLandmarks?.[0] || [];
  if (!landmarks.length) {
    return {
      id: "away",
      label: "离开",
      detail: "未检测到人脸",
      focusScore: 38,
      confidence: 0,
    };
  }

  const blendshapeMap = new Map(blendshapes.map((item) => [item.categoryName, item.score]));
  const smile = (getBlendshapeScore(blendshapeMap, "mouthSmileLeft") + getBlendshapeScore(blendshapeMap, "mouthSmileRight")) / 2;
  const blink = (getBlendshapeScore(blendshapeMap, "eyeBlinkLeft") + getBlendshapeScore(blendshapeMap, "eyeBlinkRight")) / 2;
  const browDown = (getBlendshapeScore(blendshapeMap, "browDownLeft") + getBlendshapeScore(blendshapeMap, "browDownRight")) / 2;
  const jawOpen = getBlendshapeScore(blendshapeMap, "jawOpen");

  let label = "专注";
  let detail = "脸部稳定，适合继续阅读";
  let focusScore = 82;
  let id = "focused";

  if (blink > 0.58 || jawOpen > 0.5) {
    id = "tired";
    label = "疲劳";
    detail = "检测到闭眼或打哈欠特征，建议短暂休息";
    focusScore = 54;
  } else if (browDown > 0.36 && smile < 0.18) {
    id = "confused";
    label = "困惑";
    detail = "眉部紧张，适合让 AI 解释当前内容";
    focusScore = 61;
  } else if (smile > 0.34) {
    id = "relaxed";
    label = "轻松";
    detail = "表情放松，适合保持当前节奏";
    focusScore = 78;
  }

  const normalizedBrightness = Math.max(0, Math.min(100, Math.round((brightness / 255) * 100)));
  if (normalizedBrightness < 22) {
    detail = `${detail}，但当前光线偏暗`;
    focusScore = Math.min(focusScore, 58);
  } else if (normalizedBrightness > 82) {
    detail = `${detail}，但当前光线偏强`;
    focusScore = Math.min(focusScore, 66);
  }

  return {
    id,
    label,
    detail,
    focusScore,
    confidence: Math.max(smile, blink, browDown, jawOpen, 0.65),
    raw: { smile, blink, browDown, jawOpen },
  };
}

async function analyzeFrame(video, options = {}) {
  const now = performance.now();
  if (!video || video.readyState < 2) return null;
  if (video.currentTime === lastVideoTime || now - lastFrameAt < visionRuntimeConfig.frameIntervalMs) return null;

  lastVideoTime = video.currentTime;
  lastFrameAt = now;

  const [gestureRecognizer, faceLandmarker] = await Promise.all([
    getGestureRecognizer(),
    getFaceLandmarker(),
  ]);

  const timestamp = Math.round(now);
  const gestureResult = gestureRecognizer.recognizeForVideo(video, timestamp);
  const faceResult = faceLandmarker.detectForVideo(video, timestamp);
  const faceLandmarks = faceResult?.faceLandmarks?.[0] || [];
  const hands = (gestureResult?.landmarks || []).map((landmarks, handIndex) => {
    const rawGesture = topCategory(gestureResult?.gestures?.[handIndex]);
    const rawHandedness = topCategory(gestureResult?.handedness?.[handIndex]);
    return {
      handIndex,
      landmarks,
      handedness: normalizeHandedness(rawHandedness),
      handednessScore: rawHandedness?.score || 0,
      rawGesture,
      indexTip: landmarks?.[8] || null,
      indexExtended: isFingerExtended(landmarks, 8, 6, 5),
    };
  });
  const gesture = createMouseGesture(hands);
  const emotion = classifyEmotion(faceResult, options.brightness || 0);

  return {
    ready: true,
    gesture,
    hands,
    faceLandmarks,
    emotion,
    hasFace: emotion.id !== "away",
    updatedAt: Date.now(),
  };
}

async function warmup() {
  await Promise.all([getGestureRecognizer(), getFaceLandmarker()]);
  return true;
}

function configure(options = {}) {
  const frameIntervalMs = Number(options.frameIntervalMs);
  if (Number.isFinite(frameIntervalMs) && frameIntervalMs >= 60 && frameIntervalMs <= 2000) {
    visionRuntimeConfig.frameIntervalMs = frameIntervalMs;
  }
  return { ...visionRuntimeConfig };
}

window.MindStudyVision = {
  analyzeFrame,
  configure,
  warmup,
};
