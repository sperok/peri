import type { CSSProperties } from 'react'
import type { Phrase } from '../data/phraseBank'
import { DwellTarget } from './DwellTarget'

const RADIUS = 230

// Bubbles are freeform, on-screen dwell targets independent of the
// joystick's 8-way compass mechanism (per product decision) — laid out on
// an outer ring here purely for visual clarity, offset from the compass
// points so they don't crowd the joystick zones.
function bubblePosition(index: number, count: number): CSSProperties {
  const angle = (360 / Math.max(count, 1)) * index - 90 + 22.5
  const radians = (angle * Math.PI) / 180
  const x = Math.cos(radians) * RADIUS
  const y = Math.sin(radians) * RADIUS
  return {
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
  }
}

interface BubblesProps {
  candidates: Phrase[]
  onSelect: (phraseId: string) => void
}

export function Bubbles({ candidates, onSelect }: BubblesProps) {
  if (candidates.length === 0) {
    return null
  }

  return (
    <div className="bubbles" aria-label="Phrase suggestions">
      {candidates.map((phrase, index) => (
        <div
          key={phrase.id}
          className="bubbles__item"
          style={bubblePosition(index, candidates.length)}
        >
          <DwellTarget
            onSelect={() => onSelect(phrase.id)}
            label={`Suggested phrase: ${phrase.text}`}
            durationMs={500}
            className="bubble"
          >
            {phrase.text}
          </DwellTarget>
        </div>
      ))}
    </div>
  )
}
