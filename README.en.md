# DSH Voice Assistant

A hands-free voice front end for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI:
**speak → transcribe → send → hear the answer → keep talking**, with an optional local wake word.

Answers are read with **Xiaomi MiMo streaming voices** by default (first audio in ~0.5–0.7 s), falling back to
**Microsoft Edge voices** and then to the **local system voice**.

中文说明见 [README.md](README.md)。

## Features

- **Voice input** — click the microphone, speak, pause for ~1 s; the transcript is sent through the Composer's own submit path.
- **Spoken answers** — the reply text is read aloud; code blocks are skipped and very long answers are cut at ~900 characters.
- **Wake word** `你好大肥鱼` — hands-free start; detection runs locally on the already-installed dictation model.
- **Continuous conversation** — starts listening again after each answer.
- **Play button** — every assistant message gets a play/stop control, so any single answer can be re-read on demand.
- **Three TTS engines** — MiMo (streaming or whole-sentence), Edge, system voice; automatic downgrade on failure.
- **Settings panel** — wake word, continuous mode, read-aloud, engine, mode, voice, speed, recording limit, reset.

## Requirements

1. DSH desktop (developed and verified against `0.2.1-rc.2`).
2. The official **voice input** plugin (`@deepseek-ai/dsh-experimental-voice-input-bundle`, SenseVoice transcription).
   Without it this plugin stays dormant: no status bar, no errors.

## Install

```bash
git clone https://github.com/fushenhuanhuan/dsh-voice-assistant.git
```

Install that directory as a local DSH bundle (the agent in DSH installs it with the plugin manager's
`install_bundle`, pointing at the absolute path). DSH **links** the directory into the profile — files are not copied —
and the plugin then appears under Settings → Plugins, where it can be disabled or removed. Reload the page and the
assistant bar appears under the composer.

The package is named `@local/voice-assistant` and marked `private`: it is not published to npm. Renaming it means
changing both `name` in `package.json` and the module `id` in `client.js`, then reinstalling.

## Usage

- The status bar has a microphone button on the left and three switches on the right: **Wake word**, **Continuous**, **Read replies**.
- Say something, pause for ~1 s, and the recording ends and sends itself.
- With **Wake word** on, say **你好大肥鱼**, wait for the ding, then ask your question.
- `Ctrl+Shift+Space` starts/ends a conversation; `Esc` stops it.

## How the reading works

1. **Xiaomi MiMo** (default). *Low latency* splits the answer into ≤45-character chunks and POSTs each to
   `/voice-assistant/stream`; the host relays MiMo's SSE audio while the page schedules PCM16 samples on one shared
   WebAudio timeline. *Clear* fetches whole-sentence WAVs from `/voice-assistant/tts` (cleaner, slower first sound).
2. **Microsoft Edge** — `/voice-assistant/tts`, synthesized by the bundled `lib/msedge-tts.cjs`; the connection is
   reused across sentences and retried 3 times on 429/timeout.
3. **System voice** — the browser's own voices; fully offline.

## MiMo API key

The host reads `%USERPROFILE%\.dsh\voice-assistant.json`:

```json
{ "mimoApiKey": "your key" }
```

It is re-read at most every 5 s, so no restart is needed. Without a key the MiMo engine reports it and falls back to
Edge. `DSH_SECRET_MIMO_API_KEY` in the host environment works as a fallback. **No key is stored in this repository.**

## Host routes

| Method | Path | Payload / result |
|---|---|---|
| POST | `/voice-assistant/stream` | `{engine:'mimo', text, voice, rate}` → PCM16 24 kHz mono |
| POST | `/voice-assistant/tts` | `{engine:'edge'\|'mimo', text, voice, rate}` → `audio/mpeg` or `audio/wav` |
| GET | `/voice-assistant/voices` | `{edge, edgeError, mimo, mimoReady}` |
| POST | `/voice-assistant/log` | front-end diagnostics → `%USERPROFILE%\.dsh\voice-assistant.log` |

Up to 800 characters and 16 KB per request; the routes live on DSH's own web server, same origin as the page.

## Repository layout

```
client.js            browser half: recording/VAD, wake word, playback timeline, bar, settings, message play button
index.js             host half: synthesis routes, MiMo/Edge clients, downgrade and logging
lib/msedge-tts.cjs   bundled msedge-tts build (third-party MIT, see THIRD_PARTY.md)
locale/              plugin title and description (zh/en)
tools/windows-voices optional Windows registry scripts (not part of the runtime)
cordis.patch.yml     bundle row
scripts/check.mjs    dependency-free repository checks
```

## Development

```bash
npm run check   # syntax, JSON and manifest-reference checks; no dependencies
```

The profile links to this directory, so editing `client.js` and reloading the page is enough.

## Privacy and limits

- Reading aloud **sends the answer text out**: to Xiaomi (MiMo) or Microsoft (Edge). Use the system voice for a fully offline path.
- The wake word keeps the microphone open and runs local recognition on every voiced segment; turn the switch off to release it.
- Both cloud voices are best-effort services that may change or fail; the plugin always downgrades to a working engine.

## License

[MIT](LICENSE). `lib/msedge-tts.cjs` is third-party MIT code — see [THIRD_PARTY.md](THIRD_PARTY.md).
