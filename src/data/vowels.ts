import type { VowelLength } from './types'

/**
 * Placeholder for the consonant position in vowel forms. The dotted circle is the
 * Unicode convention: fonts position Thai marks on it correctly, whereas a dash comes
 * from another font and leaves the marks misplaced.
 */
export const SLOT = '◌'

export interface Vowel {
  id: string
  /** Form with SLOT where the consonant goes, e.g. "เ◌ีย". */
  form: string
  /** Form when a final consonant follows, if it changes (◌ะ → ◌ั◌). */
  withFinal?: string
  /** Paiboon sound. */
  rom: string
  len: VowelLength
  /** id of the short/long partner. */
  pair?: string
  kind: 'basic' | 'diphthong' | 'special'
  note?: string
  /** Words from the word list written with `form`. */
  examples: string[]
  /** Words from the word list written with `withFinal`. */
  finalExamples?: string[]
}

type Spec = Omit<Vowel, 'len' | 'pair'>

const pair = (short: Spec, long: Spec): Vowel[] => [
  { ...short, len: 'short', pair: long.id },
  { ...long, len: 'long', pair: short.id },
]

export const VOWELS: Vowel[] = [
  ...pair(
    { id: 'a', form: '◌ะ', withFinal: '◌ั◌', rom: 'a', kind: 'basic', examples: ['จะ', 'นะ', 'คะ'], finalExamples: ['จับ', 'รัก', 'วัน'] },
    { id: 'aa', form: '◌า', rom: 'aa', kind: 'basic', examples: ['ตา', 'มา', 'จาน'] },
  ),
  ...pair({ id: 'i', form: '◌ิ', rom: 'i', kind: 'basic', examples: ['กิน', 'คิด', 'ผิด'] }, { id: 'ii', form: '◌ี', rom: 'ii', kind: 'basic', examples: ['ดี', 'ปี', 'มีด'] }),
  ...pair(
    { id: 'ʉ', form: '◌ึ', rom: 'ʉ', kind: 'basic', note: 'kuin i, mutta huulet levällään ja kieli taaempana', examples: ['ขึ้น', 'หนึ่ง'] },
    { id: 'ʉʉ', form: '◌ือ', withFinal: '◌ื◌', rom: 'ʉʉ', kind: 'basic', examples: ['มือ', 'ชื่อ', 'ซื้อ'], finalExamples: ['ดื่ม', 'พืช'] },
  ),
  ...pair({ id: 'u', form: '◌ุ', rom: 'u', kind: 'basic', examples: ['ทุก', 'สุข', 'กุ้ง'] }, { id: 'uu', form: '◌ู', rom: 'uu', kind: 'basic', examples: ['ดู', 'ครู', 'ลูก'] }),
  ...pair(
    { id: 'e', form: 'เ◌ะ', withFinal: 'เ◌็◌', rom: 'e', kind: 'basic', examples: [], finalExamples: ['เด็ก', 'เจ็ด', 'เล็ก'] },
    { id: 'ee', form: 'เ◌', rom: 'ee', kind: 'basic', examples: ['เลข', 'เพศ', 'เทพ'] },
  ),
  ...pair(
    { id: 'ɛ', form: 'แ◌ะ', withFinal: 'แ◌็◌', rom: 'ɛ', kind: 'basic', note: 'kuin suomen ä', examples: ['แพะ'] },
    { id: 'ɛɛ', form: 'แ◌', rom: 'ɛɛ', kind: 'basic', note: 'kuin suomen ää', examples: ['แม่', 'แมว', 'แปด'] },
  ),
  ...pair(
    { id: 'o', form: 'โ◌ะ', withFinal: '◌◌', rom: 'o', kind: 'basic', note: 'loppukonsonantin kanssa vokaalimerkki jää pois kokonaan', examples: ['โต๊ะ'], finalExamples: ['คน', 'นก', 'รถ'] },
    { id: 'oo', form: 'โ◌', rom: 'oo', kind: 'basic', examples: ['โชค', 'โรค', 'โลก'] },
  ),
  ...pair(
    { id: 'ɔ', form: 'เ◌าะ', rom: 'ɔ', kind: 'basic', note: 'avoin o, kuin englannin ”law” lyhyesti', examples: ['เกาะ', 'เพราะ', 'เงาะ'] },
    { id: 'ɔɔ', form: '◌อ', withFinal: '◌อ◌', rom: 'ɔɔ', kind: 'basic', note: 'avoin pitkä o', examples: ['ขอ', 'พ่อ', 'หมอ'], finalExamples: ['นอน', 'บอก', 'ชอบ'] },
  ),
  ...pair(
    { id: 'ə', form: 'เ◌อะ', rom: 'ə', kind: 'basic', note: 'kuin ö, mutta huulet levällään', examples: [] },
    { id: 'əə', form: 'เ◌อ', withFinal: 'เ◌ิ◌', rom: 'əə', kind: 'basic', note: 'ย:n edellä muoto on เ◌ย (เลย)', examples: ['เธอ'], finalExamples: ['เดิน', 'เปิด', 'เชิญ'] },
  ),
  ...pair({ id: 'ia', form: 'เ◌ียะ', rom: 'ia', kind: 'diphthong', examples: [] }, { id: 'iia', form: 'เ◌ีย', rom: 'iia', kind: 'diphthong', examples: ['เลี้ยง', 'เที่ยว', 'เดี๋ยว'] }),
  ...pair({ id: 'ʉa', form: 'เ◌ือะ', rom: 'ʉa', kind: 'diphthong', examples: [] }, { id: 'ʉʉa', form: 'เ◌ือ', rom: 'ʉʉa', kind: 'diphthong', examples: ['เสือ', 'เมือง', 'เลือด'] }),
  ...pair(
    { id: 'ua', form: '◌ัวะ', rom: 'ua', kind: 'diphthong', examples: [] },
    { id: 'uua', form: '◌ัว', withFinal: '◌ว◌', rom: 'uua', kind: 'diphthong', examples: ['ตัว', 'หัว', 'ถั่ว'], finalExamples: ['สวย', 'ด้วย', 'อ้วน'] },
  ),
  { id: 'am', form: '◌ำ', rom: 'am', len: 'short', kind: 'special', note: 'päättyy m-ääneen, siksi tavu on aina elävä', examples: ['ดำ', 'ทำ', 'คำ'] },
  { id: 'ai-malai', form: 'ไ◌', rom: 'ai', len: 'short', kind: 'special', note: 'ไม้มลาย – tavallisin tapa kirjoittaa ai', examples: ['ไป', 'ไฟ', 'ไก่'] },
  { id: 'ai-muan', form: 'ใ◌', rom: 'ai', len: 'short', kind: 'special', note: 'ไม้ม้วน – sama äänne, vain noin 20 sanassa', examples: ['ใจ', 'ใน', 'ใคร'] },
  { id: 'ao', form: 'เ◌า', rom: 'ao', len: 'short', kind: 'special', note: 'päättyy o-liukuun, siksi tavu on aina elävä', examples: ['เอา', 'เรา', 'เก่า'] },
]

export const VOWEL_BY_ID: ReadonlyMap<string, Vowel> = new Map(VOWELS.map((v) => [v.id, v]))

/** One written shape of a vowel: its base form, or its form before a final consonant. */
export interface VowelForm {
  /** Vowel id, plus "+" for the before-a-final form. */
  id: string
  vowel: Vowel
  text: string
  withFinal: boolean
  examples: string[]
  /** The invisible o (คน) has nothing to show, so it is taught but not drilled. */
  drillable: boolean
}

export const VOWEL_FORMS: VowelForm[] = VOWELS.flatMap((v) => [
  { id: v.id, vowel: v, text: v.form, withFinal: false, examples: v.examples, drillable: true },
  ...(v.withFinal
    ? [{ id: `${v.id}+`, vowel: v, text: v.withFinal, withFinal: true, examples: v.finalExamples ?? [], drillable: v.withFinal !== SLOT + SLOT }]
    : []),
])

export const FORM_BY_ID: ReadonlyMap<string, VowelForm> = new Map(VOWEL_FORMS.map((f) => [f.id, f]))

export function vowelForm(id: string): VowelForm {
  const f = FORM_BY_ID.get(id)
  if (!f) throw new Error(`Unknown vowel form: ${id}`)
  return f
}

/** Something speech synthesis can read: the base form written on the silent อ. */
export const speakableVowel = (v: Vowel): string => v.form.replaceAll(SLOT, 'อ')
