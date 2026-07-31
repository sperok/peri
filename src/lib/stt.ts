/**
 * Live speech-to-text for the other speaker's voice (FR9).
 *
 * NOT YET IMPLEMENTED. Per docs/TECH_STACK.md this must run on-device via a
 * WASM model (e.g. Whisper-tiny/base) rather than the browser's built-in
 * SpeechRecognition, which streams audio to a cloud service in Chrome and
 * would violate FR9/NFR5's "transcribed locally" requirement.
 *
 * Wiring this up requires: bundling a WASM STT runtime, sourcing/serving a
 * model asset, and measuring latency/battery impact against NFR2 before
 * this can ship. Until then, live-context prediction only works via the
 * manual-paste path (FR10, see contextText in the app state).
 */

export interface LiveTranscriptionSession {
  stop: () => void
}

export function startLiveTranscription(): LiveTranscriptionSession {
  throw new Error(
    'startLiveTranscription is not implemented yet — see src/lib/stt.ts and docs/TECH_STACK.md (FR9).',
  )
}
