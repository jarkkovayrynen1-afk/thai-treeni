import { CONSONANT_BY_CHAR } from './data/consonants'
import { LESSON_BY_ID, LESSONS, LIVE_DEAD_LESSON, VOWEL_LESSON_BY_ID, VOWEL_LESSONS } from './data/lessons'
import { FORM_BY_ID } from './data/vowels'
import { WORDS } from './data/words'
import type { AppState, DrillId, DrillParam } from './storage/store'

export type Family = 'consonant' | 'vowel' | 'syllable'

export const CONSONANT_DRILLS: DrillId[] = ['class', 'initial', 'final', 'sound']
export const VOWEL_DRILLS: DrillId[] = ['vowelSound', 'vowelLength']
export const FAMILY_DRILLS: Record<Family, DrillId[]> = { consonant: CONSONANT_DRILLS, vowel: VOWEL_DRILLS, syllable: ['liveDead'] }

export const familyOf = (d: DrillParam): Family =>
  d === 'mix' || CONSONANT_DRILLS.includes(d as DrillId) ? 'consonant' : d === 'vmix' || VOWEL_DRILLS.includes(d as DrillId) ? 'vowel' : 'syllable'

export const drillsOf = (d: DrillParam): DrillId[] => (d === 'mix' ? CONSONANT_DRILLS : d === 'vmix' ? VOWEL_DRILLS : [d])

/** The "mix everything in this family" drill, or the only drill of a one-drill family. */
export const FAMILY_MIX: Record<Family, DrillParam> = { consonant: 'mix', vowel: 'vmix', syllable: 'liveDead' }

/** Every lesson in teaching order, whatever its kind. */
export interface AnyLesson {
  id: string
  title: string
  family: Family
  optional?: boolean
  /** Letters, vowel form ids, or nothing for the rule lesson. */
  items: string[]
}

export const ALL_LESSONS: AnyLesson[] = [
  ...LESSONS.map((l) => ({ id: l.id, title: l.title, family: 'consonant' as const, optional: l.optional, items: l.letters })),
  ...VOWEL_LESSONS.map((l) => ({ id: l.id, title: l.title, family: 'vowel' as const, optional: l.optional, items: l.forms })),
  { id: LIVE_DEAD_LESSON.id, title: LIVE_DEAD_LESSON.title, family: 'syllable', items: [] },
]

/** Letters from every lesson the user has gone through, in lesson order. */
export function learnedLetters(lessonsDone: readonly string[]): string[] {
  return LESSONS.filter((l) => lessonsDone.includes(l.id)).flatMap((l) => l.letters)
}

const drillableForms = (ids: readonly string[]) => ids.filter((id) => FORM_BY_ID.get(id)?.drillable)

/** Vowel forms from finished vowel lessons (the invisible o is taught, not drilled). */
export function learnedForms(lessonsDone: readonly string[]): string[] {
  return drillableForms(VOWEL_LESSONS.filter((l) => lessonsDone.includes(l.id)).flatMap((l) => l.forms))
}

const MIN_WORD_POOL = 20

/**
 * Words for the live/dead drill: only ones written with letters you have learned,
 * once there are enough of them; before that, the whole list.
 */
export function wordPool(lessonsDone: readonly string[]): string[] {
  const known = new Set(learnedLetters(lessonsDone))
  const readable = WORDS.filter((w) => [...w.thai].every((ch) => !CONSONANT_BY_CHAR.has(ch) || known.has(ch))).map((w) => w.thai)
  return readable.length >= MIN_WORD_POOL ? readable : WORDS.map((w) => w.thai)
}

/** Combined attempts / correct for some items across the chosen drills. */
export function itemsScore(stats: AppState['stats'], items: readonly string[], drills: readonly DrillId[]) {
  let n = 0
  let ok = 0
  for (const d of drills) {
    for (const item of items) {
      const s = stats[d][item]
      if (s) {
        n += s.n
        ok += s.ok
      }
    }
  }
  return { n, ok }
}

/** Letters across the consonant drills (or the ones given). */
export const lettersScore = (stats: AppState['stats'], letters: readonly string[], drills: readonly DrillId[] = CONSONANT_DRILLS) =>
  itemsScore(stats, letters, drills)

export const TARGET_ACCURACY = 0.8
export const MIN_ATTEMPTS_PER_ITEM = 3
const MIN_LIVE_DEAD_ATTEMPTS = 30

export function nextLesson(lessonsDone: readonly string[]): AnyLesson | undefined {
  return ALL_LESSONS.find((l) => !l.optional && !lessonsDone.includes(l.id))
}

export function lessonScore(stats: AppState['stats'], lesson: AnyLesson) {
  if (lesson.family === 'syllable') return itemsScore(stats, Object.keys(stats.liveDead), ['liveDead'])
  return itemsScore(stats, lesson.family === 'vowel' ? drillableForms(lesson.items) : lesson.items, FAMILY_DRILLS[lesson.family])
}

/** "Mastered" = enough attempts at ≥80 % accuracy. */
export function lessonMastered(stats: AppState['stats'], lesson: AnyLesson): boolean {
  const s = lessonScore(stats, lesson)
  const needed = lesson.family === 'syllable' ? MIN_LIVE_DEAD_ATTEMPTS : lesson.items.length * MIN_ATTEMPTS_PER_ITEM
  return s.n >= needed && s.ok / s.n >= TARGET_ACCURACY
}

/**
 * Resolves a drill pool spec for a family: "done", "lesson:<id>", or an explicit list
 * ("letters:ก,ข", "forms:a,aa", "words:ตา,มา").
 */
export function resolvePool(spec: string | null, lessonsDone: readonly string[], family: Family): string[] {
  const list = spec?.match(/^(letters|forms|words):(.*)$/)
  if (list) return list[2].split(',').filter(Boolean)
  if (spec?.startsWith('lesson:')) {
    const id = spec.slice(7)
    if (family === 'consonant') return LESSON_BY_ID.get(id)?.letters ?? []
    if (family === 'vowel') return drillableForms(VOWEL_LESSON_BY_ID.get(id)?.forms ?? [])
  }
  if (family === 'vowel') return learnedForms(lessonsDone)
  if (family === 'syllable') return wordPool(lessonsDone)
  return learnedLetters(lessonsDone)
}

/** How a family's missed items are passed back as a pool. */
export const POOL_PREFIX: Record<Family, string> = { consonant: 'letters', vowel: 'forms', syllable: 'words' }
