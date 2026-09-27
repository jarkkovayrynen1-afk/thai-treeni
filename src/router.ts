import { useSyncExternalStore } from 'react'

// Hash routing (#/path?query) — GitHub Pages serves one static index.html, so the
// route must live after the #.

export interface Route {
  path: string[]
  query: URLSearchParams
}

function parse(hash: string): Route {
  const [p, q = ''] = hash.replace(/^#\/?/, '').split('?')
  return { path: p.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(q) }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return parse(hash)
}

export const href = (path: string, query?: Record<string, string>): string =>
  `#/${path}${query ? `?${new URLSearchParams(query)}` : ''}`

export function navigate(path: string, query?: Record<string, string>) {
  window.location.hash = href(path, query).slice(1)
}
