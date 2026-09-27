import { useState } from 'react'
import { ClassTag, Letter } from '../components/common'
import { LetterCard } from '../components/LetterCard'
import { CONSONANTS } from '../data/consonants'
import type { Consonant } from '../data/types'

const SECTIONS: { title: string; pick: (c: Consonant) => boolean; cls: Consonant['cls'] }[] = [
  { title: 'Keskiluokka · 9', cls: 'mid', pick: (c) => c.cls === 'mid' },
  { title: 'Korkea luokka · 11', cls: 'high', pick: (c) => c.cls === 'high' },
  { title: 'Matala, parit · 14', cls: 'low', pick: (c) => c.lowKind === 'paired' },
  { title: 'Matala, yksinäiset · 10', cls: 'low', pick: (c) => c.lowKind === 'sonorant' },
]

export function Alphabet() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="page">
      <div className="topbar">
        <h1>Aakkoset</h1>
      </div>
      <p className="muted small">Kaikki 44 konsonanttia luokittain. Himmeät ovat harvinaisia tai vanhentuneita. Napauta kirjainta.</p>
      {SECTIONS.map((s) => (
        <section key={s.title} className="stack" style={{ gap: 8 }}>
          <h2 className="row" style={{ gap: 8 }}>
            <ClassTag cls={s.cls} /> <span className="small muted">{s.title}</span>
          </h2>
          <div className="grid-letters">
            {CONSONANTS.filter(s.pick).map((c) => (
              <button key={c.char} type="button" className={c.freq === 'common' ? '' : 'rare'} onClick={() => setOpen(c.char)} aria-label={`${c.char} ${c.name}`}>
                <Letter char={c.char} />
              </button>
            ))}
          </div>
        </section>
      ))}
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(null)}>
          <div className="sheet stack" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="icon-btn" aria-label="Sulje" onClick={() => setOpen(null)}>
                ✕
              </button>
            </div>
            <LetterCard char={open} />
          </div>
        </div>
      )}
    </div>
  )
}
