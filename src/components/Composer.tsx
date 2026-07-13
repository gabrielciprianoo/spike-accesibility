import { useState } from 'react'
import { useSpeechToText } from '../hooks/useSpeechToText'

type ComposerProps = {
  sttAvailable: boolean
  onSubmit: (text: string) => void
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Permiso de micrófono denegado.',
  'service-not-allowed': 'Permiso de micrófono denegado.',
  'no-speech': 'No se detectó voz, intenta de nuevo.',
  'audio-capture': 'No se encontró un micrófono.',
  'language-not-supported': 'El idioma es-MX no está disponible en este dispositivo.',
  aborted: 'Dictado cancelado.',
  network: 'Error de red durante el dictado.',
}

export default function Composer({ sttAvailable, onSubmit }: ComposerProps) {
  const [text, setText] = useState('')

  const { isListening, error, start, stop } = useSpeechToText((transcript) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  })

  const handleMicClick = () => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div className="composer">
      <textarea
        className="composer__textarea"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Escribe un comentario..."
        rows={3}
      />
      <div className="composer__actions">
        <button
          type="button"
          className={isListening ? 'composer__mic composer__mic--listening' : 'composer__mic'}
          disabled={!sttAvailable}
          onClick={handleMicClick}
          title={sttAvailable ? 'Dictar comentario' : 'Dictado por voz no disponible'}
          aria-label={sttAvailable ? 'Dictar comentario' : 'Dictado por voz no disponible'}
        >
          🎤
        </button>
        {isListening && <span className="composer__listening-label">Escuchando...</span>}
        {!isListening && error && (
          <span className="composer__error">
            {ERROR_MESSAGES[error] ?? `Error de dictado: ${error}`}{' '}
            <button type="button" className="composer__retry" onClick={start}>
              Reintentar
            </button>
          </span>
        )}
        <button
          type="button"
          className="composer__submit"
          disabled={!text.trim()}
          onClick={handleSubmit}
        >
          Comentar
        </button>
      </div>
    </div>
  )
}
