/** Text-to-speech via the on-device Web Speech API (FR5). No network
 * dependency — satisfies NFR6 (offline). */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string): Promise<void> {
  if (!isSpeechSupported()) {
    return Promise.reject(new Error('speechSynthesis not supported in this browser'))
  }
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(event.error)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  })
}

export function cancelSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
  }
}
