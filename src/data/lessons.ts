import type { ConsonantClass, LowKind } from './types'

export interface Lesson {
  id: string
  cls: ConsonantClass
  lowKind?: LowKind
  title: string
  letters: string[]
  /** Rare / obsolete letters: shown, but not needed to move on. */
  optional?: boolean
}

// Small groups so a beginner meets 3–5 new letters at a time.
// Order: mid → high → low paired (twins of the high letters) → low sonorant.
export const LESSONS: Lesson[] = [
  { id: 'mid-1', cls: 'mid', title: 'Keskiluokka 1', letters: ['ก', 'จ', 'ด', 'ต'] },
  { id: 'mid-2', cls: 'mid', title: 'Keskiluokka 2', letters: ['บ', 'ป', 'อ'] },
  { id: 'mid-rare', cls: 'mid', title: 'Keskiluokka: harvinaiset', letters: ['ฎ', 'ฏ'], optional: true },
  { id: 'high-1', cls: 'high', title: 'Korkea luokka 1', letters: ['ข', 'ถ', 'ผ', 'ฝ'] },
  { id: 'high-2', cls: 'high', title: 'Korkea luokka 2', letters: ['ส', 'ศ', 'ษ', 'ห', 'ฉ'] },
  { id: 'high-rare', cls: 'high', title: 'Korkea luokka: harvinaiset', letters: ['ฐ', 'ฃ'], optional: true },
  { id: 'lowp-1', cls: 'low', lowKind: 'paired', title: 'Matala, parit 1', letters: ['ค', 'ท', 'พ', 'ฟ'] },
  { id: 'lowp-2', cls: 'low', lowKind: 'paired', title: 'Matala, parit 2', letters: ['ช', 'ซ', 'ฮ', 'ธ', 'ภ'] },
  { id: 'lowp-rare', cls: 'low', lowKind: 'paired', title: 'Matala, parit: harvinaiset', letters: ['ฆ', 'ฑ', 'ฒ', 'ฌ', 'ฅ'], optional: true },
  { id: 'lows-1', cls: 'low', lowKind: 'sonorant', title: 'Matala, yksinäiset 1', letters: ['ง', 'น', 'ม', 'ย'] },
  { id: 'lows-2', cls: 'low', lowKind: 'sonorant', title: 'Matala, yksinäiset 2', letters: ['ร', 'ล', 'ว', 'ญ', 'ณ'] },
  { id: 'lows-rare', cls: 'low', lowKind: 'sonorant', title: 'Matala, yksinäiset: harvinainen', letters: ['ฬ'], optional: true },
]

export const LESSON_BY_ID: ReadonlyMap<string, Lesson> = new Map(LESSONS.map((l) => [l.id, l]))

export const MNEMONIC = {
  mid: { thai: 'ไก่ จิก เด็ก ตาย บน ปาก โอ่ง', fi: 'Kana nokkii lasta, joka kuolee saviruukun suulle.', letters: 'กจดตบปอ' },
  high: { thai: 'ผี ฝาก ถุง ข้าว สาร ให้ ฉัน', fi: 'Aave antaa minulle säilöön pussillisen riisiä.', letters: 'ผฝถขสหฉ' },
} as const

export interface ClassIntro {
  heading: string
  paragraphs: string[]
  /** Closing line followed by the class's coloured tag. */
  classLine?: string
}

/** Shown before the first lesson of each group. */
export const INTROS: Record<string, ClassIntro> = {
  'mid-1': {
    heading: 'Keskiluokka · อักษรกลาง',
    paragraphs: [
      'Thain 44 konsonanttia jakautuvat kolmeen luokkaan. Luokka ratkaisee yhdessä sävymerkin ja tavun tyypin kanssa, millä sävyllä tavu lausutaan.',
      'Keskiluokassa on vain 9 kirjainta, joten se opetellaan ensin. Muistisäännön jokainen sana alkaa keskiluokan kirjaimella.',
    ],
    classLine: 'Keskiluokka näkyy sovelluksessa aina tällä värillä ja merkillä:',
  },
  'high-1': {
    heading: 'Korkea luokka · อักษรสูง',
    paragraphs: [
      'Korkeassa luokassa on 11 kirjainta. Muistisäännön sanat alkavat niistä seitsemällä: ผ ฝ ถ ข ส ห ฉ.',
      'Loput neljä ovat saman äänteen kaksoiskappaleita: ศ ษ (kuin ส), ฐ (kuin ถ) ja vanhentunut ฃ (kuin ข).',
    ],
    classLine: 'Korkea luokka näkyy aina tällä värillä ja merkillä:',
  },
  'lowp-1': {
    heading: 'Matala luokka · อักษรต่ำ',
    paragraphs: [
      'Kaikki loput 24 kirjainta ovat matalaa luokkaa. Tälle luokalle ei tarvita muistisääntöä: jos kirjain ei ole keski- eikä korkeaa luokkaa, se on matala.',
      'Parilliset (อักษรคู่, 14 kpl) ovat korkean luokan kaksosia: sama äänne, eri luokka. ข ↔ ค, ถ ↔ ท, ผ ↔ พ, ฝ ↔ ฟ, ส ↔ ซ, ห ↔ ฮ, ฉ ↔ ช.',
    ],
    classLine: 'Matala luokka näkyy aina tällä värillä ja merkillä:',
  },
  'lows-1': {
    heading: 'Matala luokka: yksinäiset · อักษรเดี่ยว',
    paragraphs: [
      'Yksinäisillä (10 kpl: ง ญ ณ น ม ย ร ล ว ฬ) ei ole korkean luokan kaksosta.',
      'Siksi kahdeksan niistä (ง ญ น ม ย ร ล ว) voi saada eteensä äänettömän ห:n, joka ”lainaa” tavulle korkean luokan: หมา luetaan mǎa. Tätä kutsutaan nimellä ห นำ, ja se tulee vastaan sävyharjoituksissa.',
    ],
  },
}

/** Finnish pronunciation hints for Paiboon initial sounds. */
export const SOUND_HINT: Record<string, string> = {
  g: 'kuin suomen k, ilman henkäystä',
  k: 'k + henkäys (kh)',
  ng: 'kuin sanassa kenkä – myös sanan alussa',
  j: 'kuin tj, ilman henkäystä',
  ch: 'tš + henkäys',
  s: 'kuin suomen s',
  y: 'kuin suomen j',
  d: 'kuin suomen d',
  dt: 'kuin suomen t, ilman henkäystä',
  t: 't + henkäys (th)',
  n: 'kuin suomen n',
  b: 'kuin suomen b',
  bp: 'kuin suomen p, ilman henkäystä',
  p: 'p + henkäys (ph)',
  f: 'kuin suomen f',
  m: 'kuin suomen m',
  r: 'täryttävä r (puhekielessä usein l)',
  l: 'kuin suomen l',
  w: 'kuin englannin w',
  h: 'kuin suomen h',
  '': 'äänetön – vokaali alkaa suoraan',
}

export const FINAL_HINT: Record<string, string> = {
  k: 'katkeava k, ei henkäystä',
  t: 'katkeava t, ei henkäystä',
  p: 'katkeava p, ei henkäystä',
  ng: 'ng',
  n: 'kuin suomen n',
  m: 'kuin suomen m',
  y: 'i-liuku: ai, ɔɔi, ui',
  w: 'o/u-liuku: ao, ɛɛo, iu',
}
