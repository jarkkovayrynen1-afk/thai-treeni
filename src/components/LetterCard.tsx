import { consonant, CONSONANTS, letterNameRom, spokenName } from '../data/consonants'
import { FINAL_HINT, SOUND_HINT } from '../data/lessons'
import { FINAL_LABEL, initialLabel } from '../i18n/fi'
import { ClassTag, Letter, SpeakButton, ThaiText } from './common'

const FREQ_FI = { common: '', rare: 'harvinainen', obsolete: 'vanhentunut – ei käytössä' } as const

/** Everything about one consonant, as shown in lessons and in the alphabet table. */
export function LetterCard({ char }: { char: string }) {
  const c = consonant(char)
  // High ↔ low paired letters share a sound; showing the twin is the key to the low class.
  const twins = c.cls === 'mid' ? [] : CONSONANTS.filter((x) => x.cls !== c.cls && x.cls !== 'mid' && x.initial === c.initial && x.freq !== 'obsolete')
  return (
    <div className="card letter-card">
      <div className="row" style={{ justifyContent: 'center' }}>
        <ClassTag cls={c.cls} letter={char} />
        {c.freq !== 'common' && <span className="badge">{FREQ_FI[c.freq]}</span>}
      </div>
      <Letter char={char} className="big" />
      <div className="stack" style={{ gap: 4, alignItems: 'center' }}>
        <div className="row">
          <ThaiText text={`${char} ${c.name}`} className="name" />
          <SpeakButton text={spokenName(c)} />
        </div>
        <div className="muted">
          {letterNameRom(c)} · ”{c.nameFi}”
        </div>
      </div>
      <div className="facts">
        <div className="fact">
          <div className="k">Tavun alussa</div>
          <div className="v">{initialLabel(c.initial)}</div>
          <div className="h">{c.initialNote ?? SOUND_HINT[c.initial]}</div>
        </div>
        <div className="fact">
          <div className="k">Tavun lopussa</div>
          <div className="v">{c.final ? FINAL_LABEL[c.final] : '—'}</div>
          <div className="h">{c.final ? FINAL_HINT[c.final] : 'ei voi olla lopussa'}</div>
        </div>
      </div>
      {twins.length > 0 && (
        <div className="small muted">
          Sama äänne, {c.cls === 'high' ? 'matala' : 'korkea'} luokka:{' '}
          <span style={{ fontSize: '1.5rem' }}>
            {twins.map((t) => (
              <Letter key={t.char} char={t.char} />
            ))}
          </span>
        </div>
      )}
    </div>
  )
}
