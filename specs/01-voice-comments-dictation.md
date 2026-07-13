# SPEC 01 — Voice-Dictated Comments and Read-Aloud (Spike)

> **Status:** Approved
> **Depends on:** None
> **Date:** 2026-07-13
> **Objective:** Investigate and implement, in a local comment simulation, voice dictation (speech-to-text) for writing comments and read-aloud (text-to-speech) for existing comments, both in Spanish (es-MX), using the browser's native Web Speech API.

## Scope

**In:**

- Local comment list simulated with React state, persisted to `localStorage` (no backend, no Amplify).
- Voice dictation (speech-to-text) to compose a new comment, using the native `SpeechRecognition` Web Speech API, locked to `es-MX`.
- Read-aloud (text-to-speech) of an existing comment, using the native `SpeechSynthesis` Web Speech API, locked to `es-MX`.
- Feature-support detection: if `SpeechRecognition` is unavailable, or no `es-MX` voice is installed for synthesis, the corresponding control is shown disabled/unavailable — no attempt is made to run it.
- Clear "listening" visual indicator while dictation is active (mic control turns red/pulsing + "Escuchando..." label).
- Plain CSS styling aimed at a professional look (no UI framework).
- Manual cross-browser/device testing (desktop Chrome, Android Chrome, iOS Safari) as part of the spike's investigation findings.

**Out of scope (for future specs):**

- Real AWS Amplify Gen 2 integration (Transcribe, Polly, DynamoDB, etc.).
- Authentication / user accounts.
- Any language other than `es-MX`.
- Cloud-based STT/TTS fallback when the native API is unsupported.
- Manual voice-selection UI.
- Editing or deleting existing comments.
- Syncing comments across devices/sessions beyond `localStorage`.

## Data model

```ts
// src/types.ts
type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO 8601
};
```

Persisted in `localStorage` under key `comments:v1` as a JSON array of `Comment`.

Runtime-only state (not persisted):

```ts
type SpeechSupport = {
  sttAvailable: boolean; // SpeechRecognition exists in window
  ttsAvailable: boolean; // SpeechSynthesis exists AND an es-MX voice is found
};
```

Conventions:

- `id`: generated with `crypto.randomUUID()`.
- `createdAt`: `new Date().toISOString()`.
- Storage key is versioned (`:v1`) to allow future schema migration without breaking old data.

## Implementation plan

1. Create `src/types.ts` with the `Comment` type and `src/lib/storage.ts` with `loadComments()` / `saveComments()` against `localStorage` key `comments:v1`, seeded with 2-3 mock comments. Wire into `App.tsx` to render a static list. Manual test: reload page, comments appear.
2. Build `src/components/CommentList.tsx` and `CommentItem.tsx` with plain CSS for a professional look. Manual test: list renders styled, no console errors.
3. Create `src/hooks/useSpeechSupport.ts` detecting `sttAvailable` (`SpeechRecognition`/`webkitSpeechRecognition` in `window`) and `ttsAvailable` (`speechSynthesis` present AND an `es-MX` voice found in `getVoices()`). Wire disabled/"unavailable" state into a speaker icon per comment and a mic icon in the composer. Manual test: toggle via devtools override, see icons disable.
4. Create `src/hooks/useTextToSpeech.ts` wrapping `SpeechSynthesis` locked to the `es-MX` voice. Wire the per-comment speaker button to read that comment's text aloud when `ttsAvailable`. Manual test: click speaker, hear comment read in Spanish.
5. Create `src/hooks/useSpeechToText.ts` wrapping `SpeechRecognition` locked to `es-MX`. Add a comment composer with a mic button: start/stop listening, show the "Escuchando..." pulsing indicator while active, append transcribed text into the composer's text field. Manual test: click mic, speak, see text appear; button pulses while listening.
6. Wire the composer's submit action: save the (dictated or typed) text as a new `Comment` via `saveComments()`, update the list, clear the composer. Manual test: dictate a comment, submit, reload page, comment persists and can be read aloud.

## Acceptance criteria

- [ ] App loads with no console errors and shows seeded comments from `localStorage`.
- [ ] Reloading the page preserves any newly added comments.
- [ ] On a browser/device with STT support, clicking the mic starts listening, shows the "Escuchando..." pulsing indicator, and transcribes Spanish speech into the composer field.
- [ ] On a browser/device without `SpeechRecognition` support, the mic button is disabled and shows an "unavailable" state instead of attempting to run.
- [ ] On a browser/device with an `es-MX` voice available, clicking a comment's speaker button reads that comment aloud in Spanish.
- [ ] On a browser/device without an `es-MX` voice available, the speaker button is disabled and shows an "unavailable" state instead of falling back to another voice/language.
- [ ] Submitting a dictated or typed comment adds it to the list and clears the composer.
- [ ] UI is styled with plain CSS (no UI framework) and reads as a polished, professional layout.

## Decisions

- **Yes:** Native Web Speech API (`SpeechRecognition` + `SpeechSynthesis`). Free, no backend, fits a spike's investigation goal.
- **No:** Cloud STT/TTS (AWS Transcribe/Polly) for this spike. Reserved for the real Amplify Gen 2 integration in a future spec.
- **Yes:** Hard-lock to `es-MX` for both STT and TTS. Matches the product's real target language; no multi-language complexity needed now.
- **No:** Fallback to another voice/language when `es-MX` is unavailable. Silently switching language would produce a broken/confusing experience; showing "unavailable" is more honest for a spike.
- **No:** Manual voice-selection UI. Adds scope not needed to answer the spike's core question.
- **Yes:** `localStorage` for comment persistence (key `comments:v1`, versioned for future migration). Simple, no backend needed for a spike.
- **No:** IndexedDB. Overengineering for a small mock comment list.
- **Yes:** Plain CSS over a UI framework. Keeps the spike dependency-free while still allowing a professional look.
- **Yes:** Explicit feature-support detection (`useSpeechSupport`) instead of try/catch-at-call-time. Lets the UI show an honest "unavailable" state up front, including the iOS Safari STT quirks surfaced during clarification.

## Risks

| Risk                                                          | Mitigation                                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `SpeechRecognition` unsupported or buggy on iOS Safari         | Detect support via `useSpeechSupport`; disable mic control and show "unavailable" instead of a broken experience. |
| No `es-MX` voice installed on the device for synthesis         | Detect via `getVoices()` in `useSpeechSupport`; disable speaker control rather than falling back to a wrong-language voice. |
| `getVoices()` returns empty on first call (async voice loading in some browsers) | Re-check on the `voiceschanged` event before deciding `ttsAvailable`. |
| User denies microphone permission                             | Treat as a listening error: stop the indicator, surface a brief inline message, leave mic control enabled to retry. |
| `localStorage` disabled (e.g. private browsing)                | Not handled in this spike — accepted as a known limitation, out of scope per Decisions. |

## What is **not** in this spec

- Real AWS Amplify Gen 2 integration (Transcribe, Polly, DynamoDB, etc.).
- Authentication / user accounts.
- Any language other than `es-MX`.
- Cloud-based STT/TTS fallback for unsupported browsers.
- Manual voice-selection UI.
- Editing or deleting existing comments.
- Syncing comments across devices/sessions beyond `localStorage`.

Each one of those, if it lands, goes in its own spec.
