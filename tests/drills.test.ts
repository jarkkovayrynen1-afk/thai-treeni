import { describe, expect, it } from 'vitest'
import { consonant, CONSONANTS } from '../src/data/consonants'
import { LESSONS } from '../src/data/lessons'
import { isCorrect, letterResults, makeQuestion, type Stats } from '../src/drills/questions'
import { pickWeighted, updateStat, weight } from '../src/engine/srs'
import { resolvePool } from '../src/progress'
import { hydrate, initialState } from '../src/storage/store'

/** Deterministic RNG so failures are reproducible. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32
    return seed / 2 ** 32
  }
}

const emptyStats = (): Stats => ({ class: {}, initial: {}, final: {}, sound: {} })

describe('lessons', () => {
  it('teach every consonant exactly once', () => {
    const all = LESSONS.flatMap((l) => l.letters)
    expect(all.length).toBe(44)
    expect(new Set(all)).toEqual(new Set(CONSONANTS.map((c) => c.char)))
  })

  it('keep each lesson within one class (and one low-class kind)', () => {
    for (const l of LESSONS) {
      for (const ch of l.letters) {
        expect([l.id, consonant(ch).cls, consonant(ch).lowKind]).toEqual([l.id, l.cls, l.lowKind])
      }
    }
  })

  it('put rare and obsolete letters only in optional lessons', () => {
    for (const l of LESSONS) {
      for (const ch of l.letters) expect([ch, consonant(ch).freq !== 'common']).toEqual([ch, !!l.optional])
    }
  })
})

describe('spaced repetition', () => {
  it('moves up a box on success and back to 0 on a miss', () => {
    let s = updateStat(undefined, true, 1)
    s = updateStat(s, true, 2)
    expect(s.box).toBe(2)
    s = updateStat(s, false, 3)
    expect(s).toMatchObject({ n: 3, ok: 2, box: 0, recent: '110' })
  })

  it('draws a missed letter far more often than a known one', () => {
    const rng = seeded(1)
    let known = updateStat(undefined, true, 0)
    for (let i = 0; i < 6; i++) known = updateStat(known, true, 0)
    const missed = updateStat(undefined, false, 0)
    const stats: Record<string, typeof known> = { ก: known, ข: missed }
    let missedCount = 0
    for (let i = 0; i < 2000; i++) if (pickWeighted(['ก', 'ข'], (x) => weight(stats[x]), [], rng) === 'ข') missedCount++
    expect(missedCount / 2000).toBeGreaterThan(0.85)
  })

  it('avoids recently shown items when it can', () => {
    const rng = seeded(2)
    for (let i = 0; i < 200; i++) expect(pickWeighted(['ก', 'จ', 'ด'], () => 1, ['ก', 'จ'], rng)).toBe('ด')
    expect(pickWeighted(['ก'], () => 1, ['ก'], rng)).toBe('ก')
  })
})

describe('questions', () => {
  const pool = CONSONANTS.map((c) => c.char)
  const rng = seeded(3)

  it('offer the right answer among 4 unique initial-sound options', () => {
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion('initial', { pool, stats: emptyStats(), recent: [], rng })
      if (q.kind !== 'initial') throw new Error()
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(consonant(q.letter).initial)
    }
  })

  it('only ask the final sound of letters that can end a syllable', () => {
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion('final', { pool, stats: emptyStats(), recent: [], rng })
      if (q.kind !== 'final') throw new Error()
      expect(consonant(q.letter).final).not.toBeNull()
    }
  })

  it('include every letter of the sound among the sound options', () => {
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion('sound', { pool, stats: emptyStats(), recent: [], rng })
      if (q.kind !== 'sound') throw new Error()
      expect(q.correct).toEqual(pool.filter((l) => consonant(l).initial === q.sound))
      for (const l of q.correct) expect(q.options).toContain(l)
      expect(q.options.length).toBeLessThanOrEqual(8)
      expect(isCorrect(q, q.correct)).toBe(true)
      expect(isCorrect(q, q.correct.slice(1))).toBe(q.correct.length === 0)
    }
  })

  it('score a sound answer per letter', () => {
    const q = { kind: 'sound' as const, sound: 'k', options: ['ข', 'ค', 'ก', 'ต'], correct: ['ข', 'ค'] }
    expect(letterResults(q, ['ข', 'ก'])).toEqual([
      ['ข', true],
      ['ค', false],
      ['ก', false],
    ])
  })

  it('work with a beginner pool of one lesson', () => {
    const small = resolvePool('lesson:mid-1', [])
    expect(small).toEqual(['ก', 'จ', 'ด', 'ต'])
    for (const drill of ['class', 'initial', 'final', 'sound'] as const) {
      for (let i = 0; i < 50; i++) makeQuestion(drill, { pool: small, stats: emptyStats(), recent: ['ก', 'จ'], rng })
    }
  })
})

describe('storage', () => {
  it('fills in missing fields from older saves', () => {
    const s = hydrate({ v: 1, lessonsDone: ['mid-1'], stats: { class: { ก: { n: 1, ok: 1, box: 1, last: 0, recent: '1' } } } })
    expect(s.lessonsDone).toEqual(['mid-1'])
    expect(s.stats.initial).toEqual({})
    expect(s.settings).toEqual(initialState().settings)
  })

  it('ignores garbage', () => {
    expect(hydrate('nope')).toEqual(initialState())
    expect(hydrate({ v: 99 })).toEqual(initialState())
  })
})
