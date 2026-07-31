/** Confirm-to-share (FR6): copy the staged phrase, or use the native share
 * sheet when available, so it can be pasted into chat/email apps. */

export async function shareOrCopy(text: string): Promise<void> {
  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
  if (nav.share) {
    try {
      await nav.share({ text })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      // fall through to clipboard if native share fails for another reason
    }
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  throw new Error('No share or clipboard API available in this browser')
}
