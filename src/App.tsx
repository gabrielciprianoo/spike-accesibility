import { useState } from 'react'
import type { Comment } from './types'
import { loadComments, saveComments } from './lib/storage'
import CommentList from './components/CommentList'
import Composer from './components/Composer'
import { useSpeechSupport } from './hooks/useSpeechSupport'

export default function App() {
  const [comments, setComments] = useState<Comment[]>(() => loadComments())
  const { sttAvailable, ttsAvailable } = useSpeechSupport()

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: 'Yo',
      text,
      createdAt: new Date().toISOString(),
    }
    const updated = [...comments, newComment]
    setComments(updated)
    saveComments(updated)
  }

  return (
    <div className="app">
      <h1 className="app__title">Comentarios</h1>
      <Composer sttAvailable={sttAvailable} onSubmit={handleAddComment} />
      <CommentList comments={comments} ttsAvailable={ttsAvailable} />
    </div>
  )
}
