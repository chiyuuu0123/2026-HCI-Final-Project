# 识别功能说明

## 双手鼠标控制

当前手势识别最多处理两只手。手势识别只用于应用内虚拟鼠标控制。

| 控制 | 触发条件 | 应用内动作 |
| --- | --- | --- |
| 鼠标移动 | 检测到右手，且右手食指指尖存在并判断为伸直 | 应用内虚拟鼠标跟随右手食指指尖移动 |
| 鼠标左键 | 检测到左手，且 MediaPipe 返回 `Thumb_Up`，置信度达到阈值 | 在当前虚拟鼠标位置触发一次应用内点击 |
| 滚轮滑动 | 检测到左手 `Closed_Fist`，同时检测到右手食指指尖 | 根据右手食指指尖上下位移触发应用内滚动 |

说明：
- 当前实现控制的是 MindStudy 应用内虚拟鼠标，不移动 Windows 系统鼠标。
- 左手点赞的点击有短防抖，避免连续触发。
- 左手握拳进入滚动模式后，右手食指向下移动对应向下滚动，向上移动对应向上滚动。
- 双手的左右由 MediaPipe `handedness` 结果判断。

## 情绪触发条件

| 状态 | 触发条件 | 页面反馈 |
| --- | --- | --- |
| 专注 | 检测到人脸，且没有明显疲劳、困惑或放松特征 | 显示专注状态，并给出较高专注分 |
| 疲劳 | 闭眼 blendshape 持续超过约 1.2 秒，或张嘴 blendshape 较高 | 提醒短暂休息，并降低专注分 |
| 困惑 | 皱眉 blendshape 较高，同时微笑特征较低 | 建议让 AI 解释当前资料 |
| 放松 | 左右嘴角微笑 blendshape 较高，同时皱眉、闭眼、张嘴特征都较低 | 保持当前学习节奏，并推荐平稳音乐 |
| 离开 | 没有检测到人脸关键点 | 显示离开状态，降低学习状态可信度 |
| 光线偏暗 | 摄像头画面平均亮度较低 | 降低专注分，并提示补光 |
| 光线偏强 | 摄像头画面平均亮度较高 | 降低专注分，并提示降低环境光或屏幕亮度 |

这些状态只作为学习状态提示，不作为医学或心理诊断。

### 疲劳和放松的细化逻辑

- 普通眨眼不会触发“疲劳”。系统会记录闭眼开始时间，只有 `eyeBlinkLeft` 和 `eyeBlinkRight` 的平均值持续高于阈值约 1.2 秒，才判断为持续闭眼并进入“疲劳”。
- 张嘴特征仍可单独触发“疲劳”，用于覆盖明显打哈欠场景。
- “放松”不是只看微笑。当前逻辑要求嘴角微笑较明显，同时皱眉、闭眼、张嘴特征都较低，避免把苦笑、闭眼笑或说话时的表情误判为轻松。

## `.env` 可调参数

配置文件位置：

```text
frontend/.env
```

当前配置：

```env
VISION_FRAME_INTERVAL_MS=20
SHOW_VISION_LANDMARKS=false
GESTURE_POINTER_SCALE=1
GESTURE_POINTER_X_MIN=0.5
GESTURE_POINTER_X_MAX=1
GESTURE_POINTER_Y_MIN=0.2
GESTURE_POINTER_Y_MAX=0.8
EMOTION_RELAXED_SMILE_THRESHOLD=0.34
EMOTION_RELAXED_BROW_MAX=0.22
EMOTION_RELAXED_EYE_CLOSED_MAX=0.35
EMOTION_RELAXED_JAW_OPEN_MAX=0.28
```

| 参数 | 默认值 | 应用限制范围 | 作用 |
| --- | --- | --- | --- |
| `VISION_FRAME_INTERVAL_MS` | `180` | `60` 到 `2000` 毫秒 | 摄像头采样和 MediaPipe 视频帧分析间隔。数值越小越灵敏，但 CPU 占用越高。 |
| `SHOW_VISION_LANDMARKS` | `false` | `true` / `false` | 是否在摄像头预览中叠加显示检测到的手部和脸部关键点。 |
| `GESTURE_POINTER_SCALE` | `1` | `0.2` 到 `3` | 虚拟指针映射缩放系数，对应 `screenX = (1 - point.x) * 窗口宽度 * k`，`screenY = point.y * 窗口高度 * k`。 |
| `GESTURE_POINTER_X_MIN` | `0` | `0` 到 `1` | 摄像头横向映射区域左边界。 |
| `GESTURE_POINTER_X_MAX` | `1` | `0` 到 `1` | 摄像头横向映射区域右边界。 |
| `GESTURE_POINTER_Y_MIN` | `0` | `0` 到 `1` | 摄像头纵向映射区域上边界。 |
| `GESTURE_POINTER_Y_MAX` | `1` | `0` 到 `1` | 摄像头纵向映射区域下边界。 |
| `EMOTION_RELAXED_SMILE_THRESHOLD` | `0.34` | `0` 到 `1` | 触发“轻松”状态所需的最低微笑 blendshape 平均值。数值越高，越不容易触发轻松。 |
| `EMOTION_RELAXED_BROW_MAX` | `0.22` | `0` 到 `1` | 触发“轻松”状态允许的最大皱眉 blendshape 平均值。数值越低，皱眉时越不容易误判为轻松。 |
| `EMOTION_RELAXED_EYE_CLOSED_MAX` | `0.35` | `0` 到 `1` | 触发“轻松”状态允许的最大闭眼 blendshape 平均值。数值越低，闭眼或眨眼时越不容易误判为轻松。 |
| `EMOTION_RELAXED_JAW_OPEN_MAX` | `0.28` | `0` 到 `1` | 触发“轻松”状态允许的最大张嘴 blendshape 值。数值越低，说话或张嘴时越不容易误判为轻松。 |

修改 `frontend/.env` 后，需要重启 Electron 应用才会生效。

## 实现方式

- `frontend/vision.js` 将 MediaPipe `GestureRecognizer` 的 `numHands` 设置为 `2`，并返回每只手的 `handedness`、原始手势、关键点和右手食指状态。
- `frontend/vision.js` 根据左手 `Thumb_Up`、左手 `Closed_Fist`、右手食指指尖组合生成鼠标控制状态。
- `frontend/app.js` 根据控制状态移动应用内虚拟鼠标、触发点击或滚动当前可滚动区域。
- `frontend/index.html` 和 `frontend/styles.css` 负责展示控制状态、摄像头关键点和虚拟鼠标。
