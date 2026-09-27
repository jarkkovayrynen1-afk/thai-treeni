import type { Family } from './progress'
import { useRoute } from './router'

/** URL names of the three families (?osa=vokaalit). */
export const FAMILY_SLUG: Record<Family, string> = { consonant: 'konsonantit', vowel: 'vokaalit', syllable: 'tavut' }

/** The family chosen in the URL, or the given default. */
export function useFamily(fallback: Family): Family {
  const { query } = useRoute()
  const slug = query.get('osa')
  return (Object.keys(FAMILY_SLUG) as Family[]).find((f) => FAMILY_SLUG[f] === slug) ?? fallback
}
