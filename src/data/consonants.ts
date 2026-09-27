import type { Consonant, ConsonantClass, FinalSound } from './types'

// All 44 consonants in dictionary order.
// Class counts: mid 9, high 11, low 24 (14 paired + 10 sonorant).
// Non-finals (ไม่ใช้เป็นตัวสะกด): ฃ ฅ ฉ ฌ ผ ฝ ห อ ฮ.
export const CONSONANTS: Consonant[] = [
  { char: 'ก', name: 'ไก่', nameRom: 'gài', nameFi: 'kana', cls: 'mid', initial: 'g', final: 'k', freq: 'common' },
  { char: 'ข', name: 'ไข่', nameRom: 'kài', nameFi: 'muna', cls: 'high', initial: 'k', final: 'k', freq: 'common' },
  { char: 'ฃ', name: 'ขวด', nameRom: 'kùuat', nameFi: 'pullo', cls: 'high', initial: 'k', final: null, freq: 'obsolete' },
  { char: 'ค', name: 'ควาย', nameRom: 'kwaai', nameFi: 'vesipuhveli', cls: 'low', lowKind: 'paired', initial: 'k', final: 'k', freq: 'common' },
  { char: 'ฅ', name: 'คน', nameRom: 'kon', nameFi: 'ihminen', cls: 'low', lowKind: 'paired', initial: 'k', final: null, freq: 'obsolete' },
  { char: 'ฆ', name: 'ระฆัง', nameRom: 'rá-kang', nameFi: 'temppelikello', cls: 'low', lowKind: 'paired', initial: 'k', final: 'k', freq: 'rare' },
  { char: 'ง', name: 'งู', nameRom: 'nguu', nameFi: 'käärme', cls: 'low', lowKind: 'sonorant', initial: 'ng', final: 'ng', freq: 'common' },
  { char: 'จ', name: 'จาน', nameRom: 'jaan', nameFi: 'lautanen', cls: 'mid', initial: 'j', final: 't', freq: 'common' },
  { char: 'ฉ', name: 'ฉิ่ง', nameRom: 'chìng', nameFi: 'pienet symbaalit', cls: 'high', initial: 'ch', final: null, freq: 'common' },
  { char: 'ช', name: 'ช้าง', nameRom: 'cháang', nameFi: 'norsu', cls: 'low', lowKind: 'paired', initial: 'ch', final: 't', freq: 'common' },
  { char: 'ซ', name: 'โซ่', nameRom: 'sôo', nameFi: 'ketju', cls: 'low', lowKind: 'paired', initial: 's', final: 't', freq: 'common' },
  { char: 'ฌ', name: 'เฌอ', nameRom: 'chəə', nameFi: 'puu', cls: 'low', lowKind: 'paired', initial: 'ch', final: null, freq: 'rare' },
  { char: 'ญ', name: 'หญิง', nameRom: 'yǐng', nameFi: 'nainen', cls: 'low', lowKind: 'sonorant', initial: 'y', final: 'n', freq: 'common' },
  { char: 'ฎ', name: 'ชฎา', nameRom: 'chá-daa', nameFi: 'tanssijan kruunu', cls: 'mid', initial: 'd', final: 't', freq: 'rare' },
  { char: 'ฏ', name: 'ปฏัก', nameRom: 'bpà-dtàk', nameFi: 'keihäs', cls: 'mid', initial: 'dt', final: 't', freq: 'rare' },
  { char: 'ฐ', name: 'ฐาน', nameRom: 'tǎan', nameFi: 'jalusta', cls: 'high', initial: 't', final: 't', freq: 'rare' },
  { char: 'ฑ', name: 'มณโฑ', nameRom: 'mon-too', nameFi: 'Montho (tarinan hahmo)', cls: 'low', lowKind: 'paired', initial: 't', initialNote: 'joskus d, esim. บัณฑิต ban-dìt', final: 't', freq: 'rare' },
  { char: 'ฒ', name: 'ผู้เฒ่า', nameRom: 'pûu-tâo', nameFi: 'vanhus', cls: 'low', lowKind: 'paired', initial: 't', final: 't', freq: 'rare' },
  { char: 'ณ', name: 'เณร', nameRom: 'neen', nameFi: 'noviisimunkki', cls: 'low', lowKind: 'sonorant', initial: 'n', final: 'n', freq: 'common' },
  { char: 'ด', name: 'เด็ก', nameRom: 'dèk', nameFi: 'lapsi', cls: 'mid', initial: 'd', final: 't', freq: 'common' },
  { char: 'ต', name: 'เต่า', nameRom: 'dtào', nameFi: 'kilpikonna', cls: 'mid', initial: 'dt', final: 't', freq: 'common' },
  { char: 'ถ', name: 'ถุง', nameRom: 'tǔng', nameFi: 'pussi', cls: 'high', initial: 't', final: 't', freq: 'common' },
  { char: 'ท', name: 'ทหาร', nameRom: 'tá-hǎan', nameFi: 'sotilas', cls: 'low', lowKind: 'paired', initial: 't', final: 't', freq: 'common' },
  { char: 'ธ', name: 'ธง', nameRom: 'tong', nameFi: 'lippu', cls: 'low', lowKind: 'paired', initial: 't', final: 't', freq: 'common' },
  { char: 'น', name: 'หนู', nameRom: 'nǔu', nameFi: 'hiiri', cls: 'low', lowKind: 'sonorant', initial: 'n', final: 'n', freq: 'common' },
  { char: 'บ', name: 'ใบไม้', nameRom: 'bai-máai', nameFi: 'lehti', cls: 'mid', initial: 'b', final: 'p', freq: 'common' },
  { char: 'ป', name: 'ปลา', nameRom: 'bplaa', nameFi: 'kala', cls: 'mid', initial: 'bp', final: 'p', freq: 'common' },
  { char: 'ผ', name: 'ผึ้ง', nameRom: 'pʉ̂ng', nameFi: 'mehiläinen', cls: 'high', initial: 'p', final: null, freq: 'common' },
  { char: 'ฝ', name: 'ฝา', nameRom: 'fǎa', nameFi: 'kansi', cls: 'high', initial: 'f', final: null, freq: 'common' },
  { char: 'พ', name: 'พาน', nameRom: 'paan', nameFi: 'jalallinen tarjotin', cls: 'low', lowKind: 'paired', initial: 'p', final: 'p', freq: 'common' },
  { char: 'ฟ', name: 'ฟัน', nameRom: 'fan', nameFi: 'hammas', cls: 'low', lowKind: 'paired', initial: 'f', final: 'p', freq: 'common' },
  { char: 'ภ', name: 'สำเภา', nameRom: 'sǎm-pao', nameFi: 'kiinalainen purjelaiva', cls: 'low', lowKind: 'paired', initial: 'p', final: 'p', freq: 'common' },
  { char: 'ม', name: 'ม้า', nameRom: 'máa', nameFi: 'hevonen', cls: 'low', lowKind: 'sonorant', initial: 'm', final: 'm', freq: 'common' },
  { char: 'ย', name: 'ยักษ์', nameRom: 'yák', nameFi: 'jättiläinen', cls: 'low', lowKind: 'sonorant', initial: 'y', final: 'y', freq: 'common' },
  { char: 'ร', name: 'เรือ', nameRom: 'rʉʉa', nameFi: 'vene', cls: 'low', lowKind: 'sonorant', initial: 'r', final: 'n', freq: 'common' },
  { char: 'ล', name: 'ลิง', nameRom: 'ling', nameFi: 'apina', cls: 'low', lowKind: 'sonorant', initial: 'l', final: 'n', freq: 'common' },
  { char: 'ว', name: 'แหวน', nameRom: 'wɛ̌ɛn', nameFi: 'sormus', cls: 'low', lowKind: 'sonorant', initial: 'w', final: 'w', freq: 'common' },
  { char: 'ศ', name: 'ศาลา', nameRom: 'sǎa-laa', nameFi: 'paviljonki', cls: 'high', initial: 's', final: 't', freq: 'common' },
  { char: 'ษ', name: 'ฤๅษี', nameRom: 'rʉʉ-sǐi', nameFi: 'erakko', cls: 'high', initial: 's', final: 't', freq: 'common' },
  { char: 'ส', name: 'เสือ', nameRom: 'sʉ̌ʉa', nameFi: 'tiikeri', cls: 'high', initial: 's', final: 't', freq: 'common' },
  { char: 'ห', name: 'หีบ', nameRom: 'hìip', nameFi: 'arkku', cls: 'high', initial: 'h', final: null, freq: 'common' },
  { char: 'ฬ', name: 'จุฬา', nameRom: 'jù-laa', nameFi: 'tähtileija', cls: 'low', lowKind: 'sonorant', initial: 'l', final: 'n', freq: 'rare' },
  { char: 'อ', name: 'อ่าง', nameRom: 'àang', nameFi: 'vati, allas', cls: 'mid', initial: '', initialNote: 'äänetön – kantaa vokaalia', final: null, freq: 'common' },
  { char: 'ฮ', name: 'นกฮูก', nameRom: 'nók-hûuk', nameFi: 'pöllö', cls: 'low', lowKind: 'paired', initial: 'h', final: null, freq: 'common' },
]

export const CONSONANT_BY_CHAR: ReadonlyMap<string, Consonant> = new Map(CONSONANTS.map((c) => [c.char, c]))

export function consonant(char: string): Consonant {
  const c = CONSONANT_BY_CHAR.get(char)
  if (!c) throw new Error(`Not a consonant: ${char}`)
  return c
}

export const isConsonant = (ch: string | undefined): boolean => ch !== undefined && CONSONANT_BY_CHAR.has(ch)

/** The eight sonorants that ห can lead (ห นำ). ฬ and ณ never take ห. */
export const HO_NAM_SONORANTS = 'งญนมยรลว'

/** Text for speech synthesis: the letter is read with an inherent ɔɔ, "กอ ไก่". */
export function spokenName(c: Consonant): string {
  return `${c.char}อ ${c.name}`
}

/** Paiboon romanization of the whole letter name, e.g. "gɔɔ gài", "kɔ̌ɔ kài". */
export function letterNameRom(c: Consonant): string {
  const vowel = c.cls === 'high' ? 'ɔ̌ɔ' : 'ɔɔ'
  return `${c.initial}${vowel} ${c.nameRom}`
}

export const CLASS_ORDER: ConsonantClass[] = ['mid', 'high', 'low']

export const FINAL_SOUNDS: FinalSound[] = ['k', 't', 'p', 'ng', 'n', 'm', 'y', 'w']
