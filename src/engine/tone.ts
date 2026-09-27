import type { ConsonantClass, Leader, Liveness, Tone, ToneMark, VowelLength } from '../data/types'

export interface ToneInput {
  /** Effective class — already the leader's class for ห นำ / อ นำ. */
  cls: ConsonantClass
  live: Liveness
  len: VowelLength
  mark: ToneMark
  leader?: Leader
}

/**
 * One row of the tone-rule table. Leader variants are separate branches so tests can
 * prove ห นำ and อ นำ are exercised, even though they reuse the high / mid rows.
 */
export type ToneBranch =
  | 'mid-live' | 'mid-dead' | 'high-live' | 'high-dead'
  | 'low-live' | 'low-dead-short' | 'low-dead-long'
  | 'mid-ek' | 'high-ek' | 'low-ek'
  | 'mid-tho' | 'high-tho' | 'low-tho'
  | 'mid-tri' | 'mid-chattawa'
  | 'honam-live' | 'honam-dead' | 'honam-ek' | 'honam-tho'
  | 'onam-ek' | 'onam-dead'

export const ALL_BRANCHES: readonly ToneBranch[] = [
  'mid-live', 'mid-dead', 'high-live', 'high-dead',
  'low-live', 'low-dead-short', 'low-dead-long',
  'mid-ek', 'high-ek', 'low-ek',
  'mid-tho', 'high-tho', 'low-tho',
  'mid-tri', 'mid-chattawa',
  'honam-live', 'honam-dead', 'honam-ek', 'honam-tho',
  'onam-ek', 'onam-dead',
]

const MARKED: Record<Exclude<ToneMark, ''>, Record<ConsonantClass, Tone>> = {
  '่': { mid: 'low', high: 'low', low: 'falling' },
  '้': { mid: 'falling', high: 'falling', low: 'high' },
  // ไม้ตรี and ไม้จัตวา are written only on mid-class consonants in native words.
  '๊': { mid: 'high', high: 'high', low: 'high' },
  '๋': { mid: 'rising', high: 'rising', low: 'rising' },
}

const MARK_KEY: Record<Exclude<ToneMark, ''>, string> = { '่': 'ek', '้': 'tho', '๊': 'tri', '๋': 'chattawa' }

/** The deterministic rule: class + live/dead (+ vowel length for low dead) + tone mark → tone. */
export function computeTone(input: ToneInput): Tone {
  const { cls, live, len, mark } = input
  if (mark) return MARKED[mark][cls]
  if (live === 'live') return cls === 'high' ? 'rising' : 'mid'
  if (cls === 'low') return len === 'short' ? 'high' : 'falling'
  return 'low'
}

export function toneBranch(input: ToneInput): ToneBranch {
  const { cls, live, len, mark, leader } = input
  const markKey = mark ? MARK_KEY[mark] : live
  if (leader === 'ห') return `honam-${markKey}` as ToneBranch
  if (leader === 'อ') return `onam-${markKey}` as ToneBranch
  if (!mark && cls === 'low' && live === 'dead') return len === 'short' ? 'low-dead-short' : 'low-dead-long'
  return `${cls}-${markKey}` as ToneBranch
}

/** True when the vowel length changes the answer (low class, dead, no mark). */
export const lengthMatters = (input: ToneInput): boolean =>
  !input.mark && input.cls === 'low' && input.live === 'dead'
