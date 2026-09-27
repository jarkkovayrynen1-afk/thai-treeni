import { ClassTag, Letter, ThaiText } from '../components/common'
import { LESSONS, MNEMONIC, type Lesson } from '../data/lessons'
import { href } from '../router'
import { useAppState } from '../storage/store'
import { lessonMastered, lettersScore } from '../progress'

const GROUPS: { title: string; cls: Lesson['cls']; kind?: Lesson['lowKind'] }[] = [
  { title: 'Keskiluokka', cls: 'mid' },
  { title: 'Korkea luokka', cls: 'high' },
  { title: 'Matala luokka – parit', cls: 'low', kind: 'paired' },
  { title: 'Matala luokka – yksinäiset', cls: 'low', kind: 'sonorant' },
]

export function Lessons() {
  const done = useAppState((s) => s.lessonsDone)
  const stats = useAppState((s) => s.stats)

  return (
    <div className="page">
      <div className="topbar">
        <h1>Oppitunnit</h1>
      </div>
      <p className="muted">
        Kirjaimet opetellaan pienissä ryhmissä. Harjoituksissa kysytään vain niitä kirjaimia, joiden oppitunnin olet käynyt läpi.
      </p>
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
          {LESSONS.filter((l) => l.cls === g.cls && l.lowKind === g.kind).map((l) => {
            const s = lettersScore(stats, l.letters)
            const isDone = done.includes(l.id)
            return (
              <a key={l.id} className="card lesson-row" href={href(`oppitunti/${l.id}`)}>
                <div style={{ flex: 1 }}>
                  <div className="letters">
                    {l.letters.map((ch) => (
                      <Letter key={ch} char={ch} />
                    ))}
                  </div>
                  <div className="title">
                    {l.title}
                    {l.optional ? ' · valinnainen' : ''}
                  </div>
                </div>
                {isDone ? (
                  <span className={`badge ${lessonMastered(stats, l) ? 'done' : ''}`}>
                    {s.n ? `${Math.round((100 * s.ok) / s.n)} %` : 'käyty'}
                  </span>
                ) : (
                  <span className="badge">uusi</span>
                )}
              </a>
            )
          })}
        </section>
      ))}
    </div>
  )
}
