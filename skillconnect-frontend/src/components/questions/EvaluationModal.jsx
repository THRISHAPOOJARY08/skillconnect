import { useState } from 'react'
import { X, Star } from 'lucide-react'
import apiClient from '../../api/apiClient'

export default function EvaluationModal({ question, onClose, onDone }) {
  const answer = question.answer
  const [pts, setPts]         = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (pts > question.maxPoints) { setError(`Max points is ${question.maxPoints}`); return }
    setLoading(true)
    try {
      await apiClient.post(`/evaluations/${answer.id}`, { awardedPoints: parseInt(pts), feedback })
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Evaluation failed')
      setLoading(false)
    }
  }

  const pct = question.maxPoints > 0 ? Math.round(pts / question.maxPoints * 100) : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5000, backdropFilter: 'blur(6px)', padding: '1rem'
    }}>
      <div className="animate-fade-up" style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        boxShadow: '0 25px 60px rgba(0,0,0,.3)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <Star size={20} color="#fbbf24" />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Evaluate Answer</span>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: '.3rem .5rem', cursor: 'pointer', color: '#fff' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Question */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.4rem' }}>Question</div>
            <p style={{ fontWeight: 600, color: 'var(--sc-navy)', margin: '0 0 .5rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{question.title}</p>
            <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: 20, padding: '.15rem .65rem', fontSize: '.72rem', fontWeight: 700 }}>
              ⭐ Max {question.maxPoints} pts
            </span>
          </div>

          {/* Answer */}
          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.4rem' }}>
              ✍️ Answer by @{answer?.answererUsername}
            </div>
            <p style={{ fontSize: '.875rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{answer?.content}</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.6rem .9rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '.83rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem' }}>
                Points to Award (max: {question.maxPoints})
              </label>
              <input type="number" className="form-control" min={0} max={question.maxPoints}
                value={pts} onChange={e => setPts(e.target.value)} required />
              {/* Progress bar */}
              <div style={{ marginTop: '.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--sc-muted)', marginBottom: '.3rem' }}>
                  <span>{pts} / {question.maxPoints} pts</span>
                  <span style={{ fontWeight: 700, color: pct >= 80 ? '#15803d' : pct >= 50 ? '#d97706' : '#dc2626' }}>{pct}%</span>
                </div>
                <div className="sc-progress-bar">
                  <div className="fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem' }}>
                Feedback (optional)
              </label>
              <textarea className="form-control" rows={3}
                placeholder="Great explanation! Could also mention…"
                value={feedback} onChange={e => setFeedback(e.target.value)} />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-sc-primary flex-grow-1" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <Star size={15} className="me-2" />}
                Submit Evaluation
              </button>
              <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: 10 }} onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
