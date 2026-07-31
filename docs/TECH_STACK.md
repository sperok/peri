# Peri — Technology Stack

**Status:** Decided (v1)
**Last updated:** 2026-07-31

This records the v1 technology choices and the reasoning behind them. See
[`PRD.md`](PRD.md) for the product requirements these decisions serve,
especially §8 (Functional Requirements) and §9 (Non-Functional
Requirements).

## Language & framework

**React + TypeScript + Vite.**

Matches the framework already used across this developer's other projects
(only the now-deprecated Peri prototype used Svelte). Vite gives fast local
dev and pairs cleanly with `vite-plugin-pwa`.

## UI state management

**XState**, for the core interaction state machine: idle → group-selected →
character-selected → phrase-staged → confirming → speaking/sharing. This
interaction is a real state machine with a hard requirement (NFR3: never
speak/send without an explicit confirm) — modeling it explicitly makes that
guarantee enforceable in code rather than an informal UI convention.

Animation (bubble appearance/staging) via Framer Motion.

## Local storage / personalization (FR8, NFR4)

**IndexedDB via Dexie.js.** Stores per-user phrase selection history and
frequency counts, entirely on-device. `localStorage` is too small and
synchronous for this; Dexie gives a clean async API over IndexedDB with
good offline behavior.

## Text-to-speech (FR5)

**Web Speech API (`SpeechSynthesis`).** Built into every major browser,
runs on-device via the OS speech engine, no network dependency — satisfies
NFR6 (offline) with no privacy tradeoff, since it's the user's own composed
text being spoken.

## Speech-to-text for live context (FR9)

**On-device WASM model** (Whisper-tiny/base via a WASM runtime, e.g.
whisper.cpp-wasm or transformers.js — final model TBD after latency
testing), **not** the browser's built-in `SpeechRecognition`.

This is a deliberate deviation from the "obvious" choice: Chrome's built-in
`SpeechRecognition` streams audio to Google's servers — it is not actually
on-device. That would contradict FR9/NFR5's existing commitment that the
other speaker's voice is transcribed locally, and would add a second party
sending the third party's voice off-device on top of the already-flagged
consent/legal risk (PRD §11). A WASM model keeps that audio on-device, at
the cost of a larger first-load download and more CPU/battery use, which
needs real measurement against NFR2's latency bar on target hardware. If
that tradeoff proves too heavy, the right fix is revisiting FR9's "locally"
requirement explicitly — not quietly switching to a cloud API.

## Phrase prediction engine (v1)

**Rule-based**, not ML-based, for v1:
- A prefix trie over a curated phrase bank for prefix-based completion.
- Per-user selection frequency (stored via Dexie) biases ranking toward the
  individual's own common phrases over time.
- A lightweight keyword-overlap score against the live transcript
  (FR9) or pasted context (FR10) re-ranks candidates toward a fitting
  reply.

This keeps v1 fully offline, fast (relevant to NFR2), and free of a model
download. An on-device embedding/LLM-based ranker is a reasonable v2 once
the joystick/dwell interaction loop itself is validated with real users —
no reason to take on that complexity before the core UX is proven. (Tracked
as an open question in PRD §11.)

## PWA / offline

**`vite-plugin-pwa`** — service worker, manifest, and caching, including
caching the STT model asset so the app keeps working offline after first
load (NFR6).

## Testing

**Vitest** (unit tests, pairs with Vite) + **Playwright** (end-to-end,
useful for testing timed dwell interactions specifically).

## Hosting

**Netlify** — static hosting with a generous free tier, global CDN caching
(matters for the STT model file fetched on first load), and simple PWA
deploy support.

## Package manager

**npm** — most common package manager across this developer's existing
projects.

## Open questions carried from this decision

- Final STT model choice (size/accuracy/latency tradeoff) needs real
  on-device testing before locking in — see PRD §11.
- If WASM STT latency/battery cost proves unworkable on target hardware,
  FR9's "locally" requirement needs explicit revisiting, not a silent
  fallback to a cloud API.
