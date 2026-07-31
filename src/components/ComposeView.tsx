import { DwellTarget } from './DwellTarget'

interface ComposeViewProps {
  draftText: string
  onChange: (text: string) => void
  onSave: () => void
  onCancel: () => void
}

// NOTE: text editing here uses a standard textarea for now. For a
// dwell-only user this view still needs its own accessible input path
// (e.g. reusing the joystick inside this view) — tracked as a follow-up,
// not solved by this scaffold.
export function ComposeView({ draftText, onChange, onSave, onCancel }: ComposeViewProps) {
  return (
    <div className="compose-view" role="dialog" aria-label="Edit phrase">
      <textarea
        className="compose-view__textarea"
        value={draftText}
        onChange={(event) => onChange(event.target.value)}
        autoFocus
      />
      <div className="compose-view__actions">
        <DwellTarget onSelect={onSave} label="Save phrase">
          Save
        </DwellTarget>
        <DwellTarget onSelect={onCancel} label="Cancel editing">
          Cancel
        </DwellTarget>
      </div>
    </div>
  )
}
