import { useEffect, useState, type ReactNode } from 'react'
import { BackLink, ClassTag, Letter, RichText, ThaiText } from '../components/common'
import { FAMILY_SLUG } from '../useFamily'
import { LetterCard } from '../components/LetterCard'
import { VowelCard, VowelFormText } from '../components/VowelCard'
import { CONSONANTS, FINAL_SOUNDS } from '../data/consonants'
import { INTROS, LESSON_BY_ID, MNEMONIC, VOWEL_LESSON_BY_ID, type ClassIntro } from '../data/lessons'
import { FINAL_LABEL } from '../i18n/fi'
import { ALL_LESSONS, FAMILY_MIX, type AnyLesson } from '../progress'
import { href } from '../router'
import { markLessonDone } from '../storage/store'
import { LiveDeadExplanation } from './Drill'

/** Steps through `pages`, then a "done" page that unlocks the lesson's items for drills. */
function LessonShell({ lesson, pages, doneItems }: { lesson: AnyLesson; pages: ReactNode[]; doneItems: ReactNode }) {
  const [step, setStep] = useState(0)
  const steps = pages.length + 1
  const isDone = step === steps - 1
  useEffect(() => {
    if (isDone) markLessonDone(lesson.id)
  }, [lesson.id, isDone])

  const next = ALL_LESSONS[ALL_LESSONS.indexOf(lesson) + 1]
  const drill = FAMILY_MIX[lesson.family]
  const pool = lesson.family === 'syllable' ? 'done' : `lesson:${lesson.id}`

  return (
    <div className="page">
      <div className="topbar">
        <BackLink to={`oppitunnit?osa=${FAMILY_SLUG[lesson.family]}`} />
        <h1>{lesson.title}</h1>
      </div>
      <div className="dots" aria-hidden>
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className={i === step ? 'on' : ''} />
        ))}
      </div>

      {isDone ? (
        <div className="card stack" style={{ textAlign: 'center' }}>
          <h2>Oppitunti käyty!</h2>
          {doneItems}
          <p className="muted">Nämä ovat nyt mukana harjoituksissa. Harjoittele heti, niin ne jäävät mieleen.</p>
          <a className="btn primary block" href={href('harjoitus', { drill, mode: 'calm', pool })}>
            Harjoittele näitä
          </a>
          {next && (
            <a className="btn block" href={href(`oppitunti/${next.id}`)}>
              Seuraava: {next.title}
            </a>
          )}
        </div>
      ) : (
        pages[step]
      )}

      <div className="row" style={{ marginTop: 'auto' }}>
        <button type="button" className="btn" style={{ flex: 1 }} disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Edellinen
        </button>
        {!isDone && (
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={() => setStep(step + 1)}>
            {step === steps - 2 ? 'Valmis' : 'Seuraava →'}
          </button>
        )}
      </div>
    </div>
  )
}

function IntroCard({ intro, tag }: { intro: ClassIntro; tag?: ReactNode }) {
  return (
    <div className="card stack">
      <h2>
        {tag} <RichText text={intro.heading} />
      </h2>
      {intro.paragraphs.map((p) => (
        <p key={p}>
          <RichText text={p} />
        </p>
      ))}
      {intro.classLine && (
        <p>
          <RichText text={intro.classLine} /> {tag}
        </p>
      )}
    </div>
  )
}

export function LessonPage({ id }: { id: string }) {
  const lesson = ALL_LESSONS.find((l) => l.id === id)
  if (!lesson) {
    return (
      <div className="page">
        <p>Oppituntia ei löytynyt.</p>
        <a href={href('oppitunnit')}>Oppitunnit</a>
      </div>
    )
  }
  if (lesson.family === 'vowel') return <VowelLesson lesson={lesson} />
  if (lesson.family === 'syllable') return <LiveDeadLesson lesson={lesson} />
  return <ConsonantLesson lesson={lesson} />
}

function ConsonantLesson({ lesson }: { lesson: AnyLesson }) {
  const l = LESSON_BY_ID.get(lesson.id)!
  const intro = INTROS[l.id]
  const mnemonic = l.cls === 'mid' || l.cls === 'high' ? MNEMONIC[l.cls] : undefined
  const pages = [
    ...(intro
      ? [
          <div key="intro" className="stack">
            <IntroCard intro={intro} tag={<ClassTag cls={l.cls} />} />
            {mnemonic && (
              <div className="mnemonic" style={{ borderColor: `var(--${l.cls})` }}>
                <ThaiText text={mnemonic.thai} className="mn-thai" />
                <div className="small muted">{mnemonic.fi}</div>
              </div>
            )}
          </div>,
        ]
      : []),
    ...l.letters.map((ch) => <LetterCard key={ch} char={ch} />),
  ]
  const doneItems = (
    <div style={{ fontSize: '2.6rem', letterSpacing: '0.1em' }}>
      {l.letters.map((ch) => (
        <Letter key={ch} char={ch} />
      ))}
    </div>
  )
  return <LessonShell lesson={lesson} pages={pages} doneItems={doneItems} />
}

function VowelLesson({ lesson }: { lesson: AnyLesson }) {
  const l = VOWEL_LESSON_BY_ID.get(lesson.id)!
  const pages = [...(l.intro ? [<IntroCard key="intro" intro={l.intro} />] : []), ...l.forms.map((f) => <VowelCard key={f} id={f} />)]
  const doneItems = (
    <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '4px 16px', fontSize: '2rem' }}>
      {l.forms.map((f) => (
        <VowelFormText key={f} id={f} />
      ))}
    </div>
  )
  return <LessonShell lesson={lesson} pages={pages} doneItems={doneItems} />
}

const STOPS = new Set(['k', 't', 'p'])

function LiveDeadLesson({ lesson }: { lesson: AnyLesson }) {
  const examples = (words: string[]) => (
    <div className="stack" style={{ gap: 10 }}>
      {words.map((w) => (
        <div key={w} className="rule">
          <LiveDeadExplanation thai={w} />
        </div>
      ))}
    </div>
  )
  const pages = [
    <div key="why" className="card stack">
      <h2>
        <RichText text="Elävä ja kuollut tavu · คำเป็น คำตาย" />
      </h2>
      <p>Tavun tooni (sävelkulku: keski, matala, laskeva, korkea tai nouseva) ratkeaa kolmesta asiasta: alkukonsonantin luokka, toonimerkki – ja onko tavu elävä vai kuollut.</p>
      <p>Elävä tavu loppuu ääneen, jota voi venyttää. Kuollut tavu loppuu lyhyeen vokaaliin tai katkeaa k-, t- tai p-ääneen.</p>
      <div className="rule live">
        <b>Elävä</b>
        <br />
        pitkä vokaali lopussa, tai loppuäänne -ng, -n, -m, -i tai -o
      </div>
      <div className="rule dead">
        <b>Kuollut</b>
        <br />
        lyhyt vokaali lopussa, tai loppuäänne -k, -t tai -p
      </div>
    </div>,
    <div key="live" className="card stack">
      <h2>Elävä tavu</h2>
      <p className="small muted">Pitkä vokaali tai soiva loppu.</p>
      {examples(['ตา', 'กิน', 'แมว', 'ลม'])}
    </div>,
    <div key="dead" className="card stack">
      <h2>Kuollut tavu</h2>
      <p className="small muted">Lyhyt vokaali tai katkeava loppu -k, -t, -p.</p>
      {examples(['จะ', 'ปาก', 'เด็ก', 'รถ'])}
    </div>,
    <div key="special" className="card stack">
      <h2>Erikoisvokaalit ovat aina eläviä</h2>
      <p>
        <VowelFormText id="am" />, <VowelFormText id="ai-malai" />, <VowelFormText id="ai-muan" /> ja <VowelFormText id="ao" /> ovat lyhyitä, mutta päättyvät m-, i- tai
        o-ääneen – siksi tavu on elävä.
      </p>
      {examples(['ดำ', 'ใจ', 'เอา'])}
      <p className="small muted">Toonimerkki (่ ้ ๊ ๋) ei vaikuta siihen, onko tavu elävä vai kuollut.</p>
    </div>,
    <div key="finals" className="card stack">
      <h2>Loppukonsonanttien kahdeksan ryhmää</h2>
      <p className="small muted">Lopussa monta kirjainta ääntyy samoin. Ylimmät kolme ryhmää tekevät tavusta kuolleen.</p>
      <div className="final-groups">
        {FINAL_SOUNDS.map((f) => (
          <FinalGroup key={f} final={f} dead={STOPS.has(f)} />
        ))}
      </div>
    </div>,
  ]
  const doneItems = (
    <p>
      <b>Elävä:</b> pitkä vokaali tai -ng -n -m -i -o
      <br />
      <b>Kuollut:</b> lyhyt vokaali tai -k -t -p
    </p>
  )
  return <LessonShell lesson={lesson} pages={pages} doneItems={doneItems} />
}

function FinalGroup({ final, dead }: { final: (typeof FINAL_SOUNDS)[number]; dead: boolean }) {
  const letters = CONSONANTS.filter((c) => c.final === final && c.freq !== 'obsolete')
  return (
    <>
      <span>
        <b>{FINAL_LABEL[final]}</b> <span className="small" style={{ color: dead ? 'var(--muted)' : 'var(--ok)' }}>{dead ? 'kuollut' : 'elävä'}</span>
      </span>
      <span className="g">
        {letters.map((c) => (
          <span key={c.char} style={{ opacity: c.freq === 'common' ? 1 : 0.5 }}>
            <Letter char={c.char} />{' '}
          </span>
        ))}
      </span>
    </>
  )
}
