import { describe, expect, it } from 'vitest'
import { VOWEL_LESSONS } from '../src/data/lessons'
import { SLOT, VOWEL_FORMS, VOWELS } from '../src/data/vowels'
import { WORDS } from '../src/data/words'
import { isCorrect, makeQuestion, type Stats } from '../src/drills/questions'
import { liveDeadReason } from '../src/engine/liveDead'
import { parseRom } from '../src/engine/paiboon'
import { analyzeSpelling } from '../src/engine/spelling'
import { resolvePool, wordPool } from '../src/progress'

const WORD = new Map(WORDS.map((w) => [w.thai, w]))
const TONE_MARKS = /[่-๋]/g

/** True if `needle`'s characters appear in `hay` in order (other characters may sit between). */
function isSubsequence(needle: string, hay: string) {
  let i = 0
  for (const ch of hay) if (ch === needle[i]) i++
  return i === needle.length
}

const SPECIAL_CHECK: Record<string, (thai: string) => boolean> = {
  am: (t) => t.includes('ำ'),
  'ai-malai': (t) => t.startsWith('ไ'),
  'ai-muan': (t) => t.startsWith('ใ'),
  ao: (t) => t.startsWith('เ') && t.replace(TONE_MARKS, '').endsWith('า'),
}
const SPECIAL_CODA: Record<string, string> = { am: 'm', 'ai-malai': 'y', 'ai-muan': 'y', ao: 'w' }

describe('vowel examples', () => {
  const cases = VOWEL_FORMS.flatMap((f) => f.examples.map((thai) => [f.id, thai, f] as const))

  it.each(cases)('%s: %s', (_, thai, form) => {
    const w = WORD.get(thai)
    expect(w, 'example must be in the checked word list').toBeDefined()
    const rom = parseRom(w!.rom)
    const v = form.vowel
    if (v.kind === 'special') {
      expect(SPECIAL_CHECK[v.id](thai), 'spelling').toBe(true)
      expect(rom.nucleus).toBe('a')
      expect(rom.coda).toBe(SPECIAL_CODA[v.id])
    } else {
      // Pronunciation: the romanized vowel is this vowel.
      expect(rom.nucleus, 'romanized vowel').toBe(v.rom)
      // Spelling: the form's signs appear in order; the invisible o means no signs at all.
      const signs = form.text.replaceAll(SLOT, '')
      if (signs) expect(isSubsequence(signs, thai.replace(TONE_MARKS, '')), `spelling contains ${form.text}`).toBe(true)
      else expect(/[ะ-๎เ-ไ]/.test(thai), 'no vowel signs').toBe(false)
    }
    // A form "with final" is only used before a final consonant, the base form of a
    // changing vowel only without one.
    if (form.withFinal) expect(analyzeSpelling(thai).final, 'has a final consonant').toBeDefined()
    else if (v.withFinal) expect(analyzeSpelling(thai).final, 'open syllable').toBeUndefined()
  })

  it('has examples for every common vowel', () => {
    const rare = new Set(['ə', 'ia', 'ʉa', 'ua', 'e+', 'ɛ+'])
    for (const f of VOWEL_FORMS) if (!rare.has(f.id) && !(f.id === 'e')) expect([f.id, f.examples.length > 0]).toEqual([f.id, true])
  })
})

describe('vowel forms and lessons', () => {
  it('have unique ids', () => expect(new Set(VOWEL_FORMS.map((f) => f.id)).size).toBe(VOWEL_FORMS.length))

  it('teach every vowel form exactly once', () => {
    const taught = VOWEL_LESSONS.flatMap((l) => l.forms)
    expect(taught.length).toBe(new Set(taught).size)
    expect(new Set(taught)).toEqual(new Set(VOWEL_FORMS.map((f) => f.id)))
  })

  it('keep short/long partners in the same lesson (rare short diphthongs aside)', () => {
    const optional = new Set(VOWEL_LESSONS.filter((l) => l.optional).flatMap((l) => l.forms))
    for (const l of VOWEL_LESSONS) {
      for (const id of l.forms) {
        const v = VOWELS.find((x) => x.id === id)
        if (v?.pair && !optional.has(v.pair) && !optional.has(id)) expect([id, l.forms.includes(v.pair)]).toEqual([id, true])
      }
    }
  })

  it('never drill the invisible o', () => {
    expect(VOWEL_FORMS.filter((f) => !f.drillable).map((f) => f.id)).toEqual(['o+'])
    expect(resolvePool('lesson:v-7', [], 'vowel')).not.toContain('o+')
  })
})

describe('live/dead explanations', () => {
  it.each(WORDS)('$thai → $live', (w) => {
    const r = liveDeadReason(w)
    expect(r.live).toBe(w.live)
  })

  it('treat the special vowels as live', () => {
    for (const t of ['ดำ', 'ใจ', 'ไป', 'เอา', 'เก่า']) expect(liveDeadReason(WORD.get(t)!).kind).toBe('special')
  })
})

describe('phase 2 questions', () => {
  const rng = (() => {
    let s = 7
    return () => (s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32
  })()
  const stats = (): Stats => ({ class: {}, initial: {}, final: {}, sound: {}, vowelSound: {}, vowelLength: {}, liveDead: {} })
  const forms = VOWEL_FORMS.filter((f) => f.drillable).map((f) => f.id)

  it('offer 4 unique vowel sounds including the answer and its length partner', () => {
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion('vowelSound', { pool: forms, stats: stats(), recent: [], rng })
      if (q.kind !== 'vowelSound') throw new Error()
      const v = VOWEL_FORMS.find((f) => f.id === q.form)!.vowel
      expect(new Set(q.options).size).toBe(4)
      expect(q.options.filter((o) => isCorrect(q, o))).toEqual([v.rom])
      if (v.pair) expect(q.options).toContain(VOWELS.find((x) => x.id === v.pair)!.rom)
    }
  })

  it('balance live and dead syllables', () => {
    const pool = WORDS.map((w) => w.thai)
    let dead = 0
    for (let i = 0; i < 1000; i++) {
      const q = makeQuestion('liveDead', { pool, stats: stats(), recent: [], rng })
      if (q.kind === 'liveDead' && WORD.get(q.word)!.live === 'dead') dead++
    }
    expect(dead / 1000).toBeGreaterThan(0.4)
    expect(dead / 1000).toBeLessThan(0.6)
  })

  it('use only readable words once enough letters are learned', () => {
    expect(wordPool([]).length).toBe(WORDS.length) // nothing readable yet → everything
    const known = new Set('กจดต')
    const early = wordPool(['mid-1'])
    expect(early.length).toBeGreaterThanOrEqual(20)
    for (const t of early) for (const ch of t) if (/[ก-ฮ]/.test(ch)) expect([t, known.has(ch)]).toEqual([t, true])
    const all = wordPool(['mid-1', 'mid-2', 'high-1', 'high-2', 'lowp-1', 'lowp-2', 'lows-1', 'lows-2'])
    expect(all.length).toBeLessThan(WORDS.length) // ยักษ์, กฎ … need rare letters
  })
})
