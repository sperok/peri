import { describe, expect, it } from 'vitest'
import { getCandidates } from './predictor'

describe('getCandidates', () => {
  it('filters by typed prefix', () => {
    const results = getCandidates({ prefix: 'hel', contextText: '', frequencyMap: new Map() })
    expect(results.every((phrase) => phrase.text.toLowerCase().startsWith('hel'))).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('ranks higher personal frequency first among prefix matches', () => {
    const freq = new Map([['i-m-hungry', 5]])
    const results = getCandidates({ prefix: "i'm h", contextText: '', frequencyMap: freq })
    expect(results[0]?.id).toBe('i-m-hungry')
  })

  it('boosts phrases that share words with the given context', () => {
    const withContext = getCandidates({
      prefix: '',
      contextText: 'are you hungry right now',
      frequencyMap: new Map(),
    })
    const withoutContext = getCandidates({ prefix: '', contextText: '', frequencyMap: new Map() })

    expect(withContext[0]?.text).toContain('hungry')
    expect(withContext[0]?.text).not.toBe(withoutContext[0]?.text)
  })

  it('respects the limit', () => {
    const results = getCandidates({ prefix: '', contextText: '', frequencyMap: new Map(), limit: 3 })
    expect(results.length).toBeLessThanOrEqual(3)
  })
})
