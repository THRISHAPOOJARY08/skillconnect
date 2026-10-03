import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import QuestionCard from '../../components/questions/QuestionCard'
import EvaluationModal from '../../components/questions/EvaluationModal'
import apiClient from '../../api/apiClient'

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [evalQ, setEvalQ]         = useState(null) // question being evaluated

  const load = () => {
    setLoading(true)
    apiClient.get('/questions/sent')
      .then(r => setQuestions(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color:'var(--sc-navy)' }}>My Questions</h4>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : questions.length === 0 ? (
        <div className="empty-state"><BookOpen size={48} /><p>You haven't asked any questions yet.<br /><a href="/ask">Ask your first question →</a></p></div>
      ) : (
        questions.map(q => (
          <QuestionCard key={q.id} q={q} showEvaluate onEvaluate={q => setEvalQ(q)} />
        ))
      )}

      {evalQ && (
        <EvaluationModal
          question={evalQ}
          onClose={() => setEvalQ(null)}
          onDone={() => { setEvalQ(null); load() }}
        />
      )}
    </div>
  )
}
