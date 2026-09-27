import { describe, expect, it } from 'vitest'
import { consonant, CONSONANTS } from '../src/data/consonants'
import { VOWELS } from '../src/data/vowels'
import { WORDS } from '../src/data/words'
import { parseRom } from '../src/engine/paiboon'
import { analyzeSpelling, toneFromSpelling } from '../src/engine/spelling'
import { computeTone } from '../src/engine/tone'

const chars = (s: string) => [...s].sort().join(' ')
const pick = (pred: (c: (typeof CONSONANTS)[number]) => boolean) => chars(CONSONANTS.filter(pred).map((c) => c.char).join(''))

describe('consonant table', () => {
  it('has 44 unique consonants', () => {
    expect(CONSONANTS).toHaveLength(44)
    expect(new Set(CONSONANTS.map((c) => c.char)).size).toBe(44)
  })

  it('has the right class members', () => {
    expect(pick((c) => c.cls === 'mid')).toBe(chars('กจฎฏดตบปอ'))
    expect(pick((c) => c.cls === 'high')).toBe(chars('ขฃฉฐถผฝศษสห'))
    expect(pick((c) => c.lowKind === 'sonorant')).toBe(chars('งญณนมยรลวฬ'))
    expect(pick((c) => c.lowKind === 'paired')).toBe(chars('คฅฆชซฌฑฒทธพฟภฮ'))
    expect(CONSONANTS.every((c) => (c.cls === 'low') === (c.lowKind !== undefined))).toBe(true)
  })

  it('pairs every paired low consonant with a high one of the same sound, and no sonorant', () => {
    const highSounds = new Set(CONSONANTS.filter((c) => c.cls === 'high').map((c) => c.initial))
    for (const c of CONSONANTS.filter((c) => c.cls === 'low')) {
      expect([c.char, highSounds.has(c.initial)]).toEqual([c.char, c.lowKind === 'paired'])
    }
  })

  it('marks exactly the nine non-final letters as unable to end a syllable', () => {
    expect(pick((c) => c.final === null)).toBe(chars('ฃฅฉฌผฝหอฮ'))
  })

  it('marks ฃ ฅ obsolete', () => expect(pick((c) => c.freq === 'obsolete')).toBe(chars('ฃฅ')))

  it('agrees with the mnemonics', () => {
    // ไก่ จิก เด็ก ตาย บน ปาก โอ่ง / ผี ฝาก ถุง ข้าว สาร ให้ ฉัน
    for (const w of ['ไก่', 'จิก', 'เด็ก', 'ตาย', 'บน', 'ปาก', 'โอ่ง']) expect(consonant(analyzeSpelling(w).initial).cls).toBe('mid')
    for (const w of ['ผี', 'ฝาก', 'ถุง', 'ข้าว', 'สาร', 'ให้', 'ฉัน']) expect(consonant(analyzeSpelling(w).initial).cls).toBe('high')
  })

  it.each(CONSONANTS.filter((c) => c.freq !== 'obsolete'))('$char $name contains its own letter', (c) => {
    expect(c.name).toContain(c.char)
  })

  it.each(CONSONANTS.filter((c) => !c.nameRom.includes('-')))('$char $name: name romanization tone matches spelling', (c) => {
    expect(toneFromSpelling(c.name)).toBe(parseRom(c.nameRom).tone)
  })
})

// Silent-ร clusters: the ร is written but not pronounced, and ทร reads as s.
const SILENT_R_ONSET: Record<string, string> = { ท: 's', ส: 's', ศ: 's', จ: 'j' }

describe('word list', () => {
  it('has unique entries', () => expect(new Set(WORDS.map((w) => w.thai)).size).toBe(WORDS.length))

  it.each(WORDS)('$thai $rom', (w) => {
    const sp = analyzeSpelling(w.thai)
    const rom = parseRom(w.rom)

    // Spelling vs stored fields
    expect(sp.mark, 'tone mark').toBe(w.mark)
    expect(sp.leader, 'leader').toBe(w.leader)
    expect(sp.cls, 'class').toBe(w.cls)
    expect(sp.live, 'live/dead from spelling').toBe(w.live)
    if (sp.len) expect(sp.len, 'length from spelling').toBe(w.len)

    // Romanization vs spelling and stored fields
    expect(rom.coda, 'final sound: romanization vs spelling').toBe(sp.coda)
    expect(rom.live, 'live/dead from romanization').toBe(w.live)
    expect(rom.len, 'length from romanization').toBe(w.len)
    expect(rom.tone, 'tone diacritic').toBe(w.tone)
    const initialSound = consonant(sp.initial).initial
    const expectedOnset = !sp.cluster
      ? initialSound
      : sp.cluster === 'ร' && sp.initial in SILENT_R_ONSET
        ? SILENT_R_ONSET[sp.initial]
        : initialSound + consonant(sp.cluster).initial
    expect(rom.onset, 'initial sound').toBe(expectedOnset)

    // The engine must reproduce the stored tone
    expect(computeTone(w), 'engine').toBe(w.tone)
  })
})

describe('vowel table', () => {
  it('pairs every short vowel with a long one of the same quality', () => {
    const byId = new Map(VOWELS.map((v) => [v.id, v]))
    for (const v of VOWELS.filter((v) => v.pair)) {
      const p = byId.get(v.pair!)!
      expect(p.pair).toBe(v.id)
      expect(p.len).not.toBe(v.len)
      const [short, long] = v.len === 'short' ? [v, p] : [p, v]
      expect(parseRom(short.rom).len).toBe('short')
      expect(parseRom(long.rom).len).toBe('long')
    }
  })
})
