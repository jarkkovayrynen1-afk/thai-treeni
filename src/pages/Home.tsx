import { ClassTag, Letter } from '../components/common'
import { CONSONANTS } from '../data/consonants'
import { LESSONS } from '../data/lessons'
import { learnedLetters, lessonMastered, lettersScore, nextLesson, TARGET_ACCURACY } from '../progress'
import { href } from '../router'
import { useAppState } from '../storage/store'

const COMMON_COUNT = CONSONANTS.filter((c) => c.freq === 'common').length

export function Home() {
  const done = useAppState((s) => s.lessonsDone)
  const stats = useAppState((s) => s.stats)
  const learned = learnedLetters(done)
  const next = nextLesson(done)
  const lastDone = [...LESSONS].reverse().find((l) => !l.optional && done.includes(l.id))
  const needsPractice = lastDone && !lessonMastered(stats, lastDone)
  const total = lettersScore(stats, learned)

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
                Oppitunnin ”{lastDone.title}” kirjaimet eivät ole vielä vakiintuneet (tavoite {Math.round(TARGET_ACCURACY * 100)} % oikein).
              </p>
              <a className="btn primary block" href={href('harjoitus', { drill: 'mix', mode: 'calm', pool: `lesson:${lastDone.id}` })}>
                Harjoittele: {lastDone.letters.map((l) => <Letter key={l} char={l} />)}
              </a>
            </div>
          )}
          {next && (
            <div className="card stack">
              <h2>Seuraava oppitunti</h2>
              <div style={{ fontSize: '2rem', letterSpacing: '0.1em' }}>
                {next.letters.map((l) => (
                  <Letter key={l} char={l} />
                ))}
              </div>
              <a className={`btn block ${needsPractice ? '' : 'primary'}`} href={href(`oppitunti/${next.id}`)}>
                {next.title}
              </a>
            </div>
          )}
          <div className="card stack">
            <h2>Pikakierros</h2>
            <p className="muted small">20 kysymystä kaikista oppimistasi kirjaimista.</p>
            <a className="btn primary block" href={href('harjoitus', { drill: 'mix', mode: 'fast', pool: 'done' })}>
              Aloita pikakierros
            </a>
          </div>
          <div className="card row" style={{ justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div className="big-number">
                {learned.filter((l) => CONSONANTS.find((c) => c.char === l)?.freq === 'common').length}/{COMMON_COUNT}
              </div>
              <div className="small muted">yleistä kirjainta</div>
            </div>
            <div>
              <div className="big-number">{total.n ? `${Math.round((100 * total.ok) / total.n)} %` : '–'}</div>
              <div className="small muted">oikein</div>
            </div>
          </div>
          {!next && (
            <div className="card stack">
              <h2>Kaikki yleiset kirjaimet käyty 🎉</h2>
              <p className="muted small">Harvinaiset kirjaimet löytyvät valinnaisista oppitunneista. Seuraavaksi: vokaalit ja sävyt (tulossa).</p>
              <a className="btn block" href={href('oppitunnit')}>
                Oppitunnit
              </a>
            </div>
          )}
        </>
      )}
    </div>
  )
}
