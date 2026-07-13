import { useEffect, useState } from 'react'
import type { SpeechSupport } from '../types'

function hasSpeechRecognition(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

function hasEsMxVoice(voices: SpeechSynthesisVoice[]): boolean {
  return voices.some((voice) => voice.lang === 'es-MX')
}

export function useSpeechSupport(): SpeechSupport {
  const [support, setSupport] = useState<SpeechSupport>({
    sttAvailable: hasSpeechRecognition(),
    ttsAvailable: false,
  })

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setSupport((prev) => ({ ...prev, ttsAvailable: hasEsMxVoice(voices) }))
    }

    checkVoices()
    window.speechSynthesis.addEventListener('voiceschanged', checkVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', checkVoices)
  }, [])

  return support
}
