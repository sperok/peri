import { assign, fromPromise, setup } from 'xstate'
import type { CompassDirection } from '../data/letterGroups'
import { getCandidates, getPhraseById } from '../lib/predictor'
import { speak } from '../lib/tts'
import { shareOrCopy } from '../lib/share'
import { recordSelection } from '../lib/storage'
import { toId, type Phrase } from '../data/phraseBank'

export interface PeriContext {
  buffer: string
  contextText: string
  stagedPhrase: string | null
  draftText: string
  activeDirection: CompassDirection | null
  candidates: Phrase[]
  frequencyMap: Map<string, number>
}

export type PeriEvent =
  | { type: 'DWELL_DIRECTION'; direction: CompassDirection }
  | { type: 'DWELL_CHAR'; char: string }
  | { type: 'CANCEL_GROUP' }
  | { type: 'BACKSPACE' }
  | { type: 'DWELL_BUBBLE'; phraseId: string }
  | { type: 'SET_CONTEXT'; text: string }
  | { type: 'COMPOSE' }
  | { type: 'EDIT_CHANGE'; text: string }
  | { type: 'EDIT_SAVE' }
  | { type: 'EDIT_CANCEL' }
  | { type: 'CONFIRM_SPEAK' }
  | { type: 'CONFIRM_SHARE' }
  | { type: 'DISCARD' }

function recompute(buffer: string, contextText: string, frequencyMap: Map<string, number>): Phrase[] {
  return getCandidates({ prefix: buffer, contextText, frequencyMap })
}

export const periMachine = setup({
  types: {
    context: {} as PeriContext,
    events: {} as PeriEvent,
    input: {} as { frequencyMap: Map<string, number> },
  },
  actors: {
    speakActor: fromPromise(async ({ input }: { input: { text: string } }) => {
      await speak(input.text)
    }),
    shareActor: fromPromise(async ({ input }: { input: { text: string } }) => {
      await shareOrCopy(input.text)
    }),
  },
  guards: {
    hasStagedPhrase: ({ context }) => context.stagedPhrase !== null,
  },
}).createMachine({
  id: 'peri',
  context: ({ input }) => ({
    buffer: '',
    contextText: '',
    stagedPhrase: null,
    draftText: '',
    activeDirection: null,
    candidates: recompute('', '', input.frequencyMap),
    frequencyMap: input.frequencyMap,
  }),
  initial: 'entering',
  states: {
    entering: {
      // Events here apply regardless of joystick sub-mode (awaitingDirection
      // or groupOpen) — e.g. bubbles stay dwell-selectable, Compose stays
      // available, and context/backspace keep working while a letter group
      // is open. Only the joystick's own two-stage selection is sub-mode
      // specific (nested below).
      on: {
        DWELL_BUBBLE: {
          target: '#peri.staged',
          actions: assign({
            stagedPhrase: ({ event }) => getPhraseById(event.phraseId)?.text ?? null,
          }),
        },
        BACKSPACE: {
          guard: ({ context }) => context.buffer.length > 0,
          actions: assign({
            buffer: ({ context }) => context.buffer.slice(0, -1),
            candidates: ({ context }) =>
              recompute(context.buffer.slice(0, -1), context.contextText, context.frequencyMap),
          }),
        },
        SET_CONTEXT: {
          actions: assign({
            contextText: ({ event }) => event.text,
            candidates: ({ context, event }) =>
              recompute(context.buffer, event.text, context.frequencyMap),
          }),
        },
        COMPOSE: {
          target: '#peri.composing',
          actions: assign({ draftText: ({ context }) => context.buffer }),
        },
      },
      initial: 'awaitingDirection',
      states: {
        awaitingDirection: {
          on: {
            DWELL_DIRECTION: {
              target: 'groupOpen',
              actions: assign({ activeDirection: ({ event }) => event.direction }),
            },
          },
        },
        groupOpen: {
          on: {
            DWELL_CHAR: {
              target: 'awaitingDirection',
              actions: assign({
                buffer: ({ context, event }) => context.buffer + event.char,
                activeDirection: null,
                candidates: ({ context, event }) =>
                  recompute(context.buffer + event.char, context.contextText, context.frequencyMap),
              }),
            },
            CANCEL_GROUP: {
              target: 'awaitingDirection',
              actions: assign({ activeDirection: null }),
            },
          },
        },
      },
    },
    staged: {
      id: 'staged',
      on: {
        CONFIRM_SPEAK: 'speaking',
        CONFIRM_SHARE: 'sharing',
        COMPOSE: {
          target: 'composing',
          actions: assign({ draftText: ({ context }) => context.stagedPhrase ?? '' }),
        },
        DISCARD: {
          target: 'entering',
          actions: assign({
            buffer: '',
            stagedPhrase: null,
            candidates: ({ context }) => recompute('', context.contextText, context.frequencyMap),
          }),
        },
      },
    },
    speaking: {
      invoke: {
        src: 'speakActor',
        input: ({ context }) => ({ text: context.stagedPhrase ?? '' }),
        onDone: {
          target: 'entering',
          actions: [
            ({ context }) => {
              if (!context.stagedPhrase) return
              const id = toId(context.stagedPhrase)
              // Fire-and-forget persist; mutate the in-memory map (same
              // reference held in context) once it resolves so future
              // predictions in this session reflect the new count without
              // needing a reload.
              void recordSelection(id).then((count) => {
                context.frequencyMap.set(id, count)
              })
            },
            assign({
              buffer: '',
              stagedPhrase: null,
              candidates: ({ context }) => recompute('', context.contextText, context.frequencyMap),
            }),
          ],
        },
        onError: 'staged',
      },
    },
    sharing: {
      invoke: {
        src: 'shareActor',
        input: ({ context }) => ({ text: context.stagedPhrase ?? '' }),
        onDone: {
          target: 'entering',
          actions: [
            ({ context }) => {
              if (!context.stagedPhrase) return
              const id = toId(context.stagedPhrase)
              // Fire-and-forget persist; mutate the in-memory map (same
              // reference held in context) once it resolves so future
              // predictions in this session reflect the new count without
              // needing a reload.
              void recordSelection(id).then((count) => {
                context.frequencyMap.set(id, count)
              })
            },
            assign({
              buffer: '',
              stagedPhrase: null,
              candidates: ({ context }) => recompute('', context.contextText, context.frequencyMap),
            }),
          ],
        },
        onError: 'staged',
      },
    },
    composing: {
      id: 'composing',
      on: {
        EDIT_CHANGE: {
          actions: assign({ draftText: ({ event }) => event.text }),
        },
        EDIT_SAVE: {
          target: 'staged',
          actions: assign({
            stagedPhrase: ({ context }) => context.draftText,
            buffer: '',
          }),
        },
        EDIT_CANCEL: [
          { guard: 'hasStagedPhrase', target: 'staged' },
          { target: 'entering' },
        ],
      },
    },
  },
})
