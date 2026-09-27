import { useEffect, useState } from 'react'

// Optional "kuuntele" using the device's own Thai voice (Web Speech API).
// If the device has no Thai voice, the button simply isn't shown.

const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined

function findThaiVoice(): SpeechSynthesisVoice | null {
  try {
    return synth?.getVoices().find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('th')) ?? null
  } catch {
    return null
  }
}

/** The Thai voice, or null. Voices load asynchronously on most browsers. */
export function useThaiVoice(): SpeechSynthesisVoice | null {
  const [voice, setVoice] = useState(findThaiVoice)
  useEffect(() => {
    if (!synth) return
    const update = () => setVoice(findThaiVoice())
    synth.addEventListener('voiceschanged', update)
    update()
    return () => synth.removeEventListener('voiceschanged', update)
  }, [])
  return voice
}

export function speak(text: string, voice: SpeechSynthesisVoice) {
  if (!synth) return
  try {
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = 'th-TH'
    u.rate = 0.8
    synth.speak(u)
  } catch {
    // Speech is a nice-to-have; ignore failures.
  }
}
