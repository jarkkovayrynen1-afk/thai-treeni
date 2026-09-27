import { ClassTag } from '../components/common'
import { LessonItems } from '../components/LessonItems'
import { CONSONANTS } from '../data/consonants'
import { LIVE_DEAD_LESSON } from '../data/lessons'
import { VOWEL_FORMS } from '../data/vowels'
import { DRILL_FI } from '../i18n/fi'
import { ALL_LESSONS, FAMILY_MIX, learnedForms, learnedLetters, lessonMastered, nextLesson, TARGET_ACCURACY } from '../progress'
import { href } from '../router'
import { useAppState, type AppState, type DrillParam } from '../storage/store'

const COMMON_COUNT = CONSONANTS.filter((c) => c.freq === 'common').length
const DRILLABLE_FORMS = VOWEL_FORMS.filter((f) => f.drillable).length

function overallScore(stats: AppState['stats']) {
  let n = 0
  let ok = 0
  for (const byItem of Object.values(stats)) {
    for (const s of Object.values(byItem)) {
      n += s.n
      ok += s.ok
    }
  }
  return { n, ok }
}

export function Home() {
  const done = useAppState((s) => s.lessonsDone)
  const stats = useAppState((s) => s.stats)
  const letters = learnedLetters(done)
  const forms = learnedForms(done)
  const next = nextLesson(done)
  const lastDone = [...ALL_LESSONS].reverse().find((l) => !l.optional && done.includes(l.id))
  const needsPractice = lastDone && !lessonMastered(stats, lastDone)
  const total = overallScore(stats)
  const fastRounds: DrillParam[] = [
    ...(letters.length ? (['mix'] as const) : []),
    ...(forms.length ? (['vmix'] as const) : []),
    ...(done.includes(LIVE_DEAD_LESSON.id) ? (['liveDead'] as const) : []),
  ]

  return (
    <div className="page">
      <div className="topbar">
        <h1>
          Thai-treeni <span className="th letter mid">ก</span>
          <span className="th letter high">ข</span>
          <span className="th letter low">ค</span>
        </h1>
        <a className="icon-btn" href={href('asetukset')} aria-label="Asetukset" title="Asetukset" style={{ textDecoration: 'none' }}>
          ⚙
        </a>
      </div>

      {done.length === 0 ? (
        <div className="card stack">
          <h2>Tervetuloa!</h2>
          <p>Tämä sovellus tekee konsonanttien luokista ja sävysäännöistä automaattisia – nopealla toistolla ja välittömällä palautteella.</p>
          <p>Jokainen konsonantti näkyy aina luokkansa värillä ja merkillä:</p>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <ClassTag cls="mid" />
            <ClassTag cls="high" />
            <ClassTag cls="low" />
          </div>
          <p>Aloita keskiluokasta: neljä kirjainta kerrallaan, sitten harjoitus.</p>
          <a className="btn primary block" href={href('oppitunti/mid-1')}>
            Aloita: Keskiluokka 1
          </a>
        </div>
      ) : (
        <>
          {needsPractice && (
            <div className="card stack">
              <h2>Harjoittele ensin</h2>
              <p className="muted small">
                Oppitunti ”{lastDone.title}” ei ole vielä vakiintunut (tavoite {Math.round(TARGET_ACCURACY * 100)} % oikein).
              </p>
              <LessonItems lesson={lastDone} />
              <a
                className="btn primary block"
                href={href('harjoitus', { drill: FAMILY_MIX[lastDone.family], mode: 'calm', pool: lastDone.family === 'syllable' ? 'done' : `lesson:${lastDone.id}` })}
              >
                Harjoittele
              </a>
            </div>
          )}
          {next && (
            <div className="card stack">
              <h2>Seuraava oppitunti</h2>
              <LessonItems lesson={next} size="2rem" />
              <a className={`btn block ${needsPractice ? '' : 'primary'}`} href={href(`oppitunti/${next.id}`)}>
                {next.title}
              </a>
            </div>
          )}
          {fastRounds.length > 0 && (
            <div className="card stack">
              <h2>Pikakierros</h2>
              <p className="muted small">20 nopeaa kysymystä siitä, mitä olet jo oppinut.</p>
              {fastRounds.map((d, i) => (
                <a key={d} className={`btn block ${i === 0 && !next ? 'primary' : ''}`} href={href('harjoitus', { drill: d, mode: 'fast', pool: 'done' })}>
                  {d === 'mix' ? 'Konsonantit' : DRILL_FI[d]}
                </a>
              ))}
            </div>
          )}
          <div className="card row" style={{ justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div className="big-number">
                {letters.filter((l) => CONSONANTS.find((c) => c.char === l)?.freq === 'common').length}/{COMMON_COUNT}
              </div>
              <div className="small muted">kirjainta</div>
            </div>
            <div>
              <div className="big-number">
                {forms.length}/{DRILLABLE_FORMS}
              </div>
              <div className="small muted">vokaalimuotoa</div>
            </div>
            <div>
              <div className="big-number">{total.n ? `${Math.round((100 * total.ok) / total.n)} %` : '–'}</div>
              <div className="small muted">oikein</div>
            </div>
          </div>
          {!next && (
            <div className="card stack">
              <h2>Kaikki oppitunnit käyty 🎉</h2>
              <p className="muted small">Seuraavaksi: sävyjen päättely (vaihe 3, tulossa).</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
