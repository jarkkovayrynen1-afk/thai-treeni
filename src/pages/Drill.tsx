import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { BackLink, ClassTag, Letter, ThaiText } from '../components/common'
import { consonant, CONSONANTS } from '../data/consonants'
import { FINAL_HINT, MNEMONIC, SOUND_HINT } from '../data/lessons'
import type { ConsonantClass } from '../data/types'
import { drillApplies, isCorrect, letterResults, makeQuestion, questionItem, type Answer, type Question } from '../drills/questions'
import { CLASS_FI, CLASS_SHAPE, DRILL_FI, FINAL_LABEL, initialLabel } from '../i18n/fi'
import { DRILLS, resolvePool } from '../progress'
import { href, navigate } from '../router'
import { getState, recordAnswer, recordRound, useAppState, type DrillId } from '../storage/store'

const ROUND_LENGTH = 20
const SOUND_EXTRA_SECONDS = 3

type Phase = 'asking' | 'feedback' | 'summary'

interface Result {
  q: Question
  answer: Answer | null
  correct: boolean
}

export function Drill({ drill, mode, poolSpec }: { drill: DrillId | 'mix'; mode: 'calm' | 'fast'; poolSpec: string | null }) {
  const settings = useAppState((s) => s.settings)
  // The pool is fixed for the round, even if a lesson gets marked done meanwhile.
  const pool = useMemo(() => resolvePool(poolSpec, getState().lessonsDone), [poolSpec])
  const drills = useMemo(() => (drill === 'mix' ? DRILLS : [drill]).filter((d) => drillApplies(d, pool)), [drill, pool])

  const [round, setRound] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [q, setQ] = useState<Question | null>(null)
  const [phase, setPhase] = useState<Phase>('asking')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const recent = useRef<string[]>([])
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const nextQuestion = useCallback(() => {
    clearTimers()
    const d = drills[Math.floor(Math.random() * drills.length)]
    const question = makeQuestion(d, { pool, stats: getState().stats, recent: recent.current, rng: Math.random })
    const keep = Math.min(2, pool.length - 1)
    recent.current = keep > 0 ? [...recent.current, questionItem(question)].slice(-keep) : []
    setQ(question)
    setAnswer(null)
    setPicked([])
    setPhase('asking')
  }, [drills, pool])

  useEffect(() => {
    if (drills.length) nextQuestion()
    return clearTimers
  }, [drills, nextQuestion, round])

  const finish = (all: Result[]) => {
    clearTimers()
    recordRound({ at: Date.now(), drill, mode, score: all.filter((r) => r.correct).length, total: all.length })
    setPhase('summary')
  }

  const submit = (a: Answer | null) => {
    if (!q || phase !== 'asking') return
    clearTimers()
    const correct = a !== null && isCorrect(q, a)
    const drillId: DrillId = q.kind
    for (const [letter, ok] of letterResults(q, a)) recordAnswer(drillId, letter, ok)
    const all = [...results, { q, answer: a, correct }]
    setResults(all)
    setAnswer(a)
    setPhase('feedback')
    const last = all.length >= ROUND_LENGTH
    const advance = () => (last ? finish(all) : nextQuestion())
    if (mode === 'fast') later(advance, correct ? 450 : 1500)
    else if (correct) later(advance, 800)
  }

  // Fast mode countdown: one timer per question. The effect event always sees the
  // latest round state, so a timeout never acts on stale results.
  const seconds = q ? settings.seconds + (q.kind === 'sound' ? SOUND_EXTRA_SECONDS : 0) : 0
  const onTimeout = useEffectEvent(() => submit(null))
  useEffect(() => {
    if (mode !== 'fast' || phase !== 'asking' || !q) return
    const t = window.setTimeout(onTimeout, seconds * 1000)
    return () => window.clearTimeout(t)
  }, [mode, phase, q, seconds])

  if (!drills.length) {
    return (
      <div className="page drill">
        <div className="topbar">
          <BackLink to="harjoittele" />
          <h1>{DRILL_FI[drill]}</h1>
        </div>
        <div className="card stack">
          <p>Tähän harjoitukseen ei ole vielä kirjaimia. Käy ensin läpi oppitunti.</p>
          <a className="btn primary" href={href('oppitunnit')}>
            Oppitunnit
          </a>
        </div>
      </div>
    )
  }

  if (phase === 'summary') {
    return (
      <Summary
        results={results}
        drill={drill}
        mode={mode}
        onAgain={() => {
          setResults([])
          recent.current = []
          setRound((r) => r + 1)
        }}
        onMissed={(letters) => navigate('harjoitus', { drill, mode: 'calm', pool: `letters:${letters.join(',')}` })}
      />
    )
  }

  if (!q) return null
  const correct = answer !== null && isCorrect(q, answer)
  const showClass = phase === 'feedback' || settings.colorInClassQuestions

  return (
    <div className="page drill">
      <div className="topbar">
        <BackLink to="harjoittele" label="Lopeta" />
        <div className="progress" aria-label={`Kysymys ${results.length + (phase === 'asking' ? 1 : 0)} / ${ROUND_LENGTH}`}>
          <div style={{ width: `${(100 * results.length) / ROUND_LENGTH}%` }} />
        </div>
        <span className="small muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {results.filter((r) => r.correct).length} / {results.length}
        </span>
      </div>
      {mode === 'fast' && (
        <div className="timer">
          {phase === 'asking' && <div key={results.length} className="timer-fill" style={{ animationDuration: `${seconds}s`, background: 'var(--muted)' }} />}
        </div>
      )}

      <div className={`prompt ${phase === 'feedback' ? (correct ? 'flash-ok' : 'flash-bad') : ''}`}>
        {q.kind === 'sound' ? (
          <>
            <div className="sound">{initialLabel(q.sound)}</div>
            <div className="ask">Mitkä kirjaimet alkavat tällä äänteellä? Valitse kaikki.</div>
          </>
        ) : (
          <>
            <Letter char={q.letter} className="big" hideClass={q.kind === 'class' && !showClass} />
            <div className="ask">{ASK[q.kind]}</div>
          </>
        )}
      </div>

      <Answers q={q} phase={phase} answer={answer} picked={picked} setPicked={setPicked} submit={submit} />

      {phase === 'feedback' && (
        <div className={`feedback ${correct ? 'ok' : 'bad'}`} role="status">
          {correct ? '✓ Oikein' : answer === null ? '⏱ Aika loppui' : '✗ Väärin'}
          <div className="explain">
            <Explanation q={q} />
          </div>
        </div>
      )}

      {phase === 'feedback' && mode === 'calm' && !correct && (
        <button
          type="button"
          className="btn primary block"
          onClick={() => (results.length >= ROUND_LENGTH ? finish(results) : nextQuestion())}
          autoFocus
        >
          Jatka
        </button>
      )}
    </div>
  )
}

const ASK: Record<Exclude<Question['kind'], 'sound'>, string> = {
  class: 'Mihin luokkaan kirjain kuuluu?',
  initial: 'Miltä kirjain kuulostaa tavun alussa?',
  final: 'Miltä kirjain kuulostaa tavun lopussa?',
}

const CLASS_BUTTONS: ConsonantClass[] = ['high', 'mid', 'low']

function Answers({
  q,
  phase,
  answer,
  picked,
  setPicked,
  submit,
}: {
  q: Question
  phase: Phase
  answer: Answer | null
  picked: string[]
  setPicked: (p: string[]) => void
  submit: (a: Answer | null) => void
}) {
  const locked = phase !== 'asking'
  const state = (value: string, isRight: boolean) => {
    if (!locked) return ''
    if (isRight) return 'right'
    return value === answer ? 'wrong' : 'dim'
  }
  const mark = (value: string, isRight: boolean) =>
    locked && (isRight || value === answer) ? <span className="mark">{isRight ? '✓' : '✗'}</span> : null

  switch (q.kind) {
    case 'class': {
      const right = consonant(q.letter).cls
      return (
        <div className="answers">
          {CLASS_BUTTONS.map((c) => (
            <button key={c} type="button" className={`answer class-btn ${c} ${state(c, c === right)}`} disabled={locked} onClick={() => submit(c)}>
              {CLASS_SHAPE[c]} {CLASS_FI[c][0].toUpperCase() + CLASS_FI[c].slice(1)}
              {mark(c, c === right)}
            </button>
          ))}
        </div>
      )
    }
    case 'initial': {
      const right = consonant(q.letter).initial
      return (
        <div className="answers two">
          {q.options.map((s) => (
            <button key={s || 'silent'} type="button" className={`answer ${state(s, s === right)}`} disabled={locked} onClick={() => submit(s)}>
              {initialLabel(s)}
              {mark(s, s === right)}
            </button>
          ))}
        </div>
      )
    }
    case 'final': {
      const right = consonant(q.letter).final
      return (
        <div className="answers four">
          {q.options.map((f) => (
            <button key={f} type="button" className={`answer ${state(f, f === right)}`} style={{ fontSize: '1.05rem' }} disabled={locked} onClick={() => submit(f)}>
              {FINAL_LABEL[f]}
              {mark(f, f === right)}
            </button>
          ))}
        </div>
      )
    }
    case 'sound': {
      const chosen = (answer as string[] | null) ?? []
      return (
        <div className="stack">
          <div className="answers four">
            {q.options.map((l) => {
              const isRight = q.correct.includes(l)
              const cls = !locked
                ? picked.includes(l)
                  ? 'selected'
                  : ''
                : isRight
                  ? chosen.includes(l)
                    ? 'right'
                    : 'right dim'
                  : chosen.includes(l)
                    ? 'wrong'
                    : 'dim'
              return (
                <button
                  key={l}
                  type="button"
                  className={`answer letter-opt ${cls}`}
                  aria-pressed={picked.includes(l)}
                  disabled={locked}
                  onClick={() => setPicked(picked.includes(l) ? picked.filter((x) => x !== l) : [...picked, l])}
                >
                  <Letter char={l} />
                  {locked && (isRight || chosen.includes(l)) && <span className="mark">{isRight ? '✓' : '✗'}</span>}
                </button>
              )
            })}
          </div>
          {!locked && (
            <button type="button" className="btn primary block" disabled={picked.length === 0} onClick={() => submit(picked)}>
              Tarkista
            </button>
          )}
        </div>
      )
    }
  }
}

function Explanation({ q }: { q: Question }) {
  if (q.kind === 'sound') {
    return (
      <span>
        <b>{initialLabel(q.sound)}</b> ({SOUND_HINT[q.sound]}):{' '}
        {q.correct.map((l) => (
          <Letter key={l} char={l} className="" />
        ))}
      </span>
    )
  }
  const c = consonant(q.letter)
  const name = <ThaiText text={`${c.char} ${c.name}`} />
  switch (q.kind) {
    case 'class':
      return (
        <span className="stack" style={{ gap: 6 }}>
          <span>
            {name} → <ClassTag cls={c.cls} letter={c.char} />
          </span>
          <ClassReason char={c.char} />
        </span>
      )
    case 'initial':
      return (
        <span>
          {name} → <b>{initialLabel(c.initial)}</b> · {c.initialNote ?? SOUND_HINT[c.initial]}
        </span>
      )
    case 'final':
      return (
        <span>
          {name} lopussa → <b>{FINAL_LABEL[c.final!]}</b> · {FINAL_HINT[c.final!]}
        </span>
      )
  }
}

/** Why a letter has its class: the mnemonic, or its high-class twin. */
export function ClassReason({ char }: { char: string }) {
  const c = consonant(char)
  if (c.cls === 'mid' || c.cls === 'high') {
    const m = MNEMONIC[c.cls]
    const inMnemonic = m.letters.includes(char)
    return (
      <span className="small">
        {inMnemonic ? 'Muistisääntö: ' : 'Sama äänne kuin muistisäännössä: '}
        <ThaiText text={m.thai} />
      </span>
    )
  }
  const twins = CONSONANTS.filter((x) => x.cls === 'high' && x.initial === c.initial && x.freq !== 'obsolete')
  return twins.length ? (
    <span className="small">
      Korkean luokan kaksonen: {twins.map((t) => <Letter key={t.char} char={t.char} />)} – sama äänne, eri luokka.
    </span>
  ) : (
    <span className="small">Yksinäinen – ei korkean luokan kaksosta. Ei muistisäännöissä → matala.</span>
  )
}

function Summary({
  results,
  drill,
  mode,
  onAgain,
  onMissed,
}: {
  results: Result[]
  drill: DrillId | 'mix'
  mode: 'calm' | 'fast'
  onAgain: () => void
  onMissed: (letters: string[]) => void
}) {
  const score = results.filter((r) => r.correct).length
  const missedLetters = [...new Set(results.filter((r) => !r.correct).flatMap((r) => letterResults(r.q, r.answer).filter(([, ok]) => !ok).map(([l]) => l)))]
  return (
    <div className="page drill">
      <div className="topbar">
        <BackLink to="harjoittele" />
        <h1>Kierros valmis</h1>
      </div>
      <div className="card stack" style={{ textAlign: 'center' }}>
        <div className="big-number">
          {score} / {results.length}
        </div>
        <div className="muted">
          {DRILL_FI[drill]} · {mode === 'fast' ? 'pikakierros' : 'rauhallinen'}
        </div>
      </div>
      {missedLetters.length > 0 ? (
        <div className="card stack">
          <h2>Harjoiteltavaa</h2>
          <div style={{ fontSize: '2.4rem', letterSpacing: '0.1em' }}>
            {missedLetters.map((l) => (
              <Letter key={l} char={l} />
            ))}
          </div>
          <button type="button" className="btn block" onClick={() => onMissed(missedLetters)}>
            Harjoittele vain näitä
          </button>
        </div>
      ) : (
        <div className="card">Kaikki oikein! 🎉</div>
      )}
      <button type="button" className="btn primary block" onClick={onAgain}>
        Uusi kierros
      </button>
      <a className="btn block" href={href('harjoittele')}>
        Valmis
      </a>
    </div>
  )
}
