import { ClassTag, ThaiText } from '../components/common'
import { LessonItems } from '../components/LessonItems'
import { FamilyTabs } from '../components/FamilyTabs'
import { useFamily } from '../useFamily'
import { LESSONS, LIVE_DEAD_LESSON, MNEMONIC, VOWEL_LESSONS, type Lesson } from '../data/lessons'
import { ALL_LESSONS, lessonMastered, lessonScore, nextLesson, type AnyLesson } from '../progress'
import { href } from '../router'
import { useAppState } from '../storage/store'

const GROUPS: { title: string; cls: Lesson['cls']; kind?: Lesson['lowKind'] }[] = [
  { title: 'Keskiluokka', cls: 'mid' },
  { title: 'Korkea luokka', cls: 'high' },
  { title: 'Matala luokka – parit', cls: 'low', kind: 'paired' },
  { title: 'Matala luokka – yksinäiset', cls: 'low', kind: 'sonorant' },
]

const lessonById = (id: string) => ALL_LESSONS.find((l) => l.id === id)!

/** One lesson row: its letters / vowel forms, title, and done-% badge. */
function LessonRow({ lesson }: { lesson: AnyLesson }) {
  const done = useAppState((s) => s.lessonsDone)
  const stats = useAppState((s) => s.stats)
  const s = lessonScore(stats, lesson)
  const isDone = done.includes(lesson.id)
  return (
    <a className="card lesson-row" href={href(`oppitunti/${lesson.id}`)}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="letters">
          <LessonItems lesson={lesson} size={lesson.family === 'consonant' ? '1.7rem' : '1.5rem'} />
        </div>
        <div className="title">
          {lesson.title}
          {lesson.optional ? ' · valinnainen' : ''}
        </div>
      </div>
      {isDone ? (
        <span className={`badge ${lessonMastered(stats, lesson) ? 'done' : ''}`}>{s.n ? `${Math.round((100 * s.ok) / s.n)} %` : 'käyty'}</span>
      ) : (
        <span className="badge">uusi</span>
      )}
    </a>
  )
}

export function Lessons() {
  const done = useAppState((s) => s.lessonsDone)
  const family = useFamily(nextLesson(done)?.family ?? 'consonant')

  return (
    <div className="page">
      <div className="topbar">
        <h1>Oppitunnit</h1>
      </div>
      <FamilyTabs page="oppitunnit" current={family} />

      {family === 'consonant' && (
        <>
          <p className="muted small">Kirjaimet opetellaan pienissä ryhmissä. Harjoituksissa kysytään vain niitä kirjaimia, joiden oppitunnin olet käynyt läpi.</p>
          {GROUPS.map((g) => (
            <section key={g.title} className="stack lesson-group">
              <h2>
                <ClassTag cls={g.cls} /> {g.title}
              </h2>
              {(g.cls === 'mid' || g.cls === 'high') && (
                <div className="mnemonic" style={{ borderColor: `var(--${g.cls})` }}>
                  <ThaiText text={MNEMONIC[g.cls].thai} className="mn-thai" />
                  <div className="small muted">{MNEMONIC[g.cls].fi}</div>
                </div>
              )}
              {LESSONS.filter((l) => l.cls === g.cls && l.lowKind === g.kind).map((l) => (
                <LessonRow key={l.id} lesson={lessonById(l.id)} />
              ))}
            </section>
          ))}
        </>
      )}

      {family === 'vowel' && (
        <>
          <p className="muted small">Vokaalit opetellaan lyhyt–pitkä-pareina. Merkki ◌ näyttää konsonantin paikan.</p>
          <section className="stack">
            {VOWEL_LESSONS.map((l) => (
              <LessonRow key={l.id} lesson={lessonById(l.id)} />
            ))}
          </section>
        </>
      )}

      {family === 'syllable' && (
        <>
          <p className="muted small">Jokainen tavu on joko elävä tai kuollut. Se on sävysääntöjen toinen pala – luokan jälkeen.</p>
          <section className="stack">
            <LessonRow lesson={lessonById(LIVE_DEAD_LESSON.id)} />
          </section>
        </>
      )}
    </div>
  )
}
