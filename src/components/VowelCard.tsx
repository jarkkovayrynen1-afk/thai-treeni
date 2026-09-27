import { VOWEL_BY_ID, speakableVowel, vowelForm, type VowelForm } from '../data/vowels'
import { LEN_FI } from '../i18n/fi'
import { wordOf } from '../drills/questions'
import { RichText, SpeakButton, ThaiText } from './common'

/** A vowel shape with ◌ marking the consonant slot. */
export function VowelFormText({ id, className = '' }: { id: string; className?: string }) {
  return <span className={`th vform ${className}`}>{vowelForm(id).text}</span>
}

export function LengthTag({ form }: { form: VowelForm }) {
  return <span className={`len-tag ${form.vowel.len}`}>{LEN_FI[form.vowel.len]}</span>
}

/** Example words for a form: Thai (consonants in class colour), romanization, meaning. */
export function VowelExamples({ form, limit = 3 }: { form: VowelForm; limit?: number }) {
  if (!form.examples.length) return <span className="small muted">Harvinainen – ei esimerkkiä sanalistassa.</span>
  return (
    <span className="examples">
      {form.examples.slice(0, limit).map((t) => {
        const w = wordOf(t)
        return (
          <span key={t} className="example">
            <ThaiText text={t} className="ex-thai" />
            <span className="small muted">
              {w.rom} · {w.fi}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/** Everything about one vowel form, as shown in lessons and the vowel table. */
export function VowelCard({ id }: { id: string }) {
  const f = vowelForm(id)
  const v = f.vowel
  const partner = v.pair ? VOWEL_BY_ID.get(v.pair) : undefined
  const isSilentO = !f.drillable
  return (
    <div className="card letter-card">
      <div className="row" style={{ justifyContent: 'center' }}>
        <LengthTag form={f} />
        {f.withFinal && <span className="badge">loppukonsonantin kanssa</span>}
      </div>
      <VowelFormText id={id} className="big" />
      <div className="row">
        <span className="vowel-rom">{v.rom}</span>
        <SpeakButton text={speakableVowel(v)} />
      </div>
      {isSilentO && <p>Kahden konsonantin välissä ei ole vokaalimerkkiä → luetaan lyhyellä o:lla.</p>}
      {f.withFinal && !isSilentO && (
        <p className="small muted">
          Sama äänne kuin <VowelFormText id={v.id} />, mutta tällä muodolla, kun perään tulee loppukonsonantti.
        </p>
      )}
      {v.note && (
        <p className="small muted">
          <RichText text={v.note} />
        </p>
      )}
      <div className="facts">
        <div className="fact">
          <div className="k">Pituus</div>
          <div className="v">{LEN_FI[v.len]}</div>
          <div className="h">{v.kind === 'special' ? 'erikoisvokaali' : v.kind === 'diphthong' ? 'liukuvokaali' : 'perusvokaali'}</div>
        </div>
        <div className="fact">
          <div className="k">{partner ? (v.len === 'short' ? 'Pitkä pari' : 'Lyhyt pari') : 'Pari'}</div>
          <div className="v">{partner ? <VowelFormText id={partner.id} /> : '—'}</div>
          <div className="h">{partner ? partner.rom : 'ei paria'}</div>
        </div>
      </div>
      <div className="stack" style={{ gap: 6, width: '100%', textAlign: 'left' }}>
        <div className="small muted">Esimerkkejä</div>
        <VowelExamples form={f} />
      </div>
    </div>
  )
}
