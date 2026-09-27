import { describe, expect, it } from 'vitest'
import type { Tone } from '../src/data/types'
import { branchFromSpelling, toneFromSpelling } from '../src/engine/spelling'
import { ALL_BRANCHES, computeTone, type ToneBranch } from '../src/engine/tone'

// The rules table itself, cell by cell.
describe('computeTone: rules table', () => {
  const cases: [string, Parameters<typeof computeTone>[0], Tone][] = [
    ['mid live', { cls: 'mid', live: 'live', len: 'long', mark: '' }, 'mid'],
    ['mid dead short', { cls: 'mid', live: 'dead', len: 'short', mark: '' }, 'low'],
    ['mid dead long', { cls: 'mid', live: 'dead', len: 'long', mark: '' }, 'low'],
    ['high live', { cls: 'high', live: 'live', len: 'long', mark: '' }, 'rising'],
    ['high dead short', { cls: 'high', live: 'dead', len: 'short', mark: '' }, 'low'],
    ['high dead long', { cls: 'high', live: 'dead', len: 'long', mark: '' }, 'low'],
    ['low live', { cls: 'low', live: 'live', len: 'long', mark: '' }, 'mid'],
    ['low dead short', { cls: 'low', live: 'dead', len: 'short', mark: '' }, 'high'],
    ['low dead long', { cls: 'low', live: 'dead', len: 'long', mark: '' }, 'falling'],
    ['mid ek', { cls: 'mid', live: 'live', len: 'long', mark: '่' }, 'low'],
    ['high ek', { cls: 'high', live: 'live', len: 'long', mark: '่' }, 'low'],
    ['low ek', { cls: 'low', live: 'live', len: 'long', mark: '่' }, 'falling'],
    ['low ek on dead syllable', { cls: 'low', live: 'dead', len: 'short', mark: '่' }, 'falling'],
    ['mid tho', { cls: 'mid', live: 'live', len: 'long', mark: '้' }, 'falling'],
    ['high tho', { cls: 'high', live: 'live', len: 'long', mark: '้' }, 'falling'],
    ['low tho', { cls: 'low', live: 'live', len: 'long', mark: '้' }, 'high'],
    ['mid tri', { cls: 'mid', live: 'live', len: 'long', mark: '๊' }, 'high'],
    ['mid tri on dead syllable', { cls: 'mid', live: 'dead', len: 'short', mark: '๊' }, 'high'],
    ['mid chattawa', { cls: 'mid', live: 'live', len: 'long', mark: '๋' }, 'rising'],
  ]
  it.each(cases)('%s', (_, input, tone) => expect(computeTone(input)).toBe(tone))
})

// Known words: expected tones are how the words are pronounced. The engine gets ONLY the
// Thai spelling, so this also proves the spelling analyzer reads class/live/dead correctly.
const KNOWN: [thai: string, tone: Tone][] = [
  // mid, no mark
  ['กา', 'mid'], ['บิน', 'mid'], ['ตอน', 'mid'], ['จำ', 'mid'], ['ปู', 'mid'], ['ตรง', 'mid'], ['ใจ', 'mid'], ['เอา', 'mid'],
  ['อาบ', 'low'], ['ปิด', 'low'], ['กับ', 'low'], ['ดุ', 'low'], ['แกะ', 'low'], ['ตอบ', 'low'], ['จุด', 'low'], ['เปิด', 'low'],
  // mid, marks
  ['ปู่', 'low'], ['จ่าย', 'low'], ['ไก่', 'low'],
  ['ต้ม', 'falling'], ['ตู้', 'falling'], ['บ้า', 'falling'], ['ต้น', 'falling'], ['ได้', 'falling'],
  ['โต๊ะ', 'high'], ['ก๊อก', 'high'], ['ป๊า', 'high'],
  ['ตั๋ว', 'rising'], ['จ๋า', 'rising'], ['เดี๋ยว', 'rising'],
  // high
  ['หา', 'rising'], ['สูง', 'rising'], ['ขาย', 'rising'], ['ถุง', 'rising'], ['ผี', 'rising'], ['สอน', 'rising'], ['ขวา', 'rising'],
  ['ขวด', 'low'], ['ผัด', 'low'], ['สอบ', 'low'], ['หัก', 'low'], ['ขาด', 'low'], ['สัตว์', 'low'],
  ['ห่อ', 'low'], ['สั่ง', 'low'], ['ส่วน', 'low'],
  ['ข้าง', 'falling'], ['ถ้วย', 'falling'], ['ห้าม', 'falling'], ['สร้าง', 'falling'],
  // low paired
  ['ทอง', 'mid'], ['ชาย', 'mid'], ['ครัว', 'mid'], ['ฟัน', 'mid'], ['ความ', 'mid'], ['ทราย', 'mid'],
  ['ซัก', 'high'], ['ชุด', 'high'], ['ชัด', 'high'], ['เคาะ', 'high'], ['ครับ', 'high'],
  ['ธูป', 'falling'], ['ซีด', 'falling'], ['ภาค', 'falling'], ['ชอบ', 'falling'],
  ['ช่าง', 'falling'], ['เท่า', 'falling'], ['ค่ำ', 'falling'], ['ค่ะ', 'falling'],
  ['ค้า', 'high'], ['ทั้ง', 'high'], ['คุ้ม', 'high'],
  // low sonorant
  ['ยา', 'mid'], ['นม', 'mid'], ['ลืม', 'mid'], ['งู', 'mid'],
  ['ลบ', 'high'], ['ลุก', 'high'], ['ละ', 'high'], ['ยักษ์', 'high'],
  ['วาด', 'falling'], ['เรียบ', 'falling'], ['ลูก', 'falling'],
  ['ยุ่ง', 'falling'], ['ล่าง', 'falling'],
  ['ยิ้ม', 'high'], ['ล้าง', 'high'], ['ร้อง', 'high'],
  // ห นำ
  ['หมอน', 'rising'], ['หลาน', 'rising'], ['หวัง', 'rising'], ['ไหม', 'rising'], ['หญิง', 'rising'],
  ['หลอก', 'low'], ['หยาบ', 'low'], ['หมด', 'low'],
  ['หมู่', 'low'], ['หล่อ', 'low'], ['ใหญ่', 'low'],
  ['หมั้น', 'falling'], ['หน้า', 'falling'],
  // อ นำ — the complete set
  ['อย่า', 'low'], ['อยู่', 'low'], ['อย่าง', 'low'], ['อยาก', 'low'],
]

describe('known words (spelling → tone)', () => {
  it('has at least 60 words', () => expect(KNOWN.length).toBeGreaterThanOrEqual(60))
  it.each(KNOWN)('%s → %s', (thai, tone) => expect(toneFromSpelling(thai)).toBe(tone))

  it('covers every branch of the rules table', () => {
    const hit = new Set<ToneBranch>(KNOWN.map(([thai]) => branchFromSpelling(thai)))
    const missing = ALL_BRANCHES.filter((b) => !hit.has(b))
    expect(missing).toEqual([])
  })
})
