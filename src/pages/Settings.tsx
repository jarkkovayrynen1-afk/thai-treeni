import { useState } from 'react'
import { BackLink } from '../components/common'
import { exportJson, importJson, resetProgress, updateSettings, useAppState } from '../storage/store'

const SECONDS = [3, 5, 8]

export function Settings() {
  const settings = useAppState((s) => s.settings)
  const [backup, setBackup] = useState('')
  const [message, setMessage] = useState('')

  const download = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `thai-treeni-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="page">
      <div className="topbar">
        <BackLink to="" />
        <h1>Asetukset</h1>
      </div>

      <section className="card stack">
        <h2>Pikakierroksen aikaraja</h2>
        <div className="chips" role="group" aria-label="Sekuntia kysymykseen">
          {SECONDS.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={settings.seconds === s} onClick={() => updateSettings({ seconds: s })}>
              {s} s
            </button>
          ))}
        </div>
        <p className="small muted">”Äänne → kirjaimet” -kysymyksissä saat 3 sekuntia lisää.</p>
      </section>

      <section className="card stack">
        <label className="switch">
          <span>
            <b>Näytä luokan väri myös luokkakysymyksissä</b>
            <br />
            <span className="small muted">Pois päältä kirjain on kysymyksessä harmaa, jotta luokka pitää oikeasti muistaa. Väri tulee näkyviin heti vastauksen jälkeen.</span>
          </span>
          <input type="checkbox" checked={settings.colorInClassQuestions} onChange={(e) => updateSettings({ colorInClassQuestions: e.target.checked })} />
        </label>
      </section>

      <section className="card stack">
        <h2>Varmuuskopio</h2>
        <p className="small muted">Edistyminen tallentuu vain tähän selaimeen. Ota välillä varmuuskopio, jos vaihdat puhelinta tai tyhjennät selaimen tiedot.</p>
        <button type="button" className="btn" onClick={download}>
          Lataa varmuuskopio (.json)
        </button>
        <textarea value={backup} onChange={(e) => setBackup(e.target.value)} placeholder="Palauta: liitä varmuuskopion sisältö tähän" aria-label="Varmuuskopion sisältö" />
        <button
          type="button"
          className="btn"
          disabled={!backup.trim()}
          onClick={() => setMessage(importJson(backup) ? 'Palautettu ✓' : 'Tiedosto ei kelpaa.')}
        >
          Palauta varmuuskopiosta
        </button>
        {message && <p className="small">{message}</p>}
      </section>

      <section className="card stack">
        <h2>Aloita alusta</h2>
        <button
          type="button"
          className="btn"
          style={{ color: 'var(--bad)' }}
          onClick={() => {
            if (window.confirm('Poistetaanko kaikki edistyminen ja tilastot? Tätä ei voi perua.')) resetProgress()
          }}
        >
          Nollaa edistyminen
        </button>
      </section>

      <p className="small muted" style={{ textAlign: 'center' }}>
        Thai-treeni · romanisointi Paiboon · fontti Sarabun (OFL)
      </p>
    </div>
  )
}
