import { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import { periMachine } from './machine/periMachine'
import { loadAllStats } from './lib/storage'
import { Joystick } from './components/Joystick'
import { Bubbles } from './components/Bubbles'
import { StagedPanel } from './components/StagedPanel'
import { ComposeView } from './components/ComposeView'
import './App.css'

function PeriApp({ initialFrequencyMap }: { initialFrequencyMap: Map<string, number> }) {
  const [snapshot, send] = useMachine(periMachine, {
    input: { frequencyMap: initialFrequencyMap },
  })

  const isEntering = snapshot.matches('entering')
  const isAwaitingDirection = snapshot.matches({ entering: 'awaitingDirection' })
  const isStaged = snapshot.matches('staged')
  const isSpeaking = snapshot.matches('speaking')
  const isSharing = snapshot.matches('sharing')
  const isComposing = snapshot.matches('composing')

  const joystickMode = isAwaitingDirection ? 'awaitingDirection' : 'groupOpen'

  return (
    <div className="app">
      <header className="app__header">
        <h1>Peri</h1>
        <label className="app__context-input">
          Incoming message (context)
          <input
            type="text"
            placeholder="Paste what the other person said…"
            onChange={(event) => send({ type: 'SET_CONTEXT', text: event.target.value })}
            disabled={!isEntering}
          />
        </label>
      </header>

      <main className="app__stage">
        {isEntering && (
          <>
            <Bubbles
              candidates={snapshot.context.candidates}
              onSelect={(phraseId) => send({ type: 'DWELL_BUBBLE', phraseId })}
            />
            <Joystick
              mode={joystickMode}
              activeDirection={snapshot.context.activeDirection}
              onDirection={(direction) => send({ type: 'DWELL_DIRECTION', direction })}
              onChar={(char) => send({ type: 'DWELL_CHAR', char })}
              onCancelGroup={() => send({ type: 'CANCEL_GROUP' })}
              bufferPreview={snapshot.context.buffer}
            />
          </>
        )}

        {isStaged && (
          <StagedPanel
            phrase={snapshot.context.stagedPhrase ?? ''}
            onSpeak={() => send({ type: 'CONFIRM_SPEAK' })}
            onShare={() => send({ type: 'CONFIRM_SHARE' })}
            onEdit={() => send({ type: 'COMPOSE' })}
            onDiscard={() => send({ type: 'DISCARD' })}
          />
        )}

        {(isSpeaking || isSharing) && (
          <p className="app__status" role="status">
            {isSpeaking ? 'Speaking…' : 'Sharing…'}
          </p>
        )}

        {isComposing && (
          <ComposeView
            draftText={snapshot.context.draftText}
            onChange={(text) => send({ type: 'EDIT_CHANGE', text })}
            onSave={() => send({ type: 'EDIT_SAVE' })}
            onCancel={() => send({ type: 'EDIT_CANCEL' })}
          />
        )}
      </main>

      <footer className="app__footer">
        <button
          type="button"
          className="app__compose-button"
          onClick={() => send({ type: 'COMPOSE' })}
          disabled={!(isEntering || isStaged)}
        >
          Compose
        </button>
        <button
          type="button"
          className="app__backspace"
          onClick={() => send({ type: 'BACKSPACE' })}
          disabled={!isEntering || snapshot.context.buffer.length === 0}
        >
          ⌫ Backspace
        </button>
      </footer>
    </div>
  )
}

function App() {
  const [frequencyMap, setFrequencyMap] = useState<Map<string, number> | null>(null)

  useEffect(() => {
    loadAllStats()
      .then(setFrequencyMap)
      .catch(() => setFrequencyMap(new Map()))
  }, [])

  if (!frequencyMap) {
    return (
      <div className="app app--loading" role="status">
        Loading…
      </div>
    )
  }

  return <PeriApp initialFrequencyMap={frequencyMap} />
}

export default App
