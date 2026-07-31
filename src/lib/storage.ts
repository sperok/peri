import Dexie, { type EntityTable } from 'dexie'

/** Local, on-device personalization data (FR8/NFR4). Never synced. */

export interface PhraseStat {
  phraseId: string
  selectCount: number
  lastSelectedAt: number
}

const db = new Dexie('PeriDB') as Dexie & {
  phraseStats: EntityTable<PhraseStat, 'phraseId'>
}

db.version(1).stores({
  phraseStats: 'phraseId',
})

export async function loadAllStats(): Promise<Map<string, number>> {
  const rows = await db.phraseStats.toArray()
  return new Map(rows.map((row) => [row.phraseId, row.selectCount]))
}

export async function recordSelection(phraseId: string): Promise<number> {
  return db.transaction('rw', db.phraseStats, async () => {
    const existing = await db.phraseStats.get(phraseId)
    const selectCount = (existing?.selectCount ?? 0) + 1
    await db.phraseStats.put({
      phraseId,
      selectCount,
      lastSelectedAt: Date.now(),
    })
    return selectCount
  })
}

export { db }
