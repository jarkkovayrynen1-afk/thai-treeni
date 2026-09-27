import type { Family } from '../progress'
import { href } from '../router'
import { FAMILY_SLUG } from '../useFamily'

const FAMILY_LABEL: Record<Family, string> = { consonant: 'Konsonantit', vowel: 'Vokaalit', syllable: 'Tavut' }

/** Konsonantit / Vokaalit / Tavut switcher; the choice lives in the URL so Back works. */
export function FamilyTabs({ page, current, families = ['consonant', 'vowel', 'syllable'] }: { page: string; current: Family; families?: Family[] }) {
  return (
    <div className="chips" role="tablist">
      {families.map((f) => (
        <a key={f} role="tab" className="chip" aria-selected={f === current} aria-pressed={f === current} href={href(page, { osa: FAMILY_SLUG[f] })} style={{ textDecoration: 'none' }}>
          {FAMILY_LABEL[f]}
        </a>
      ))}
    </div>
  )
}
