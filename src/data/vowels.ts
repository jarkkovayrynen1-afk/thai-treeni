import type { VowelLength } from './types'

/** Placeholder for the consonant position in vowel forms. */
export const SLOT = '–'

export interface Vowel {
  id: string
  /** Form with SLOT where the consonant goes, e.g. "เ–ีย". */
  form: string
  /** Form when a final consonant follows, if it changes (–ะ → –ั–). */
  withFinal?: string
  /** Paiboon sound. */
  rom: string
  len: VowelLength
  /** id of the short/long partner. */
  pair?: string
  kind: 'basic' | 'diphthong' | 'special'
  note?: string
}

const pair = (short: Omit<Vowel, 'len' | 'pair'>, long: Omit<Vowel, 'len' | 'pair'>): Vowel[] => [
  { ...short, len: 'short', pair: long.id },
  { ...long, len: 'long', pair: short.id },
]

export const VOWELS: Vowel[] = [
  ...pair({ id: 'a', form: '–ะ', withFinal: '–ั–', rom: 'a', kind: 'basic' }, { id: 'aa', form: '–า', rom: 'aa', kind: 'basic' }),
  ...pair({ id: 'i', form: '–ิ', rom: 'i', kind: 'basic' }, { id: 'ii', form: '–ี', rom: 'ii', kind: 'basic' }),
  ...pair({ id: 'ʉ', form: '–ึ', rom: 'ʉ', kind: 'basic' }, { id: 'ʉʉ', form: '–ือ', withFinal: '–ื–', rom: 'ʉʉ', kind: 'basic' }),
  ...pair({ id: 'u', form: '–ุ', rom: 'u', kind: 'basic' }, { id: 'uu', form: '–ู', rom: 'uu', kind: 'basic' }),
  ...pair({ id: 'e', form: 'เ–ะ', withFinal: 'เ–็–', rom: 'e', kind: 'basic' }, { id: 'ee', form: 'เ–', rom: 'ee', kind: 'basic' }),
  ...pair({ id: 'ɛ', form: 'แ–ะ', withFinal: 'แ–็–', rom: 'ɛ', kind: 'basic' }, { id: 'ɛɛ', form: 'แ–', rom: 'ɛɛ', kind: 'basic' }),
  ...pair(
    { id: 'o', form: 'โ–ะ', withFinal: '––', rom: 'o', kind: 'basic', note: 'loppukonsonantin kanssa vokaali on näkymätön: คน kon' },
    { id: 'oo', form: 'โ–', rom: 'oo', kind: 'basic' },
  ),
  ...pair({ id: 'ɔ', form: 'เ–าะ', rom: 'ɔ', kind: 'basic' }, { id: 'ɔɔ', form: '–อ', withFinal: '–อ–', rom: 'ɔɔ', kind: 'basic' }),
  ...pair({ id: 'ə', form: 'เ–อะ', rom: 'ə', kind: 'basic' }, { id: 'əə', form: 'เ–อ', withFinal: 'เ–ิ–', rom: 'əə', kind: 'basic' }),
  ...pair({ id: 'ia', form: 'เ–ียะ', rom: 'ia', kind: 'diphthong' }, { id: 'iia', form: 'เ–ีย', rom: 'iia', kind: 'diphthong' }),
  ...pair({ id: 'ʉa', form: 'เ–ือะ', rom: 'ʉa', kind: 'diphthong' }, { id: 'ʉʉa', form: 'เ–ือ', rom: 'ʉʉa', kind: 'diphthong' }),
  ...pair({ id: 'ua', form: '–ัวะ', rom: 'ua', kind: 'diphthong' }, { id: 'uua', form: '–ัว', withFinal: '–ว–', rom: 'uua', kind: 'diphthong' }),
  { id: 'am', form: '–ำ', rom: 'am', len: 'short', kind: 'special', note: 'päättyy m-ääneen, siksi elävä' },
  { id: 'ai-muan', form: 'ใ–', rom: 'ai', len: 'short', kind: 'special', note: 'ไม้ม้วน – vain noin 20 sanassa' },
  { id: 'ai-malai', form: 'ไ–', rom: 'ai', len: 'short', kind: 'special', note: 'ไม้มลาย – yleisempi ai' },
  { id: 'ao', form: 'เ–า', rom: 'ao', len: 'short', kind: 'special', note: 'päättyy w-liukuun, siksi elävä' },
]
