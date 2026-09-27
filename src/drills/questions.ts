import { consonant, FINAL_SOUNDS } from '../data/consonants'
import type { ConsonantClass, FinalSound, Liveness, VowelLength } from '../data/types'
import { VOWELS, vowelForm } from '../data/vowels'
import { WORDS } from '../data/words'
import { pickWeighted, shuffle, weight, type ItemStat, type Rng } from '../engine/srs'
import type { DrillId } from '../storage/store'

export type Question =
  | { kind: 'class'; letter: string }
  | { kind: 'initial'; letter: string; options: string[] }
  | { kind: 'final'; letter: string; options: FinalSound[] }
  | { kind: 'sound'; sound: string; options: string[]; correct: string[] }
  | { kind: 'vowelSound'; form: string; options: string[] }
  | { kind: 'vowelLength'; form: string }
  | { kind: 'liveDead'; word: string }

export type Answer = ConsonantClass | FinalSound | VowelLength | Liveness | string | string[]

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
const ALL_VOWEL_SOUNDS = [...new Set(VOWELS.map((v) => v.rom))]
const WORD_BY_THAI = new Map(WORDS.map((w) => [w.thai, w]))

export const wordOf = (thai: string) => {
  const w = WORD_BY_THAI.get(thai)
  if (!w) throw new Error(`Unknown word: ${thai}`)
  return w
}

export const drillApplies = (drill: DrillId, pool: readonly string[]): boolean =>
  drill === 'final' ? pool.some((l) => consonant(l).final !== null) : pool.length > 0

export interface QuestionContext {
  /** Letters, vowel form ids or words, depending on the drill's family. */
  pool: readonly string[]
  stats: Stats
  /** Items shown in the last couple of questions, to avoid instant repeats. */
  recent: readonly string[]
  rng: Rng
}

export function makeQuestion(drill: DrillId, ctx: QuestionContext): Question {
  const { pool, stats, recent, rng } = ctx
  const w = (item: string) => weight(stats[drill][item])
  const pick = (items: readonly string[]) => pickWeighted(items, w, recent, rng)

  switch (drill) {
    case 'class':
      return { kind: 'class', letter: pick(pool) }

    case 'initial': {
      const letter = pick(pool)
      const right = consonant(letter).initial
      const poolSounds = [...new Set(pool.map((l) => consonant(l).initial))]
      const distractors = uniq([...shuffle(CONFUSABLE[right] ?? [], rng), ...shuffle(poolSounds, rng), ...shuffle(ALL_INITIALS, rng)])
        .filter((s) => s !== right)
        .slice(0, 3)
      return { kind: 'initial', letter, options: shuffle([right, ...distractors], rng) }
    }

    case 'final':
      return { kind: 'final', letter: pick(pool.filter((l) => consonant(l).final !== null)), options: FINAL_SOUNDS }

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

    case 'vowelSound': {
      const form = pick(pool)
      const v = vowelForm(form).vowel
      // The length partner is the classic mistake, so it is always one of the options.
      const partner = v.pair ? [VOWELS.find((x) => x.id === v.pair)!.rom] : []
      const poolSounds = shuffle([...new Set(pool.map((f) => vowelForm(f).vowel.rom))], rng)
      const distractors = uniq([...partner, ...poolSounds, ...shuffle(ALL_VOWEL_SOUNDS, rng)])
        .filter((s) => s !== v.rom)
        .slice(0, 3)
      return { kind: 'vowelSound', form, options: shuffle([v.rom, ...distractors], rng) }
    }

    case 'vowelLength':
      return { kind: 'vowelLength', form: pick(pool) }

    case 'liveDead': {
      // Half live, half dead, so guessing "live" (the more common kind) does not pay.
      const want: Liveness = rng() < 0.5 ? 'live' : 'dead'
      const side = pool.filter((t) => wordOf(t).live === want)
      return { kind: 'liveDead', word: pick(side.length ? side : pool) }
    }
  }
}

/** The item a question is "about", for the no-instant-repeat rule and for stats. */
export function questionItem(q: Question): string {
  switch (q.kind) {
    case 'sound':
      return q.sound
    case 'vowelSound':
    case 'vowelLength':
      return q.form
    case 'liveDead':
      return q.word
    default:
      return q.letter
  }
}

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
    case 'vowelSound':
      return answer === vowelForm(q.form).vowel.rom
    case 'vowelLength':
      return answer === vowelForm(q.form).vowel.len
    case 'liveDead':
      return answer === wordOf(q.word).live
  }
}

/** Per-item results to store: sound questions touch several letters at once. */
export function itemResults(q: Question, answer: Answer | null): [item: string, correct: boolean][] {
  if (q.kind !== 'sound') return [[questionItem(q), answer !== null && isCorrect(q, answer)]]
  const picked = (answer as string[] | null) ?? []
  return [
    ...q.correct.map((l): [string, boolean] => [l, picked.includes(l)]),
    ...picked.filter((l) => !q.correct.includes(l)).map((l): [string, boolean] => [l, false]),
  ]
}

const uniq = <T,>(xs: T[]): T[] => [...new Set(xs)]
