import { useEffect, useRef, useState } from 'react'

const TARGET_LANG = 'es-MX'
const MAX_NETWORK_RETRIES = 2
const NETWORK_RETRY_DELAY_MS = 400

type SpeechRecognitionResultEvent = {
  resultIndex: number
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
}

type SpeechRecognitionErrorEvent = {
  error: string
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onspeechstart: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function useSpeechToText(onResult: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult
  const networkRetryCountRef = useRef(0)
  const retryingRef = useRef(false)

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor()
    if (!SpeechRecognitionCtor) {
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = TARGET_LANG
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        }
      }
      if (finalTranscript) {
        onResultRef.current(finalTranscript)
      }
    }

    recognition.onspeechstart = () => {
      networkRetryCountRef.current = 0
    }
    recognition.onend = () => {
      if (retryingRef.current) {
        retryingRef.current = false
        return
      }
      setIsListening(false)
    }
    recognition.onerror = (event) => {
      if (event.error === 'network' && networkRetryCountRef.current < MAX_NETWORK_RETRIES) {
        networkRetryCountRef.current += 1
        retryingRef.current = true
        window.setTimeout(() => {
          try {
            recognitionRef.current?.start()
          } catch {
            retryingRef.current = false
          }
        }, NETWORK_RETRY_DELAY_MS)
        return
      }
      retryingRef.current = false
      setError(event.error)
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [])

  const start = () => {
    if (!recognitionRef.current) {
      return
    }
    networkRetryCountRef.current = 0
    retryingRef.current = false
    setError(null)
    recognitionRef.current.start()
    setIsListening(true)
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  return { isListening, error, start, stop }
}
