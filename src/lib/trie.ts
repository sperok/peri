/** Prefix trie over phrase text, used to find candidate phrase ids for a
 * typed prefix without scanning the whole phrase bank on every keystroke. */

interface TrieNode {
  children: Map<string, TrieNode>
  phraseIds: Set<string>
}

function createNode(): TrieNode {
  return { children: new Map(), phraseIds: new Set() }
}

export class PrefixTrie {
  private root: TrieNode = createNode()

  insert(text: string, phraseId: string): void {
    const normalized = text.toLowerCase()
    let node = this.root
    node.phraseIds.add(phraseId)
    for (const char of normalized) {
      let next = node.children.get(char)
      if (!next) {
        next = createNode()
        node.children.set(char, next)
      }
      next.phraseIds.add(phraseId)
      node = next
    }
  }

  /** Returns phrase ids whose text starts with the given prefix. */
  search(prefix: string): Set<string> {
    const normalized = prefix.toLowerCase()
    let node = this.root
    for (const char of normalized) {
      const next = node.children.get(char)
      if (!next) return new Set()
      node = next
    }
    return node.phraseIds
  }
}
