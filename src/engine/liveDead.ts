import type { FinalSound, Liveness, VowelLength, Word } from '../data/types'
import { analyzeSpelling } from './spelling'

/** Why a syllable is live or dead, in the terms the lesson teaches. */
export type LiveDeadReason =
  | { live: Liveness; kind: 'stop' | 'sonorant' | 'glide'; final: string; coda: FinalSound }
  | { live: 'live'; kind: 'special'; vowel: 'am' | 'ai' | 'ao' }
  | { live: Liveness; kind: 'open'; len: VowelLength }

export function liveDeadReason(word: Word): LiveDeadReason {
  const sp = analyzeSpelling(word.thai)
  if (sp.pre === 'ใ' || sp.pre === 'ไ') return { live: 'live', kind: 'special', vowel: 'ai' }
  if (sp.coda === 'm' && !sp.final) return { live: 'live', kind: 'special', vowel: 'am' }
  if (sp.coda === 'w' && !sp.final) return { live: 'live', kind: 'special', vowel: 'ao' }
  if (sp.coda && sp.final) {
    const kind = sp.coda === 'k' || sp.coda === 't' || sp.coda === 'p' ? 'stop' : sp.coda === 'y' || sp.coda === 'w' ? 'glide' : 'sonorant'
    return { live: kind === 'stop' ? 'dead' : 'live', kind, final: sp.final, coda: sp.coda }
  }
  // Open syllable: only the (pronounced) vowel length decides.
  return { live: word.len === 'long' ? 'live' : 'dead', kind: 'open', len: word.len }
}
