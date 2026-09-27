import { LESSON_BY_ID, LESSONS, type Lesson } from './data/lessons'
import type { AppState, DrillId } from './storage/store'

export const DRILLS: DrillId[] = ['class', 'initial', 'final', 'sound']

/** Letters from every lesson the user has gone through, in lesson order. */
export function learnedLetters(lessonsDone: readonly string[]): string[] {
  return LESSONS.filter((l) => lessonsDone.includes(l.id)).flatMap((l) => l.letters)
}

/** Combined attempts / correct for a set of letters across the chosen drills. */
export function lettersScore(stats: AppState['stats'], letters: readonly string[], drills: readonly DrillId[] = DRILLS) {
  let n = 0
  let ok = 0
  for (const d of drills) {
    for (const l of letters) {
      const s = stats[d][l]
      if (s) {
        n += s.n
        ok += s.ok
      }
    }
  }
  return { n, ok }
}

export const TARGET_ACCURACY = 0.8
export const MIN_ATTEMPTS_PER_LETTER = 3

export function nextLesson(lessonsDone: readonly string[]): Lesson | undefined {
  return LESSONS.find((l) => !l.optional && !lessonsDone.includes(l.id))
}

/** A lesson is "mastered" once its letters have enough attempts at ≥80 % accuracy. */
export function lessonMastered(stats: AppState['stats'], lesson: Lesson): boolean {
  const s = lettersScore(stats, lesson.letters)
  return s.n >= lesson.letters.length * MIN_ATTEMPTS_PER_LETTER && s.ok / s.n >= TARGET_ACCURACY
}

/** Resolves a drill pool spec: "done", "lesson:<id>" or "letters:ก,ข". */
export function resolvePool(spec: string | null, lessonsDone: readonly string[]): string[] {
  if (spec?.startsWith('lesson:')) return LESSON_BY_ID.get(spec.slice(7))?.letters ?? []
  if (spec?.startsWith('letters:')) return spec.slice(8).split(',').filter(Boolean)
  return learnedLetters(lessonsDone)
}
