# 识别功能说明

## 双手鼠标控制

当前手势识别最多处理两只手。手势识别用于应用内虚拟鼠标控制。

| 控制 | 触发条件 | 应用内动作 |
| --- | --- | --- |
| 鼠标移动 | 检测到右手，且右手大拇指指尖与食指指尖距离小于 `GESTURE_PINCH_DISTANCE_MAX` | 根据两指捏合中点的位移相对移动应用内虚拟鼠标 |
| 鼠标左键 | 检测到左手，且 MediaPipe 返回 `Thumb_Up`，置信度达到阈值 | 在当前虚拟鼠标位置触发一次应用内点击 |
| 向上滚动 | 检测到右手，且 MediaPipe 返回 `Thumb_Up`，置信度达到阈值 | 当前可滚动区域向上滚动 |
| 向下滚动 | 检测到右手，且 MediaPipe 返回 `Thumb_Down`，置信度达到阈值 | 当前可滚动区域向下滚动 |

说明：

- 当前实现控制的是 MindStudy 应用内虚拟鼠标，不移动 Windows 系统鼠标。
- 左手点赞的点击有短防抖，避免连续触发。
- 右手捏合移动是相对位移控制：第一次捏合只建立当前位置，之后根据捏合点在摄像头画面中的位移增量移动指针。
- 右手点赞和倒赞进入固定方向滚动模式，不再使用“左手握拳 + 右手食指上下移动”。
- 右手点赞/倒赞滚动增加了稳定判定：同一方向需要连续保持 `GESTURE_SCROLL_STABLE_MS` 毫秒后才开始滚动，滚动过程中每 `GESTURE_SCROLL_INTERVAL_MS` 毫秒最多触发一次，每次滚动 `GESTURE_SCROLL_AMOUNT` 像素。
- 双手的左右由 MediaPipe `handedness` 结果判断。
- 手势最终状态采用过去 `GESTURE_VOTE_WINDOW_MS` 毫秒内识别结果的众数，降低单帧误判。

## 情绪触发条件

| 状态 | 触发条件 | 页面反馈 |
| --- | --- | --- |
| 专注 | 检测到人脸，且没有命中疲劳、走神、焦虑、疑惑或轻松条件 | 显示专注状态，并给出较高专注分 |
| 疲劳 | `blink > EMOTION_EYE_CLOSED_THRESHOLD` 持续超过 `EMOTION_TIRED_EYE_CLOSED_MS`，或 `jawOpen > EMOTION_YAWN_THRESHOLD` | 提醒短暂休息，并降低专注分 |
| 走神 | 最近 `EMOTION_DISTRACTED_EYE_MOVEMENT_WINDOW_MS` 毫秒内 `eyeMovementAmplitude < EMOTION_DISTRACTED_EYE_MOVEMENT_MAX && blink < EMOTION_DISTRACTED_EYE_OPEN_MAX`，且最近 `EMOTION_DISTRACTED_NO_BLINK_MS` 毫秒内没有眨眼 | 提醒重新聚焦当前任务 |
| 焦虑 | `browDown > EMOTION_ANXIOUS_BROW_DOWN_THRESHOLD` | 建议放慢节奏并拆解当前任务 |
| 疑惑 | `headTiltDegrees > EMOTION_CONFUSED_HEAD_TILT_DEGREES` | 建议让 AI 解释当前资料 |
| 轻松 | `smile > EMOTION_RELAXED_SMILE_THRESHOLD && browDown < EMOTION_RELAXED_BROW_MAX && blink < EMOTION_RELAXED_EYE_CLOSED_MAX && jawOpen < EMOTION_RELAXED_JAW_OPEN_MAX` | 保持当前学习节奏，并推荐平稳音乐 |
| 离开 | 没有检测到人脸关键点 | 显示离开状态，降低学习状态可信度 |
| 光线偏暗 | 摄像头画面平均亮度较低 | 降低专注分，并提示补光 |
| 光线偏强 | 摄像头画面平均亮度较高 | 降低专注分，并提示降低环境光或屏幕亮度 |

这些状态只作为学习状态提示，不作为医学或心理诊断。

## 细化逻辑

- 普通眨眼不会触发“疲劳”。系统会记录闭眼开始时间，只有 `eyeBlinkLeft` 和 `eyeBlinkRight` 的平均值持续高于阈值，才判断为持续闭眼并进入“疲劳”。
- “走神”现在要求眼球基本不动，同时眼睛保持睁开，并且最近一段时间没有眨眼。也就是说，眨眼、闭眼或长时间闭眼不会被当作走神，而会分别落入普通帧、疲劳等逻辑。
- “焦虑”由皱眉触发，“疑惑”由头部倾斜触发。
- “轻松”不只看微笑，还要求皱眉、闭眼和张嘴特征都较低，避免把苦笑、闭眼笑或说话时的表情误判为轻松。
- 情绪最终状态采用过去 `EMOTION_VOTE_WINDOW_MS` 毫秒内识别结果的众数，降低单帧误判。

## `.env` 可调参数

配置文件位置：

```text
frontend/.env
```

当前配置示例：

```env
VISION_FRAME_INTERVAL_MS=10
GESTURE_VOTE_WINDOW_MS=1000
EMOTION_VOTE_WINDOW_MS=1000
GESTURE_PINCH_DISTANCE_MAX=0.055
SHOW_VISION_LANDMARKS=true
GESTURE_POINTER_SCALE=1
GESTURE_POINTER_RELATIVE_SENSITIVITY=2
GESTURE_POINTER_RELATIVE_DEAD_ZONE=0.002
GESTURE_SCROLL_INTERVAL_MS=180
GESTURE_SCROLL_AMOUNT=120
GESTURE_SCROLL_STABLE_MS=220
GESTURE_POINTER_X_MIN=0.1
GESTURE_POINTER_X_MAX=0.8
GESTURE_POINTER_Y_MIN=0.2
GESTURE_POINTER_Y_MAX=0.8
EMOTION_EYE_CLOSED_THRESHOLD=0.58
EMOTION_TIRED_EYE_CLOSED_MS=1200
EMOTION_YAWN_THRESHOLD=0.5
EMOTION_DISTRACTED_EYE_MOVEMENT_WINDOW_MS=10000
EMOTION_DISTRACTED_EYE_MOVEMENT_MAX=0.018
EMOTION_DISTRACTED_EYE_OPEN_MAX=0.2
EMOTION_DISTRACTED_NO_BLINK_MS=1000
EMOTION_ANXIOUS_BROW_DOWN_THRESHOLD=0.05
EMOTION_CONFUSED_HEAD_TILT_DEGREES=24
EMOTION_RELAXED_SMILE_THRESHOLD=0.1
EMOTION_RELAXED_BROW_MAX=1
EMOTION_RELAXED_EYE_CLOSED_MAX=1
EMOTION_RELAXED_JAW_OPEN_MAX=0.28
```

| 参数 | 默认值 | 应用限制范围 | 作用 |
| --- | --- | --- | --- |
| `VISION_FRAME_INTERVAL_MS` | `180` | `60` 到 `2000` 毫秒 | 摄像头采样和 MediaPipe 视频帧分析间隔。数值越小越灵敏，但 CPU 占用越高。 |
| `GESTURE_VOTE_WINDOW_MS` | `1000` | `0` 到 `5000` 毫秒 | 手势识别众数投票窗口。 |
| `EMOTION_VOTE_WINDOW_MS` | `1000` | `0` 到 `5000` 毫秒 | 情绪识别众数投票窗口。 |
| `GESTURE_PINCH_DISTANCE_MAX` | `0.055` | `0.005` 到 `0.2` | 右手大拇指和食指指尖距离小于该值时，判定为捏合移动手势。 |
| `SHOW_VISION_LANDMARKS` | `false` | `true` / `false` | 是否在摄像头预览中叠加显示检测到的手部和脸部关键点。 |
| `GESTURE_POINTER_RELATIVE_SENSITIVITY` | `1.8` | `0.1` 到 `8` | 捏合相对移动灵敏度。 |
| `GESTURE_POINTER_RELATIVE_DEAD_ZONE` | `0.002` | `0` 到 `0.05` | 捏合相对移动死区，用于过滤小幅抖动。 |
| `GESTURE_SCROLL_INTERVAL_MS` | `180` | `16` 到 `1000` 毫秒 | 右手点赞/倒赞滚轮触发的最小间隔。数值越大，滚动越慢也越稳。 |
| `GESTURE_SCROLL_AMOUNT` | `120` | `10` 到 `800` 像素 | 每次手势滚动的像素量。 |
| `GESTURE_SCROLL_STABLE_MS` | `220` | `0` 到 `1000` 毫秒 | 右手点赞/倒赞需要连续稳定保持多久后才开始滚动。 |
| `GESTURE_POINTER_SCALE` | `1` | `0.2` 到 `3` | 旧绝对映射缩放参数；当前右手捏合移动不再使用该参数。 |
| `GESTURE_POINTER_X_MIN` | `0` | `0` 到 `1` | 旧绝对映射横向区域左边界；当前右手捏合移动不再使用该参数。 |
| `GESTURE_POINTER_X_MAX` | `1` | `0` 到 `1` | 旧绝对映射横向区域右边界；当前右手捏合移动不再使用该参数。 |
| `GESTURE_POINTER_Y_MIN` | `0` | `0` 到 `1` | 旧绝对映射纵向区域上边界；当前右手捏合移动不再使用该参数。 |
| `GESTURE_POINTER_Y_MAX` | `1` | `0` 到 `1` | 旧绝对映射纵向区域下边界；当前右手捏合移动不再使用该参数。 |
| `EMOTION_EYE_CLOSED_THRESHOLD` | `0.58` | `0` 到 `1` | 判断闭眼的 `eyeBlinkLeft/right` 平均值阈值。 |
| `EMOTION_TIRED_EYE_CLOSED_MS` | `1200` | `0` 到 `10000` 毫秒 | 闭眼持续多长时间后触发“疲劳”。 |
| `EMOTION_YAWN_THRESHOLD` | `0.5` | `0` 到 `1` | 触发“疲劳”的张嘴或打哈欠阈值。 |
| `EMOTION_DISTRACTED_EYE_MOVEMENT_WINDOW_MS` | `1000` | `200` 到 `10000` 毫秒 | 判断“走神”时统计眼球移动幅度的时间窗口。 |
| `EMOTION_DISTRACTED_EYE_MOVEMENT_MAX` | `0.018` | `0` 到 `0.2` | 触发“走神”的最大眼球移动幅度。 |
| `EMOTION_DISTRACTED_EYE_OPEN_MAX` | `0.2` | `0` 到 `1` | 触发“走神”时允许的最大 blink 值。数值越低，越要求眼睛稳定睁开。 |
| `EMOTION_DISTRACTED_NO_BLINK_MS` | `1000` | `0` 到 `5000` 毫秒 | 触发“走神”前要求最近多久没有出现眨眼帧。 |
| `EMOTION_ANXIOUS_BROW_DOWN_THRESHOLD` | `0.36` | `0` 到 `1` | 触发“焦虑”的皱眉 blendshape 平均值阈值。 |
| `EMOTION_CONFUSED_HEAD_TILT_DEGREES` | `12` | `0` 到 `45` 度 | 触发“疑惑”的头部倾斜角阈值。 |
| `EMOTION_RELAXED_SMILE_THRESHOLD` | `0.34` | `0` 到 `1` | 触发“轻松”状态所需的最低微笑 blendshape 平均值。 |
| `EMOTION_RELAXED_BROW_MAX` | `0.22` | `0` 到 `1` | 触发“轻松”状态允许的最大皱眉 blendshape 平均值。 |
| `EMOTION_RELAXED_EYE_CLOSED_MAX` | `0.35` | `0` 到 `1` | 触发“轻松”状态允许的最大闭眼 blendshape 平均值。 |
| `EMOTION_RELAXED_JAW_OPEN_MAX` | `0.28` | `0` 到 `1` | 触发“轻松”状态允许的最大张嘴 blendshape 值。 |

修改 `frontend/.env` 后，需要重启 Electron 应用才会生效。

## 实现方式

- `frontend/vision.js` 将 MediaPipe `GestureRecognizer` 的 `numHands` 设置为 `2`，并返回每只手的 `handedness`、原始手势、关键点和右手捏合状态。
- `frontend/vision.js` 根据左手 `Thumb_Up`、右手拇指与食指捏合、右手 `Thumb_Up`、右手 `Thumb_Down` 生成鼠标控制状态。
- `frontend/vision.js` 对手势和情绪分别维护时间窗口内的识别历史，并使用众数投票输出稳定状态。
- `frontend/app.js` 根据控制状态移动应用内虚拟鼠标、触发点击或按固定方向滚动当前可滚动区域。
- `frontend/app.js` 对右手点赞/倒赞滚动增加方向稳定时间、滚动间隔和滚动步长控制，减少边界姿态导致的上下抖动。
- `frontend/index.html` 和 `frontend/styles.css` 负责展示控制状态、摄像头关键点和虚拟鼠标。
