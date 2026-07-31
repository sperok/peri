import type { CSSProperties } from 'react'
import { DIRECTION_ANGLES, LETTER_GROUPS, groupForDirection, type CompassDirection } from '../data/letterGroups'
import { DwellTarget } from './DwellTarget'

const RADIUS = 130

function positionStyle(angleDeg: number): CSSProperties {
  const radians = (angleDeg * Math.PI) / 180
  const x = Math.cos(radians) * RADIUS
  const y = Math.sin(radians) * RADIUS
  return {
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
  }
}

function charLabel(char: string): string {
  return char === ' ' ? '␣' : char
}

interface JoystickProps {
  mode: 'awaitingDirection' | 'groupOpen'
  activeDirection: CompassDirection | null
  onDirection: (direction: CompassDirection) => void
  onChar: (char: string) => void
  onCancelGroup: () => void
  bufferPreview: string
}

export function Joystick({
  mode,
  activeDirection,
  onDirection,
  onChar,
  onCancelGroup,
  bufferPreview,
}: JoystickProps) {
  const activeGroup = activeDirection ? groupForDirection(activeDirection) : null

  return (
    <div className="joystick" role="group" aria-label="Character entry joystick">
      <div className="joystick__hub">
        {mode === 'groupOpen' ? (
          <DwellTarget onSelect={onCancelGroup} label="Cancel, back to directions" className="joystick__cancel">
            ×
          </DwellTarget>
        ) : (
          <span className="joystick__buffer" aria-hidden="true">
            {bufferPreview || ' '}
          </span>
        )}
      </div>

      {mode === 'awaitingDirection' &&
        LETTER_GROUPS.map((group) => (
          <div
            key={group.direction}
            className="joystick__zone"
            style={positionStyle(DIRECTION_ANGLES[group.direction])}
          >
            <DwellTarget
              onSelect={() => onDirection(group.direction)}
              label={`Direction ${group.direction}: ${group.chars.map(charLabel).join(' ')}`}
            >
              {group.chars.map(charLabel).join(' ')}
            </DwellTarget>
          </div>
        ))}

      {mode === 'groupOpen' &&
        activeGroup &&
        activeGroup.chars.map((char, index) => {
          const angle = (360 / activeGroup.chars.length) * index - 90
          return (
            <div key={char} className="joystick__zone" style={positionStyle(angle)}>
              <DwellTarget onSelect={() => onChar(char)} label={`Character ${charLabel(char)}`}>
                {charLabel(char)}
              </DwellTarget>
            </div>
          )
        })}
    </div>
  )
}
