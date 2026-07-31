import { DwellTarget } from './DwellTarget'

interface StagedPanelProps {
  phrase: string
  onSpeak: () => void
  onShare: () => void
  onEdit: () => void
  onDiscard: () => void
}

// FR4/NFR3: staging never speaks or sends by itself — every action here is
// a distinct, explicit confirm step.
export function StagedPanel({ phrase, onSpeak, onShare, onEdit, onDiscard }: StagedPanelProps) {
  return (
    <div className="staged-panel" role="alert" aria-label="Staged phrase, awaiting confirmation">
      <p className="staged-panel__text">{phrase}</p>
      <div className="staged-panel__actions">
        <DwellTarget onSelect={onSpeak} label="Speak this phrase aloud" className="staged-panel__primary">
          🔊 Speak
        </DwellTarget>
        <DwellTarget onSelect={onShare} label="Copy or share this phrase">
          📋 Copy / Share
        </DwellTarget>
        <DwellTarget onSelect={onEdit} label="Edit this phrase">
          ✎ Edit
        </DwellTarget>
        <DwellTarget onSelect={onDiscard} label="Discard and start over">
          ✕ Discard
        </DwellTarget>
      </div>
    </div>
  )
}
