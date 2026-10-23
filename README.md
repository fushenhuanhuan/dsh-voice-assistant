# 语音助手 · DSH Voice Assistant

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web 界面加一个免手持语音入口：
**说话 → 自动转写 → 自动发送 → 朗读回答 → 继续听**，也可以直接用唤醒词叫起来。

回答默认用**小米 MiMo 流式音色**朗读（首段音频约 0.5–0.7 秒到达），MiMo 不可用时依次退回**微软 Edge 音色**和**系统语音**。

## 功能

- **语音提问**：点麦克风说一句，停顿约 1 秒自动结束录音、转写并发送（走宿主 Composer 自己的提交路径，和按回车等价）。
- **自动朗读**：回答定型后朗读正文；代码块跳过，过长只读前 900 字。「朗读回答」关掉就只发不念。
- **唤醒词「你好大肥鱼」**：开着开关时，本地检测到这句就开始对话，不用碰鼠标键盘。
- **连续对话**：回答结束自动重新聆听，可以直接追问。
- **播放按钮**：每条助手回答的操作栏里有一个播放 / 停止按钮，随时重听这一条。
- **三个朗读引擎**：MiMo（低延迟流式 / 清晰整句）、Edge、系统离线语音，失败自动降级。
- **设置面板**：唤醒词、连续对话、朗读、引擎、模式、音色、语速、录音上限、恢复默认。

## 安装

**前提**

1. DSH 桌面端（本插件在 `0.2.1-rc.2` 上开发与验证）；
2. 已启用官方「语音输入」插件（`@deepseek-ai/dsh-experimental-voice-input-bundle`，提供 SenseVoice 转写）。没有它时本插件保持静默，不报错也不出现状态条。

**步骤**

```bash
git clone https://github.com/fushenhuanhuan/dsh-voice-assistant.git
```

然后在 DSH 里把这个目录装成本地 bundle：让 DSH 的 agent 用插件管理器安装该目录的绝对路径（`install_bundle`）。DSH 会把它**链接**进当前 profile，不复制文件，之后在「设置 → 插件」里能看到「语音助手」，可以随时停用或卸载。

装完刷新页面，输入框下方会出现状态条。

> 这是一个本地 bundle，包名是 `@local/voice-assistant`（`private: true`，不会发到 npm）。
> 想换名字要同时改 `package.json` 的 `name` 和 `client.js` 里 `__ModuleLoader__.load({ id })`，然后重新安装。

## 用法

- 状态条左边是麦克风按钮，右边是「唤醒词」「连续对话」「朗读回答」三个开关（真正的 `role="switch"`）。
- 点麦克风开始：说一句话，停顿约 1 秒自动结束并发送。
- 打开「唤醒词」后说 **你好大肥鱼**：听到提示音直接说问题。
- 快捷键 `Ctrl+Shift+Space` 开始 / 结束，`Esc` 结束。
- 助手回答结束后，开「连续对话」会自动重新聆听；关掉则回答完就结束。

## 朗读是怎么发声的

三个引擎，按顺序兜底：

1. **小米 MiMo（默认）** — 两种模式：
   - **低延迟（默认）**：把回答切成 ≤45 字的短段，每段 POST `/voice-assistant/stream`，宿主转发 MiMo 的 SSE 音频流，把 PCM16 边收边推给页面；页面按到达顺序把样本排进同一个 WebAudio 时间轴（所有段共享一条时间线，句间连续），首声约 0.7 秒。切短段是因为 MiMo 的长流式偶尔会打颤，短段明显干净。
   - **清晰**：逐句 POST `/voice-assistant/tts` 取整段 WAV，最干净但首声要等整句合成（约 2–3 秒）；下一句在当前句播放时已开始合成。
2. **微软 Edge** — POST `/voice-assistant/tts`，宿主用 `lib/msedge-tts.cjs` 合成 MP3。连接在多个句子之间复用（只握手一次），429/超时自动重试 3 次。
3. **系统语音** — 浏览器自带语音（Windows SAPI），完全离线。

MiMo 失败时状态条提示「MiMo 暂时不可用，已改用 Edge 音色」；Edge 也失败则改用系统语音并提示。整条回复不会因为网络问题被吞掉。

**为什么要提前解锁音频**：Chromium 只在用户手势里允许 AudioContext 启动，而语音对话的回答往往在最后一次点击好几秒后才到。插件会在页面第一次点击 / 按键时就建好音频上下文并推一个静音样本，否则自动朗读会「有流程但没声音」（试听正常、自动朗读没声就是这个问题）。

## 设置

设置 → 通用 → 「语音助手」一行，点「配置」展开面板：

| 项 | 说明 |
|---|---|
| 唤醒词 | 说「你好大肥鱼」开始对话（和状态条上的开关是同一个值） |
| 连续对话 | 回答结束后自动重新聆听（和状态条上的开关是同一个值） |
| 朗读回答 | 是否朗读回答 |
| 朗读引擎 | 小米 MiMo（默认）／微软 Edge 音色／系统语音（离线） |
| 朗读模式 | MiMo 专属：低延迟（分段流式，约 0.7 秒出声）／清晰（整句合成，约 2–3 秒） |
| 朗读音色 | MiMo：冰糖、茉莉、苏打、白桦、Mia、Chloe、Milo、Dean；Edge：晓晓、晓伊、云希、云健、云扬、云夏，另有东北/陕西口音和台湾、香港音色；系统：本机已安装语音 |
| 朗读语速 | 0.7× – 1.6×，默认 1.05×（MiMo 用风格指令表达快慢，Edge 用 SSML prosody） |
| 单次录音上限 | 10 – 90 秒，默认 45 秒 |
| 快捷键 | 固定为 `Ctrl+Shift+Space`（只读展示） |
| 恢复默认 | 把以上全部还原为默认值 |

音色字段旁边的「试听」用当前引擎和音色读一句话。所有设置存在浏览器本地（`dsh.voice-assistant.prefs`），改完立即生效，无需重启。

## MiMo API Key

宿主从 `%USERPROFILE%\.dsh\voice-assistant.json` 读取：

```json
{ "mimoApiKey": "你的 key" }
```

文件只在读的时候访问，改完 5 秒内生效，不用重启。没配置时「朗读引擎」里 MiMo 会提示缺 key，并自动退回 Edge。TTS 系列目前在 MiMo 平台限时免费。

也可以用环境变量：宿主进程环境里如果有 `DSH_SECRET_MIMO_API_KEY`，会作为后备。

> 这个 key 只留在你的机器上：仓库里没有任何 key，插件也不会把它写进日志或浏览器。

## 唤醒词与灵敏度

浏览器里没有离线唤醒词引擎，所以这里不引入额外模型，而是复用听写插件已装好的 SenseVoice：

1. 麦克风保持打开，按「有声才录」切成 ≤4 秒片段；
2. 只把**检测到人声**的片段送去本机识别（安静时零推理）；
3. 文本里同时出现「你好／您好／嗨／哈喽」和「大肥鱼／大肥魚／大飞鱼」这类近音写法就算唤醒；
4. 唤醒后响一声提示音，直接进入聆听；助手说话期间与页面隐藏时自动暂停。

没唤醒成功时状态条右侧会显示「听到：……」，方便判断是没听见还是听错了。

相关常量在 `client.js` 顶部（`WAKE_` 开头）：

| 常量 | 现值 | 作用 |
|---|---|---|
| `WAKE_WINDOW_MS` | 4000 | 单段最长录音，太短会截断整句话 |
| `WAKE_SILENCE_MS` | 1000 | 静音多久判定一句话结束 |
| `WAKE_THRESHOLD` | 0.006 | 人声判定电平，麦克风偏钝就调小 |
| `WAKE_ALIASES` | 大肥鱼 / 大肥魚 / 大飞鱼… | 允许的识别写法，可增删 |

## 给系统音色补中文音色（可选，Windows 10）

只有切到「系统语音」时才用得上。见 [tools/windows-voices/README.md](tools/windows-voices/README.md)：双击 `.reg` 可以把系统里隐藏的**康康**、**瑶瑶**补登记到 SAPI5，并附带一键还原。

## 宿主接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/voice-assistant/stream` | `{engine:'mimo', text, voice, rate}` → PCM16 24 kHz 单声道，`x-sample-rate` 头 |
| POST | `/voice-assistant/tts` | `{engine:'edge'\|'mimo', text, voice, rate}` → `audio/mpeg`（Edge）或 `audio/wav`（MiMo） |
| GET | `/voice-assistant/voices` | `{edge, edgeError, mimo, mimoReady}` |
| POST | `/voice-assistant/log` | 前端诊断事件 → `%USERPROFILE%\.dsh\voice-assistant.log` |

单次请求文本上限 800 字、请求体 16 KB；路由注册在 DSH 自己的 web 服务上，与页面同源。

## 项目结构

```
client.js            浏览器半部：录音/VAD、唤醒词、朗读调度与音频时间轴、状态条、设置面板、回答行的播放按钮
index.js             宿主半部：三条合成路由 + 一条日志路由，MiMo/Edge 客户端与降级
lib/msedge-tts.cjs   msedge-tts 的打包副本（第三方 MIT，见 THIRD_PARTY.md）
locale/              插件管理里的标题与描述（zh/en）
tools/windows-voices Windows 注册表脚本（可选，不属于运行时）
cordis.patch.yml     bundle 行
scripts/check.mjs    仓库自检：语法、JSON、manifest 引用
```

## 开发

```bash
npm run check     # 语法 + JSON + manifest 引用完整性，无依赖
```

改完 `client.js` 后刷新页面即可生效（profile 里是指向本目录的链接，不会复制文件）。改了 `package.json` 的 `name` 或 `client.js` 的模块 `id` 则需要重新安装。

## 排查

前端会把关键动作 POST 到 `/voice-assistant/log`，宿主追加到 `%USERPROFILE%\.dsh\voice-assistant.log`（超过 512 KB 自动清空）。记录的事件：`boot`（前端版本）、`auto-read` / `auto-skip`（自动朗读决策）、`say` / `speak`（引擎与文本长度）、`fallback`（降级原因）、`stop`。看这些就能分清「没触发」和「触发了没声音」。

音频侧：播放用的 AudioContext 固定 24 kHz，和 MiMo 的 PCM 同采样率，避免逐块重采样产生的爆音；流式数据按 50 ms（第一块）/ 120 ms 成块排进时间轴。

## 隐私与边界

- 浏览器需要麦克风权限（`http://127.0.0.1` 属于安全上下文）。
- **朗读会把要读的回答文本外发**：MiMo 发给小米、Edge 发给微软。完全不想外发就用「系统语音」。
- **唤醒词开启期间麦克风一直占用**，每段有人声的音频都要在本机跑一次识别；不想要了就关掉开关。
- 唤醒有延迟：要等一句话说完、静音约 1 秒才判定；唤醒词本身不会被发送出去。匹配是宽松的，环境里频繁出现「你好」「大肥鱼」时可能误唤醒。
- MiMo 的 TTS 目前限时免费，政策可能变化；Edge 的朗读接口也不是官方公开 API。两者失败都会自动降级。
- MiMo 的流式音频本身偶尔带咔哒声（模型端，不同音色/不同生成轮次不一样）；`/voice-assistant/tts` 的整段 WAV 更干净，但要多等一整句。
- 插件依赖 DSH 宿主的 `webServer` 服务，不能只装在网页端。

## 许可

本仓库代码以 [MIT](LICENSE) 发布。`lib/msedge-tts.cjs` 是第三方 MIT 代码，来源与许可见 [THIRD_PARTY.md](THIRD_PARTY.md)。

English: [README.en.md](README.en.md)
