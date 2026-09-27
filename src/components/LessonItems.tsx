import type { AnyLesson } from '../progress'
import { Letter, ThaiText } from './common'
import { VowelFormText } from './VowelCard'

/** The letters / vowel forms a lesson teaches, drawn the usual way. */
export function LessonItems({ lesson, size = '1.7rem' }: { lesson: AnyLesson; size?: string }) {
  if (lesson.family === 'syllable') return <ThaiText text="ตา · จะ · ปาก · กิน" className="" />
  return (
    <span className="row" style={{ flexWrap: 'wrap', gap: lesson.family === 'vowel' ? '0 14px' : '0 4px', fontSize: size }}>
      {lesson.items.map((item) => (lesson.family === 'consonant' ? <Letter key={item} char={item} /> : <VowelFormText key={item} id={item} />))}
    </span>
  )
}
