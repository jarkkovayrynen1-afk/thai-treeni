import { useState } from 'react'
import { Letter } from '../components/common'
import { drillApplies } from '../drills/questions'
import { DRILL_FI } from '../i18n/fi'
import { learnedLetters } from '../progress'
import { href } from '../router'
import { useAppState, type DrillId } from '../storage/store'

const OPTIONS: { id: DrillId | 'mix'; help: string }[] = [
  { id: 'mix', help: 'Kaikkia alla olevia sekaisin' },
  { id: 'class', help: 'Keski, korkea vai matala?' },
  { id: 'initial', help: 'Miltä kirjain kuulostaa tavun alussa' },
  { id: 'final', help: 'Miltä kirjain kuulostaa tavun lopussa' },
  { id: 'sound', help: 'Kuulet äänteen – valitse kaikki sen kirjaimet' },
]

export function Practice() {
  const done = useAppState((s) => s.lessonsDone)
  const seconds = useAppState((s) => s.settings.seconds)
  const [mode, setMode] = useState<'calm' | 'fast'>('calm')
  const pool = learnedLetters(done)

  return (
    <div className="page">
      <div className="topbar">
        <h1>Harjoittele</h1>
      </div>

      {pool.length === 0 ? (
        <div className="card stack">
          <p>Harjoituksissa kysytään kirjaimia, joiden oppitunnin olet käynyt. Aloita ensimmäisestä oppitunnista.</p>
          <a className="btn primary" href={href('oppitunti/mid-1')}>
            Keskiluokka 1
          </a>
        </div>
      ) : (
        <>
          <div className="card stack">
            <div className="small muted">Mukana {pool.length} kirjainta:</div>
            <div style={{ fontSize: '1.7rem', letterSpacing: '0.06em', lineHeight: 1.4 }}>
              {pool.map((l) => (
                <Letter key={l} char={l} />
              ))}
            </div>
          </div>

          <div className="stack" style={{ gap: 8 }}>
            <div className="chips" role="group" aria-label="Tila">
              <button type="button" className="chip" aria-pressed={mode === 'calm'} onClick={() => setMode('calm')}>
                Rauhallinen
              </button>
              <button type="button" className="chip" aria-pressed={mode === 'fast'} onClick={() => setMode('fast')}>
                Pikakierros · {seconds} s
              </button>
            </div>
            <p className="small muted">
              {mode === 'calm'
                ? 'Ei aikarajaa. Virheen jälkeen näet selityksen ja jatkat omaan tahtiin.'
                : `Vastaa ${seconds} sekunnissa. Oikea vastaus näytetään hetken ja peli jatkuu. Aikarajan voit vaihtaa asetuksista.`}
            </p>
          </div>

          <div className="stack">
            {OPTIONS.filter((o) => o.id === 'mix' || drillApplies(o.id, pool)).map((o) => (
              <a key={o.id} className="card lesson-row" href={href('harjoitus', { drill: o.id, mode, pool: 'done' })}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{DRILL_FI[o.id]}</div>
                  <div className="title">{o.help}</div>
                </div>
                <span aria-hidden>→</span>
              </a>
            ))}
          </div>
          <p className="small muted">Jokainen kierros on 20 kysymystä. Kirjaimet, joissa teet virheitä, tulevat vastaan useammin.</p>
        </>
      )}
    </div>
  )
}
