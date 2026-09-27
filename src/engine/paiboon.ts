import type { FinalSound, Liveness, Tone, VowelLength } from '../data/types'

// Parses a one-syllable Paiboon romanization such as "kâao", "bpə̀ət", "sǔuai".
// Used by tests as an independent second opinion: the romanization records how the
// word is actually pronounced, the spelling analyzer records how it is written.

const TONE_DIACRITICS: Record<string, Tone> = {
  '̀': 'low', // grave
  '̂': 'falling', // circumflex
  '́': 'high', // acute
  '̌': 'rising', // caron
}

const VOWEL_LETTERS = 'aeiouɛɔəʉ'
// Longest first so "iia" wins over "ii" and "ia".
const NUCLEI = ['iia', 'ʉʉa', 'uua', 'aa', 'ii', 'ʉʉ', 'uu', 'ee', 'ɛɛ', 'oo', 'ɔɔ', 'əə', 'ia', 'ʉa', 'ua', 'a', 'i', 'ʉ', 'u', 'e', 'ɛ', 'o', 'ɔ', 'ə']
const CODAS: Record<string, FinalSound | null> = { '': null, k: 'k', t: 't', p: 'p', ng: 'ng', n: 'n', m: 'm', i: 'y', o: 'w', u: 'w' }

export interface RomAnalysis {
  onset: string
  nucleus: string
  coda: FinalSound | null
  len: VowelLength
  live: Liveness
  tone: Tone
}

export function parseRom(rom: string): RomAnalysis {
  const nfd = rom.normalize('NFD')
  const diacritics = [...nfd].filter((ch) => ch in TONE_DIACRITICS)
  if (diacritics.length > 1) throw new Error(`${rom}: more than one tone diacritic`)
  const tone = diacritics.length ? TONE_DIACRITICS[diacritics[0]] : 'mid'
  const bare = [...nfd].filter((ch) => !(ch in TONE_DIACRITICS)).join('')
  if (/[^a-zɛɔəʉ]/.test(bare)) throw new Error(`${rom}: unexpected character`)

  const v = [...bare].findIndex((ch) => VOWEL_LETTERS.includes(ch))
  if (v < 0) throw new Error(`${rom}: no vowel`)
  const onset = bare.slice(0, v)
  const tail = bare.slice(v)
  const nucleus = NUCLEI.find((n) => tail.startsWith(n))
  if (!nucleus) throw new Error(`${rom}: unknown vowel`)
  const codaText = tail.slice(nucleus.length)
  if (!(codaText in CODAS)) throw new Error(`${rom}: unknown ending "${codaText}"`)
  // Paiboon writes the ว glide as -u only after i (หิว hǐu), as -o everywhere else (ยาว yaao).
  const wGlide = nucleus === 'i' ? 'u' : 'o'
  if (CODAS[codaText] === 'w' && codaText !== wGlide) throw new Error(`${rom}: write the w-glide as -${wGlide}`)
  const coda = CODAS[codaText]
  const len: VowelLength = nucleus.length >= 2 && (nucleus[0] === nucleus[1] || nucleus.length === 3) ? 'long' : 'short'
  const live: Liveness = coda === 'k' || coda === 't' || coda === 'p' || (coda === null && len === 'short') ? 'dead' : 'live'
  return { onset, nucleus, coda, len, live, tone }
}
