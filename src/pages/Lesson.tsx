import { useEffect, useState } from 'react'
import { BackLink, ClassTag, Letter, ThaiText } from '../components/common'
import { LetterCard } from '../components/LetterCard'
import { INTROS, LESSON_BY_ID, LESSONS, MNEMONIC } from '../data/lessons'
import { href } from '../router'
import { markLessonDone } from '../storage/store'

export function LessonPage({ id }: { id: string }) {
  const lesson = LESSON_BY_ID.get(id)
  const intro = INTROS[id]
  const [step, setStep] = useState(0)

  const steps = lesson ? (intro ? 1 : 0) + lesson.letters.length + 1 : 0
  const isDone = step === steps - 1
  useEffect(() => {
    if (lesson && isDone) markLessonDone(lesson.id)
  }, [lesson, isDone])

  if (!lesson) {
    return (
      <div className="page">
        <p>Oppituntia ei löytynyt.</p>
        <a href={href('oppitunnit')}>Oppitunnit</a>
      </div>
    )
  }

  const letterIndex = step - (intro ? 1 : 0)
  const next = LESSONS[LESSONS.indexOf(lesson) + 1]
  const mnemonic = lesson.cls === 'mid' || lesson.cls === 'high' ? MNEMONIC[lesson.cls] : undefined

  return (
    <div className="page">
      <div className="topbar">
        <BackLink to="oppitunnit" />
        <h1>{lesson.title}</h1>
      </div>
      <div className="dots" aria-hidden>
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className={i === step ? 'on' : ''} />
        ))}
      </div>

      {intro && step === 0 && (
        <div className="card stack">
          <h2>
            <ClassTag cls={lesson.cls} /> {intro.heading}
          </h2>
          {intro.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {mnemonic && (
            <div className="mnemonic" style={{ borderColor: `var(--${lesson.cls})` }}>
              <ThaiText text={mnemonic.thai} className="mn-thai" />
              <div className="small muted">{mnemonic.fi}</div>
            </div>
          )}
        </div>
      )}

      {letterIndex >= 0 && letterIndex < lesson.letters.length && <LetterCard char={lesson.letters[letterIndex]} />}

      {isDone && (
        <div className="card stack" style={{ textAlign: 'center' }}>
          <h2>Oppitunti käyty!</h2>
          <div style={{ fontSize: '2.6rem', letterSpacing: '0.1em' }}>
            {lesson.letters.map((ch) => (
              <Letter key={ch} char={ch} />
            ))}
          </div>
          <p className="muted">Nämä kirjaimet ovat nyt mukana harjoituksissa. Harjoittele niitä heti, niin ne jäävät mieleen.</p>
          <a className="btn primary block" href={href('harjoitus', { drill: 'mix', mode: 'calm', pool: `lesson:${lesson.id}` })}>
            Harjoittele näitä
          </a>
          {next && (
            <a className="btn block" href={href(`oppitunti/${next.id}`)}>
              Seuraava: {next.title}
            </a>
          )}
        </div>
      )}

      <div className="row" style={{ marginTop: 'auto' }}>
        <button type="button" className="btn" style={{ flex: 1 }} disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Edellinen
        </button>
        {!isDone && (
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={() => setStep(step + 1)}>
            {step === steps - 2 ? 'Valmis' : 'Seuraava →'}
          </button>
        )}
      </div>
    </div>
  )
}
