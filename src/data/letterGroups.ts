export type CompassDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export interface LetterGroup {
  direction: CompassDirection
  /** Characters in this group, most-frequent first. Group size is inversely
   * proportional to frequency so the most common characters need the
   * fewest dwells to reach (small/singleton groups), and rare characters
   * share a larger group. */
  chars: string[]
}

// English letter-frequency ordering (approx.), plus space as its own
// highest-priority target since it's the single most frequent character
// in running text. Punctuation shares the lowest-frequency group.
export const LETTER_GROUPS: LetterGroup[] = [
  { direction: 'N', chars: [' '] },
  { direction: 'NE', chars: ['e', 't'] },
  { direction: 'E', chars: ['a', 'o', 'i'] },
  { direction: 'SE', chars: ['n', 's', 'h', 'r'] },
  { direction: 'S', chars: ['d', 'l', 'c', 'u'] },
  { direction: 'SW', chars: ['m', 'w', 'f', 'g'] },
  { direction: 'W', chars: ['y', 'p', 'b', 'v'] },
  { direction: 'NW', chars: ['k', 'j', 'x', 'q', 'z', '.', ',', '?'] },
]

export const DIRECTION_ANGLES: Record<CompassDirection, number> = {
  N: -90,
  NE: -45,
  E: 0,
  SE: 45,
  S: 90,
  SW: 135,
  W: 180,
  NW: -135,
}

export function groupForDirection(direction: CompassDirection): LetterGroup {
  const group = LETTER_GROUPS.find((g) => g.direction === direction)
  if (!group) throw new Error(`Unknown compass direction: ${direction}`)
  return group
}
