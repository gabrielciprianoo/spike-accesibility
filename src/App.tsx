import { useState } from 'react'
import type { Comment } from './types'
import { loadComments } from './lib/storage'
import CommentList from './components/CommentList'

export default function App() {
  const [comments] = useState<Comment[]>(() => loadComments())

  return (
    <div className="app">
      <h1 className="app__title">Comentarios</h1>
      <CommentList comments={comments} />
    </div>
  )
}
