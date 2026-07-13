import type { Comment } from '../types'
import CommentItem from './CommentItem'

type CommentListProps = {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="comment-list__empty">Aún no hay comentarios.</p>
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </ul>
  )
}
