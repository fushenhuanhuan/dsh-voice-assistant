/**
 * Host half of the voice-assistant bundle.
 *
 * The browser half records, transcribes through the dictation plugin and drives the Composer. Only
 * the spoken answer needs the Host, for two reasons a page cannot work around:
 *
 *  - Microsoft Edge's read-aloud service needs a WebSocket handshake with headers and a signed token;
 *  - Xiaomi MiMo TTS is an OpenAI-style endpoint that needs an API key kept out of the browser.
 *
 * Routes:
 *   POST /voice-assistant/stream  { engine, text, voice, rate } -> PCM16 24 kHz mono, streamed
 *   POST /voice-assistant/tts     { engine, text, voice, rate } -> audio/mpeg (Edge) or audio/wav (MiMo)
 *   GET  /voice-assistant/voices                               -> { edge, mimo, mimoReady }
 *
 * `stream` is the fast path: MiMo generates faster than real time, so the first samples reach the
 * page in well under a second and playback starts while the rest is still being generated.
 *
 * The Edge client is `lib/msedge-tts.cjs`, a verbatim copy of the MIT-licensed `msedge-tts` build
 * shipped inside the `dsh-voice-mode` plugin (see THIRD_PARTY.md). The MiMo key lives in
 * `%USERPROFILE%\.dsh\voice-assistant.json` as `{ "mimoApiKey": "..." }`.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { MsEdgeTTS, OUTPUT_FORMAT } from './lib/msedge-tts.cjs'

const STREAM_ROUTE = '/voice-assistant/stream'
const TTS_ROUTE = '/voice-assistant/tts'
const VOICES_ROUTE = '/voice-assistant/voices'

const EDGE_VOICES_URL = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'

const MIMO_URL = 'https://api.xiaomimimo.com/v1/chat/completions'
const MIMO_MODEL = 'mimo-v2.5-tts'
const MIMO_VOICES = ['冰糖', '茉莉', '苏打', '白桦', 'Mia', 'Chloe', 'Milo', 'Dean']
const MIMO_SAMPLE_RATE = 24000

const DEFAULT_EDGE_VOICE = 'zh-CN-XiaoxiaoNeural'
const DEFAULT_MIMO_VOICE = '冰糖'
const VOICE_PATTERN = /^[A-Za-z]{2,3}-[A-Za-z]{2,4}(?:-[A-Za-z0-9]+)+Neural$/

const MAX_TEXT = 800
const MAX_BODY = 16 * 1024
const EDGE_ATTEMPTS = 3

const CONFIG_FILE = path.join(os.homedir(), '.dsh', 'voice-assistant.json')

/** Edge voices, filtered to the languages this UI labels; cached for a few hours. */
const voicesCache = { at: 0, value: null }

/** MiMo key cache — re-read at most every 5 s so editing the file needs no restart. */
const keyCache = { at: 0, value: '' }

/** Reused across chunks: one WebSocket handshake instead of one per sentence. */
let edgeTts = null
let edgeVoice = ''
let edgeChain = Promise.resolve()

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function mimoKey() {
  const now = Date.now()
  if (now - keyCache.at < 5000) return keyCache.value
  let value = ''
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    if (typeof raw.mimoApiKey === 'string') value = raw.mimoApiKey.trim()
  } catch (_error) {}
  if (!value && typeof process.env.DSH_SECRET_MIMO_API_KEY === 'string') value = process.env.DSH_SECRET_MIMO_API_KEY.trim()
  keyCache.at = now
  keyCache.value = value
  return value
}

/** Turn the assistant's 0.7–1.6 multiplier into an SSML prosody rate. */
function prosodyRate(rate) {
  const factor = Number.isFinite(rate) ? Math.min(2, Math.max(0.5, rate)) : 1
  const percent = Math.round((factor - 1) * 100)
  return `${percent >= 0 ? '+' : ''}${percent}%`
}

/** MiMo has no rate knob; a short style instruction is the supported way to steer pacing. */
function mimoStyle(rate) {
  const factor = Number.isFinite(rate) ? rate : 1
  if (factor <= 0.9) return '语速放慢一些，吐字清晰，语气自然。'
  if (factor >= 1.15) return '语速稍快一些，保持自然，不要赶。'
  return ''
}

function mimoMessages(text, rate) {
  const messages = []
  const style = mimoStyle(rate)
  if (style) messages.push({ role: 'user', content: style })
  messages.push({ role: 'assistant', content: text })
  return messages
}

/* -------------------------------------------------------------------------- */
/* Edge                                                                        */
/* -------------------------------------------------------------------------- */

function edgeRun(task) {
  const run = edgeChain.then(task, task)
  edgeChain = run.catch(() => {})
  return run
}

async function edgeGet(voice) {
  if (!edgeTts) edgeTts = new MsEdgeTTS({ connectionTimeoutMs: 12000, synthesisTimeoutMs: 45000 })
  if (voice !== edgeVoice) {
    await edgeTts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
    edgeVoice = voice
  }
  return edgeTts
}

function edgeReset() {
  if (edgeTts) {
    try {
      edgeTts.close()
    } catch (_error) {}
  }
  edgeTts = null
  edgeVoice = ''
}

async function edgeSynthesizeOnce(text, voice, rate) {
  // The client inserts the text into its SSML template verbatim, so escape what would break it.
  const safe = text.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]))
  const tts = await edgeGet(voice)
  const { audioStream } = await tts.toStream(safe, { rate: prosodyRate(rate) })
  const chunks = []
  for await (const chunk of audioStream) chunks.push(chunk)
  if (chunks.length === 0) throw new Error('no audio received')
  return Buffer.concat(chunks)
}

/** Synthesise one Edge chunk as MP3, retrying the transient failures the service hands out. */
export function synthesizeEdge(text, voice = DEFAULT_EDGE_VOICE, rate = 1) {
  return edgeRun(async () => {
    let lastError = null
    for (let attempt = 1; attempt <= EDGE_ATTEMPTS; attempt += 1) {
      try {
        return await edgeSynthesizeOnce(text, voice, rate)
      } catch (error) {
        lastError = error
        edgeReset()
        if (attempt === EDGE_ATTEMPTS) break
        await sleep(400 * attempt * attempt)
      }
    }
    throw lastError || new Error('synthesis failed')
  })
}

/** Mainland voices first in the order the settings picker should show them. */
const VOICE_ORDER = [
  'zh-CN-XiaoxiaoNeural',
  'zh-CN-XiaoyiNeural',
  'zh-CN-YunxiNeural',
  'zh-CN-YunjianNeural',
  'zh-CN-YunyangNeural',
  'zh-CN-YunxiaNeural',
  'zh-CN-liaoning-XiaobeiNeural',
  'zh-CN-shaanxi-XiaoniNeural',
]

function voiceRank(voice) {
  const index = VOICE_ORDER.indexOf(voice.shortName)
  if (index >= 0) return index
  if (voice.locale === 'zh-CN') return VOICE_ORDER.length
  if (voice.locale === 'zh-TW') return VOICE_ORDER.length + 1
  if (voice.locale === 'zh-HK') return VOICE_ORDER.length + 2
  return VOICE_ORDER.length + 3
}

async function listEdgeVoices() {
  const now = Date.now()
  if (voicesCache.value && now - voicesCache.at < 6 * 60 * 60 * 1000) return voicesCache.value
  const response = await fetch(EDGE_VOICES_URL, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`voice list answered ${response.status}`)
  const all = await response.json()
  const voices = all
    .filter((voice) => typeof voice.ShortName === 'string' && /^(zh|en)[-_]/i.test(voice.Locale || ''))
    .map((voice) => ({
      shortName: voice.ShortName,
      locale: voice.Locale,
      gender: voice.Gender,
      label: voice.FriendlyName || voice.ShortName,
    }))
    .sort((left, right) => voiceRank(left) - voiceRank(right) || left.shortName.localeCompare(right.shortName))
  voicesCache.at = now
  voicesCache.value = voices
  return voices
}

/* -------------------------------------------------------------------------- */
/* MiMo                                                                        */
/* -------------------------------------------------------------------------- */

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch (_error) {
    return null
  }
}

async function mimoRequest(text, voice, rate, stream) {
  const key = mimoKey()
  if (!key) {
    throw Object.assign(new Error('MiMo API key is not configured'), { code: 'mimo-key-missing' })
  }
  const body = {
    model: MIMO_MODEL,
    messages: mimoMessages(text, rate),
    audio: { format: stream ? 'pcm' : 'wav', voice: MIMO_VOICES.includes(voice) ? voice : DEFAULT_MIMO_VOICE },
    stream,
  }
  const response = await fetch(MIMO_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw Object.assign(new Error(`MiMo answered ${response.status} ${detail.slice(0, 160)}`), { code: 'mimo-failed' })
  }
  return response
}

/** Non-streaming MiMo synthesis (WAV), used by the request/response fallback route. */
export async function synthesizeMimo(text, voice = DEFAULT_MIMO_VOICE, rate = 1) {
  const response = await mimoRequest(text, voice, rate, false)
  const data = await response.json()
  const audio = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.audio
  if (!audio || typeof audio.data !== 'string') throw new Error('MiMo returned no audio')
  return Buffer.from(audio.data, 'base64')
}

/**
 * Stream MiMo PCM into `write` as the deltas arrive; resolves with the number of bytes written.
 * @param {(chunk: Buffer) => Promise<void> | void} write
 */
async function streamMimo(text, voice, rate, write) {
  const response = await mimoRequest(text, voice, rate, true)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let written = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let index
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index).trim()
        buffer = buffer.slice(index + 1)
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        const delta = safeJson(payload)
        const data = delta && delta.choices && delta.choices[0] && delta.choices[0].delta && delta.choices[0].delta.audio && delta.choices[0].delta.audio.data
        if (typeof data !== 'string' || data.length === 0) continue
        const pcm = Buffer.from(data, 'base64')
        if (pcm.length === 0) continue
        await write(pcm)
        written += pcm.length
      }
    }
  } finally {
    try {
      await reader.cancel()
    } catch (_error) {}
  }
  return written
}

/* -------------------------------------------------------------------------- */
/* HTTP plumbing                                                               */
/* -------------------------------------------------------------------------- */

function send(res, status, body, headers = {}) {
  if (res.headersSent) {
    res.end()
    return
  }
  res.statusCode = status
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value)
  res.end(body)
}

function sendJson(res, status, value) {
  send(res, status, JSON.stringify(value), { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('body too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function readRequest(req, res, fallbackEngine, engines) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    sendJson(res, 405, { error: 'method-not-allowed' })
    return null
  }
  let payload
  try {
    payload = JSON.parse(await readBody(req))
  } catch (error) {
    sendJson(res, error && error.status === 413 ? 413 : 400, { error: 'invalid-body' })
    return null
  }
  const text = typeof payload.text === 'string' ? payload.text.trim() : ''
  if (!text) {
    sendJson(res, 400, { error: 'empty-text' })
    return null
  }
  if (text.length > MAX_TEXT) {
    sendJson(res, 413, { error: 'text-too-long' })
    return null
  }
  const engine = engines.includes(payload.engine) ? payload.engine : fallbackEngine
  const rateValue = Number(payload.rate)
  const rate = Number.isFinite(rateValue) ? Math.min(2, Math.max(0.5, rateValue)) : 1
  const voice = typeof payload.voice === 'string' ? payload.voice.trim().slice(0, 80) : ''
  return { text, engine, rate, voice }
}

/** Stream raw PCM16 to the response, honouring backpressure. */
function pcmWriter(res) {
  return async (chunk) => {
    if (res.destroyed || res.writableEnded) throw new Error('client went away')
    if (!res.write(chunk)) {
      await new Promise((resolve) => {
        const done = () => {
          res.off('drain', done)
          res.off('close', done)
          resolve()
        }
        res.on('drain', done)
        res.on('close', done)
      })
    }
  }
}

async function handleStream(req, res) {
  const request = await readRequest(req, res, 'mimo', ['mimo'])
  if (!request) return
  if (!mimoKey()) {
    sendJson(res, 409, { error: 'mimo-key-missing' })
    return
  }
  const { text, rate, voice } = request
  res.statusCode = 200
  res.setHeader('content-type', 'application/octet-stream')
  res.setHeader('x-sample-rate', String(MIMO_SAMPLE_RATE))
  res.setHeader('x-channels', '1')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  try {
    await streamMimo(text, voice || DEFAULT_MIMO_VOICE, rate, pcmWriter(res))
  } catch (error) {
    // Headers are already out, so the only clean signal left is to abort the body.
    if (!res.writableEnded) res.destroy(error)
    return
  }
  res.end()
}

async function handleTts(req, res) {
  const request = await readRequest(req, res, 'edge', ['edge', 'mimo'])
  if (!request) return
  const { text, engine, rate, voice } = request
  if (engine === 'mimo') {
    try {
      const audio = await synthesizeMimo(text, voice || DEFAULT_MIMO_VOICE, rate)
      send(res, 200, audio, {
        'content-type': 'audio/wav',
        'content-length': String(audio.length),
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      })
    } catch (error) {
      const code = (error && error.code) || 'synthesis-failed'
      sendJson(res, code === 'mimo-key-missing' ? 409 : 502, { error: code })
    }
    return
  }
  const edgeVoiceName = VOICE_PATTERN.test(voice) ? voice : DEFAULT_EDGE_VOICE
  try {
    const audio = await synthesizeEdge(text, edgeVoiceName, rate)
    send(res, 200, audio, {
      'content-type': 'audio/mpeg',
      'content-length': String(audio.length),
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    })
  } catch (_error) {
    sendJson(res, 502, { error: 'synthesis-failed' })
  }
}

async function handleVoices(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET')
    sendJson(res, 405, { error: 'method-not-allowed' })
    return
  }
  let edge = []
  let edgeError = null
  try {
    edge = await listEdgeVoices()
  } catch (error) {
    edgeError = String((error && error.message) || error)
  }
  sendJson(res, 200, {
    edge,
    edgeError,
    mimo: MIMO_VOICES,
    mimoReady: mimoKey().length > 0,
  })
}

/* -------------------------------------------------------------------------- */
/* Diagnostics                                                                 */
/* -------------------------------------------------------------------------- */

const LOG_ROUTE = '/voice-assistant/log'
const LOG_FILE = path.join(os.homedir(), '.dsh', 'voice-assistant.log')
const LOG_LIMIT = 512 * 1024

/** Append one line to the local debug log; capped so it cannot grow without bound. */
async function handleLog(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    sendJson(res, 405, { error: 'method-not-allowed' })
    return
  }
  let payload
  try {
    payload = JSON.parse(await readBody(req))
  } catch (_error) {
    sendJson(res, 400, { error: 'invalid-body' })
    return
  }
  const line = `${new Date().toISOString()} ${String(payload.tag || 'event')} ${JSON.stringify(payload.data || null)}\n`
  try {
    fs.appendFileSync(LOG_FILE, line)
    const stat = fs.statSync(LOG_FILE)
    if (stat.size > LOG_LIMIT) fs.truncateSync(LOG_FILE, 0)
  } catch (_error) {}
  res.statusCode = 204
  res.end()
}

/** Host services this plugin needs. */
export const inject = ['webServer']

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: STREAM_ROUTE, handler: handleStream }), 'voice-assistant: streaming route')
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: TTS_ROUTE, handler: handleTts }), 'voice-assistant: synthesis route')
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: VOICES_ROUTE, handler: handleVoices }), 'voice-assistant: voice list route')
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: LOG_ROUTE, handler: handleLog }), 'voice-assistant: debug log route')
}
