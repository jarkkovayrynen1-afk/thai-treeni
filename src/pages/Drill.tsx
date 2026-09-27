import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from 'react'
import { BackLink, ClassTag, Letter, SpeakButton, ThaiText } from '../components/common'
import { LengthTag, VowelExamples, VowelFormText } from '../components/VowelCard'
import { consonant, CONSONANTS, spokenName } from '../data/consonants'
import { FINAL_HINT, MNEMONIC, SOUND_HINT } from '../data/lessons'
import type { ConsonantClass, Liveness, VowelLength } from '../data/types'
import { speakableVowel, VOWEL_BY_ID, vowelForm } from '../data/vowels'
import { drillApplies, isCorrect, itemResults, makeQuestion, questionItem, wordOf, type Answer, type Question } from '../drills/questions'
import { liveDeadReason } from '../engine/liveDead'
import { CLASS_FI, CLASS_SHAPE, DRILL_FI, FINAL_LABEL, initialLabel, LEN_FI, LIVE_FI } from '../i18n/fi'
import { drillsOf, familyOf, POOL_PREFIX, resolvePool, type Family } from '../progress'
import { href, navigate } from '../router'
import { speak, useThaiVoice } from '../speech/speak'
import { getState, recordAnswer, recordRound, useAppState, type DrillId, type DrillParam } from '../storage/store'

const ROUND_LENGTH = 20
const SOUND_EXTRA_SECONDS = 3
/** Fast mode: how long the answer stays on screen before the next question. */
const FAST_SHOW_RIGHT_MS = 900
const FAST_SHOW_WRONG_MS = 2200

type Phase = 'asking' | 'feedback' | 'summary'

interface Result {
  q: Question
  answer: Answer | null
  /** Right AND without listening first — only these count. */
  correct: boolean
  hinted: boolean
}

/** What 🔊 reads for a question. */
function speechFor(q: Question): string {
  switch (q.kind) {
    case 'sound':
      return `${q.correct[0]}อ`
    case 'vowelSound':
    case 'vowelLength':
      return speakableVowel(vowelForm(q.form).vowel)
    case 'liveDead':
      return q.word
    default:
      return spokenName(consonant(q.letter))
  }
}

/** Listening before answering gives the answer away, except in sound questions. */
const listeningIsHint = (q: Question) => q.kind !== 'sound'

const EMPTY_TEXT: Record<Family, string> = {
  consonant: 'Tähän harjoitukseen ei ole vielä kirjaimia. Käy ensin läpi oppitunti.',
  vowel: 'Tähän harjoitukseen ei ole vielä vokaaleja. Käy ensin läpi vokaalioppitunti.',
  syllable: 'Käy ensin läpi oppitunti ”Elävä ja kuollut tavu”.',
}

export function Drill({ drill, mode, poolSpec }: { drill: DrillParam; mode: 'calm' | 'fast'; poolSpec: string | null }) {
  const settings = useAppState((s) => s.settings)
  const family = familyOf(drill)
  // The pool is fixed for the round, even if a lesson gets marked done meanwhile.
  const pool = useMemo(() => resolvePool(poolSpec, getState().lessonsDone, family), [poolSpec, family])
  const drills = useMemo(() => drillsOf(drill).filter((d) => drillApplies(d, pool)), [drill, pool])

  const [round, setRound] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [q, setQ] = useState<Question | null>(null)
  const [phase, setPhase] = useState<Phase>('asking')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [hinted, setHinted] = useState(false)
  const voice = useThaiVoice()
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
    setHinted(false)
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
    const right = a !== null && isCorrect(q, a)
    // A hinted answer still teaches, but the item is treated as not known yet.
    const correct = right && !hinted
    const drillId: DrillId = q.kind
    for (const [item, ok] of itemResults(q, a)) recordAnswer(drillId, item, ok && !hinted)
    const all = [...results, { q, answer: a, correct, hinted }]
    setResults(all)
    setAnswer(a)
    setPhase('feedback')
    if (mode === 'fast') {
      const last = all.length >= ROUND_LENGTH
      later(() => (last ? finish(all) : nextQuestion()), right ? FAST_SHOW_RIGHT_MS : FAST_SHOW_WRONG_MS)
    } else if (voice && settings.speakAfterAnswer) {
      speak(speechFor(q), voice)
    }
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
          <p>{EMPTY_TEXT[family]}</p>
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
        family={family}
        mode={mode}
        onAgain={() => {
          setResults([])
          recent.current = []
          setRound((r) => r + 1)
        }}
        onMissed={(items) => navigate('harjoitus', { drill, mode: 'calm', pool: `${POOL_PREFIX[family]}:${items.join(',')}` })}
      />
    )
  }

  if (!q) return null
  const correct = answer !== null && isCorrect(q, answer)
  const hintable = phase === 'asking' && listeningIsHint(q)
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
        <PromptItem q={q} hideClass={q.kind === 'class' && !showClass} />
        <div className="ask">{ASK[q.kind]}</div>
        <SpeakButton text={speechFor(q)} showLabel label={hintable ? 'Kuuntele (vihje)' : 'Kuuntele'} onSpeak={() => hintable && setHinted(true)} />
      </div>

      <Answers q={q} phase={phase} answer={answer} picked={picked} setPicked={setPicked} submit={submit} />

      {phase === 'feedback' && (
        <div className={`feedback ${correct ? 'ok' : 'bad'}`} role="status">
          {correct ? '✓ Oikein' : answer === null ? '⏱ Aika loppui' : '✗ Väärin'}
          {correct && hinted && ' – vihjeen avulla, joten tämä tulee pian uudestaan'}
          <div className="explain">
            <Explanation q={q} />
          </div>
        </div>
      )}

      {phase === 'feedback' && mode === 'calm' && (
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

const ASK: Record<Question['kind'], string> = {
  class: 'Mihin luokkaan kirjain kuuluu?',
  initial: 'Miltä kirjain kuulostaa tavun alussa?',
  final: 'Miltä kirjain kuulostaa tavun lopussa?',
  sound: 'Mitkä kirjaimet alkavat tällä äänteellä? Valitse kaikki.',
  vowelSound: 'Miltä vokaali kuulostaa?',
  vowelLength: 'Onko vokaali lyhyt vai pitkä?',
  liveDead: 'Onko tavu elävä vai kuollut?',
}

function PromptItem({ q, hideClass }: { q: Question; hideClass: boolean }) {
  switch (q.kind) {
    case 'sound':
      return <div className="sound">{initialLabel(q.sound)}</div>
    case 'vowelSound':
    case 'vowelLength':
      return <VowelFormText id={q.form} className="big" />
    case 'liveDead':
      return <ThaiText text={q.word} className="word-big" />
    default:
      return <Letter char={q.letter} className="big" hideClass={hideClass} />
  }
}

const CLASS_BUTTONS: ConsonantClass[] = ['high', 'mid', 'low']
const LENGTH_BUTTONS: VowelLength[] = ['short', 'long']
const LIVE_BUTTONS: Liveness[] = ['live', 'dead']
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

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
  /** A row of plain answer buttons. */
  const buttons = (values: readonly string[], label: (v: string) => ReactNode, layout: string, extra = '') => (
    <div className={`answers ${layout}`}>
      {values.map((v) => {
        const isRight = isCorrect(q, v)
        return (
          <button key={v || 'silent'} type="button" className={`answer ${extra} ${state(v, isRight)}`} disabled={locked} onClick={() => submit(v)}>
            {label(v)}
            {mark(v, isRight)}
          </button>
        )
      })}
    </div>
  )

  switch (q.kind) {
    case 'class': {
      const right = consonant(q.letter).cls
      return (
        <div className="answers">
          {CLASS_BUTTONS.map((c) => (
            <button key={c} type="button" className={`answer class-btn ${c} ${state(c, c === right)}`} disabled={locked} onClick={() => submit(c)}>
              {CLASS_SHAPE[c]} {capitalize(CLASS_FI[c])}
              {mark(c, c === right)}
            </button>
          ))}
        </div>
      )
    }
    case 'initial':
      return buttons(q.options, initialLabel, 'two')
    case 'final':
      return (
        buttons(q.options, (f) => FINAL_LABEL[f as keyof typeof FINAL_LABEL], 'four', 'compact')
      )
    case 'vowelSound':
      return buttons(q.options, (s) => <span className="rom">{s}</span>, 'two')
    case 'vowelLength':
      return buttons(LENGTH_BUTTONS, (l) => capitalize(LEN_FI[l as VowelLength]), 'two')
    case 'liveDead':
      return buttons(LIVE_BUTTONS, (l) => capitalize(LIVE_FI[l as Liveness]), 'two')
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
  switch (q.kind) {
    case 'sound':
      return (
        <span>
          <b>{initialLabel(q.sound)}</b> ({SOUND_HINT[q.sound]}):{' '}
          {q.correct.map((l) => (
            <Letter key={l} char={l} />
          ))}
        </span>
      )
    case 'vowelSound':
    case 'vowelLength':
      return <VowelExplanation form={q.form} />
    case 'liveDead':
      return <LiveDeadExplanation thai={q.word} />
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

function VowelExplanation({ form }: { form: string }) {
  const f = vowelForm(form)
  const partner = f.vowel.pair ? VOWEL_BY_ID.get(f.vowel.pair) : undefined
  return (
    <span className="stack" style={{ gap: 6 }}>
      <span>
        <VowelFormText id={form} /> = <b className="rom">{f.vowel.rom}</b> · <LengthTag form={f} />
        {partner && (
          <span className="small">
            {' '}
            · pari <VowelFormText id={partner.id} /> <span className="rom">{partner.rom}</span>
          </span>
        )}
      </span>
      <VowelExamples form={f} limit={2} />
    </span>
  )
}

/** Why a syllable is live or dead — the one-line version of the lesson. */
export function LiveDeadExplanation({ thai }: { thai: string }) {
  const w = wordOf(thai)
  const r = liveDeadReason(w)
  const verdict = <b>{LIVE_FI[r.live]}</b>
  let why: ReactNode
  switch (r.kind) {
    case 'stop':
      why = (
        <>
          Loppukonsonantti <Letter char={r.final} /> ääntyy <b>{FINAL_LABEL[r.coda]}</b> – katkeava loppu →{' '}
        </>
      )
      break
    case 'sonorant':
    case 'glide':
      why = (
        <>
          Loppukonsonantti <Letter char={r.final} /> ääntyy <b>{FINAL_LABEL[r.coda]}</b> – soiva loppu →{' '}
        </>
      )
      break
    case 'special':
      why = (
        <>
          <VowelFormText id={r.vowel === 'ai' ? (thai.startsWith('ใ') ? 'ai-muan' : 'ai-malai') : r.vowel} /> päättyy{' '}
          {r.vowel === 'am' ? 'm' : r.vowel === 'ai' ? 'i' : 'o'}-ääneen →{' '}
        </>
      )
      break
    case 'open':
      why = <>Ei loppukonsonanttia ja vokaali on {LEN_FI[r.len]} → </>
  }
  return (
    <span className="stack" style={{ gap: 4 }}>
      <span>
        <ThaiText text={thai} /> {w.rom} · {w.fi}
      </span>
      <span>
        {why}
        {verdict}
      </span>
      {w.mark && <span className="small muted">Sävymerkki ei vaikuta siihen, onko tavu elävä vai kuollut.</span>}
    </span>
  )
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

/** One item in a summary list, drawn the way its family is drawn everywhere else. */
function ItemView({ item, family }: { item: string; family: Family }) {
  if (family === 'consonant') return <Letter char={item} />
  if (family === 'vowel') return <VowelFormText id={item} />
  return <ThaiText text={item} />
}

function Summary({
  results,
  drill,
  family,
  mode,
  onAgain,
  onMissed,
}: {
  results: Result[]
  drill: DrillParam
  family: Family
  mode: 'calm' | 'fast'
  onAgain: () => void
  onMissed: (items: string[]) => void
}) {
  const score = results.filter((r) => r.correct).length
  const missed = [
    ...new Set(
      results
        .filter((r) => !r.correct)
        .flatMap((r) => (r.hinted ? [questionItem(r.q)] : itemResults(r.q, r.answer).filter(([, ok]) => !ok).map(([item]) => item))),
    ),
  ]
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
      {missed.length > 0 ? (
        <div className="card stack">
          <h2>Harjoiteltavaa</h2>
          <div className="row" style={{ flexWrap: 'wrap', gap: '4px 14px', fontSize: family === 'consonant' ? '2.4rem' : '1.8rem' }}>
            {missed.map((item) => (
              <ItemView key={item} item={item} family={family} />
            ))}
          </div>
          <button type="button" className="btn block" onClick={() => onMissed(missed)}>
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
