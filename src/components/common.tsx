import { consonant, CONSONANT_BY_CHAR } from '../data/consonants'
import type { ConsonantClass } from '../data/types'
import { CLASS_FI, CLASS_SHAPE, LOW_KIND_FI } from '../i18n/fi'
import { href, useRoute } from '../router'
import { speak, useThaiVoice } from '../speech/speak'

/**
 * A consonant in its class colour. `hideClass` shows it neutral — only used while a
 * question is asking for the class itself.
 */
export function Letter({ char, hideClass = false, className = '' }: { char: string; hideClass?: boolean; className?: string }) {
  const cls = consonant(char).cls
  return <span className={`th letter ${hideClass ? 'hidden-class' : cls} ${className}`}>{char}</span>
}

/** Thai text where every consonant is coloured by class (vowels and marks stay neutral). */
export function ThaiText({ text, hideClass = false, className = '' }: { text: string; hideClass?: boolean; className?: string }) {
  return (
    <span className={`th ${className}`}>
      {splitClusters(text).map((part, i) => {
        const c = CONSONANT_BY_CHAR.get(part[0])
        return c && !hideClass ? (
          <span key={i} className={`letter ${c.cls}`}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </span>
  )
}

/** Keeps each consonant together with the combining marks written on it. */
function splitClusters(text: string): string[] {
  const parts: string[] = []
  for (const ch of text) {
    if (/[ัิ-ฺ็-๎]/.test(ch) && parts.length) parts[parts.length - 1] += ch
    else parts.push(ch)
  }
  return parts
}

export function ClassTag({ cls, letter }: { cls: ConsonantClass; letter?: string }) {
  const kind = letter ? consonant(letter).lowKind : undefined
  return (
    <span className={`class-tag ${cls}`}>
      <span aria-hidden>{CLASS_SHAPE[cls]}</span>
      {CLASS_FI[cls]}
      {kind ? ` · ${LOW_KIND_FI[kind]}` : ''}
    </span>
  )
}

export function SpeakButton({ text, label = 'Kuuntele' }: { text: string; label?: string }) {
  const voice = useThaiVoice()
  if (!voice) return null
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} onClick={() => speak(text, voice)}>
      🔊
    </button>
  )
}

const TABS = [
  { path: '', label: 'Koti', ico: '⌂' },
  { path: 'oppitunnit', label: 'Opi', ico: 'ก' },
  { path: 'harjoittele', label: 'Harjoittele', ico: '◎' },
  { path: 'aakkoset', label: 'Aakkoset', ico: '▦' },
  { path: 'tilastot', label: 'Tilastot', ico: '▤' },
]

export function TabBar() {
  const { path } = useRoute()
  const current = path[0] === 'oppitunti' ? 'oppitunnit' : (path[0] ?? '')
  return (
    <div className="tabbar">
      <nav>
        {TABS.map((t) => (
          <a key={t.path} href={href(t.path)} aria-current={current === t.path ? 'page' : undefined}>
            <span className="ico th" aria-hidden>
              {t.ico}
            </span>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

export function BackLink({ to, label = 'Takaisin' }: { to: string; label?: string }) {
  return (
    <a className="icon-btn" href={href(to)} aria-label={label} title={label} style={{ textDecoration: 'none' }}>
      ←
    </a>
  )
}
