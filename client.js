window.__ModuleLoader__.load({
  id: '@local/voice-assistant',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'voice-assistant'

    /** Host routes this plugin owns (registered by index.js). */
    const STREAM_URL = '/voice-assistant/stream'
    const TTS_URL = '/voice-assistant/tts'
    const VOICES_URL = '/voice-assistant/voices'
    const LOG_ROUTE = '/voice-assistant/log'
    const EDGE_VOICE_DEFAULT = 'zh-CN-XiaoxiaoNeural'
    const MIMO_VOICE_DEFAULT = '冰糖'
    const PCM_SAMPLE_RATE = 24000

    /** MiMo's built-in voices with the one-line character Xiaomi ships for each. */
    const MIMO_VOICES = [
      { value: '冰糖', label: '冰糖 · 活泼少女' },
      { value: '茉莉', label: '茉莉 · 知性女声' },
      { value: '苏打', label: '苏打 · 阳光少年' },
      { value: '白桦', label: '白桦 · 成熟男声' },
      { value: 'Mia', label: 'Mia · Lively girl' },
      { value: 'Chloe', label: 'Chloe · Witty grace' },
      { value: 'Milo', label: 'Milo · Sunny boy' },
      { value: 'Dean', label: 'Dean · Steady gentle' },
    ]

    /* ------------------------------------------------------------------ */
    /* Localized text (flat dictionaries, `{name}` interpolation).        */
    /* ------------------------------------------------------------------ */

    const zh = {
      ready: '语音助手',
      start: '开始语音对话',
      stop: '结束语音对话',
      requesting: '正在请求麦克风…',
      listening: '正在聆听…说完自动发送',
      transcribing: '识别中…',
      thinking: '已发送，等回答…',
      speaking: '正在播报…',
      continuous: '连续对话',
      speak: '朗读回答',
      wake: '唤醒词',
      wakeListening: '等待「你好大肥鱼」…',
      wakeBlocked: '唤醒词用不了：{message}',
      wakeHeard: '唤醒了，说出你的问题',
      heard: '听到：',
      shortcut: 'Ctrl+Shift+Space',
      empty: '没听到声音，再点一下麦克风试试',
      permission: '麦克风权限被拒绝：请在浏览器和系统设置里允许后重试',
      device: '打不开麦克风，请检查输入设备',
      unavailable: '这个浏览器不支持录音',
      interrupted: '录音被中断，请重试',
      failed: '识别失败：{message}',
      noAnswer: '没有等到回答，看一下对话里的提示',
      unsupported: '当前环境不支持语音朗读，回答只显示在对话里',
      'settings.title': '语音助手',
      'settings.description': '免手持语音对话：默认行为、朗读与录音参数',
      'settings.configure': '配置',
      'settings.collapse': '收起',
      'settings.continuous': '连续对话',
      'settings.continuousHint': '回答结束后自动重新开始聆听',
      'settings.speak': '朗读回答',
      'settings.speakHint': '回答结束后用选定的音色读出来',
      'settings.voice': '朗读音色',
      'settings.engine': '朗读引擎',
      'settings.engineHint': 'MiMo 流式最快（约 0.7 秒出声）；Edge 音色偏播音腔；系统语音完全离线',
      'settings.engineMimo': '小米 MiMo（流式，最快）',
      'settings.engineEdge': '微软 Edge 音色',
      'settings.engineSystem': '系统语音（离线）',
      'settings.voiceHintMimo': '小米精品音色，边生成边播放',
      'settings.mimoMode': '朗读模式',
      'settings.mimoModeHint': '低延迟：分段流式，首声约 0.7 秒；清晰：整句合成，最干净但首声约 2–3 秒',
      'settings.mimoModeClean': '清晰（整句合成，较慢）',
      'settings.mimoModeStream': '低延迟（分段流式）',
      'settings.voiceHintEdge': '微软在线自然音色',
      'settings.voiceHintSystem': '本机已安装的系统语音',
      'settings.edgeHostDown': '在线朗读接口没有响应：需要完全退出并重开 DSH（刷新页面不够）后再试',
      'settings.mimoMissing': '没读到 MiMo API Key：写到 %USERPROFILE%\\.dsh\\voice-assistant.json 后点试听重试',
      'settings.voiceAuto': '自动选择',
      'settings.preview': '试听',
      'settings.previewSample': '你好，这是当前的朗读音色。',
      'voice.male': '男',
      'voice.female': '女',
      'action.play': '朗读这条回答',
      'action.stop': '停止朗读',
      'mimoFallback': 'MiMo 暂时不可用，已改用 Edge 音色',
      'edgeFallback': '在线语音暂时不可用，已改用系统语音',
      'settings.rate': '朗读语速',
      'settings.rateHint': '0.7× 更慢，1.6× 更快',
      'settings.maxSeconds': '单次录音上限',
      'settings.maxSecondsHint': '超过上限自动结束并发送',
      'settings.wake': '唤醒词',
      'settings.wakeHint': '说「你好大肥鱼」自动开始对话；开启期间麦克风保持占用，只在本机检测人声',
      'settings.shortcut': '快捷键',
      'settings.shortcutHint': '开始 / 结束语音对话',
      'settings.reset': '恢复默认',
    }

    const en = {
      ready: 'Voice assistant',
      start: 'Start voice conversation',
      stop: 'End voice conversation',
      requesting: 'Requesting the microphone…',
      listening: 'Listening… pause to send',
      transcribing: 'Transcribing…',
      thinking: 'Sent — waiting for the answer…',
      speaking: 'Reading the answer…',
      continuous: 'Continuous',
      speak: 'Read replies',
      wake: 'Wake word',
      wakeListening: 'Waiting for “你好大肥鱼”…',
      wakeBlocked: 'Wake word unavailable: {message}',
      wakeHeard: 'Wake word heard — say your question',
      heard: 'Heard: ',
      shortcut: 'Ctrl+Shift+Space',
      empty: 'Nothing heard — press the microphone again',
      permission: 'Microphone access denied. Allow it in the browser and system settings.',
      device: 'The microphone could not be opened. Check the input device.',
      unavailable: 'This browser cannot record audio.',
      interrupted: 'The recording was interrupted. Please try again.',
      failed: 'Transcription failed: {message}',
      noAnswer: 'No answer arrived — check the conversation for a notice.',
      unsupported: 'Speech synthesis is unavailable here; answers stay on screen.',
      'settings.title': 'Voice assistant',
      'settings.description': 'Hands-free conversation: defaults, reading and recording limits',
      'settings.configure': 'Configure',
      'settings.collapse': 'Collapse',
      'settings.continuous': 'Continuous conversation',
      'settings.continuousHint': 'Start listening again after each answer',
      'settings.speak': 'Read replies aloud',
      'settings.speakHint': 'Speak each answer with the selected voice',
      'settings.voice': 'Reading voice',
      'settings.engine': 'Speech engine',
      'settings.engineHint': 'MiMo streams the fastest (~0.7 s to first sound); Edge sounds more like a newsreader; system voices work fully offline',
      'settings.engineMimo': 'Xiaomi MiMo (default)',
      'settings.engineEdge': 'Microsoft Edge voices',
      'settings.engineSystem': 'System voices (offline)',
      'settings.voiceHintMimo': 'Xiaomi studio voices, played while they are generated',
      'settings.mimoMode': 'Playback mode',
      'settings.mimoModeHint': 'Low latency streams in short segments (~0.7 s to first sound); clear synthesises whole sentences (cleanest, ~2–3 s)',
      'settings.mimoModeClean': 'Clear (whole sentence, slower)',
      'settings.mimoModeStream': 'Low latency (segmented stream)',
      'settings.voiceHintEdge': 'Microsoft natural online voices',
      'settings.voiceHintSystem': 'Voices installed on this machine',
      'settings.edgeHostDown': 'The online speech route is not answering — fully quit and reopen DSH (a page refresh is not enough), then try again',
      'settings.mimoMissing': 'No MiMo API key found — write it to %USERPROFILE%\\.dsh\\voice-assistant.json and try the preview again',
      'settings.voiceAuto': 'Automatic',
      'settings.preview': 'Preview',
      'settings.previewSample': 'Hello, this is the current reading voice.',
      'voice.male': 'male',
      'voice.female': 'female',
      'action.play': 'Read this answer aloud',
      'action.stop': 'Stop reading',
      'mimoFallback': 'MiMo is unavailable right now — reading with the Edge voice instead',
      'edgeFallback': 'The online voice is unavailable — reading with the system voice instead',
      'settings.rate': 'Reading speed',
      'settings.rateHint': '0.7× slower, 1.6× faster',
      'settings.maxSeconds': 'Recording limit',
      'settings.maxSecondsHint': 'End and send when the limit is reached',
      'settings.wake': 'Wake word',
      'settings.wakeHint': 'Say “你好大肥鱼” to start; the microphone stays open and audio is checked locally',
      'settings.shortcut': 'Shortcut',
      'settings.shortcutHint': 'Start / end the voice conversation',
      'settings.reset': 'Reset',
    }
    const SILENCE_AFTER_SPEECH = 1100
    const NO_SPEECH_TIMEOUT = 8000
    const SPEECH_THRESHOLD = 0.009
    const MAX_BYTES = 4 * 1024 * 1024
    const PREF_KEY = 'dsh.voice-assistant.prefs'
    const PREF_DEFAULTS = { continuous: true, speakReplies: true, wakeWord: false, rate: 1.05, maxSeconds: 45, engine: 'mimo', mimoMode: 'stream', mimoVoice: MIMO_VOICE_DEFAULT, edgeVoice: EDGE_VOICE_DEFAULT, systemVoice: '' }

    /* ------------------------------------------------------------------ */
    /* Shared preferences: one store for the bar and the General row.      */
    /* ------------------------------------------------------------------ */

    /** Clamp untrusted stored values into the ranges the panel exposes. */
    function normalizePrefs(raw) {
      const value = raw && typeof raw === 'object' ? raw : {}
      const rate = Number(value.rate)
      const maxSeconds = Number(value.maxSeconds)
      return {
        continuous: value.continuous !== false,
        speakReplies: value.speakReplies !== false,
        wakeWord: value.wakeWord === true,
        rate: Number.isFinite(rate) ? Math.min(1.6, Math.max(0.7, Math.round(rate * 100) / 100)) : PREF_DEFAULTS.rate,
        maxSeconds: Number.isFinite(maxSeconds) ? Math.min(90, Math.max(10, Math.round(maxSeconds))) : PREF_DEFAULTS.maxSeconds,
        engine: value.engine === 'system' || value.engine === 'edge' || value.engine === 'mimo' ? value.engine : PREF_DEFAULTS.engine,
        mimoMode: value.mimoMode === 'clean' ? 'clean' : 'stream',
        mimoVoice: typeof value.mimoVoice === 'string' && MIMO_VOICES.some((voice) => voice.value === value.mimoVoice) ? value.mimoVoice : MIMO_VOICE_DEFAULT,
        edgeVoice: typeof value.edgeVoice === 'string' && /^[A-Za-z0-9-]{5,80}$/.test(value.edgeVoice) ? value.edgeVoice : EDGE_VOICE_DEFAULT,
        // `voice` was the system-voice picker before the online engine existed; keep old settings working.
        systemVoice: typeof value.systemVoice === 'string'
          ? value.systemVoice.slice(0, 120)
          : typeof value.voice === 'string' ? value.voice.slice(0, 120) : '',
      }
    }

    let prefsValue = null
    const prefsListeners = new Set()

    function readStoredPrefs() {
      try {
        const raw = window.localStorage.getItem(PREF_KEY)
        return raw ? JSON.parse(raw) : null
      } catch (_error) {
        return null
      }
    }

    function getPrefs() {
      if (prefsValue === null) prefsValue = normalizePrefs(readStoredPrefs())
      return prefsValue
    }

    function setPrefs(patch) {
      prefsValue = normalizePrefs({ ...getPrefs(), ...patch })
      try {
        window.localStorage.setItem(PREF_KEY, JSON.stringify(prefsValue))
      } catch (_error) {}
      for (const listener of [...prefsListeners]) listener(prefsValue)
    }

    function subscribePrefs(listener) {
      prefsListeners.add(listener)
      return () => prefsListeners.delete(listener)
    }

    /** Re-render the caller whenever the shared preferences change. */
    function usePrefs() {
      const [, force] = React.useState(0)
      React.useEffect(() => subscribePrefs(() => force((value) => value + 1)), [])
      return getPrefs()
    }

    /* ------------------------------------------------------------------ */
    /* Canonical PCM16 WAV (16 kHz mono) — the format the Host accepts.    */
    /* ------------------------------------------------------------------ */

    function encodeWave(samples) {
      const bytes = new Uint8Array(44 + samples.length * 2)
      const view = new DataView(bytes.buffer)
      const text = (at, value) => {
        for (let i = 0; i < value.length; i++) bytes[at + i] = value.charCodeAt(i)
      }
      text(0, 'RIFF')
      view.setUint32(4, bytes.length - 8, true)
      text(8, 'WAVE')
      text(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, 16000, true)
      view.setUint32(28, 32000, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      text(36, 'data')
      view.setUint32(40, samples.length * 2, true)
      for (let i = 0; i < samples.length; i++) {
        const value = Math.max(-1, Math.min(1, samples[i]))
        view.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true)
      }
      return bytes
    }

    function audioBase64(bytes) {
      let text = ''
      for (let i = 0; i < bytes.length; i += 8192) {
        text += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192))
      }
      return btoa(text)
    }

    /* ------------------------------------------------------------------ */
    /* One microphone acquisition: record, watch the level, resample.      */
    /* ------------------------------------------------------------------ */

    class Recording {
      constructor() {
        this.stream = null
        this.context = null
        this.analyser = null
        this.recorder = null
        this.chunks = []
        this.samples = new Float32Array(512)
        this.closed = false
      }

      async start() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unavailable')
        if (typeof MediaRecorder === 'undefined') throw new Error('unavailable')
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: false,
          })
        } catch (error) {
          const name = error && error.name
          throw new Error(name === 'NotAllowedError' || name === 'SecurityError' ? 'permission' : 'device')
        }
        if (this.closed) {
          stream.getTracks().forEach((track) => track.stop())
          throw new Error('interrupted')
        }
        this.stream = stream
        const context = new AudioContext()
        this.context = context
        try {
          if (context.state === 'suspended') await context.resume()
        } catch (_error) {}
        this.analyser = context.createAnalyser()
        this.analyser.fftSize = this.samples.length
        context.createMediaStreamSource(stream).connect(this.analyser)
        const recorder = new MediaRecorder(stream)
        this.recorder = recorder
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0 && !this.closed) this.chunks.push(event.data)
        }
        recorder.start()
      }

      /** RMS of the live signal, used only to find the end of an utterance. */
      level() {
        if (!this.analyser) return 0
        this.analyser.getFloatTimeDomainData(this.samples)
        let sum = 0
        for (let i = 0; i < this.samples.length; i++) sum += this.samples[i] * this.samples[i]
        return Math.sqrt(sum / this.samples.length)
      }

      /** Stop capture and return canonical 16 kHz mono WAV bytes. */
      async stop(maxSeconds) {
        const recorder = this.recorder
        const context = this.context
        const stream = this.stream
        if (!recorder || recorder.state !== 'recording' || !context || !stream) {
          await this.close()
          throw new Error('empty')
        }
        await new Promise((resolve) => {
          recorder.onstop = () => resolve()
          try {
            recorder.stop()
          } catch (_error) {
            resolve()
          }
        })
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size === 0) throw new Error('empty')
        const decoded = await context.decodeAudioData(await blob.arrayBuffer())
        const seconds = Math.max(0.05, Math.min(decoded.duration, maxSeconds))
        const frames = Math.max(1, Math.floor(seconds * 16000))
        const offline = new OfflineAudioContext(1, frames, 16000)
        const source = offline.createBufferSource()
        source.buffer = decoded
        source.connect(offline.destination)
        source.start()
        const rendered = await offline.startRendering()
        return encodeWave(rendered.getChannelData(0))
      }

      async close() {
        this.closed = true
        this.chunks = []
        try {
          if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop()
        } catch (_error) {}
        try {
          if (this.stream) this.stream.getTracks().forEach((track) => track.stop())
        } catch (_error) {}
        this.recorder = null
        this.stream = null
        const context = this.context
        this.context = null
        this.analyser = null
        if (context) {
          try {
            await context.close()
          } catch (_error) {}
        }
      }
    }

    /* ------------------------------------------------------------------ */
    /* Wake word: local, VAD-gated spot checks against the dictation model */
    /* ------------------------------------------------------------------ */

    const WAKE_WINDOW_MS = 4000
    const WAKE_SILENCE_MS = 1000
    const WAKE_THRESHOLD = 0.006
    const WAKE_PHRASE = '你好大肥鱼'
    const WAKE_ALIASES = ['大肥鱼', '大肥魚', '大飞鱼', '大肥渝', '大菲鱼', '大肥渔']

    /** Lowercase and drop punctuation/space so recognizer variants compare equally. */
    function normalizeSpeech(text) {
      return String(text || '')
        .toLowerCase()
        .replace(/[\s\u3000,，。!！?？;；、'"”‘’（）\[\]【】<>《》~～\-_/\\|]/g, '')
    }

    function isWakePhrase(text) {
      const speech = normalizeSpeech(text)
      if (!speech || speech.length > 40) return false
      const hello = speech.includes('你好') || speech.includes('您好') || speech.includes('嗨') || speech.includes('哈喽') || speech.includes('哈啰') || speech.includes('hello')
      if (!hello) return false
      return WAKE_ALIASES.some((alias) => speech.includes(alias))
    }

    /** Short "ding" so the user knows the wake word landed; silent when audio is blocked. */
    function chime() {
      try {
        const context = new AudioContext()
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = 880
        gain.gain.setValueAtTime(0.0001, context.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start()
        oscillator.stop(context.currentTime + 0.2)
        setTimeout(() => {
          try {
            context.close()
          } catch (_error) {}
        }, 500)
      } catch (_error) {}
    }

    /**
     * Always-on microphone loop that only spends recognition on windows containing speech.
     * It owns a separate stream and is stopped whenever the conversation itself is active.
     */
    class WakeWord {
      constructor(deps) {
        this.deps = deps
        this.running = false
        this.state = 'off'
        this.error = ''
        this.stream = null
        this.context = null
        this.analyser = null
        this.abort = null
        this.samples = new Float32Array(512)
        this.run = 0
        this.lastHeard = ''
        this.lastHeardAt = 0
      }

      emit(state, error) {
        this.state = state
        if (error !== undefined) this.error = error
        this.deps.onChange()
      }

      async start() {
        if (this.running) return
        this.running = true
        this.run += 1
        const run = this.run
        this.emit('starting', '')
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: false,
          })
        } catch (error) {
          this.running = false
          this.emit('error', error && error.message ? error.message : String(error))
          return
        }
        if (!this.running || run !== this.run) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        try {
          this.stream = stream
          const context = new AudioContext()
          this.context = context
          if (context.state === 'suspended') await context.resume().catch(() => {})
          this.analyser = context.createAnalyser()
          this.analyser.fftSize = this.samples.length
          context.createMediaStreamSource(stream).connect(this.analyser)
        } catch (_error) {}
        this.emit('listening', '')
        void this.loop(run)
      }

      level() {
        if (!this.analyser) return 0
        this.analyser.getFloatTimeDomainData(this.samples)
        let sum = 0
        for (let i = 0; i < this.samples.length; i++) sum += this.samples[i] * this.samples[i]
        return Math.sqrt(sum / this.samples.length)
      }

      async loop(run) {
        while (this.running && run === this.run) {
          const audio = await this.capture(run)
          if (!this.running || run !== this.run) return
          if (!audio) continue
          let text = ''
          try {
            const controller = new AbortController()
            this.abort = controller
            const result = await this.deps.transcribe({ audioBase64: audioBase64(audio) }, controller.signal)
            this.abort = null
            if (run !== this.run) return
            if (result && result.ok === true) text = String((result.value && result.value.text) || '')
          } catch (_error) {
            continue
          }
          if (!this.running || run !== this.run) return
          if (text) {
            // Keep the last thing the recognizer heard so the bar can show why nothing woke it.
            this.lastHeard = text.trim()
            this.lastHeardAt = Date.now()
            this.emit(this.state)
          }
          if (isWakePhrase(text)) {
            this.stop()
            this.deps.onWake(text)
            return
          }
        }
      }

      /** Record one short window; null when it never got loud enough to be speech. */
      async capture(run) {
        if (!this.stream || typeof MediaRecorder === 'undefined') return null
        let recorder
        try {
          recorder = new MediaRecorder(this.stream)
        } catch (_error) {
          return null
        }
        const chunks = []
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) chunks.push(event.data)
        }
        try {
          recorder.start()
        } catch (_error) {
          return null
        }
        const startedAt = Date.now()
        let above = 0
        let heard = false
        let lastVoice = startedAt
        await new Promise((resolve) => {
          const timer = setInterval(() => {
            if (!this.running || run !== this.run) {
              clearInterval(timer)
              resolve()
              return
            }
            const level = this.level()
            const now = Date.now()
            if (level > WAKE_THRESHOLD) {
              above += 1
              if (above >= 2) {
                heard = true
                lastVoice = now
              }
            } else {
              above = 0
            }
            const elapsed = now - startedAt
            if (elapsed >= WAKE_WINDOW_MS || (heard && now - lastVoice > WAKE_SILENCE_MS && elapsed > 900)) {
              clearInterval(timer)
              resolve()
            }
          }, 100)
        })
        await new Promise((resolve) => {
          try {
            recorder.onstop = () => resolve()
            if (recorder.state !== 'inactive') recorder.stop()
            else resolve()
          } catch (_error) {
            resolve()
          }
        })
        if (!heard || chunks.length === 0 || !this.context) return null
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
          const decoded = await this.context.decodeAudioData(await blob.arrayBuffer())
          const seconds = Math.max(0.05, Math.min(decoded.duration, WAKE_WINDOW_MS / 1000))
          const frames = Math.max(1, Math.floor(seconds * 16000))
          const offline = new OfflineAudioContext(1, frames, 16000)
          const source = offline.createBufferSource()
          source.buffer = decoded
          source.connect(offline.destination)
          source.start()
          const rendered = await offline.startRendering()
          return encodeWave(rendered.getChannelData(0))
        } catch (_error) {
          return null
        }
      }

      stop() {
        this.running = false
        this.run += 1
        if (this.abort) {
          this.abort.abort()
          this.abort = null
        }
        if (this.stream) {
          try {
            this.stream.getTracks().forEach((track) => track.stop())
          } catch (_error) {}
        }
        this.stream = null
        this.analyser = null
        const context = this.context
        this.context = null
        if (context) {
          try {
            context.close()
          } catch (_error) {}
        }
        if (this.state !== 'off') this.emit('off', '')
      }
    }

    /* ------------------------------------------------------------------ */
    /* Speech synthesis: a short, markdown-free reading of the answer.     */
    /* ------------------------------------------------------------------ */

    const synthesis = () => (typeof window !== 'undefined' ? window.speechSynthesis : undefined)

    function stripForSpeech(text) {
      return String(text || '')
        .replace(/```[\s\S]*?```/g, ' （代码略过） ')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/https?:\/\/\S+/g, ' 链接 ')
        .replace(/<\/?[a-z][^>]*>/gi, ' ')
        .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
        .replace(/[*_~|]{1,3}/g, ' ')
        .replace(/\n{2,}/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim()
    }

    function chunkForSpeech(text) {
      const clean = stripForSpeech(text)
      const pieces = clean.split(/([。！？；.!?;\n]+)/)
      const sentences = []
      let buffer = ''
      for (const piece of pieces) {
        if (!piece) continue
        if (/^[。！？；.!?;\n]+$/.test(piece)) {
          buffer += piece
          if (buffer.trim()) sentences.push(buffer.trim())
          buffer = ''
        } else {
          buffer += piece
        }
      }
      if (buffer.trim()) sentences.push(buffer.trim())
      const chunks = []
      let current = ''
      for (const sentence of sentences) {
        let piece = sentence
        while (piece.length > 220) {
          const head = piece.slice(0, 220)
          if (current) {
            chunks.push(current)
            current = ''
          }
          chunks.push(head)
          piece = piece.slice(220)
        }
        if (!current) current = piece
        else if (current.length + piece.length <= 110) current += piece
        else {
          chunks.push(current)
          current = piece
        }
      }
      if (current) chunks.push(current)
      if (chunks.length === 0) return []
      const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      if (total <= 900) return chunks
      const kept = []
      let length = 0
      for (const chunk of chunks) {
        if (length + chunk.length > 900) {
          kept.push('（回答较长，先读到这里）')
          break
        }
        kept.push(chunk)
        length += chunk.length
      }
      return kept
    }

    function isChineseVoice(voice) {
      return /^zh([-_]|$)/i.test((voice && voice.lang) || '')
    }

    /** Every system voice, Chinese first — the order the settings picker shows. */
    function collectVoices() {
      const synth = synthesis()
      if (!synth || typeof synth.getVoices !== 'function') return []
      const voices = (synth.getVoices() || []).filter((voice) => voice && voice.name)
      return [...voices.filter(isChineseVoice), ...voices.filter((voice) => !isChineseVoice(voice))]
    }

    function pickVoice(preferredName) {
      const voices = collectVoices()
      if (voices.length === 0) return undefined
      if (preferredName) {
        const chosen = voices.find((voice) => voice.name === preferredName)
        if (chosen) return chosen
      }
      const chinese = voices.filter(isChineseVoice)
      const preferred = chinese.find((voice) => /xiaoxiao|xiaoyi|yunxi|yunyang|yaoyao|huihui|kangkang|female|女/i.test(voice.name || ''))
      return preferred || chinese.find((voice) => voice.localService) || chinese[0] || voices.find((voice) => voice.default) || voices[0]
    }

    /* ------------------------------------------------------------------ */
    /* Spoken answers: Edge online voices through the Host, with the       */
    /* system voices as the offline fallback.                              */
    /* ------------------------------------------------------------------ */

    /** Chinese display names for the Edge voices worth surfacing in the picker. */
    const EDGE_VOICE_NAMES = {
      'zh-CN-XiaoxiaoNeural': '晓晓',
      'zh-CN-XiaoyiNeural': '晓伊',
      'zh-CN-YunjianNeural': '云健',
      'zh-CN-YunxiNeural': '云希',
      'zh-CN-YunxiaNeural': '云夏',
      'zh-CN-YunyangNeural': '云扬',
      'zh-CN-liaoning-XiaobeiNeural': '晓北 · 东北',
      'zh-CN-shaanxi-XiaoniNeural': '晓妮 · 陕西',
      'zh-TW-HsiaoChenNeural': '曉臻',
      'zh-TW-HsiaoYuNeural': '曉雨',
      'zh-TW-YunJheNeural': '雲哲',
      'zh-HK-HiuGaaiNeural': '曉佳',
      'zh-HK-HiuMaanNeural': '曉曼',
      'zh-HK-WanLungNeural': '雲龍',
    }

    /** Shown before (or instead of) the Host's voice list. */
    const EDGE_VOICES_FALLBACK = [
      { shortName: 'zh-CN-XiaoxiaoNeural', gender: 'Female' },
      { shortName: 'zh-CN-XiaoyiNeural', gender: 'Female' },
      { shortName: 'zh-CN-YunxiNeural', gender: 'Male' },
      { shortName: 'zh-CN-YunjianNeural', gender: 'Male' },
      { shortName: 'zh-CN-YunyangNeural', gender: 'Male' },
      { shortName: 'zh-CN-YunxiaNeural', gender: 'Male' },
    ]

    let catalogue = null
    let catalogueRequest = null
    /** false once the Host routes have been tried and did not answer — surfaced in the settings panel. */
    let hostOk = null

    /** Fetch the voice catalogue and engine readiness once; built-in lists when the Host is missing. */
    function loadCatalogue() {
      if (catalogue) return Promise.resolve(catalogue)
      if (!catalogueRequest) {
        catalogueRequest = fetch(VOICES_URL, { headers: { accept: 'application/json' } })
          .then((response) => (response.ok ? response.json() : Promise.reject(new Error('voices ' + response.status))))
          .then((data) => {
            const edge = Array.isArray(data && data.edge) ? data.edge.filter((voice) => /^zh[-_]/i.test(voice.locale || '')) : []
            catalogue = {
              edge: edge.length > 0 ? edge : EDGE_VOICES_FALLBACK,
              mimo: Array.isArray(data && data.mimo) ? data.mimo : MIMO_VOICES.map((voice) => voice.value),
              mimoReady: Boolean(data && data.mimoReady),
              ok: true,
            }
            hostOk = true
            return catalogue
          })
          .catch(() => {
            catalogueRequest = null
            hostOk = false
            return { edge: EDGE_VOICES_FALLBACK, mimo: MIMO_VOICES.map((voice) => voice.value), mimoReady: false, ok: false }
          })
      }
      return catalogueRequest
    }

    function useCatalogue() {
      const [state, setState] = React.useState(() => catalogue || {
        edge: EDGE_VOICES_FALLBACK,
        mimo: MIMO_VOICES.map((voice) => voice.value),
        mimoReady: false,
        ok: hostOk,
      })
      React.useEffect(() => {
        let alive = true
        void loadCatalogue().then((next) => {
          if (alive) setState(next)
        })
        return () => {
          alive = false
        }
      }, [])
      return state
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    /** Fire-and-forget diagnostics; the Host appends them to ~/.dsh/voice-assistant.log. */
    function diag(tag, data) {
      try {
        void fetch(LOG_ROUTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ tag, data }),
        }).catch(() => {})
      } catch (_error) {}
    }

    let sharedAudioContext = null
    const activeSources = new Set()
    /** Bumped by every new utterance and by stopSpeaking, so stale playback exits quietly. */
    let speechSeq = 0

    /** Which reply is being spoken right now — the message action button renders from this. */
    let speechStatus = { active: false, messageId: null }
    const speechStatusListeners = new Set()

    function setSpeechStatus(patch) {
      speechStatus = { ...speechStatus, ...patch }
      for (const listener of [...speechStatusListeners]) listener(speechStatus)
    }

    function useSpeechStatus() {
      const [value, setValue] = React.useState(speechStatus)
      React.useEffect(() => {
        const listener = (next) => setValue(next)
        speechStatusListeners.add(listener)
        setValue(speechStatus)
        return () => {
          speechStatusListeners.delete(listener)
        }
      }, [])
      return value
    }

    function playbackContext() {
      const Ctor = window.AudioContext || window.webkitAudioContext
      if (!Ctor) return null
      if (!sharedAudioContext) {
        // Match MiMo's native rate. Resampling every short streamed block separately is what makes
        // streamed speech click; a 24 kHz context plays the samples as they arrive.
        try {
          sharedAudioContext = new Ctor({ sampleRate: PCM_SAMPLE_RATE, latencyHint: 'interactive' })
        } catch (_error) {
          try {
            sharedAudioContext = new Ctor()
          } catch (_error2) {
            return null
          }
        }
      }
      if (sharedAudioContext.state === 'suspended') {
        try {
          void sharedAudioContext.resume()
        } catch (_error) {}
      }
      return sharedAudioContext
    }

    let audioUnlocked = false

    /**
     * Chromium only starts an AudioContext inside a user gesture, and a reply can arrive long after
     * the last click. Create the context on the first interaction and push one silent sample through
     * it, so playback later is not suspended.
     */
    function warmAudio() {
      const context = playbackContext()
      if (!context) return
      if (context.state === 'suspended') {
        try {
          void context.resume()
        } catch (_error) {}
      }
      if (audioUnlocked || context.state === 'suspended') return
      audioUnlocked = true
      try {
        const source = context.createBufferSource()
        source.buffer = context.createBuffer(1, 1, 22050)
        source.connect(context.destination)
        source.start(0)
      } catch (_error) {}
    }

    /** Cut off whatever is being spoken, online or offline. */
    function stopSpeaking() {
      speechSeq += 1
      setSpeechStatus({ active: false, messageId: null })
      for (const source of activeSources) {
        try {
          source.stop()
        } catch (_error) {}
      }
      activeSources.clear()
      try {
        const synth = synthesis()
        if (synth) synth.cancel()
      } catch (_error) {}
    }

    /** Split text into sentence-sized pieces of at most `max` characters. */
    function splitSentences(text, max) {
      const pieces = []
      for (const part of String(text || '').split(/(?<=[。！？!?；;\n])/)) {
        let rest = part.trim()
        while (rest.length > max) {
          pieces.push(rest.slice(0, max))
          rest = rest.slice(max)
        }
        if (rest) pieces.push(rest)
      }
      return pieces
    }

    async function synthesizeChunk(text, options, engine = 'edge') {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          engine,
          text,
          voice: engine === 'mimo' ? options.mimoVoice : options.edgeVoice,
          rate: options.rate,
        }),
      })
      if (!response.ok) throw new Error('synthesis answered ' + response.status)
      const data = await response.arrayBuffer()
      const context = playbackContext()
      if (!context) throw new Error('audio playback unavailable')
      return await context.decodeAudioData(data)
    }

    function playBuffer(context, buffer, token) {
      return new Promise((resolve) => {
        if (token !== speechSeq) {
          resolve(false)
          return
        }
        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        activeSources.add(source)
        let settled = false
        let timer = null
        const finish = (value) => {
          if (settled) return
          settled = true
          if (timer) clearTimeout(timer)
          activeSources.delete(source)
          resolve(value)
        }
        source.onended = () => finish(token === speechSeq)
        try {
          source.start()
        } catch (_error) {
          finish(false)
          return
        }
        // A suspended AudioContext never fires `ended`; give up so the caller is not stuck.
        timer = setTimeout(() => finish(false), (buffer.duration + 2) * 1000)
      })
    }

    /** Play the chunks with the Edge voices; the next chunk synthesises while this one plays. */
    async function speakEdge(chunks, options, token) {
      const wrap = (promise) => promise.then((buffer) => ({ ok: true, buffer }), (error) => ({ ok: false, error }))
      let pending = wrap(synthesizeChunk(chunks[0], options, 'edge'))
      for (let index = 0; index < chunks.length; index += 1) {
        const current = await pending
        if (token !== speechSeq) return
        if (!current.ok) throw current.error
        if (index + 1 < chunks.length) pending = wrap(synthesizeChunk(chunks[index + 1], options, 'edge'))
        const context = playbackContext()
        if (!context) throw new Error('audio playback unavailable')
        if (context.state === 'suspended') {
          try {
            await context.resume()
          } catch (_error) {}
        }
        if (context.state !== 'running') throw new Error('audio playback blocked')
        const played = await playBuffer(context, current.buffer, token)
        if (!played || token !== speechSeq) return
      }
    }

    /**
     * "Clear" MiMo mode: each sentence is synthesised as a complete WAV (the streaming path can
     * carry a faint warble on long replies), and the next sentence is fetched while this one plays.
     */
    async function speakMimoClean(chunks, options, token) {
      const parts = chunks.flatMap((chunk) => splitSentences(chunk, 70))
      if (parts.length === 0) return
      const wrap = (promise) => promise.then((buffer) => ({ ok: true, buffer }), (error) => ({ ok: false, error }))
      let pending = wrap(synthesizeChunk(parts[0], options, 'mimo'))
      for (let index = 0; index < parts.length; index += 1) {
        const current = await pending
        if (token !== speechSeq) return
        if (!current.ok) throw current.error
        if (index + 1 < parts.length) pending = wrap(synthesizeChunk(parts[index + 1], options, 'mimo'))
        const context = playbackContext()
        if (!context) throw new Error('audio playback unavailable')
        if (context.state === 'suspended') {
          try {
            await context.resume()
          } catch (_error) {}
        }
        if (context.state !== 'running') throw new Error('audio playback blocked')
        const played = await playBuffer(context, current.buffer, token)
        if (!played || token !== speechSeq) return
      }
    }

    /**
     * One continuous PCM player. Several short streamed pieces share a single audio-clock timeline,
     * so a sentence boundary is sample-continuous instead of a new playback at "now".
     */
    function createPcmPlayer(context, sampleRate) {
      let pending = new Uint8Array(0)
      let scheduledEnd = context.currentTime + 0.06
      let flushed = false
      const schedule = (int16) => {
        const frames = Math.floor(int16.byteLength / 2)
        if (frames <= 0) return
        const buffer = context.createBuffer(1, frames, sampleRate)
        const channel = buffer.getChannelData(0)
        const view = new DataView(int16.buffer, int16.byteOffset, frames * 2)
        for (let index = 0; index < frames; index += 1) channel[index] = view.getInt16(index * 2, true) / 32768
        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        // Keep blocks back-to-back. If the queue fell behind, restart just ahead of `now` — never
        // overlap two sources, because overlapping PCM doubles the signal and plays as noise.
        const startAt = scheduledEnd > context.currentTime + 0.01 ? scheduledEnd : context.currentTime + 0.05
        source.start(startAt)
        scheduledEnd = startAt + buffer.duration
        activeSources.add(source)
        source.onended = () => activeSources.delete(source)
      }
      /** Hand the queued samples to the audio clock once enough of them arrived. */
      const flush = (all) => {
        const even = pending.length - (pending.length % 2)
        if (even < 2) {
          if (all) pending = new Uint8Array(0)
          return
        }
        const minFrames = Math.round(sampleRate * (flushed ? 0.12 : 0.05))
        if (!all && even / 2 < minFrames) return
        schedule(pending.subarray(0, even))
        pending = pending.length % 2 === 0 ? new Uint8Array(0) : pending.slice(even)
        flushed = true
      }
      return {
        push(bytes) {
          const merged = new Uint8Array(pending.length + bytes.length)
          merged.set(pending)
          merged.set(bytes, pending.length)
          pending = merged
          flush(false)
        },
        /** Flush the tail and wait until the audio clock has played everything scheduled. */
        async drain() {
          flush(true)
          const deadline = Date.now() + Math.max(0, scheduledEnd - context.currentTime) * 1000 + 15000
          while (context.currentTime < scheduledEnd - 0.03) {
            if (Date.now() > deadline) break
            await sleep(40)
          }
        },
      }
    }

    /** Stream one short piece into the shared player; resolves false when the read was cancelled. */
    async function streamTextInto(player, text, options, token) {
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ engine: 'mimo', text, voice: options.mimoVoice, rate: options.rate }),
      })
      if (!response.ok || !response.body) {
        const detail = await response.json().catch(() => null)
        throw Object.assign(new Error('stream answered ' + response.status), { code: detail && detail.error })
      }
      const reader = response.body.getReader()
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (token !== speechSeq) {
            try {
              await reader.cancel()
            } catch (_error) {}
            return false
          }
          if (done) break
          player.push(value)
        }
      } finally {
        try {
          await reader.cancel()
        } catch (_error) {}
      }
      return true
    }

    /**
     * Streaming MiMo mode. The reply is split into short pieces before streaming: MiMo's longer
     * streams occasionally warble, while short pieces stay clean. All pieces feed one player, so
     * sentence boundaries stay continuous and synthesis runs ahead of playback.
     */
    async function speakMimo(chunks, options, token) {
      const context = playbackContext()
      if (!context) throw new Error('audio playback unavailable')
      if (context.state === 'suspended') {
        try {
          await context.resume()
        } catch (_error) {}
      }
      if (context.state !== 'running') throw new Error('audio playback blocked')
      const pieces = chunks.flatMap((chunk) => splitSentences(chunk, 45))
      if (pieces.length === 0) return
      diag('mimo-pieces', { count: pieces.length, lengths: pieces.map((piece) => piece.length) })
      const player = createPcmPlayer(context, PCM_SAMPLE_RATE)
      for (const piece of pieces) {
        if (token !== speechSeq) return
        const ok = await streamTextInto(player, piece, options, token)
        if (!ok) return
      }
      await player.drain()
    }

    function speakSystem(chunks, options, token) {
      return new Promise((resolve) => {
        const synth = synthesis()
        let finished = false
        let watchdog = null
        const finish = () => {
          if (finished) return
          finished = true
          if (watchdog) clearInterval(watchdog)
          resolve()
        }
        if (!synth || typeof SpeechSynthesisUtterance === 'undefined' || chunks.length === 0) {
          finish()
          return
        }
        try {
          synth.cancel()
        } catch (_error) {}
        const voice = pickVoice(options.systemVoice)
        let index = 0
        const next = () => {
          if (finished) return
          if (token !== speechSeq) {
            finish()
            return
          }
          if (index >= chunks.length) {
            finish()
            return
          }
          const utterance = new SpeechSynthesisUtterance(chunks[index])
          index += 1
          utterance.lang = voice && voice.lang ? voice.lang : 'zh-CN'
          if (voice) utterance.voice = voice
          utterance.rate = options.rate
          utterance.pitch = 1
          utterance.onend = next
          utterance.onerror = next
          synth.speak(utterance)
        }
        next()
        watchdog = setInterval(() => {
          if (finished) {
            clearInterval(watchdog)
            return
          }
          if (token !== speechSeq) {
            finish()
            return
          }
          if (!synth.speaking && !synth.pending) {
            clearInterval(watchdog)
            next()
            setTimeout(() => {
              if (!synth.speaking && !synth.pending) finish()
            }, 400)
          }
        }, 700)
      })
    }

    /** Merge sentence chunks back into bigger pieces — one MiMo request per reply avoids gaps. */
    function mergeChunks(chunks, limit) {
      const out = []
      let current = ''
      for (const chunk of chunks) {
        if (!current) current = chunk
        else if (current.length + chunk.length <= limit) current += chunk
        else {
          out.push(current)
          current = chunk
        }
      }
      if (current) out.push(current)
      return out
    }

    /**
     * Speak one answer: MiMo (clear WAV or low-latency stream), then the Edge voice, then the
     * offline system voices. Every online step is best-effort — a reply is never silently dropped.
     * @param {(notice: string) => void} [onFallback] called with the key of the engine that failed
     */
    async function speakAnswer(text, options, onDone, onFallback) {
      const sentenceChunks = chunkForSpeech(text)
      if (sentenceChunks.length === 0) {
        onDone()
        return
      }
      const token = ++speechSeq
      const mode = options.mimoMode === 'stream' ? 'stream' : 'clean'
      setSpeechStatus({ active: true, messageId: options.messageId || null })
      diag('speak', { engine: options.engine, mode, messageId: options.messageId || null, length: text.length })
      try {
        if (options.engine === 'mimo') {
          try {
            if (mode === 'stream') await speakMimo(mergeChunks(sentenceChunks, 800), options, token)
            else await speakMimoClean(sentenceChunks, options, token)
            if (token === speechSeq) onDone()
            return
          } catch (error) {
            if (token !== speechSeq) return
            diag('fallback', { from: 'mimo', mode, message: String((error && error.message) || error) })
            if (onFallback) onFallback('mimoFallback')
          }
        }
        if (options.engine === 'mimo' || options.engine === 'edge') {
          try {
            await speakEdge(sentenceChunks, options, token)
            if (token === speechSeq) onDone()
            return
          } catch (error) {
            if (token !== speechSeq) return
            diag('fallback', { from: 'edge', message: String((error && error.message) || error) })
            if (onFallback) onFallback('edgeFallback')
          }
        }
        await speakSystem(sentenceChunks, options, token)
        if (token === speechSeq) onDone()
      } finally {
        if (token === speechSeq) setSpeechStatus({ active: false, messageId: null })
      }
    }

    /* ------------------------------------------------------------------ */
    /* The conversation engine: listen → transcribe → hand text → speak.   */
    /* ------------------------------------------------------------------ */

    class Engine {
      constructor(deps) {
        this.deps = deps
        this.phase = 'idle'
        this.active = false
        this.transcript = ''
        this.notice = ''
        this.recording = null
        this.vad = null
        this.abort = null
        this.run = 0
        this.disposed = false
      }

      emit(patch) {
        if (patch) Object.assign(this, patch)
        if (!this.disposed) this.deps.onChange()
      }

      toggle() {
        warmAudio()
        if (this.active) this.stopAll()
        else {
          this.active = true
          this.notice = ''
          void this.listen()
        }
      }

      /** Enter a conversation because the wake word was heard. */
      startFromWake() {
        if (this.disposed || this.active) return
        this.active = true
        this.notice = ''
        chime()
        void this.listen()
      }

      stopAll() {
        this.run += 1
        this.active = false
        this.notice = ''
        this.transcript = ''
        if (this.vad) clearInterval(this.vad)
        this.vad = null
        if (this.abort) this.abort.abort()
        this.abort = null
        const recording = this.recording
        this.recording = null
        if (recording) void recording.close()
        stopSpeaking()
        this.emit({ phase: 'idle' })
      }

      fail(kind, message) {
        const known = kind === 'permission' || kind === 'device' || kind === 'unavailable' || kind === 'interrupted'
        this.emit({
          phase: kind === 'permission' || kind === 'device' || kind === 'unavailable' ? 'idle' : 'error',
          notice: known ? kind : { key: 'failed', params: { message: String(message || '') } },
          active: false,
        })
        this.active = false
      }

      async listen() {
        if (this.disposed || !this.active) return
        if (this.phase === 'listening' || this.phase === 'requesting' || this.phase === 'transcribing') return
        const run = this.run
        const limit = getPrefs().maxSeconds
        this.transcript = ''
        this.emit({ phase: 'requesting' })
        const recording = new Recording()
        try {
          await recording.start()
        } catch (error) {
          if (run !== this.run) return
          this.fail(error.message, error.message)
          return
        }
        if (run !== this.run || this.disposed || !this.active) {
          void recording.close()
          return
        }
        this.recording = recording
        this.emit({ phase: 'listening' })
        const startedAt = Date.now()
        let above = 0
        let heard = false
        let lastVoice = startedAt
        this.vad = setInterval(() => {
          if (this.recording !== recording) return
          let level = 0
          try {
            level = recording.level()
          } catch (_error) {
            level = 0
          }
          const now = Date.now()
          if (level > SPEECH_THRESHOLD) {
            above += 1
            if (above >= 3) {
              heard = true
              lastVoice = now
            }
          } else {
            above = 0
          }
          if (now - startedAt > limit * 1000) {
            void this.finishListening()
            return
          }
          if (!heard && now - startedAt > NO_SPEECH_TIMEOUT) {
            void this.finishListening('silent')
            return
          }
          if (heard && now - lastVoice > SILENCE_AFTER_SPEECH && now - startedAt > 900) {
            void this.finishListening()
          }
        }, 120)
      }

      async finishListening(outcome) {
        if (this.vad) clearInterval(this.vad)
        this.vad = null
        const recording = this.recording
        this.recording = null
        if (!recording) return
        const run = this.run
        if (outcome === 'silent') {
          // Never send a recognizer's guess at pure silence: a hallucinated sentence would be
          // submitted as the user's request.
          await recording.close()
          if (run !== this.run) return
          this.emit({ phase: 'idle', notice: 'empty', active: false })
          this.active = false
          return
        }
        let bytes
        this.emit({ phase: 'transcribing' })
        try {
          bytes = await recording.stop(getPrefs().maxSeconds)
          void recording.close()
        } catch (error) {
          await recording.close()
          if (run !== this.run) return
          if (error && error.message === 'empty') {
            this.emit({ phase: 'idle', notice: 'empty', active: false })
            this.active = false
          } else {
            this.fail(error && error.message, error && error.message)
          }
          return
        }
        if (run !== this.run) return
        if (bytes.byteLength > MAX_BYTES) {
          this.emit({ phase: 'idle', notice: { key: 'failed', params: { message: 'audio too large' } }, active: false })
          this.active = false
          return
        }
        const controller = new AbortController()
        this.abort = controller
        try {
          const result = await this.deps.transcribe({ audioBase64: audioBase64(bytes) }, controller.signal)
          if (run !== this.run || this.disposed) return
          this.abort = null
          if (!result || result.ok !== true) {
            const message = result && result.error ? result.error.message : 'unknown error'
            this.fail('failed', message)
            return
          }
          const text = String((result.value && result.value.text) || '').trim()
          if (!text) {
            this.emit({ phase: 'idle', notice: 'empty', active: false })
            this.active = false
            return
          }
          this.emit({ phase: 'thinking', transcript: text, notice: '' })
          this.deps.onSpeech(text)
        } catch (error) {
          if (run !== this.run || this.disposed) return
          this.abort = null
          if (error && (error.name === 'AbortError' || error.name === 'CanceledError')) return
          this.fail('failed', error && error.message ? error.message : String(error))
        }
      }

      say(text, messageId) {
        const run = this.run
        const prefs = getPrefs()
        diag('say', { messageId: messageId || null, length: text.length, engine: prefs.engine })
        this.emit({ phase: 'speaking' })
        speakAnswer(text, { ...prefs, messageId }, () => {
          if (run !== this.run || this.disposed) return
          this.afterReply()
        }, (notice) => {
          if (run !== this.run || this.disposed) return
          this.emit({ notice: notice || 'edgeFallback' })
        })
      }

      afterReply() {
        if (!this.active) {
          this.emit({ phase: 'idle' })
          return
        }
        if (getPrefs().continuous) {
          void this.listen()
          return
        }
        this.active = false
        this.emit({ phase: 'idle' })
      }
    }

    /* ------------------------------------------------------------------ */
    /* Controls                                                            */
    /* ------------------------------------------------------------------ */

    const CSS = `
.dshva-root{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:2px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dshva-mic{width:24px;height:24px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer;padding:0;flex:none;transition:background .15s,color .15s,border-color .15s}
.dshva-mic:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.dshva-mic:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dshva-root[data-phase="requesting"] .dshva-mic,.dshva-root[data-phase="transcribing"] .dshva-mic{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.dshva-root[data-phase="listening"] .dshva-mic{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base);animation:dshva-pulse 1.5s ease-in-out infinite}
.dshva-root[data-phase="speaking"] .dshva-mic{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base)}
.dshva-root[data-phase="error"] .dshva-mic{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
@keyframes dshva-pulse{0%,100%{opacity:1}50%{opacity:.5}}
.dshva-text{display:flex;align-items:baseline;gap:8px;min-width:0;flex:1}
.dshva-status{white-space:nowrap;flex:none}
.dshva-root[data-phase="error"] .dshva-status{color:var(--dsw-alias-state-error-primary)}
.dshva-quote{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);opacity:.72}
.dshva-controls{display:flex;align-items:center;gap:10px;flex:none}
.dshva-toggle{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:11px;color:var(--dsw-alias-label-secondary)}
.dshva-switch{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;padding:2px;border:0;border-radius:999px;background:var(--dsw-alias-border-l3, var(--dsw-alias-border-l2));cursor:pointer;display:block}
.dshva-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
.dshva-switch:disabled{cursor:default;opacity:.5}
.dshva-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dshva-thumb{display:block;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-switch-thumb, var(--dsw-alias-bg-base));transition:transform .12s ease,background .12s ease}
.dshva-switch[aria-checked="true"] .dshva-thumb{transform:translate(16px);background:var(--dsw-alias-label-primary-foreground, #fff)}
.dshva-hint{flex:none;font-size:11px;color:var(--dsw-alias-state-idle-primary);opacity:.75;white-space:nowrap}
@media (max-width:720px){.dshva-hint{display:none}}
.dshva-settings{border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dshva-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0}
.dshva-row-main{min-width:0}
.dshva-row-title{font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}
.dshva-row-desc{margin-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dshva-row-action{display:inline-flex;align-items:center;gap:6px;flex:none;height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}
.dshva-row-action:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}
.dshva-row-action:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dshva-chevron{transition:transform .15s ease}
.dshva-row-action[aria-expanded="true"] .dshva-chevron{transform:rotate(180deg)}
.dshva-panel{margin:0 0 16px;padding:6px 14px 10px;border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}
.dshva-field{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:10px 0;border-top:.5px solid var(--dsw-alias-border-l1)}
.dshva-field:first-child{border-top:0}
.dshva-field-main{min-width:0}
.dshva-field-label{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary)}
.dshva-field-hint{margin-top:2px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.dshva-field-value{display:flex;align-items:center;gap:10px;flex:none;font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dshva-range{width:160px;accent-color:var(--dsw-alias-brand-primary)}
.dshva-select{height:26px;max-width:190px;padding:0 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer;font-family:inherit}
.dshva-select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dshva-kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;padding:2px 6px;border-radius:5px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.dshva-reset{height:24px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer;flex:none}
.dshva-reset:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.dshva-action{display:grid;place-items:center;width:24px;height:24px;padding:0;border-radius:999px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.dshva-action:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dshva-action:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dshva-action[aria-pressed="true"]{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
`

    const micIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', 'aria-hidden': true },
      h('rect', { x: 9, y: 3, width: 6, height: 11, rx: 3, fill: 'currentColor' }),
      h('path', { d: 'M6 11a6 6 0 0 0 12 0', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }),
      h('path', { d: 'M12 17v4M9 21h6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }))

    const stopIcon = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', 'aria-hidden': true },
      h('rect', { x: 5, y: 5, width: 14, height: 14, rx: 3, fill: 'currentColor' }))

    const playIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', 'aria-hidden': true },
      h('path', { d: 'M8 5.2v13.6L19 12z', fill: 'currentColor' }))

    const chevron = () => h('svg', { className: 'dshva-chevron', width: 12, height: 12, viewBox: '0 0 24 24', 'aria-hidden': true },
      h('path', { d: 'M6 9l6 6 6-6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }))

    /** Host-shaped switch: a real `role="switch"` button with a sliding thumb. */
    function Switch({ checked, onChange, label, disabled }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        className: 'dshva-switch',
        'aria-checked': checked ? 'true' : 'false',
        'aria-label': label,
        title: label,
        disabled: disabled === true,
        onClick: () => onChange(!checked),
      }, h('span', { className: 'dshva-thumb', 'aria-hidden': true }))
    }

    function ToggleField({ label, hint, checked, onChange }) {
      return h('div', { className: 'dshva-field' },
        h('div', { className: 'dshva-field-main' },
          h('div', { className: 'dshva-field-label' }, label),
          hint ? h('div', { className: 'dshva-field-hint' }, hint) : null),
        h(Switch, { checked, onChange, label }))
    }

    function RangeField({ label, hint, value, min, max, step, display, onChange }) {
      return h('div', { className: 'dshva-field' },
        h('div', { className: 'dshva-field-main' },
          h('div', { className: 'dshva-field-label' }, label),
          hint ? h('div', { className: 'dshva-field-hint' }, hint) : null),
        h('div', { className: 'dshva-field-value' },
          h('input', {
            type: 'range',
            className: 'dshva-range',
            min,
            max,
            step,
            value,
            'aria-label': label,
            onChange: (event) => onChange(Number(event.target.value)),
          }),
          h('span', null, display)))
    }

    /**
     * System voices for the picker. Chromium populates its voice list asynchronously and fires
     * `voiceschanged` once SAPI has been enumerated, so subscribe instead of reading once.
     */
    function useSystemVoices() {
      const [voices, setVoices] = React.useState(() => collectVoices())
      React.useEffect(() => {
        const synth = synthesis()
        if (!synth) return undefined
        const update = () => setVoices(collectVoices())
        update()
        if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', update)
        else synth.onvoiceschanged = update
        return () => {
          if (typeof synth.removeEventListener === 'function') synth.removeEventListener('voiceschanged', update)
          else if (synth.onvoiceschanged === update) synth.onvoiceschanged = null
        }
      }, [])
      return voices
    }

    function voiceLabel(voice) {
      const lang = voice.lang ? ' · ' + voice.lang : ''
      return (voice.name || '') + lang
    }

    /** Readable "晓晓 · 女" style label for an Edge voice record. */
    function edgeVoiceLabel(voice, t) {
      const name = EDGE_VOICE_NAMES[voice.shortName] || voice.shortName
      const gender = voice.gender === 'Male' ? text(t, 'voice.male') : voice.gender === 'Female' ? text(t, 'voice.female') : ''
      return gender ? name + ' · ' + gender : name
    }

    function SelectField({ label, hint, value, options, onChange, action, onAction }) {
      return h('div', { className: 'dshva-field' },
        h('div', { className: 'dshva-field-main' },
          h('div', { className: 'dshva-field-label' }, label),
          hint ? h('div', { className: 'dshva-field-hint' }, hint) : null),
        h('div', { className: 'dshva-field-value' },
          h('select', {
            className: 'dshva-select',
            value,
            'aria-label': label,
            onChange: (event) => onChange(event.target.value),
          }, options.map((option) => h('option', { key: option.value, value: option.value }, option.label))),
          action ? h('button', { type: 'button', className: 'dshva-reset', onClick: onAction }, action) : null))
    }

    /**
     * Every assistant node in a Chat snapshot, oldest first.
     *
     * DSH 0.2 keeps nodes in a `Map` of `assistant-step` nodes with the blocks under `data.blocks`;
     * older payloads used an `order` array with `assistant` nodes whose blocks sat on the node.
     * Both shapes are handled so the reader does not depend on one UI build.
     */
    function assistantNodes(snapshot) {
      if (!snapshot) return []
      const nodes = snapshot.nodes
      const out = []
      if (nodes && typeof nodes.values === 'function') {
        for (const node of nodes.values()) {
          if (node && (node.kind === 'assistant-step' || node.kind === 'assistant')) out.push(node)
        }
      } else if (snapshot.order && nodes && typeof nodes.get === 'function') {
        for (const key of snapshot.order) {
          const node = nodes.get(key)
          if (node && (node.kind === 'assistant-step' || node.kind === 'assistant')) out.push(node)
        }
      } else if (snapshot.legacy && snapshot.legacy.order && snapshot.legacy.nodes) {
        for (const key of snapshot.legacy.order) {
          const node = snapshot.legacy.nodes.get(key)
          if (node && (node.kind === 'assistant-step' || node.kind === 'assistant')) out.push(node)
        }
      }
      return out.length > 400 ? out.slice(-400) : out
    }

    /** Plain text of one assistant node, block by block. */
    function nodeText(node) {
      const blocks = (node && node.data && node.data.blocks) || (node && node.blocks) || []
      const parts = []
      for (const block of blocks) {
        if (block && block.kind === 'text' && typeof block.text === 'string' && block.text.trim()) parts.push(block.text)
      }
      return parts.join('\n').trim()
    }

    /**
     * Read the newest settled Assistant reply out of the Chat node store.
     * @param {unknown} snapshot Chat snapshot from the session-scoped `useChat` selector hook.
     * @returns {string} plain text of the last assistant message, or '' when there is none.
     */
    function latestReply(snapshot) {
      const nodes = assistantNodes(snapshot)
      for (let i = nodes.length - 1; i >= 0; i--) {
        const value = nodeText(nodes[i])
        if (value) return value
      }
      return ''
    }

    /** The newest assistant message id, used to mark which reply the reader is speaking. */
    function latestAssistantId(snapshot) {
      const nodes = assistantNodes(snapshot)
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].messageId !== undefined && nodes[i].messageId !== null) return nodes[i].messageId
      }
      return null
    }

    /** Text of the assistant reply a message action belongs to. */
    function replyTextFor(snapshot, messageId) {
      const nodes = assistantNodes(snapshot)
      let sawId = false
      let newest = ''
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        const value = nodeText(node)
        if (!newest && value) newest = value
        if (node.messageId === undefined || node.messageId === null) continue
        sawId = true
        if (messageId === undefined || messageId === null || node.messageId === messageId) return value
      }
      // Older payloads carry no messageId; fall back to the newest answer so the action still works.
      return sawId ? '' : newest
    }

    function text(t, key, params) {
      return typeof t === 'function' ? t(key, params) : key
    }

    /* ------------------------------------------------------------------ */
    /* Composer dock: the assistant bar                                    */
    /* ------------------------------------------------------------------ */

    function VoiceAssistantBar(props) {
      const { inputActions, useChat, useSession, useInput, api, t } = props
      const engineRef = React.useRef(null)
      const wakeRef = React.useRef(null)
      const [, force] = React.useState(0)
      const prefs = usePrefs()
      const [pageVisible, setPageVisible] = React.useState(() => !document.hidden)
      const liveInput = useInput ? useInput((state) => state) : null
      const inputRef = React.useRef(liveInput)
      inputRef.current = liveInput

      const reply = useChat ? useChat(latestReply) : ''
      const latestId = useChat ? useChat(latestAssistantId) : null
      const latestIdRef = React.useRef(latestId)
      latestIdRef.current = latestId
      const running = useSession ? useSession((state) => state.running) : false
      const replyRef = React.useRef('')
      replyRef.current = reply
      const baseReplyRef = React.useRef('')
      const speechRef = React.useRef(null)

      speechRef.current = (spoken) => {
        if (!inputActions) return
        const state = inputRef.current
        const existing = state && typeof state.draft === 'string' ? state.draft.trim() : ''
        const payload = existing ? existing + '\n' + spoken : spoken
        baseReplyRef.current = replyRef.current
        try {
          inputActions.setDraft(payload)
        } catch (_error) {
          return
        }
        setTimeout(() => {
          try {
            inputActions.submit()
          } catch (_error) {}
          setTimeout(() => {
            const current = inputRef.current
            const stalled = current && typeof current.draft === 'string' && current.draft.trim() !== '' && current.phase === 'plain'
            if (stalled) {
              try {
                inputActions.submit()
              } catch (_error) {}
            }
          }, 260)
        }, 40)
      }

      if (!engineRef.current) {
        engineRef.current = new Engine({
          onChange: () => force((value) => value + 1),
          transcribe: (request, signal) => api.transcribe(request, signal),
          onSpeech: (spoken) => {
            if (speechRef.current) speechRef.current(spoken)
          },
        })
      }
      const engine = engineRef.current

      if (!wakeRef.current) {
        wakeRef.current = new WakeWord({
          onChange: () => force((value) => value + 1),
          transcribe: (request, signal) => api.transcribe(request, signal),
          onWake: () => {
            if (engineRef.current) engineRef.current.startFromWake()
          },
        })
      }
      const wake = wakeRef.current

      React.useEffect(() => {
        const onKey = (event) => {
          if (event.ctrlKey && event.shiftKey && (event.code === 'Space' || event.key === ' ')) {
            event.preventDefault()
            engine.toggle()
            return
          }
          if (event.key === 'Escape' && engine.active) {
            event.preventDefault()
            engine.stopAll()
          }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [engine])

      React.useEffect(() => {
        const onVisibility = () => setPageVisible(!document.hidden)
        document.addEventListener('visibilitychange', onVisibility)
        return () => document.removeEventListener('visibilitychange', onVisibility)
      }, [])

      // Replies can arrive long after the last click, so unlock audio on the first interaction;
      // without this a fresh AudioContext stays suspended and the reader is silent.
      React.useEffect(() => {
        const wake = () => warmAudio()
        window.addEventListener('pointerdown', wake, true)
        window.addEventListener('keydown', wake, true)
        return () => {
          window.removeEventListener('pointerdown', wake, true)
          window.removeEventListener('keydown', wake, true)
        }
      }, [])

      // One line per mount tells the debug log whether this slot can see the transcript at all.
      React.useEffect(() => {
        diag('bar', { replyLength: replyRef.current.length, latestId: latestIdRef.current || null, speakReplies: getPrefs().speakReplies })
      }, [])

      // The wake loop owns the microphone, so it runs only while the conversation is idle and the
      // page is visible; a detected phrase starts the conversation instead.
      React.useEffect(() => {
        const shouldRun = prefs.wakeWord && !engine.active && pageVisible
        if (shouldRun) void wake.start()
        else wake.stop()
      }, [prefs.wakeWord, engine.active, engine.phase, pageVisible, wake])

      React.useEffect(() => {
        engine.disposed = false
        return () => {
          engine.disposed = true
          engine.run += 1
          if (wakeRef.current) wakeRef.current.stop()
          if (engine.vad) clearInterval(engine.vad)
          engine.vad = null
          if (engine.abort) engine.abort.abort()
          const recording = engine.recording
          engine.recording = null
          if (recording) void recording.close()
          stopSpeaking()
        }
      }, [engine])

      // Speak exactly one answer per spoken request: the newest reply that differs from the
      // reply that was on screen when the request was submitted.
      React.useEffect(() => {
        if (engine.phase !== 'thinking') return
        if (running) return
        if (!reply || reply === baseReplyRef.current) return
        if (prefs.speakReplies) engine.say(reply, latestIdRef.current)
        else engine.afterReply()
      }, [reply, running, engine.phase, prefs.speakReplies, engine])

      // Reading aloud also covers answers to typed messages: once the turn settles and the voice
      // conversation does not own playback, read the newest answer once. The reply text itself is
      // the trigger — message ids are not present in every Chat projection.
      //
      // A page switch remounts this bar and the chat loads asynchronously, which used to look like
      // "a new answer appeared" and replayed the last reply on every return. Only replies whose
      // turn this mounted bar actually watched run (running === true at some point) are read.
      const sawRunningRef = React.useRef(false)
      React.useEffect(() => {
        if (running) sawRunningRef.current = true
      }, [running])
      const spokenTextRef = React.useRef(reply)
      React.useEffect(() => {
        if (!reply || reply === spokenTextRef.current) {
          spokenTextRef.current = reply
          return
        }
        if (!sawRunningRef.current) {
          spokenTextRef.current = reply
          diag('auto-skip', { reason: 'not-our-turn', length: reply.length })
          return
        }
        if (!prefs.speakReplies) {
          spokenTextRef.current = reply
          return
        }
        // Wait for the turn to settle; this effect runs again when `running` flips.
        if (running) return
        if (engine.active || engine.phase === 'thinking' || engine.phase === 'speaking') {
          spokenTextRef.current = reply
          diag('auto-skip', { reason: 'voice-flow', phase: engine.phase, length: reply.length })
          return
        }
        diag('auto-read', { length: reply.length, latestId: latestId || null })
        spokenTextRef.current = reply
        speakAnswer(reply, { ...getPrefs(), messageId: latestId || null }, () => {}, () => {})
      }, [reply, running, prefs.speakReplies, engine, latestId])

      // A Turn that fails without an Assistant message never changes the reply text; give up instead
      // of leaving the bar on "waiting for the answer" forever.
      React.useEffect(() => {
        if (engine.phase !== 'thinking' || running) return undefined
        const timer = setTimeout(() => {
          if (engine.phase !== 'thinking') return
          engine.active = false
          engine.emit({ phase: 'idle', notice: 'noAnswer' })
        }, 25000)
        return () => clearTimeout(timer)
      }, [engine, engine.phase, running])

      const phase = engine.phase
      const status = (() => {
        if (phase === 'requesting') return text(t, 'requesting')
        if (phase === 'listening') return text(t, 'listening')
        if (phase === 'transcribing') return text(t, 'transcribing')
        if (phase === 'thinking') return text(t, 'thinking')
        if (phase === 'speaking') return text(t, 'speaking')
        if (phase === 'error') {
          if (engine.notice && typeof engine.notice === 'object') return text(t, engine.notice.key, engine.notice.params)
          if (engine.notice) return text(t, engine.notice)
          return text(t, 'failed', { message: '' })
        }
        if (engine.notice) {
          if (typeof engine.notice === 'object') return text(t, engine.notice.key, engine.notice.params)
          return text(t, engine.notice)
        }
        if (phase === 'idle' && prefs.wakeWord) {
          if (wake.state === 'error') return text(t, 'wakeBlocked', { message: wake.error || '' })
          if (wake.state === 'starting') return text(t, 'requesting')
          if (wake.state === 'listening') return text(t, 'wakeListening')
        }
        return text(t, 'ready')
      })()

      const heardRecently = prefs.wakeWord && phase === 'idle' && wake.lastHeard && Date.now() - wake.lastHeardAt < 8000
      const quote = phase === 'thinking' || phase === 'speaking'
        ? engine.transcript
        : heardRecently ? text(t, 'heard') + wake.lastHeard : ''
      const failed = phase === 'error'
        || Boolean(engine.notice && phase === 'idle' && engine.notice !== '')
        || (phase === 'idle' && prefs.wakeWord && wake.state === 'error')

      return h('div', {
        className: 'dshva-root',
        'data-phase': phase,
      },
        h('style', { key: 'dshva-style' }, CSS),
        h('button', {
          key: 'mic',
          type: 'button',
          className: 'dshva-mic',
          onClick: () => engine.toggle(),
          title: text(t, engine.active ? 'stop' : 'start'),
          'aria-label': text(t, engine.active ? 'stop' : 'start'),
          'aria-pressed': engine.active,
        }, engine.active ? stopIcon() : micIcon()),
        h('div', { key: 'text', className: 'dshva-text' },
          h('span', { className: 'dshva-status', role: 'status', 'aria-live': 'polite', style: failed ? { color: 'var(--dsw-alias-state-error-primary)' } : undefined }, status),
          quote ? h('span', { className: 'dshva-quote', title: quote }, quote) : null),
        h('div', { key: 'controls', className: 'dshva-controls' },
          h('span', { className: 'dshva-toggle' },
            h('span', null, text(t, 'wake')),
            h(Switch, {
              checked: prefs.wakeWord,
              onChange: (next) => setPrefs({ wakeWord: next }),
              label: text(t, 'settings.wake'),
            })),
          h('span', { className: 'dshva-toggle' },
            h('span', null, text(t, 'continuous')),
            h(Switch, {
              checked: prefs.continuous,
              onChange: (next) => setPrefs({ continuous: next }),
              label: text(t, 'settings.continuous'),
            })),
          h('span', { className: 'dshva-toggle' },
            h('span', null, text(t, 'speak')),
            h(Switch, {
              checked: prefs.speakReplies,
              onChange: (next) => setPrefs({ speakReplies: next }),
              label: text(t, 'settings.speak'),
            }))),
        h('span', { key: 'hint', className: 'dshva-hint' }, text(t, 'shortcut')))
    }

    /* ------------------------------------------------------------------ */
    /* Assistant message action: read this answer aloud, or stop it         */
    /* ------------------------------------------------------------------ */

    function AssistantReadAction({ sessionId, messageId, useChat, t }) {
      const status = useSpeechStatus()
      const answer = useChat ? useChat((snapshot) => replyTextFor(snapshot, messageId)) : ''
      if (!answer) return null
      const mine = status.active && status.messageId === messageId
      const label = text(t, mine ? 'action.stop' : 'action.play')
      return h('button', {
        type: 'button',
        className: 'dshva-action',
        'aria-label': label,
        'aria-pressed': mine ? 'true' : 'false',
        title: label,
        onClick: () => {
          warmAudio()
          if (mine || status.active) stopSpeaking()
          if (mine) return
          speakAnswer(answer, { ...getPrefs(), messageId }, () => {}, () => {})
        },
      }, mine ? stopIcon() : playIcon())
    }

    /* ------------------------------------------------------------------ */
    /* Settings → General: one row with an inline panel                    */
    /* ------------------------------------------------------------------ */

    function VoiceAssistantSettings({ t }) {
      const prefs = usePrefs()
      const [open, setOpen] = React.useState(false)
      const [previewNote, setPreviewNote] = React.useState('')
      const systemVoices = useSystemVoices()
      const catalogue = useCatalogue()
      const edgeVoices = catalogue.edge
      const title = text(t, 'settings.title')
      const engineOptions = [
        { value: 'mimo', label: text(t, 'settings.engineMimo') },
        { value: 'edge', label: text(t, 'settings.engineEdge') },
        { value: 'system', label: text(t, 'settings.engineSystem') },
      ]
      const edgeVoice = edgeVoices.some((voice) => voice.shortName === prefs.edgeVoice) ? prefs.edgeVoice : (edgeVoices[0] ? edgeVoices[0].shortName : EDGE_VOICE_DEFAULT)
      const edgeVoiceOptions = edgeVoices.map((voice) => ({ value: voice.shortName, label: edgeVoiceLabel(voice, t) }))
      const mimoVoice = MIMO_VOICES.some((voice) => voice.value === prefs.mimoVoice) ? prefs.mimoVoice : MIMO_VOICE_DEFAULT
      const selectedSystemVoice = prefs.systemVoice && systemVoices.some((voice) => voice.name === prefs.systemVoice) ? prefs.systemVoice : ''
      const systemVoiceOptions = [
        { value: '', label: text(t, 'settings.voiceAuto') },
        ...systemVoices.map((voice) => ({ value: voice.name, label: voiceLabel(voice) })),
      ]
      const preview = (options) => {
        setPreviewNote('')
        speakAnswer(text(t, 'settings.previewSample'), options, () => setPreviewNote(''), (notice) => setPreviewNote(text(t, notice || 'edgeFallback')))
      }
      const hostDown = catalogue.ok === false
      const mimoMissing = catalogue.ok !== false && !catalogue.mimoReady
      const voiceField = prefs.engine === 'mimo'
        ? h(SelectField, {
          label: text(t, 'settings.voice'),
          hint: text(t, 'settings.voiceHintMimo'),
          value: mimoVoice,
          options: MIMO_VOICES,
          onChange: (next) => setPrefs({ mimoVoice: next }),
          action: text(t, 'settings.preview'),
          onAction: () => preview({ ...prefs, engine: 'mimo', mimoVoice }),
        })
        : prefs.engine === 'edge'
          ? h(SelectField, {
            label: text(t, 'settings.voice'),
            hint: text(t, 'settings.voiceHintEdge'),
            value: edgeVoice,
            options: edgeVoiceOptions,
            onChange: (next) => setPrefs({ edgeVoice: next }),
            action: text(t, 'settings.preview'),
            onAction: () => preview({ ...prefs, engine: 'edge', edgeVoice }),
          })
          : h(SelectField, {
            label: text(t, 'settings.voice'),
            hint: text(t, 'settings.voiceHintSystem'),
            value: selectedSystemVoice,
            options: systemVoiceOptions,
            onChange: (next) => setPrefs({ systemVoice: next }),
            action: text(t, 'settings.preview'),
            onAction: () => preview({ ...prefs, engine: 'system', systemVoice: selectedSystemVoice }),
          })
      return h('div', { className: 'dshva-settings' },
        h('style', { key: 'dshva-style' }, CSS),
        h('div', { className: 'dshva-row' },
          h('div', { className: 'dshva-row-main' },
            h('div', { className: 'dshva-row-title' }, title),
            h('div', { className: 'dshva-row-desc' }, text(t, 'settings.description'))),
          h('button', {
            type: 'button',
            className: 'dshva-row-action',
            'aria-expanded': open ? 'true' : 'false',
            'aria-controls': 'dshva-settings-panel',
            onClick: () => setOpen((value) => !value),
          },
            h('span', null, text(t, open ? 'settings.collapse' : 'settings.configure')),
            chevron())),
        open ? h('div', { className: 'dshva-panel', id: 'dshva-settings-panel', role: 'group', 'aria-label': title },
          h(ToggleField, {
            label: text(t, 'settings.wake'),
            hint: text(t, 'settings.wakeHint'),
            checked: prefs.wakeWord,
            onChange: (next) => setPrefs({ wakeWord: next }),
          }),
          h(ToggleField, {
            label: text(t, 'settings.continuous'),
            hint: text(t, 'settings.continuousHint'),
            checked: prefs.continuous,
            onChange: (next) => setPrefs({ continuous: next }),
          }),
          h(ToggleField, {
            label: text(t, 'settings.speak'),
            hint: text(t, 'settings.speakHint'),
            checked: prefs.speakReplies,
            onChange: (next) => setPrefs({ speakReplies: next }),
          }),
          h(SelectField, {
            label: text(t, 'settings.engine'),
            hint: text(t, 'settings.engineHint'),
            value: prefs.engine,
            options: engineOptions,
            onChange: (next) => setPrefs({ engine: next }),
          }),
          prefs.engine === 'mimo'
            ? h(SelectField, {
              label: text(t, 'settings.mimoMode'),
              hint: text(t, 'settings.mimoModeHint'),
              value: prefs.mimoMode,
              options: [
                { value: 'clean', label: text(t, 'settings.mimoModeClean') },
                { value: 'stream', label: text(t, 'settings.mimoModeStream') },
              ],
              onChange: (next) => setPrefs({ mimoMode: next }),
            })
            : null,
          voiceField,
          hostDown
            ? h('div', { className: 'dshva-field-hint', style: { color: 'var(--dsw-alias-state-warning-primary, #b7791f)' } }, text(t, 'settings.edgeHostDown'))
            : null,
          mimoMissing && prefs.engine === 'mimo'
            ? h('div', { className: 'dshva-field-hint', style: { color: 'var(--dsw-alias-state-warning-primary, #b7791f)' } }, text(t, 'settings.mimoMissing'))
            : null,
          previewNote
            ? h('div', { className: 'dshva-field-hint', style: { color: 'var(--dsw-alias-state-warning-primary, #b7791f)' } }, previewNote)
            : null,
          h(RangeField, {
            label: text(t, 'settings.rate'),
            hint: text(t, 'settings.rateHint'),
            value: prefs.rate,
            min: 0.7,
            max: 1.6,
            step: 0.05,
            display: prefs.rate.toFixed(2) + '×',
            onChange: (next) => setPrefs({ rate: next }),
          }),
          h(RangeField, {
            label: text(t, 'settings.maxSeconds'),
            hint: text(t, 'settings.maxSecondsHint'),
            value: prefs.maxSeconds,
            min: 10,
            max: 90,
            step: 5,
            display: prefs.maxSeconds + ' s',
            onChange: (next) => setPrefs({ maxSeconds: next }),
          }),
          h('div', { className: 'dshva-field' },
            h('div', { className: 'dshva-field-main' },
              h('div', { className: 'dshva-field-label' }, text(t, 'settings.shortcut')),
              h('div', { className: 'dshva-field-hint' }, text(t, 'settings.shortcutHint'))),
            h('div', { className: 'dshva-field-value' },
              h('kbd', { className: 'dshva-kbd' }, 'Ctrl+Shift+Space'),
              h('button', {
                type: 'button',
                className: 'dshva-reset',
                onClick: () => setPrefs({ ...PREF_DEFAULTS }),
              }, text(t, 'settings.reset'))))) : null)
    }

    /* ------------------------------------------------------------------ */
    /* Plugin entry                                                        */
    /* ------------------------------------------------------------------ */

    const inject = ['slots', 'locale', 'remote']

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }))
      diag('boot', { client: '1.4.1' })
      // Shared stylesheet: the message action lives in a toolbar where an inline <style> would be
      // invalid markup, so register the rules once for every surface.
      ctx.effect(() => {
        const style = document.createElement('style')
        style.dataset.plugin = NS
        style.textContent = CSS
        document.head.appendChild(style)
        return () => style.remove()
      }, 'voice-assistant: styles')
      // `remote.speech` is mounted by the installed dictation plugin; defer until it exists so this
      // plugin stays dormant instead of throwing in a profile without speech recognition.
      ctx.inject(['remote.speech', 'slots'], (scope) => {
        const api = {
          transcribe: (request, signal) => scope.remote.speech.transcribe(request, signal),
        }
        scope.slots.inject('conversation.composer.dock', () => scope.slots.register({
          name: 'conversation.composer.dock',
          id: 'voice-assistant',
          order: 2,
          locale: NS,
          inject: () => ({ api }),
        }, VoiceAssistantBar))
        scope.slots.inject('settings.general.item', () => scope.slots.register({
          name: 'settings.general.item',
          id: 'voice-assistant',
          order: 31,
          locale: NS,
        }, VoiceAssistantSettings))
      })
      // Reading an existing answer aloud does not need dictation, so this action is registered on
      // its own: it works even in a profile without the speech-to-text plugin.
      ctx.inject(['slots'], (scope) => {
        scope.slots.inject('conversation.chat.assistant-actions', () => scope.slots.register({
          name: 'conversation.chat.assistant-actions',
          id: 'voice-assistant-read',
          order: 21,
          locale: NS,
        }, AssistantReadAction))
      })
    }

    return { inject, apply }
  },
})

