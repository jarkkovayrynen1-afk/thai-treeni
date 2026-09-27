export type ConsonantClass = 'mid' | 'high' | 'low'
/** อักษรคู่ (has a high-class twin with the same sound) vs อักษรเดี่ยว (sonorant, no twin). */
export type LowKind = 'paired' | 'sonorant'
/** The eight final-sound categories (มาตราตัวสะกด). y/w are the glide finals ย/ว. */
export type FinalSound = 'k' | 't' | 'p' | 'ng' | 'n' | 'm' | 'y' | 'w'
export type Frequency = 'common' | 'rare' | 'obsolete'

export type Liveness = 'live' | 'dead'
export type VowelLength = 'short' | 'long'
/** '' = no tone mark, otherwise the Thai tone-mark character itself. */
export type ToneMark = '' | '่' | '้' | '๊' | '๋'
export type Tone = 'mid' | 'low' | 'falling' | 'high' | 'rising'
export type Leader = 'ห' | 'อ'

export interface Consonant {
  char: string
  /** The acrophonic name word, e.g. ไก่ in "ก ไก่". */
  name: string
  /** Paiboon romanization of the name word. */
  nameRom: string
  nameFi: string
  cls: ConsonantClass
  lowKind?: LowKind
  /** Paiboon initial sound; '' for อ (silent vowel carrier). */
  initial: string
  initialNote?: string
  /** null = cannot end a syllable. */
  final: FinalSound | null
  freq: Frequency
}

export interface Word {
  thai: string
  /** Paiboon romanization with tone diacritic. */
  rom: string
  fi: string
  /** Effective class: the leader's class for ห นำ / อ นำ words. */
  cls: ConsonantClass
  live: Liveness
  len: VowelLength
  mark: ToneMark
  tone: Tone
  leader?: Leader
}
