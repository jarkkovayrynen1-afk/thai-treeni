import { useEffect } from 'react'
import { TabBar } from './components/common'
import { Alphabet } from './pages/Alphabet'
import { Drill } from './pages/Drill'
import { Home } from './pages/Home'
import { LessonPage } from './pages/Lesson'
import { Lessons } from './pages/Lessons'
import { Practice } from './pages/Practice'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'
import { useRoute } from './router'
import { DRILL_FI } from './i18n/fi'
import type { DrillParam } from './storage/store'

/** Every drill has a label, so the label table doubles as the list of valid drills. */
const isDrill = (d: string): d is DrillParam => d in DRILL_FI

export default function App() {
  const { path, query } = useRoute()
  const page = path[0] ?? ''
  const sub = path[1] ?? ''
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, sub])

  if (page === 'harjoitus') {
    const drill = query.get('drill') ?? 'mix'
    return (
      <Drill
        key={query.toString()}
        drill={isDrill(drill) ? drill : 'mix'}
        mode={query.get('mode') === 'fast' ? 'fast' : 'calm'}
        poolSpec={query.get('pool')}
      />
    )
  }

  return (
    <>
      {page === 'oppitunnit' ? (
        <Lessons />
      ) : page === 'oppitunti' ? (
        <LessonPage key={sub} id={sub} />
      ) : page === 'harjoittele' ? (
        <Practice />
      ) : page === 'tilastot' ? (
        <Stats />
      ) : page === 'aakkoset' ? (
        <Alphabet />
      ) : page === 'asetukset' ? (
        <Settings />
      ) : (
        <Home />
      )}
      <TabBar />
    </>
  )
}
