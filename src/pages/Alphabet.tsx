import { useState } from 'react'
import { ClassTag, Letter } from '../components/common'
import { FamilyTabs } from '../components/FamilyTabs'
import { useFamily } from '../useFamily'
import { LetterCard } from '../components/LetterCard'
import { VowelCard, VowelFormText } from '../components/VowelCard'
import { CONSONANTS } from '../data/consonants'
import type { Consonant } from '../data/types'
import { VOWEL_FORMS, type VowelForm } from '../data/vowels'

const SECTIONS: { title: string; pick: (c: Consonant) => boolean; cls: Consonant['cls'] }[] = [
  { title: 'Keskiluokka · 9', cls: 'mid', pick: (c) => c.cls === 'mid' },
  { title: 'Korkea luokka · 11', cls: 'high', pick: (c) => c.cls === 'high' },
  { title: 'Matala, parit · 14', cls: 'low', pick: (c) => c.lowKind === 'paired' },
  { title: 'Matala, yksinäiset · 10', cls: 'low', pick: (c) => c.lowKind === 'sonorant' },
]

const VOWEL_SECTIONS: { title: string; pick: (f: VowelForm) => boolean }[] = [
  { title: 'Lyhyet', pick: (f) => !f.withFinal && f.vowel.len === 'short' && f.vowel.kind !== 'special' },
  { title: 'Pitkät', pick: (f) => !f.withFinal && f.vowel.len === 'long' },
  { title: 'Erikoisvokaalit – aina eläviä', pick: (f) => f.vowel.kind === 'special' },
  { title: 'Muoto loppukonsonantin kanssa', pick: (f) => f.withFinal },
]

export function Alphabet() {
  const [open, setOpen] = useState<{ kind: 'letter' | 'vowel'; id: string } | null>(null)
  const family = useFamily('consonant')
  return (
    <div className="page">
      <div className="topbar">
        <h1>Aakkoset</h1>
      </div>
      <FamilyTabs page="aakkoset" current={family} families={['consonant', 'vowel']} />

      {family === 'consonant' ? (
        <>
          <p className="muted small">Kaikki 44 konsonanttia luokittain. Himmeät ovat harvinaisia tai vanhentuneita. Napauta kirjainta.</p>
          {SECTIONS.map((s) => (
            <section key={s.title} className="stack" style={{ gap: 8 }}>
              <h2 className="row" style={{ gap: 8 }}>
                <ClassTag cls={s.cls} /> <span className="small muted">{s.title}</span>
              </h2>
              <div className="grid-letters">
                {CONSONANTS.filter(s.pick).map((c) => (
                  <button key={c.char} type="button" className={c.freq === 'common' ? '' : 'rare'} onClick={() => setOpen({ kind: 'letter', id: c.char })} aria-label={`${c.char} ${c.name}`}>
                    <Letter char={c.char} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <>
          <p className="muted small">Merkki ◌ näyttää konsonantin paikan. Napauta vokaalia nähdäksesi esimerkit.</p>
          {VOWEL_SECTIONS.map((s) => (
            <section key={s.title} className="stack" style={{ gap: 8 }}>
              <h2 className="small muted">{s.title}</h2>
              <div className="grid-vowels">
                {VOWEL_FORMS.filter(s.pick).map((f) => (
                  <button key={f.id} type="button" onClick={() => setOpen({ kind: 'vowel', id: f.id })} aria-label={`${f.text} ${f.vowel.rom}`}>
                    <VowelFormText id={f.id} />
                    <span className="small muted">{f.drillable ? f.vowel.rom : 'o (näkymätön)'}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(null)}>
          <div className="sheet stack" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="icon-btn" aria-label="Sulje" onClick={() => setOpen(null)}>
                ✕
              </button>
            </div>
            {open.kind === 'letter' ? <LetterCard char={open.id} /> : <VowelCard id={open.id} />}
          </div>
        </div>
      )}
    </div>
  )
}
