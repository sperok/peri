import { describe, expect, it } from 'vitest'
import { PrefixTrie } from './trie'

describe('PrefixTrie', () => {
  it('finds phrases by prefix, case-insensitively', () => {
    const trie = new PrefixTrie()
    trie.insert('Hello', 'p1')
    trie.insert('Hi there', 'p2')
    trie.insert('Help', 'p3')

    expect(trie.search('he')).toEqual(new Set(['p1', 'p3']))
    expect(trie.search('HE')).toEqual(new Set(['p1', 'p3']))
    expect(trie.search('hi')).toEqual(new Set(['p2']))
  })

  it('returns an empty set for an unmatched prefix', () => {
    const trie = new PrefixTrie()
    trie.insert('Hello', 'p1')
    expect(trie.search('xyz')).toEqual(new Set())
  })

  it('returns everything under the root for an empty prefix', () => {
    const trie = new PrefixTrie()
    trie.insert('Hello', 'p1')
    trie.insert('World', 'p2')
    expect(trie.search('')).toEqual(new Set(['p1', 'p2']))
  })
})
