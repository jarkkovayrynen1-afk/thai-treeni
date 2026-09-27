import { useState } from 'react'
import { ClassTag, Letter } from '../components/common'
import { CLASS_ORDER, CONSONANTS } from '../data/consonants'
import { DRILL_FI } from '../i18n/fi'
import { DRILLS, lettersScore } from '../progress'
import { useAppState, type DrillId } from '../storage/store'

const pct = (ok: number, n: number) => (n ? Math.round((100 * ok) / n) : 0)

export function Stats() {
  const stats = useAppState((s) => s.stats)
  const rounds = useAppState((s) => s.rounds)
  const [filter, setFilter] = useState<DrillId | 'all'>('all')
  const drills = filter === 'all' ? DRILLS : [filter]

  const rows = CONSONANTS.map((c) => {
    const s = lettersScore(stats, [c.char], drills)
    const recent = drills.map((d) => stats[d][c.char]).filter(Boolean).sort((a, b) => b!.last - a!.last)[0]?.recent ?? ''
    return { c, ...s, miss: s.n - s.ok, recent }
  })
    .filter((r) => r.n > 0)
    // Most-missed first: lowest accuracy, then most misses.
    .sort((a, b) => a.ok / a.n - b.ok / b.n || b.miss - a.miss)

  return (
    <div className="page">
      <div className="topbar">
        <h1>Tilastot</h1>
      </div>

      <div className="chips" role="group" aria-label="Harjoitus">
        <button type="button" className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          Kaikki
        </button>
        {DRILLS.map((d) => (
          <button key={d} type="button" className="chip" aria-pressed={filter === d} onClick={() => setFilter(d)}>
            {DRILL_FI[d]}
          </button>
        ))}
      </div>

      <div className="stack">
        {CLASS_ORDER.map((cls) => {
          const s = lettersScore(
            stats,
            CONSONANTS.filter((c) => c.cls === cls).map((c) => c.char),
            drills,
          )
          return (
            <div key={cls} className="card stack" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <ClassTag cls={cls} />
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.n ? `${pct(s.ok, s.n)} %` : '–'}</span>
              </div>
              <div className="bar">
                <div style={{ width: `${pct(s.ok, s.n)}%`, background: `var(--${cls})` }} />
              </div>
              <div className="small muted">{s.n} vastausta</div>
            </div>
          )
        })}
      </div>

      <section className="card stack">
        <h2>Kirjaimet – eniten virheitä ensin</h2>
        {rows.length === 0 ? (
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
              {rows.map((r) => (
                <tr key={r.c.char}>
                  <td className="l">
                    <Letter char={r.c.char} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{pct(r.ok, r.n)} %</div>
                    <div className="bar" style={{ width: 72 }}>
                      <div style={{ width: `${pct(r.ok, r.n)}%`, background: `var(--${r.c.cls})` }} />
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

      {rounds.length > 0 && (
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
      )}
    </div>
  )
}
