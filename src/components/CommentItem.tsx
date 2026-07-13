import type { Comment } from '../types'

type CommentItemProps = {
  comment: Comment
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <li className="comment-item">
      <div className="comment-item__header">
        <span className="comment-item__author">{comment.author}</span>
        <span className="comment-item__date">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="comment-item__text">{comment.text}</p>
    </li>
  )
}
