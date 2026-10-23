# Third-party notices

This repository is MIT-licensed (see [LICENSE](LICENSE)). It also redistributes one third-party build:

## `lib/msedge-tts.cjs`

A verbatim copy of the `msedge-tts` client bundle (version 2.1.0 line) that ships inside the
`dsh-voice-mode` plugin. That bundle is a build of the MIT-licensed project
**MsEdgeTTS** — <https://github.com/Migushthe2nd/MsEdgeTTS> — together with its runtime dependencies.
The copyright in that code belongs to the MsEdgeTTS authors and the authors of its dependencies.

It is used here, unchanged, on the **Host** side to talk to Microsoft Edge's read-aloud service.
No modifications have been made to it; do not edit the file if you intend to keep it in sync with upstream.

Upstream license text (MIT):

> MIT License
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software
> and associated documentation files (the "Software"), to deal in the Software without
> restriction, including without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

If you redistribute this repository or a build of it, keep this file and the upstream link with it.

### Service notice

The voices themselves are produced by Microsoft's Edge read-aloud service, which is not a
documented, stable public API: availability, rate limits and terms are Microsoft's to change.
When it is unreachable the plugin falls back to the locally installed system voices.

### Other services used at runtime

- **Xiaomi MiMo TTS** (`api.xiaomimimo.com`) — used only when a user configures their own API key. No MiMo code is
  bundled here.
- **Local speech recognition** — provided by the separately installed DeepSeek Harness voice-input bundle
  (SenseVoice); no model files are included in this repository.
