import { useSyncExternalStore } from 'react'
import { updateStat, type ItemStat } from '../engine/srs'

// All progress lives in one localStorage entry. Every access is wrapped in try/catch:
// private mode or blocked storage must never break the app, it just won't remember.

export type DrillId = 'class' | 'initial' | 'final' | 'sound'

export interface RoundRecord {
  at: number
  drill: DrillId | 'mix'
  mode: 'calm' | 'fast'
  score: number
  total: number
}

export interface Settings {
  /** Seconds per question in fast mode. */
  seconds: number
  /** Show the class color even when the question asks for the class. */
  colorInClassQuestions: boolean
}

export interface AppState {
  v: 1
  lessonsDone: string[]
  stats: Record<DrillId, Record<string, ItemStat>>
  rounds: RoundRecord[]
  settings: Settings
  /** Words the user has checked (Phase 3). */
  verified: string[]
  /** Times the tone table was opened (Phase 3). */
  tableOpens: number[]
}

const KEY = 'thai-treeni:v1'
const MAX_ROUNDS = 200

export const initialState = (): AppState => ({
  v: 1,
  lessonsDone: [],
  stats: { class: {}, initial: {}, final: {}, sound: {} },
  rounds: [],
  settings: { seconds: 5, colorInClassQuestions: false },
  verified: [],
  tableOpens: [],
})

/** Merge stored data over defaults so older saves gain new fields. */
export function hydrate(raw: unknown): AppState {
  const base = initialState()
  if (!raw || typeof raw !== 'object' || (raw as { v?: unknown }).v !== 1) return base
  const r = raw as Partial<AppState>
  return {
    ...base,
    ...r,
    stats: { ...base.stats, ...r.stats },
    settings: { ...base.settings, ...r.settings },
  }
}

function load(): AppState {
  try {
    const text = localStorage.getItem(KEY)
    return text ? hydrate(JSON.parse(text)) : initialState()
  } catch {
    return initialState()
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: keep working from memory.
  }
}

export function getState(): AppState {
  return state
}

export function setState(update: (s: AppState) => AppState) {
  state = update(state)
  save()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppState<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state))
}

// ── Actions

export function markLessonDone(id: string) {
  setState((s) => (s.lessonsDone.includes(id) ? s : { ...s, lessonsDone: [...s.lessonsDone, id] }))
}

export function recordAnswer(drill: DrillId, item: string, correct: boolean) {
  const now = Date.now()
  setState((s) => ({
    ...s,
    stats: { ...s.stats, [drill]: { ...s.stats[drill], [item]: updateStat(s.stats[drill][item], correct, now) } },
  }))
}

export function recordRound(round: RoundRecord) {
  setState((s) => ({ ...s, rounds: [...s.rounds, round].slice(-MAX_ROUNDS) }))
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function resetProgress() {
  setState((s) => ({ ...initialState(), settings: s.settings }))
}

export function exportJson(): string {
  return JSON.stringify(state, null, 1)
}

export function importJson(text: string): boolean {
  try {
    const parsed = JSON.parse(text)
    if (parsed?.v !== 1) return false
    setState(() => hydrate(parsed))
    return true
  } catch {
    return false
  }
}
