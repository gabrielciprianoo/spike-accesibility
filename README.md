# Spike: Voice-Dictated Comments and Read-Aloud (es-MX)

Investigates whether the browser's native **Web Speech API** — no backend, no paid cloud service — is good enough to add:

1. **Voice dictation** (speech-to-text) for writing a comment.
2. **Read-aloud** (text-to-speech) for an existing comment.

...locked to Mexican Spanish (`es-MX`). The app itself is a throwaway local comment list (`localStorage`, no auth, no server) — the point of the spike is the speech layer, and everything here is written so the pattern can be lifted into any other React project.

## Why this matters beyond this repo

Both `SpeechRecognition` (STT) and `SpeechSynthesis` (TTS) are free, built into the browser, and require zero API keys or backend calls. That makes them attractive for adding accessibility features fast. But they come with real, non-obvious rough edges that this spike surfaces and works around. If your project needs voice input/output, the three hooks in `src/hooks/` are close to drop-in — read on for what they handle and why.

## Architecture

```
src/
  types.ts                    Comment + SpeechSupport types
  lib/storage.ts              localStorage load/save (key "comments:v1")
  hooks/
    useSpeechSupport.ts       feature detection (can we even try STT/TTS?)
    useSpeechToText.ts        wraps SpeechRecognition
    useTextToSpeech.ts        wraps SpeechSynthesis
  components/
    Composer.tsx              text field + mic button + submit
    CommentList.tsx / CommentItem.tsx   list + per-comment speaker button
  App.tsx                      wires it all together
```

Nothing here depends on a UI framework — plain CSS in `src/index.css`.

## How the pieces work

### 1. Feature detection (`useSpeechSupport`)

Web Speech API support is inconsistent across browsers, so the app never blindly tries to use it. On mount:

- `sttAvailable` — checks whether `SpeechRecognition` or `webkitSpeechRecognition` exists on `window`.
- `ttsAvailable` — checks whether `speechSynthesis` exists **and** an `es-MX` voice shows up in `getVoices()`.

The tricky part: `getVoices()` often returns an **empty array on the very first call** because some browsers load the voice list asynchronously. The hook re-checks on the `voiceschanged` event, so `ttsAvailable` flips to `true` once the list actually loads instead of staying stuck at `false`.

Both flags drive `disabled` state on the mic and speaker buttons — the UI never attempts a call that's going to fail silently or throw.

### 2. Dictation (`useSpeechToText`)

Wraps `SpeechRecognition`, locked to `es-MX`. Two decisions here matter more than they look:

- **`continuous: true` + `interimResults: true`**, not the defaults. With `continuous: false`, Chrome/Brave/Safari stop listening the instant they detect *any* pause after speech (sometimes within a second) — so a user barely gets one word out before it cuts off. `continuous: true` keeps the mic open until the user explicitly clicks stop. Because `results` becomes cumulative in this mode, the hook tracks `event.resultIndex` to only append *new* final results, avoiding duplicated text.
- **Silent auto-retry on `network` errors.** Chrome-family browsers don't run STT locally — audio is streamed to Google's speech backend. That backend intermittently returns a `network` error even with a fine internet connection (especially right after starting, or in some regions). The hook retries automatically (up to 2x, 400ms apart) before ever telling the user anything went wrong; only a persistent failure surfaces the inline error + a manual "retry" action.
- **Every error is surfaced, not swallowed.** Permission denial, no microphone, unsupported language, aborted session — each maps to a plain-language message in `Composer.tsx`, and the mic stays enabled so the user can just try again.

### 3. Read-aloud (`useTextToSpeech`)

Wraps `SpeechSynthesis`, locked to `es-MX`. The non-obvious problem: **not all `es-MX` voices sound the same, and picking the wrong one makes the feature sound unusably robotic.** On a machine with zero network voices installed (e.g. Brave, which doesn't ship Google's cloud voices the way official Chrome does), `getVoices()` may return *only* local OS voices for `es-MX`, and the "obvious" first one isn't the best one — e.g. macOS exposes a set of persona voices (Eddy, Flo, Grandma, Grandpa, Reed, Rocko, Sandy, Shelley) that are the same character voices reused across every language, alongside the classic dedicated `es-MX` voice ("Paulina"), which reads far more natural for this use case.

The voice-selection order is: (1) a known-good named voice if present, (2) any non-local/network voice (usually higher quality), (3) whatever `es-MX` voice is left. If your target OS/browser combo sounds off, log `speechSynthesis.getVoices()` and adjust the preferred-name list — that's the one part of this pattern that's inherently machine-dependent.

## Known limitations (found during manual testing)

- **STT only works reliably in official Google Chrome.** Chromium forks (Brave, and likely others) block or don't ship the Google speech backend `SpeechRecognition` depends on — Brave requires manually enabling *"Use Google services for speech recognition"* in `brave://settings/system` before it works at all. This is a browser-vendor restriction, not something fixable in app code.
- **TTS voice quality is 100% dependent on what's installed on the OS/browser.** There is no way to guarantee a "good" voice is available; feature-detection only confirms *a* voice exists, not that it sounds acceptable.
- **No fallback to another language/voice when `es-MX` is unavailable** — by design. Silently switching language would be a worse experience than clearly showing "unavailable."

## Porting this to another project

1. Copy `useSpeechSupport.ts`, `useSpeechToText.ts`, `useTextToSpeech.ts` as-is — swap `TARGET_LANG` for your locale.
2. Gate any mic/speaker UI behind `sttAvailable`/`ttsAvailable` from `useSpeechSupport` — never call the APIs without checking first.
3. Keep `continuous: true` for dictation unless you specifically want single-utterance behavior.
4. Expect and handle the `network` error case for STT if you support Chromium-based browsers.
5. Sanity-check `getVoices()` on your actual target devices before shipping TTS — don't assume the first matching-language voice is the best one.

## Running it

```bash
npm install
npm run dev
```

No environment variables, no backend, no build step beyond Vite.
