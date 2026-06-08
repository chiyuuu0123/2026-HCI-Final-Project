# 龙龙固定语音包

当前版本不再在软件交互时实时生成龙龙语音。桌宠和主窗口 AI 对话会播放已经放进项目里的固定音频，用于上线问候、摸摸反馈、学习提醒、AI 思考提示和回答开场。

## 已内置音频

固定音频位于：

```text
frontend/assets/longlong-voice
```

当前使用的文件：

```text
boot-01.wav
boot-02.wav
boot-03.wav
boot-04.wav
boot-05.wav
boot-06.wav
poke-01.wav
poke-02.wav
poke-03.wav
poke-04.wav
poke-05.wav
poke-06.wav
poke-07.wav
poke-08.wav
tip-01.wav
tip-02.wav
tip-03.wav
tip-04.wav
tip-05.wav
tip-06.wav
tip-07.wav
tip-08.wav
tip-09.wav
tip-10.wav
ai-thinking.wav
ai-answer.wav
```

前端在 `frontend/companion.html` 里用固定文案查表播放桌宠音频；主窗口在 `frontend/app.js` 里播放 AI 思考和回答开场音频。没有对应音频的文字只显示气泡或 Markdown，不会再回退到系统朗读，也不会临时调用语音合成。

## 以后要新增固定语音

如果之后想补几句新的龙龙问候或提醒，可以临时启动本地 GPT-SoVITS 服务生成 `.wav`，生成后把音频文件放到 `frontend/assets/longlong-voice`，再在 `frontend/companion.html` 的 `hardcodedLonglongAudio` 里添加一条映射。

启动本地服务：

```powershell
npm run voice:api
```

测试生成一段语音：

```powershell
npm run voice:test -- "龙龙提醒你，休息五分钟再继续。"
```

共享服务器和客户端脚本仍然保留，用于以后批量制作固定音频；日常运行软件不需要启动它们。
