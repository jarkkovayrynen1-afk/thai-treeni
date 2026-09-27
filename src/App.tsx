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
import type { DrillId } from './storage/store'

const DRILL_IDS = ['class', 'initial', 'final', 'sound', 'mix']

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
        drill={(DRILL_IDS.includes(drill) ? drill : 'mix') as DrillId | 'mix'}
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
