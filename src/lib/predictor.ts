import { PHRASE_BANK, type Phrase } from '../data/phraseBank'
import { PrefixTrie } from './trie'

const trie = new PrefixTrie()
const phrasesById = new Map<string, Phrase>()
for (const phrase of PHRASE_BANK) {
  trie.insert(phrase.text, phrase.id)
  phrasesById.set(phrase.id, phrase)
}

const STOPWORDS = new Set(['a', 'an', 'the', 'i', 'you', 'is', 'are', 'to', 'of'])

function significantWords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  return new Set(words)
}

function contextOverlapScore(phrase: string, context: string): number {
  if (!context.trim()) return 0
  const phraseWords = significantWords(phrase)
  const contextWords = significantWords(context)
  if (phraseWords.size === 0 || contextWords.size === 0) return 0
  let shared = 0
  for (const word of phraseWords) {
    if (contextWords.has(word)) shared += 1
  }
  return shared / phraseWords.size
}

const FREQUENCY_WEIGHT = 1
const CONTEXT_WEIGHT = 3

export interface PredictionInput {
  /** Characters entered so far via the joystick; empty = no prefix filter. */
  prefix: string
  /** Live transcript or pasted incoming message, used to bias toward a fitting reply. */
  contextText: string
  /** In-memory copy of per-user selection counts (see lib/storage.ts). */
  frequencyMap: Map<string, number>
  limit?: number
}

export function getCandidates({
  prefix,
  contextText,
  frequencyMap,
  limit = 6,
}: PredictionInput): Phrase[] {
  const candidateIds = prefix ? trie.search(prefix) : new Set(phrasesById.keys())

  const scored = Array.from(candidateIds)
    .map((id) => phrasesById.get(id))
    .filter((phrase): phrase is Phrase => Boolean(phrase))
    .map((phrase) => {
      const frequency = frequencyMap.get(phrase.id) ?? 0
      const overlap = contextOverlapScore(phrase.text, contextText)
      const score = FREQUENCY_WEIGHT * frequency + CONTEXT_WEIGHT * overlap
      return { phrase, score }
    })

  scored.sort((a, b) => b.score - a.score || a.phrase.text.localeCompare(b.phrase.text))

  return scored.slice(0, limit).map((entry) => entry.phrase)
}

export function getPhraseById(id: string): Phrase | undefined {
  return phrasesById.get(id)
}
