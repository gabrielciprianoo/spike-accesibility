import { useState } from 'react'
import type { Comment } from './types'
import { loadComments } from './lib/storage'

export default function App() {
  const [comments] = useState<Comment[]>(() => loadComments())

  return (
    <div>
      <h1>Comentarios</h1>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>{comment.author}</strong>: {comment.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
