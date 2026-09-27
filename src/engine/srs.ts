// Leitner-style spaced repetition for fast drills. Each item sits in a box 0–5:
// a correct answer moves it up one box, a miss drops it to 0. Lower boxes are drawn
// far more often, so the letters you miss keep coming back until they stick.

export interface ItemStat {
  /** Attempts. */
  n: number
  /** Correct answers. */
  ok: number
  box: number
  /** Last answer time (ms since epoch). */
  last: number
  /** Last results, newest last: '1' correct, '0' miss. At most 10. */
  recent: string
}

export const MAX_BOX = 5
const BOX_WEIGHT = [10, 6, 3.5, 2, 1.2, 0.6]
/** Unseen items: likely enough to show up soon, not so likely they swamp a round. */
const NEW_WEIGHT = 5

export function updateStat(stat: ItemStat | undefined, correct: boolean, now: number): ItemStat {
  const s = stat ?? { n: 0, ok: 0, box: 0, last: 0, recent: '' }
  return {
    n: s.n + 1,
    ok: s.ok + (correct ? 1 : 0),
    box: correct ? Math.min(MAX_BOX, s.box + 1) : 0,
    last: now,
    recent: (s.recent + (correct ? '1' : '0')).slice(-10),
  }
}

export function weight(stat: ItemStat | undefined): number {
  return stat ? BOX_WEIGHT[Math.min(stat.box, MAX_BOX)] : NEW_WEIGHT
}

export type Rng = () => number

/**
 * Weighted random pick. Items in `avoid` (recently shown) are skipped whenever
 * there is anything else to choose from.
 */
export function pickWeighted<T>(items: readonly T[], weightOf: (item: T) => number, avoid: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error('pickWeighted: no items')
  const fresh = items.filter((i) => !avoid.includes(i))
  const candidates = fresh.length ? fresh : items
  const total = candidates.reduce((sum, i) => sum + weightOf(i), 0)
  let r = rng() * total
  for (const item of candidates) {
    r -= weightOf(item)
    if (r < 0) return item
  }
  return candidates[candidates.length - 1]
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const accuracy = (s: { n: number; ok: number }): number => (s.n ? s.ok / s.n : 0)
