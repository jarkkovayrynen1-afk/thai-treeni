import { consonant, FINAL_SOUNDS } from '../data/consonants'
import type { ConsonantClass, FinalSound } from '../data/types'
import { pickWeighted, shuffle, weight, type ItemStat, type Rng } from '../engine/srs'
import type { DrillId } from '../storage/store'

export type Question =
  | { kind: 'class'; letter: string }
  | { kind: 'initial'; letter: string; options: string[] }
  | { kind: 'final'; letter: string; options: FinalSound[] }
  | { kind: 'sound'; sound: string; options: string[]; correct: string[] }

export type Answer = ConsonantClass | string | FinalSound | string[]

export type Stats = Record<DrillId, Record<string, ItemStat>>

const ALL_INITIALS = ['g', 'k', 'ng', 'j', 'ch', 's', 'y', 'd', 'dt', 't', 'n', 'b', 'bp', 'p', 'f', 'm', 'r', 'l', 'w', 'h', '']
/** Sounds a beginner mixes up, used first as distractors. */
const CONFUSABLE: Record<string, string[]> = {
  g: ['k', 'dt', 'bp'], k: ['g', 'h', 't'], dt: ['t', 'd', 'g'], t: ['dt', 'd', 'k'],
  bp: ['p', 'b', 'g'], p: ['bp', 'b', 'f'], b: ['bp', 'p', 'd'], d: ['dt', 't', 'b'],
  j: ['ch', 'y', 'dt'], ch: ['j', 's', 'k'], s: ['ch', 't', 'h'], y: ['j', 'ng', 'w'],
  f: ['p', 'w', 'h'], h: ['k', '', 's'], '': ['h', 'ng', 'y'], ng: ['n', 'g', 'y'],
  n: ['m', 'ng', 'l'], m: ['n', 'b', 'w'], r: ['l', 'n', 'd'], l: ['r', 'n', 'y'], w: ['b', 'f', 'y'],
}

export const drillApplies = (drill: DrillId, pool: readonly string[]): boolean =>
  drill === 'final' ? pool.some((l) => consonant(l).final !== null) : pool.length > 0

export interface QuestionContext {
  pool: readonly string[]
  stats: Stats
  /** Items shown in the last couple of questions, to avoid instant repeats. */
  recent: readonly string[]
  rng: Rng
}

export function makeQuestion(drill: DrillId, ctx: QuestionContext): Question {
  const { pool, stats, recent, rng } = ctx
  const w = (item: string) => weight(stats[drill][item])

  switch (drill) {
    case 'class':
      return { kind: 'class', letter: pickWeighted(pool, w, recent, rng) }

    case 'initial': {
      const letter = pickWeighted(pool, w, recent, rng)
      const right = consonant(letter).initial
      const poolSounds = [...new Set(pool.map((l) => consonant(l).initial))]
      const distractors = uniq([...shuffle(CONFUSABLE[right] ?? [], rng), ...shuffle(poolSounds, rng), ...shuffle(ALL_INITIALS, rng)])
        .filter((s) => s !== right)
        .slice(0, 3)
      return { kind: 'initial', letter, options: shuffle([right, ...distractors], rng) }
    }

    case 'final': {
      const finals = pool.filter((l) => consonant(l).final !== null)
      return { kind: 'final', letter: pickWeighted(finals, w, recent, rng), options: FINAL_SOUNDS }
    }

    case 'sound': {
      const bySound = new Map<string, string[]>()
      for (const l of pool) bySound.set(consonant(l).initial, [...(bySound.get(consonant(l).initial) ?? []), l])
      // A sound is as urgent as its weakest letter.
      const sound = pickWeighted([...bySound.keys()], (s) => Math.max(...bySound.get(s)!.map(w)), recent, rng)
      const correct = bySound.get(sound)!
      const others = shuffle(pool.filter((l) => !correct.includes(l)), rng)
      const options = shuffle([...correct, ...others.slice(0, Math.max(3, 8 - correct.length))].slice(0, 8), rng)
      return { kind: 'sound', sound, options, correct }
    }
  }
}

/** The item a question is "about", for the no-instant-repeat rule. */
export const questionItem = (q: Question): string => (q.kind === 'sound' ? q.sound : q.letter)

export function isCorrect(q: Question, answer: Answer): boolean {
  switch (q.kind) {
    case 'class':
      return answer === consonant(q.letter).cls
    case 'initial':
      return answer === consonant(q.letter).initial
    case 'final':
      return answer === consonant(q.letter).final
    case 'sound': {
      const picked = answer as string[]
      return picked.length === q.correct.length && q.correct.every((l) => picked.includes(l))
    }
  }
}

/** Per-letter results to store: sound questions touch several letters at once. */
export function letterResults(q: Question, answer: Answer | null): [letter: string, correct: boolean][] {
  if (q.kind !== 'sound') return [[q.letter, answer !== null && isCorrect(q, answer)]]
  const picked = (answer as string[] | null) ?? []
  return [
    ...q.correct.map((l): [string, boolean] => [l, picked.includes(l)]),
    ...picked.filter((l) => !q.correct.includes(l)).map((l): [string, boolean] => [l, false]),
  ]
}

const uniq = <T,>(xs: T[]): T[] => [...new Set(xs)]
