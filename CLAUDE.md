# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A spike investigating voice dictation (speech-to-text) and read-aloud (text-to-speech) for comments, built with Vite + React 19 + TypeScript. There is no backend: comments are simulated entirely in React state and persisted to `localStorage`. See `specs/01-voice-comments-dictation.md` for the full spec (scope, data model, rationale) driving the current implementation.

## Commands

- `pnpm dev` — start the Vite dev server
- `pnpm build` — typecheck (`tsc -b`) then production build (`vite build`)
- `pnpm lint` — run oxlint
- `pnpm preview` — preview a production build

There is no test framework configured in this repo — do not assume Jest/Vitest exist. Verifying behavior means running `pnpm dev` and exercising the UI in a real browser (Web Speech API requires an actual browser environment, not jsdom).

Package manager is pnpm (see `pnpm-lock.yaml`).

## Architecture

**Data flow:** `App.tsx` owns the single source of truth — `comments: Comment[]` in React state, initialized from and written through `src/lib/storage.ts` (`loadComments`/`saveComments`, localStorage key `comments:v1`, versioned to allow future schema migration). `App` seeds three sample Spanish comments on first load if storage is empty. There is no comment editing/deletion — only append.

**Feature detection gates everything speech-related.** `useSpeechSupport` (src/hooks/useSpeechSupport.ts) is the single hook that decides whether STT/TTS controls are enabled anywhere in the UI:
- `sttAvailable`: presence of `window.SpeechRecognition`/`webkitSpeechRecognition`.
- `ttsAvailable`: `window.speechSynthesis` exists AND at least one voice with `lang === 'es-MX'` is installed (checked async via the `voiceschanged` event, since voice lists load lazily in some browsers).

Both speech features are hard-locked to `es-MX` — there is no language selection UI, and this is intentional per the spec (out of scope).

**Speech-to-text** (`src/hooks/useSpeechToText.ts`): wraps the native `SpeechRecognition` API in `continuous`/`interimResults` mode. Notable behavior: transient `'network'` errors trigger a silent auto-retry (up to `MAX_NETWORK_RETRIES = 2`, `NETWORK_RETRY_DELAY_MS = 400`) via a `retryingRef` flag that suppresses the `onend` handler during a retry — don't treat every `onend`/`onerror` as terminal without checking this flag. The retry counter resets on `onspeechstart`. Non-network errors surface through the hook's `error` state and are mapped to Spanish user-facing strings in `Composer.tsx`'s `ERROR_MESSAGES`.

**Text-to-speech** (`src/hooks/useTextToSpeech.ts`): wraps `SpeechSynthesisUtterance`, locked to `es-MX`. Voice selection prefers, in order: (1) a voice literally named `'Paulina'` (macOS's classic es-MX voice, which reads more naturally than the newer persona voices like Eddy/Flo/Rocko — those are the same reused character voices across every language), then (2) any non-local (network-backed, typically higher quality) `es-MX` voice, then (3) whatever `es-MX` voice is first available. Always calls `speechSynthesis.cancel()` before speaking to prevent overlapping utterances.

**Component tree:** `App` → `Composer` (dictation input + submit, disables mic button when `!sttAvailable`) and `CommentList` → `CommentItem` (per-comment read-aloud button, disabled when `!ttsAvailable`). Both speech hooks are consumed directly by the components that need them (`Composer` uses `useSpeechToText`, `CommentItem` uses `useTextToSpeech`), not lifted to `App`.

**Types:** `src/types.ts` defines the two shared shapes (`Comment`, `SpeechSupport`); the Web Speech API itself has no official TS lib types, so `useSpeechToText.ts` hand-declares the minimal `SpeechRecognitionInstance`/`SpeechRecognitionConstructor` shapes it needs rather than relying on `lib.dom`.

## Working with specs

This repo uses a spec-driven workflow (`.agents/skills/spec/` and `spec-impl/`). Specs live in `specs/NN-slug.md`. `specs/.spec-config.yml` controls whether `/spec-impl` auto-creates a `spec-NN-slug` git branch. Check `specs/` for the current spec's status/scope before making architectural changes, since scope boundaries (e.g. "no language other than es-MX", "no editing/deleting comments") are deliberate spike constraints, not gaps to fill in.
