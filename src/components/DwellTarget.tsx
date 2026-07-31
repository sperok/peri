import type { CSSProperties, ReactNode } from 'react'
import { useDwell } from '../hooks/useDwell'

interface DwellTargetProps {
  onSelect: () => void
  durationMs?: number
  className?: string
  disabled?: boolean
  label: string
  children: ReactNode
}

export function DwellTarget({
  onSelect,
  durationMs = 600,
  className = '',
  disabled = false,
  label,
  children,
}: DwellTargetProps) {
  const { progress, bind } = useDwell(onSelect, durationMs)

  return (
    <button
      type="button"
      className={`dwell-target ${className}`}
      aria-label={label}
      disabled={disabled}
      style={{ '--dwell-progress': progress } as CSSProperties}
      {...(disabled ? {} : bind)}
    >
      <span className="dwell-target__ring" aria-hidden="true" />
      <span className="dwell-target__content">{children}</span>
    </button>
  )
}
