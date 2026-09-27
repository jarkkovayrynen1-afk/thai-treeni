import type { Word } from '../data/types'
import { CLASS_FI, LEN_FI, LIVE_FI, MARK_FI, TONE_FI } from '../i18n/fi'
import { analyzeSpelling } from './spelling'
import { computeTone, lengthMatters } from './tone'

export interface Derivation {
  /** The letters that decide the class, e.g. "ข" or "หม" (ห นำ). */
  onset: string
  classText: string
  liveText: string
  markText: string
  toneText: string
  /** One line: "ข = korkea · elävä · ei merkkiä → nouseva". */
  line: string
}

export function deriveWord(word: Word): Derivation {
  const { initial } = analyzeSpelling(word.thai)
  const onset = word.leader ? word.leader + initial : initial
  const classText = CLASS_FI[word.cls] + (word.leader ? ` (${word.leader} นำ)` : '')
  const liveText = LIVE_FI[word.live] + (lengthMatters(word) ? `, ${LEN_FI[word.len]}` : '')
  const markText = MARK_FI[word.mark]
  const toneText = TONE_FI[computeTone(word)]
  return { onset, classText, liveText, markText, toneText, line: `${onset} = ${classText} · ${liveText} · ${markText} → ${toneText}` }
}
