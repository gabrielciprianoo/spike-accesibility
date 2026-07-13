import { useState } from 'react'
import type { Comment } from './types'
import { loadComments } from './lib/storage'
import CommentList from './components/CommentList'
import Composer from './components/Composer'
import { useSpeechSupport } from './hooks/useSpeechSupport'

export default function App() {
  const [comments] = useState<Comment[]>(() => loadComments())
  const { sttAvailable, ttsAvailable } = useSpeechSupport()

  return (
    <div className="app">
      <h1 className="app__title">Comentarios</h1>
      <Composer sttAvailable={sttAvailable} />
      <CommentList comments={comments} ttsAvailable={ttsAvailable} />
    </div>
  )
}
