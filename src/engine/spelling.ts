import { consonant, HO_NAM_SONORANTS, isConsonant } from '../data/consonants'
import type { ConsonantClass, FinalSound, Leader, Liveness, ToneMark, VowelLength } from '../data/types'
import { computeTone, toneBranch, type ToneInput } from './tone'

// Reads the tone-relevant structure straight from the Thai spelling of ONE syllable.
// It handles the patterns in the app's word list (preposed vowels, clusters, ห นำ / อ นำ,
// medial -ว-, silent ์ letters) and throws on anything it does not understand, so an
// unsupported word can never slip through with a guessed answer.

const PREPOSED = 'เแโใไ'
const TONE_MARKS = '่้๊๋'
const SHORT_OPEN_ENDINGS = 'ะิึุ'
const SHORT_SIGNS = 'ัิึุ็'

export interface SpellingAnalysis {
  mark: ToneMark
  leader?: Leader
  /** The consonant that carries the sound at the start (after any leader). */
  initial: string
  /** Second consonant of a cluster (ปล, คร, ขว, ทร …), if any. */
  cluster?: string
  /** Final-sound category, or null for an open syllable. */
  coda: FinalSound | null
  /**
   * Vowel length where the spelling decides it reliably (open syllables and unmarked
   * dead syllables). Undefined elsewhere: spoken length often differs in live syllables.
   */
  len?: VowelLength
  live: Liveness
  /** Class that decides the tone: the leader's class when there is one. */
  cls: ConsonantClass
}

export function analyzeSpelling(thai: string): SpellingAnalysis {
  const marks = [...thai].filter((ch) => TONE_MARKS.includes(ch))
  if (marks.length > 1) throw new Error(`${thai}: more than one tone mark`)
  const mark = (marks[0] ?? '') as ToneMark

  // Drop tone marks and silent letters (consonant, optional ิ/ุ, then ์).
  const s = [...thai].filter((ch) => !TONE_MARKS.includes(ch)).join('').replace(/[ก-ฮ][ิุ]?์/g, '')
  const chars = [...s]
  let i = 0
  const pre = PREPOSED.includes(chars[0]) ? chars[i++] : ''

  const first = chars[i]
  if (!isConsonant(first)) throw new Error(`${thai}: expected a consonant at position ${i}`)

  let leader: Leader | undefined
  let initial: string
  if (first === 'ห' && HO_NAM_SONORANTS.includes(chars[i + 1] ?? '-') && isConsonant(chars[i + 1])) {
    leader = 'ห'
    initial = chars[i + 1]
    i += 2
  } else if (first === 'อ' && chars[i + 1] === 'ย') {
    leader = 'อ'
    initial = 'ย'
    i += 2
  } else {
    initial = first
    i += 1
  }

  let cluster: string | undefined
  const c2 = chars[i]
  if (c2 !== undefined && 'รลว'.includes(c2) && !leader) {
    const next = chars[i + 1]
    // Before a vowel sign ร ล ว belong to the onset (ปลา, ครู, ขวา, ทราย). Before a
    // consonant ร ล still do (เพลง, ตรง) but ว is the medial vowel -ว- (ขวด, สวน).
    const isCluster =
      next === undefined
        ? pre === 'ใ' || pre === 'ไ' // ใคร, ใกล้
        : !isConsonant(next) || c2 !== 'ว'
    if (isCluster) {
      cluster = c2
      i += 1
    }
  }

  const rest = chars.slice(i).join('')
  const last = chars[chars.length - 1]
  let coda: FinalSound | null
  let body = rest // vowel part, without the final consonant

  if (pre === 'ใ' || pre === 'ไ') {
    if (rest !== '') throw new Error(`${thai}: unexpected letters after ${pre}-`)
    coda = 'y'
  } else if (last === 'ำ') {
    coda = 'm'
  } else if (pre === 'เ' && rest === 'า') {
    coda = 'w' // เ-า
  } else if (rest === '') {
    if (!pre) throw new Error(`${thai}: no vowel`)
    coda = null // เ- แ- โ- open
  } else if (!isConsonant(last)) {
    coda = null // ends in a vowel sign
  } else if (last === 'อ') {
    coda = null // -อ, -ือ, เ-อ, เ-ือ
  } else if (last === 'ย' && pre === 'เ' && rest.endsWith('ีย')) {
    coda = null // เ-ีย
  } else if (last === 'ว' && rest.endsWith('ัว')) {
    coda = null // -ัว
  } else {
    const f = consonant(last).final
    if (f === null) throw new Error(`${thai}: ${last} cannot be a final consonant`)
    coda = f
    body = rest.slice(0, -1)
  }

  let len: VowelLength | undefined
  if (coda === null) {
    len = SHORT_OPEN_ENDINGS.includes(s[s.length - 1]) ? 'short' : 'long'
  } else if (coda === 'k' || coda === 't' || coda === 'p') {
    if (!mark) len = closedLength(thai, pre, body)
  }

  const live: Liveness = coda === 'k' || coda === 't' || coda === 'p' || (coda === null && len === 'short') ? 'dead' : 'live'
  const cls = consonant(leader ?? initial).cls
  return { mark, ...(leader ? { leader } : {}), initial, ...(cluster ? { cluster } : {}), coda, ...(len ? { len } : {}), live, cls }
}

/** Vowel length of a closed syllable, from the vowel signs between onset and final. */
function closedLength(thai: string, pre: string, body: string): VowelLength {
  if (pre === 'เ' && body === 'ิ') return 'long' // เ-ิ- = əə
  if ([...body].some((ch) => SHORT_SIGNS.includes(ch))) return 'short'
  if (body === '') return pre ? 'long' : 'short' // เลข, โชค vs. คน, นก (implicit o)
  if (/^(า|ี|ื|ู|อ|ว|ีย|ือ)$/.test(body)) return 'long'
  throw new Error(`${thai}: cannot read vowel length from "${pre}…${body}"`)
}

/** Full derivation from spelling alone. `len` falls back to 'long' where it cannot matter. */
export function toneInputFromSpelling(thai: string): ToneInput & { analysis: SpellingAnalysis } {
  const a = analyzeSpelling(thai)
  const input: ToneInput = { cls: a.cls, live: a.live, len: a.len ?? 'long', mark: a.mark, ...(a.leader ? { leader: a.leader } : {}) }
  if (!a.len && !a.mark && a.cls === 'low' && a.live === 'dead') throw new Error(`${thai}: length needed but unknown`)
  return { ...input, analysis: a }
}

export const toneFromSpelling = (thai: string) => computeTone(toneInputFromSpelling(thai))
export const branchFromSpelling = (thai: string) => toneBranch(toneInputFromSpelling(thai))
