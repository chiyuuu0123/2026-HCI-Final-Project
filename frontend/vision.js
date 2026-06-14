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
  gestureVoteWindowMs: 1000,
  emotionVoteWindowMs: 1000,
  pinchDistanceMax: 0.055,
};

const emotionRuntimeConfig = {
  eyeClosedThreshold: 0.58,
  tiredEyeClosedMs: 1200,
  yawnThreshold: 0.5,
  distractedEyeMovementWindowMs: 1000,
  distractedEyeMovementMax: 0.018,
  distractedEyeOpenMax: 0.2,
  distractedNoBlinkMs: 1000,
  anxiousBrowDownThreshold: 0.36,
  confusedHeadTiltDegrees: 12,
  relaxedSmileThreshold: 0.34,
  relaxedBrowMax: 0.22,
  relaxedEyeClosedMax: 0.35,
  relaxedJawOpenMax: 0.28,
};

const emotionRuntimeState = {
  eyeClosedSince: 0,
  lastDistractedBlinkAt: 0,
  eyeMovementSamples: [],
  gestureVotes: [],
  emotionVotes: [],
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

function getHeadTiltDegrees(landmarks) {
  const leftEye = landmarks?.[33];
  const rightEye = landmarks?.[263];
  if (!leftEye || !rightEye) return 0;
  return Math.abs(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180 / Math.PI);
}

function getEyeCenter(landmarks) {
  const left = landmarks?.[468] || landmarks?.[33];
  const right = landmarks?.[473] || landmarks?.[263];
  return midpoint(left, right);
}

function updateEyeMovementAmplitude(landmarks, now) {
  const center = getEyeCenter(landmarks);
  if (!center) {
    emotionRuntimeState.eyeMovementSamples = [];
    return 0;
  }
  const samples = emotionRuntimeState.eyeMovementSamples;
  samples.push({ at: now, point: center });
  while (samples.length && now - samples[0].at > emotionRuntimeConfig.distractedEyeMovementWindowMs) {
    samples.shift();
  }
  if (samples.length < 2) return 0;
  const xs = samples.map((sample) => sample.point.x);
  const ys = samples.map((sample) => sample.point.y);
  return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function landmarkDistance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function midpoint(a, b) {
  if (!a || !b) return null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z || 0) + (b.z || 0)) / 2,
  };
}

function createPinchInfo(landmarks) {
  const thumbTip = landmarks?.[4];
  const indexTip = landmarks?.[8];
  if (!thumbTip || !indexTip) {
    return { active: false, point: null, distance: 1 };
  }
  const distance = landmarkDistance(thumbTip, indexTip);
  return {
    active: distance <= visionRuntimeConfig.pinchDistanceMax,
    point: midpoint(thumbTip, indexTip),
    distance,
  };
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
  const rightRawName = rightHand?.rawGesture?.name;
  const rightScore = Number(rightHand?.rawGesture?.score) || 0;
  const rightPinch = rightHand?.pinch || null;

  if (leftRawName === "Thumb_Up" && leftScore >= 0.5) {
    return {
      id: "left-thumb-click",
      label: "\u5de6\u624b\u70b9\u8d5e",
      action: "\u9f20\u6807\u5de6\u952e",
      mode: "click",
      confidence: leftScore,
    };
  }

  if (rightRawName === "Thumb_Up" && rightScore >= 0.5) {
    return {
      id: "right-thumb-up-scroll-up",
      label: "\u53f3\u624b\u70b9\u8d5e",
      action: "\u9f20\u6807\u5411\u4e0a\u6eda\u52a8",
      mode: "scroll-up",
      confidence: rightScore,
    };
  }

  if (rightRawName === "Thumb_Down" && rightScore >= 0.5) {
    return {
      id: "right-thumb-down-scroll-down",
      label: "\u53f3\u624b\u5012\u8d5e",
      action: "\u9f20\u6807\u5411\u4e0b\u6eda\u52a8",
      mode: "scroll-down",
      confidence: rightScore,
    };
  }

  if (rightPinch?.active && rightPinch.point) {
    return {
      id: "right-pinch-pointer",
      label: "\u53f3\u624b\u62c7\u6307+\u98df\u6307\u634f\u5408",
      action: "\u9f20\u6807\u79fb\u52a8",
      mode: "point",
      point: rightPinch.point,
      confidence: Math.max(0.62, 1 - (rightPinch.distance / Math.max(0.001, visionRuntimeConfig.pinchDistanceMax))),
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
  const now = performance.now();
  const blendshapes = faceResult?.faceBlendshapes?.[0]?.categories || [];
  const landmarks = faceResult?.faceLandmarks?.[0] || [];
  if (!landmarks.length) {
    emotionRuntimeState.eyeClosedSince = 0;
    emotionRuntimeState.lastDistractedBlinkAt = 0;
    emotionRuntimeState.eyeMovementSamples = [];
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
  const headTiltDegrees = getHeadTiltDegrees(landmarks);
  const eyeMovementAmplitude = updateEyeMovementAmplitude(landmarks, now);
  const isEyeClosed = blink > emotionRuntimeConfig.eyeClosedThreshold;
  if (blink >= emotionRuntimeConfig.distractedEyeOpenMax) {
    emotionRuntimeState.lastDistractedBlinkAt = now;
  }
  if (isEyeClosed) {
    if (!emotionRuntimeState.eyeClosedSince) emotionRuntimeState.eyeClosedSince = now;
  } else {
    emotionRuntimeState.eyeClosedSince = 0;
  }
  const eyeClosedMs = emotionRuntimeState.eyeClosedSince ? now - emotionRuntimeState.eyeClosedSince : 0;
  const isLongEyeClosed = eyeClosedMs >= emotionRuntimeConfig.tiredEyeClosedMs;
  const isYawning = jawOpen > emotionRuntimeConfig.yawnThreshold;
  const hasEnoughEyeSamples = emotionRuntimeState.eyeMovementSamples.length >= 3;
  const hasRecentBlink =
    emotionRuntimeState.lastDistractedBlinkAt > 0 &&
    now - emotionRuntimeState.lastDistractedBlinkAt < emotionRuntimeConfig.distractedNoBlinkMs;
  const isDistracted =
    hasEnoughEyeSamples &&
    eyeMovementAmplitude < emotionRuntimeConfig.distractedEyeMovementMax &&
    blink < emotionRuntimeConfig.distractedEyeOpenMax &&
    !hasRecentBlink;
  const isAnxious = browDown > emotionRuntimeConfig.anxiousBrowDownThreshold;
  const isConfused = headTiltDegrees > emotionRuntimeConfig.confusedHeadTiltDegrees;
  const isRelaxed =
    smile > emotionRuntimeConfig.relaxedSmileThreshold &&
    browDown < emotionRuntimeConfig.relaxedBrowMax &&
    blink < emotionRuntimeConfig.relaxedEyeClosedMax &&
    jawOpen < emotionRuntimeConfig.relaxedJawOpenMax;

  let label = "专注";
  let detail = "脸部稳定，适合继续阅读";
  let focusScore = 82;
  let id = "focused";

  if (isLongEyeClosed || isYawning) {
    id = "tired";
    label = "疲劳";
    detail = isLongEyeClosed ? "检测到持续闭眼，建议短暂休息" : "检测到打哈欠特征，建议短暂休息";
    focusScore = 54;
  } else if (isDistracted) {
    id = "distracted";
    label = "走神";
    detail = "最近眼球移动幅度较小，建议重新聚焦当前任务";
    focusScore = 57;
  } else if (isAnxious) {
    id = "anxious";
    label = "焦虑";
    detail = "检测到皱眉特征，建议放慢节奏并拆解当前任务";
    focusScore = 60;
  } else if (isConfused) {
    id = "confused";
    label = "疑惑";
    detail = "检测到头部倾斜，适合让 AI 解释当前内容";
    focusScore = 61;
  } else if (isRelaxed) {
    id = "relaxed";
    label = "轻松";
    detail = "检测到稳定微笑，且没有明显皱眉、闭眼或张嘴特征，适合保持当前节奏";
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
    confidence: Math.max(smile, blink, browDown, jawOpen, Math.min(1, headTiltDegrees / 45), 0.65),
    raw: { smile, blink, browDown, jawOpen, headTiltDegrees, eyeClosedMs, eyeMovementAmplitude },
  };
}

function pruneVotes(votes, now, windowMs) {
  while (votes.length && now - votes[0].at > windowMs) {
    votes.shift();
  }
}

function getMajorityVote(votes) {
  if (!votes.length) return null;
  const counts = new Map();
  votes.forEach((item, index) => {
    const id = item.value?.id || "none";
    const current = counts.get(id) || { count: 0, latestIndex: -1, latest: item.value };
    current.count += 1;
    current.latestIndex = index;
    current.latest = item.value;
    counts.set(id, current);
  });

  return [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.latestIndex - a.latestIndex;
  })[0]?.latest || null;
}

function voteRecognitionResult(votes, value, windowMs, now) {
  votes.push({ at: now, value });
  pruneVotes(votes, now, windowMs);
  return getMajorityVote(votes) || value;
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
      pinch: createPinchInfo(landmarks),
    };
  });
  const rawGesture = createMouseGesture(hands);
  const rawEmotion = classifyEmotion(faceResult, options.brightness || 0);
  const gesture = voteRecognitionResult(
    emotionRuntimeState.gestureVotes,
    rawGesture,
    visionRuntimeConfig.gestureVoteWindowMs,
    now,
  );
  const emotion = voteRecognitionResult(
    emotionRuntimeState.emotionVotes,
    rawEmotion,
    visionRuntimeConfig.emotionVoteWindowMs,
    now,
  );

  return {
    ready: true,
    gesture,
    rawGesture,
    hands,
    faceLandmarks,
    emotion,
    rawEmotion,
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
  const gestureVoteWindowMs = Number(options.gestureVoteWindowMs);
  if (Number.isFinite(gestureVoteWindowMs) && gestureVoteWindowMs >= 0 && gestureVoteWindowMs <= 5000) {
    visionRuntimeConfig.gestureVoteWindowMs = gestureVoteWindowMs;
  }
  const emotionVoteWindowMs = Number(options.emotionVoteWindowMs);
  if (Number.isFinite(emotionVoteWindowMs) && emotionVoteWindowMs >= 0 && emotionVoteWindowMs <= 5000) {
    visionRuntimeConfig.emotionVoteWindowMs = emotionVoteWindowMs;
  }
  const pinchDistanceMax = Number(options.pinchDistanceMax);
  if (Number.isFinite(pinchDistanceMax) && pinchDistanceMax >= 0.005 && pinchDistanceMax <= 0.2) {
    visionRuntimeConfig.pinchDistanceMax = pinchDistanceMax;
  }
  const eyeClosedThreshold = Number(options.eyeClosedThreshold);
  if (Number.isFinite(eyeClosedThreshold) && eyeClosedThreshold >= 0 && eyeClosedThreshold <= 1) {
    emotionRuntimeConfig.eyeClosedThreshold = eyeClosedThreshold;
  }
  const tiredEyeClosedMs = Number(options.tiredEyeClosedMs);
  if (Number.isFinite(tiredEyeClosedMs) && tiredEyeClosedMs >= 0 && tiredEyeClosedMs <= 10000) {
    emotionRuntimeConfig.tiredEyeClosedMs = tiredEyeClosedMs;
  }
  const yawnThreshold = Number(options.yawnThreshold);
  if (Number.isFinite(yawnThreshold) && yawnThreshold >= 0 && yawnThreshold <= 1) {
    emotionRuntimeConfig.yawnThreshold = yawnThreshold;
  }
  const distractedEyeMovementWindowMs = Number(options.distractedEyeMovementWindowMs);
  if (Number.isFinite(distractedEyeMovementWindowMs) && distractedEyeMovementWindowMs >= 200 && distractedEyeMovementWindowMs <= 10000) {
    emotionRuntimeConfig.distractedEyeMovementWindowMs = distractedEyeMovementWindowMs;
  }
  const distractedEyeMovementMax = Number(options.distractedEyeMovementMax);
  if (Number.isFinite(distractedEyeMovementMax) && distractedEyeMovementMax >= 0 && distractedEyeMovementMax <= 0.2) {
    emotionRuntimeConfig.distractedEyeMovementMax = distractedEyeMovementMax;
  }
  const distractedEyeOpenMax = Number(options.distractedEyeOpenMax);
  if (Number.isFinite(distractedEyeOpenMax) && distractedEyeOpenMax >= 0 && distractedEyeOpenMax <= 1) {
    emotionRuntimeConfig.distractedEyeOpenMax = distractedEyeOpenMax;
  }
  const distractedNoBlinkMs = Number(options.distractedNoBlinkMs);
  if (Number.isFinite(distractedNoBlinkMs) && distractedNoBlinkMs >= 0 && distractedNoBlinkMs <= 5000) {
    emotionRuntimeConfig.distractedNoBlinkMs = distractedNoBlinkMs;
  }
  const anxiousBrowDownThreshold = Number(options.anxiousBrowDownThreshold);
  if (Number.isFinite(anxiousBrowDownThreshold) && anxiousBrowDownThreshold >= 0 && anxiousBrowDownThreshold <= 1) {
    emotionRuntimeConfig.anxiousBrowDownThreshold = anxiousBrowDownThreshold;
  }
  const confusedHeadTiltDegrees = Number(options.confusedHeadTiltDegrees);
  if (Number.isFinite(confusedHeadTiltDegrees) && confusedHeadTiltDegrees >= 0 && confusedHeadTiltDegrees <= 45) {
    emotionRuntimeConfig.confusedHeadTiltDegrees = confusedHeadTiltDegrees;
  }
  const relaxedSmileThreshold = Number(options.relaxedSmileThreshold);
  if (Number.isFinite(relaxedSmileThreshold) && relaxedSmileThreshold >= 0 && relaxedSmileThreshold <= 1) {
    emotionRuntimeConfig.relaxedSmileThreshold = relaxedSmileThreshold;
  }
  const relaxedBrowMax = Number(options.relaxedBrowMax);
  if (Number.isFinite(relaxedBrowMax) && relaxedBrowMax >= 0 && relaxedBrowMax <= 1) {
    emotionRuntimeConfig.relaxedBrowMax = relaxedBrowMax;
  }
  const relaxedEyeClosedMax = Number(options.relaxedEyeClosedMax);
  if (Number.isFinite(relaxedEyeClosedMax) && relaxedEyeClosedMax >= 0 && relaxedEyeClosedMax <= 1) {
    emotionRuntimeConfig.relaxedEyeClosedMax = relaxedEyeClosedMax;
  }
  const relaxedJawOpenMax = Number(options.relaxedJawOpenMax);
  if (Number.isFinite(relaxedJawOpenMax) && relaxedJawOpenMax >= 0 && relaxedJawOpenMax <= 1) {
    emotionRuntimeConfig.relaxedJawOpenMax = relaxedJawOpenMax;
  }
  return { ...visionRuntimeConfig, emotion: { ...emotionRuntimeConfig } };
}

window.LongMindStudyVision = {
  analyzeFrame,
  configure,
  warmup,
};
