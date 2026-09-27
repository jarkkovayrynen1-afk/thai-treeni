import type { DrillId } from '../storage/store'
import type { ConsonantClass, FinalSound, Liveness, LowKind, Tone, ToneMark, VowelLength } from '../data/types'

export const CLASS_FI: Record<ConsonantClass, string> = { mid: 'keski', high: 'korkea', low: 'matala' }
export const CLASS_SHAPE: Record<ConsonantClass, string> = { mid: '●', high: '▲', low: '▼' }
export const LOW_KIND_FI: Record<LowKind, string> = { paired: 'pari', sonorant: 'yksinäinen' }
export const LOW_KIND_THAI: Record<LowKind, string> = { paired: 'อักษรคู่', sonorant: 'อักษรเดี่ยว' }

export const TONE_FI: Record<Tone, string> = { mid: 'keski', low: 'matala', falling: 'laskeva', high: 'korkea', rising: 'nouseva' }
/** Order used for the five tone buttons. */
export const TONE_ORDER: Tone[] = ['mid', 'low', 'falling', 'high', 'rising']
/** Pitch-contour glyphs shown next to tone names. */
export const TONE_ICON: Record<Tone, string> = { mid: '→', low: '↘', falling: '↗↘', high: '↗', rising: '↘↗' }

export const LIVE_FI: Record<Liveness, string> = { live: 'elävä', dead: 'kuollut' }
export const LEN_FI: Record<VowelLength, string> = { short: 'lyhyt', long: 'pitkä' }

export const MARK_FI: Record<ToneMark, string> = {
  '': 'ei merkkiä',
  '่': 'ไม้เอก ◌่',
  '้': 'ไม้โท ◌้',
  '๊': 'ไม้ตรี ◌๊',
  '๋': 'ไม้จัตวา ◌๋',
}

export const FINAL_LABEL: Record<FinalSound, string> = {
  k: '-k',
  t: '-t',
  p: '-p',
  ng: '-ng',
  n: '-n',
  m: '-m',
  y: '-i (y)',
  w: '-o (w)',
}

export const DRILL_FI: Record<DrillId | 'mix', string> = {
  class: 'Kirjain → luokka',
  initial: 'Kirjain → alkuäänne',
  final: 'Kirjain → loppuäänne',
  sound: 'Äänne → kirjaimet',
  mix: 'Sekoitus',
}

export const initialLabel = (sound: string): string => (sound === '' ? 'äänetön' : sound)
