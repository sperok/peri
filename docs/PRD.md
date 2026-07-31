# Peri — Product Requirements Document

**Status:** Draft (in progress)
**Owner:** TBD
**Last updated:** 2026-07-31

## 1. Overview

Peri is a predictive phrase-completion communication tool for people with
motor and/or speech disabilities. It lets users produce full phrases and
sentences from a minimal number of physical selections, so that composing a
message costs as little time and physical effort as possible.

## 2. Problem Statement

For people who type slowly or with high physical effort — including
non-speaking AAC users and people with motor impairments who use methods like
head-pointer + dwell selection — every character typed has a real cost in
time and fatigue. Existing text input is optimized for typical typing speeds
and doesn't minimize the number of discrete selections required to say
something. This makes real-time conversation (in person or in chat) slow,
tiring, and often impractical, and pushes users toward a narrow set of
pre-canned phrases instead of expressing what they actually mean.

Peri addresses this by predicting full phrases — not just next words — from
minimal input, using conversational context to narrow suggestions, so users
can say more with fewer selections.

## 3. Target Users

- **Primary:** People with motor/mobility impairments that make typing slow
  or effortful (e.g., limited dexterity, single-switch or head-pointer +
  dwell access).
- **Primary:** Non-speaking / speech-disabled users who rely on
  text-to-speech to communicate (AAC users).
- Note: these groups overlap significantly (many AAC users also have motor
  impairments affecting input speed), and Peri is designed for that overlap
  specifically, not as two separate products.

### Reference input method (v1 design target)
Head-pointer control with dwell-based selection (user rests an on-screen
cursor over a target for a fixed dwell time to select it). Every selection
is slow and effortful relative to standard typing — this is the primary
constraint the product is designed around. Design and interaction decisions
should be validated against this input method first, not against keyboard
typing.

## 4. Context of Use

Peri is used across:
- In-person spoken conversation (composed phrase is spoken aloud via TTS)
- Text messaging / chat apps
- Email and longer-form writing
- Aspirationally, anywhere text is entered system-wide (see [§10 Non-Goals](#10-non-goals--v1) — full system-wide input is out of scope for v1)

## 5. Goals (v1)

1. Let a user compose a common phrase/sentence using significantly fewer
   selections than typing it character-by-character.
2. Support two prediction modes in one loop: prefix-based phrase completion
   (user selects a few letters, gets full phrase candidates) and
   context-aware re-ranking (recent conversation context biases which
   phrases are suggested first, including likely replies).
3. Speak composed phrases aloud via TTS.
4. Let users copy/share a composed phrase into other apps (messaging, email).
5. Personalize phrase predictions to the individual user over time, with
   personalization data stored locally on-device (not synced to a
   third-party server by default) given the sensitivity of personal
   communication data.

## 6. Success Metrics

- **Selections per message**: median number of dwell-selections required to
  compose a message, compared to character-by-character typing baseline.
- **Time to compose a message**: wall-clock time from starting a message to
  it being ready to send/speak.
- **User-reported confidence/satisfaction**: qualitative feedback from real
  users on whether Peri reduces communication fatigue/frustration and lets
  them say what they actually mean (vs. settling for a canned phrase).

*(Target numbers/thresholds TBD — need baseline data before setting hard
targets. See [§11 Open Questions](#11-open-questions--risks).)*

## 7. User Stories

### 7.1 Reference scenario: composing and speaking a phrase mid-conversation

Alex is at dinner with a friend and wants to respond to something the friend
just said.

1. Peri is listening and transcribes the friend's spoken side of the
   conversation via live speech-to-text. A visible on-screen indicator (and/or
   spoken disclosure) makes clear the conversation is being transcribed —
   see the consent decision and residual legal risk in
   [§11](#11-open-questions--risks). This transcript is the context signal
   used to bias phrase predictions toward a fitting reply.
2. Alex begins entering characters using the on-screen 8-way joystick. The
   joystick has 8 static compass zones (N/NE/E/SE/S/SW/W/NW), each holding a
   fixed small group of letters/numbers/symbols, arranged by frequency so the
   most common characters are fastest to reach. Selection is two-stage:
   dwelling a direction reveals the group assigned to it, then a second
   dwell selects the specific character within that group.
3. As Alex enters characters, phrase-candidate "thought bubbles" appear at
   freeform positions on screen around the joystick. Candidates are ranked
   using the typed prefix, Alex's personal phrase history, and the live
   conversational context from step 1.
4. Alex dwells directly on a bubble's on-screen position to select it. This
   *stages* the phrase (shown large/highlighted) — it is not yet spoken.
5. Alex takes an explicit confirm action to speak the staged phrase aloud
   (TTS), and/or a separate explicit action to copy/share it into another
   app.
6. At any point, Alex can use the Compose control to open an edit view and
   revise or append to the currently staged/composed phrase before
   confirming.

After a phrase is spoken/sent, Peri auto-resets to a blank state for the
next phrase — joystick entry alone is enough to start fresh. Compose is
only needed to revise/append to a phrase mid-flow, before it's confirmed;
it is not required to start a new phrase.

### 7.2 Reference scenario: composing a chat message

Alex wants to reply to a text message. Context (the incoming message) is
provided by manual paste or typing, or the conversation proceeds without
live-context re-ranking, relying on prefix + personalization only (mirrors
step 1 above, minus the live-microphone-transcription path). Steps 2-6 above
apply the same way; in step 5 Alex uses copy/share into the messaging app
rather than (or in addition to) TTS.

## 8. Functional Requirements

- **FR1 — Joystick character entry**: On-screen 8-directional joystick with
  8 static compass zones, each mapped to a fixed character group ordered by
  frequency. Two-stage selection: dwell direction → reveal group → dwell
  character within group.
- **FR2 — Phrase prediction**: Generate ranked full-phrase candidates from
  (a) the typed prefix, (b) the user's personal phrase/selection history,
  and (c) live conversational context (see FR9).
- **FR3 — Candidate display**: Render candidate phrases as independently
  dwell-selectable "thought bubble" UI elements, freely positioned around
  the joystick (not tied to compass directions).
- **FR4 — Staging**: Dwelling a bubble stages it as the pending phrase
  (visually highlighted/enlarged); staging never speaks or sends by itself.
- **FR5 — Confirm to speak**: A distinct, explicit dwell-selectable action
  triggers TTS playback of the staged phrase.
- **FR6 — Confirm to share**: A distinct, explicit action copies the staged
  phrase to the clipboard and/or invokes a share target, for pasting into
  chat/email apps.
- **FR7 — Compose/edit view**: A persistent Compose control opens an edit
  view for revising or appending to the current staged/composed phrase
  before it's confirmed.
- **FR8 — Local personalization**: Phrase ranking adapts to the individual
  user's own selection history over time. This data is stored locally
  on-device, not synced to a third-party server by default.
- **FR9 — Live conversational context (in-person mode)**: Peri captures the
  other speaker's audio via microphone, transcribes it locally via
  speech-to-text, and uses the running transcript to re-rank phrase
  candidates toward a fitting reply. A visible on-screen indicator (and/or
  spoken disclosure) that the conversation is being transcribed must be
  shown whenever this is active — this disclosure is the v1 consent
  mechanism (decision recorded in [§11](#11-open-questions--risks); no
  additional affirmative action is required from the other party). Raw
  audio and transcript handling must follow the data-handling requirements
  in [§9](#9-non-functional-requirements).
- **FR10 — Manual context (chat mode)**: User can paste/type in the
  incoming message text as a context signal for reply prediction, as an
  alternative to live transcription.

## 9. Non-Functional Requirements

- **NFR1 — Dwell-time budget**: Every added dwell-selection has a real time
  and fatigue cost. Target dwell time and the number of dwells needed for
  common actions should be treated as a first-class performance metric, not
  an afterthought — this is the product's core value proposition, not a
  nice-to-have.
- **NFR2 — Prediction latency**: Candidate phrases must appear fast enough
  to feel responsive within a live spoken conversation (target latency
  TBD — needs testing with real dwell-timing, see
  [§11](#11-open-questions--risks)). This applies to both prefix-based
  completion and live-transcript-driven re-ranking.
- **NFR3 — Accidental-activation resistance ("Midas touch")**: Because
  selection is dwell-based, the UI must avoid speaking or sending anything
  from an incidental gaze/rest. The staged-then-confirm flow (FR4/FR5/FR6)
  is the primary mitigation; dwell thresholds and staging visuals should be
  tuned specifically to minimize false activations without adding
  unnecessary extra steps.
- **NFR4 — On-device personalization data**: Per FR8, personal phrase
  history/model data is stored locally by default. Any future sync/backup
  feature needs explicit opt-in and its own privacy review.
- **NFR5 — Microphone/transcript privacy**: Per FR9, audio of a third party
  (the other speaker) is being captured. Raw audio should be processed
  transiently wherever possible rather than retained; any retention of
  audio or transcript content needs a clear, minimal retention policy. A
  visible on-screen (and/or spoken) disclosure that transcription is active
  is required at all times while FR9 is running — see the consent decision
  and residual legal risk in [§11](#11-open-questions--risks).
- **NFR6 — Platform**: Web app / PWA, installable, usable offline where
  feasible (TTS and on-device prediction should not hard-require network
  connectivity once loaded, given how time-sensitive live conversation use
  is).
- **NFR7 — Accessibility of Peri's own UI**: Beyond being an accessibility
  tool itself, Peri's UI (contrast, target sizing for dwell zones, motion/
  animation of bubbles) must itself meet accessibility standards suitable
  for users with motor and visual differences.

## 10. Non-Goals / V1

- Full system-wide input (custom keyboard/input method that works inside
  any app on the OS) is **not** in scope for v1. V1 is a web app/PWA;
  getting text into other apps happens via copy/share, not direct system
  injection. System-wide input integration is a candidate for a later phase.
- Cloud-synced/shared personalization data is not in scope for v1
  (per FR8/NFR4) — personalization is local-only at launch.
- Support for input methods other than head-pointer + dwell (e.g. switch
  scanning, eye gaze) is not a v1 design target, though the architecture
  should not deliberately preclude it later.

## 11. Open Questions & Risks

- **[High] Consent/legal risk for third-party audio capture (FR9)** —
  **decision**: v1 uses a visible on-screen and/or spoken disclosure
  ("this conversation is being transcribed") as the sole consent
  mechanism; no additional affirmative action is required from the other
  party. **Residual risk**: several U.S. states (and other jurisdictions)
  require all-party consent to record a conversation, and a passive
  disclosure may not meet that bar legally in every jurisdiction Peri is
  used in. This decision should still go through real legal review before
  FR9 ships broadly — treat the disclosure-only approach as the product
  design intent, not as a substitute for that review.
- **[High] "Midas touch" tuning is unvalidated**: The staged→confirm flow
  (NFR3) is a design hypothesis, not tested. Needs real user testing with
  actual head-pointer/dwell users to find the right dwell thresholds and
  confirm-step design that balances speed against accidental activation.
- System-wide input is a stated long-term goal but the v1 platform (web
  app/PWA) can't natively provide it. Need a plan for how/when to bridge
  this (e.g., companion browser extension, OS-level accessibility service,
  or native app) — flagging so it isn't lost.
- No baseline data yet on current selections-per-message or time-to-compose
  for the target users, so success metric targets in §6 are qualitative
  for now — need to establish a baseline (e.g. against current
  character-by-character typing) before setting hard numeric targets.
- Prediction ranking algorithm/model is undefined (rule-based frequency
  model vs. statistical/ML model, on-device vs. needing a backend) — affects
  NFR2 (latency) and NFR6 (offline capability) significantly and needs its
  own design spike.
- Number of candidate bubbles shown at once, and how they're laid out
  without overlapping or crowding the dwell-selectable joystick zones, is
  undefined — needs interaction design work.

## 12. Constraints & Assumptions

- **Reference input method**: Design and validate against head-pointer +
  dwell selection first (per §3); other input methods are out of scope for
  v1 (§10).
- **Platform**: Web app / PWA for v1 (§4/NFR6); no native mobile or desktop
  app at launch.
- **Privacy-by-default**: Personalization data stays on-device by default
  (FR8/NFR4); any third-party audio (FR9) is handled with minimal retention
  and pending legal review (§11).
- **No baseline data**: There is currently no existing user base or usage
  data for Peri; early metrics (§6) will be directional, not
  targets-with-numbers, until real users are testing it.
