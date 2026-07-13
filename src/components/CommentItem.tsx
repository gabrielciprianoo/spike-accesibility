import type { Comment } from '../types'
import { useTextToSpeech } from '../hooks/useTextToSpeech'

type CommentItemProps = {
  comment: Comment
  ttsAvailable: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function CommentItem({ comment, ttsAvailable }: CommentItemProps) {
  const { speak } = useTextToSpeech()

  return (
    <li className="comment-item">
      <div className="comment-item__header">
        <span className="comment-item__author">{comment.author}</span>
        <div className="comment-item__meta">
          <span className="comment-item__date">{formatDate(comment.createdAt)}</span>
          <button
            type="button"
            className="comment-item__speaker"
            disabled={!ttsAvailable}
            onClick={() => speak(comment.text)}
            title={ttsAvailable ? 'Escuchar comentario' : 'Lectura en voz alta no disponible'}
            aria-label={ttsAvailable ? 'Escuchar comentario' : 'Lectura en voz alta no disponible'}
          >
            🔊
          </button>
        </div>
      </div>
      <p className="comment-item__text">{comment.text}</p>
    </li>
  )
}
