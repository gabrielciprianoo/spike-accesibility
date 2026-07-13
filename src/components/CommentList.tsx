import type { Comment } from '../types'
import CommentItem from './CommentItem'

type CommentListProps = {
  comments: Comment[]
  ttsAvailable: boolean
}

export default function CommentList({ comments, ttsAvailable }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="comment-list__empty">Aún no hay comentarios.</p>
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} ttsAvailable={ttsAvailable} />
      ))}
    </ul>
  )
}
