import { useState } from 'react'
import { Letter, ThaiText } from '../components/common'
import { FamilyTabs } from '../components/FamilyTabs'
import { useFamily } from '../useFamily'
import { VowelFormText } from '../components/VowelCard'
import { LIVE_DEAD_LESSON } from '../data/lessons'
import { drillApplies } from '../drills/questions'
import { DRILL_FI } from '../i18n/fi'
import { ALL_LESSONS, drillsOf, resolvePool, type Family } from '../progress'
import { href } from '../router'
import { useAppState, type DrillParam } from '../storage/store'

const OPTIONS: Record<Family, { id: DrillParam; help: string }[]> = {
  consonant: [
    { id: 'mix', help: 'Kaikkia alla olevia sekaisin' },
    { id: 'class', help: 'Keski, korkea vai matala?' },
    { id: 'initial', help: 'Miltä kirjain kuulostaa tavun alussa' },
    { id: 'final', help: 'Miltä kirjain kuulostaa tavun lopussa' },
    { id: 'sound', help: 'Näet äänteen – valitse kaikki sen kirjaimet' },
  ],
  vowel: [
    { id: 'vmix', help: 'Molempia sekaisin' },
    { id: 'vowelSound', help: 'Miltä vokaali kuulostaa' },
    { id: 'vowelLength', help: 'Lyhyt vai pitkä vokaali' },
  ],
  syllable: [{ id: 'liveDead', help: 'Näet tavun – onko se elävä vai kuollut' }],
}

const EMPTY: Record<Family, { text: string; lesson: string }> = {
  consonant: { text: 'Harjoituksissa kysytään kirjaimia, joiden oppitunnin olet käynyt. Aloita ensimmäisestä oppitunnista.', lesson: 'mid-1' },
  vowel: { text: 'Vokaaliharjoituksissa kysytään vokaaleja, joiden oppitunnin olet käynyt.', lesson: 'v-1' },
  syllable: { text: 'Käy ensin läpi sääntötunti – se kestää pari minuuttia.', lesson: LIVE_DEAD_LESSON.id },
}

export function Practice() {
  const done = useAppState((s) => s.lessonsDone)
  const seconds = useAppState((s) => s.settings.seconds)
  const lastFamily = ALL_LESSONS.find((l) => l.id === done[done.length - 1])?.family ?? 'consonant'
  const family = useFamily(lastFamily)
  const [mode, setMode] = useState<'calm' | 'fast'>('calm')
  const unlocked = family !== 'syllable' || done.includes(LIVE_DEAD_LESSON.id)
  const pool = unlocked ? resolvePool('done', done, family) : []

  return (
    <div className="page">
      <div className="topbar">
        <h1>Harjoittele</h1>
      </div>
      <FamilyTabs page="harjoittele" current={family} />

      {pool.length === 0 ? (
        <div className="card stack">
          <p>{EMPTY[family].text}</p>
          <a className="btn primary" href={href(`oppitunti/${EMPTY[family].lesson}`)}>
            {ALL_LESSONS.find((l) => l.id === EMPTY[family].lesson)!.title}
          </a>
        </div>
      ) : (
        <>
          <div className="card stack">
            <div className="small muted">
              Mukana {pool.length} {family === 'consonant' ? 'kirjainta' : family === 'vowel' ? 'vokaalimuotoa' : 'tavua'}
              {family === 'syllable' && ' sanalistasta'}:
            </div>
            <PoolPreview family={family} pool={pool} />
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
                ? 'Ei aikarajaa. Näet selityksen jokaisen vastauksen jälkeen ja jatkat omaan tahtiin.'
                : `Vastaa ${seconds} sekunnissa. Oikea vastaus näytetään hetken ja peli jatkuu. Aikarajan voit vaihtaa asetuksista.`}
            </p>
          </div>

          <div className="stack">
            {OPTIONS[family]
              .filter((o) => drillsOf(o.id).some((d) => drillApplies(d, pool)))
              .map((o) => (
                <a key={o.id} className="card lesson-row" href={href('harjoitus', { drill: o.id, mode, pool: 'done' })}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{DRILL_FI[o.id]}</div>
                    <div className="title">{o.help}</div>
                  </div>
                  <span aria-hidden>→</span>
                </a>
              ))}
          </div>
          <p className="small muted">Jokainen kierros on 20 kysymystä. Ne, joissa teet virheitä, tulevat vastaan useammin.</p>
        </>
      )}
    </div>
  )
}

function PoolPreview({ family, pool }: { family: Family; pool: string[] }) {
  if (family === 'consonant') {
    return (
      <div style={{ fontSize: '1.7rem', letterSpacing: '0.06em', lineHeight: 1.4 }}>
        {pool.map((l) => (
          <Letter key={l} char={l} />
        ))}
      </div>
    )
  }
  if (family === 'vowel') {
    return (
      <div className="row" style={{ flexWrap: 'wrap', gap: '2px 14px', fontSize: '1.5rem' }}>
        {pool.map((f) => (
          <VowelFormText key={f} id={f} />
        ))}
      </div>
    )
  }
  return (
    <div style={{ fontSize: '1.3rem', lineHeight: 1.6 }}>
      <ThaiText text={pool.slice(0, 12).join(' · ')} />
      {pool.length > 12 && <span className="muted"> …</span>}
    </div>
  )
}
