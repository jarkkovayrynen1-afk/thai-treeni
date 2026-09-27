import { useState, type ReactNode } from 'react'
import { ClassTag, Letter, ThaiText } from '../components/common'
import { FamilyTabs } from '../components/FamilyTabs'
import { useFamily } from '../useFamily'
import { VowelFormText } from '../components/VowelCard'
import { CLASS_ORDER, CONSONANTS } from '../data/consonants'
import { VOWEL_FORMS } from '../data/vowels'
import { WORDS } from '../data/words'
import type { ItemStat } from '../engine/srs'
import { DRILL_FI, LEN_FI, LIVE_FI } from '../i18n/fi'
import { FAMILY_DRILLS, familyOf, itemsScore } from '../progress'
import { useAppState, type DrillId } from '../storage/store'

const pct = (ok: number, n: number) => (n ? Math.round((100 * ok) / n) : 0)

interface Row {
  key: string
  view: ReactNode
  n: number
  ok: number
  recent: string
  color: string
}

export function Stats() {
  const stats = useAppState((s) => s.stats)
  const rounds = useAppState((s) => s.rounds)
  const family = useFamily('consonant')
  const [filter, setFilter] = useState<DrillId | 'all'>('all')
  const familyDrills = FAMILY_DRILLS[family]
  const drills = filter !== 'all' && familyDrills.includes(filter) ? [filter] : familyDrills

  /** Accuracy and latest results of one item across the selected drills. */
  const row = (key: string, view: ReactNode, color: string): Row => {
    const s = itemsScore(stats, [key], drills)
    const latest = drills
      .map((d) => stats[d][key])
      .filter((x): x is ItemStat => !!x)
      .sort((a, b) => b.last - a.last)[0]
    return { key, view, ...s, recent: latest?.recent ?? '', color }
  }

  const rows =
    family === 'consonant'
      ? CONSONANTS.map((c) => row(c.char, <Letter char={c.char} />, `var(--${c.cls})`))
      : family === 'vowel'
        ? VOWEL_FORMS.filter((f) => f.drillable).map((f) => row(f.id, <VowelFormText id={f.id} />, 'var(--ink)'))
        : WORDS.map((w) => row(w.thai, <ThaiText text={w.thai} />, w.live === 'live' ? 'var(--ok)' : 'var(--muted)'))

  // Summary bars: classes, vowel lengths, or live vs dead.
  const groups: { label: ReactNode; items: string[]; color: string }[] =
    family === 'consonant'
      ? CLASS_ORDER.map((cls) => ({ label: <ClassTag cls={cls} />, items: CONSONANTS.filter((c) => c.cls === cls).map((c) => c.char), color: `var(--${cls})` }))
      : family === 'vowel'
        ? (['short', 'long'] as const).map((len) => ({
            label: <b>{LEN_FI[len]} vokaali</b>,
            items: VOWEL_FORMS.filter((f) => f.vowel.len === len).map((f) => f.id),
            color: 'var(--ink)',
          }))
        : (['live', 'dead'] as const).map((live) => ({
            label: <b>{LIVE_FI[live]} tavu</b>,
            items: WORDS.filter((w) => w.live === live).map((w) => w.thai),
            color: live === 'live' ? 'var(--ok)' : 'var(--muted)',
          }))

  return (
    <div className="page">
      <div className="topbar">
        <h1>Tilastot</h1>
      </div>
      <FamilyTabs page="tilastot" current={family} />

      {familyDrills.length > 1 && (
        <div className="chips" role="group" aria-label="Harjoitus">
          <button type="button" className="chip" aria-pressed={drills.length > 1} onClick={() => setFilter('all')}>
            Kaikki
          </button>
          {familyDrills.map((d) => (
            <button key={d} type="button" className="chip" aria-pressed={drills.length === 1 && drills[0] === d} onClick={() => setFilter(d)}>
              {DRILL_FI[d]}
            </button>
          ))}
        </div>
      )}

      <div className="stack">
        {groups.map((g, i) => {
          const s = itemsScore(stats, g.items, drills)
          return (
            <div key={i} className="card stack" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                {g.label}
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.n ? `${pct(s.ok, s.n)} %` : '–'}</span>
              </div>
              <div className="bar">
                <div style={{ width: `${pct(s.ok, s.n)}%`, background: g.color }} />
              </div>
              <div className="small muted">
                {s.n} {s.n === 1 ? 'vastaus' : 'vastausta'}
              </div>
            </div>
          )
        })}
      </div>

      <ItemTable rows={rows} title={family === 'consonant' ? 'Kirjaimet' : family === 'vowel' ? 'Vokaalit' : 'Tavut'} />

      <RecentRounds rounds={rounds.filter((r) => familyOf(r.drill) === family)} />
    </div>
  )
}

function ItemTable({ rows, title }: { rows: Row[]; title: string }) {
  const answered = rows
    .filter((r) => r.n > 0)
    // Most-missed first: lowest accuracy, then most misses.
    .sort((a, b) => a.ok / a.n - b.ok / b.n || b.n - b.ok - (a.n - a.ok))
  return (
    <section className="card stack">
      <h2>{title} – eniten virheitä ensin</h2>
      {answered.length === 0 ? (
        <p className="muted">Ei vielä vastauksia. Tee harjoituskierros, niin tilastot ilmestyvät tänne.</p>
      ) : (
        <table className="stat-table">
          <thead>
            <tr>
              <th />
              <th>Oikein</th>
              <th>Vastauksia</th>
              <th>Viimeksi</th>
            </tr>
          </thead>
          <tbody>
            {answered.map((r) => (
              <tr key={r.key}>
                <td className="l" style={{ whiteSpace: 'nowrap' }}>
                  {r.view}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{pct(r.ok, r.n)} %</div>
                  <div className="bar" style={{ width: 72 }}>
                    <div style={{ width: `${pct(r.ok, r.n)}%`, background: r.color }} />
                  </div>
                </td>
                <td>{r.n}</td>
                <td aria-label="Viimeisimmät vastaukset" style={{ letterSpacing: 1, fontSize: '0.75rem' }}>
                  {[...r.recent.slice(-5)].map((x, i) => (
                    <span key={i} style={{ color: x === '1' ? 'var(--ok)' : 'var(--bad)' }}>
                      {x === '1' ? '●' : '✕'}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function RecentRounds({ rounds }: { rounds: { at: number; drill: keyof typeof DRILL_FI; mode: string; score: number; total: number }[] }) {
  if (!rounds.length) return null
  return (
    <section className="card stack">
      <h2>Viimeisimmät kierrokset</h2>
      {[...rounds]
        .reverse()
        .slice(0, 10)
        .map((r) => (
          <div key={r.at} className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small">
              {new Date(r.at).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })} · {DRILL_FI[r.drill]}
              {r.mode === 'fast' ? ' · pika' : ''}
            </span>
            <b style={{ fontVariantNumeric: 'tabular-nums' }}>
              {r.score}/{r.total}
            </b>
          </div>
        ))}
    </section>
  )
}
