import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, AlertCircle } from 'lucide-react'
import apiClient from '../../api/apiClient'
import { useActivityMonitor } from '../../hooks/useActivityMonitor'
import { getAvatar } from '../../utils/avatar'

export default function AnswerEditorPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [startTime]             = useState(Date.now())
  const textareaRef             = useRef(null)

  const { events, tabSwitches, copyCount, pasteCount } = useActivityMonitor(textareaRef)

  useEffect(() => {
    apiClient.get(`/questions/${id}`).then(r => setQuestion(r.data)).catch(() => navigate('/answer'))
  }, [id, navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!content.trim()) { setError('Answer cannot be empty'); return }
    setLoading(true)

    // Save activity logs
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const logEvents = [
      ...events,
      { eventType: 'TIME_SPENT', timestamp: new Date().toISOString(), metadata: `${timeSpent}s` }
    ]

    try {
      const { data: answer } = await apiClient.post(`/answers/${id}`, { content })
      // Post activity logs
      try {
        await apiClient.post(`/activity-logs/${answer.id}`, logEvents)
      } catch { /* best effort */ }
      navigate('/answer')
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed')
      setLoading(false)
    }
  }

  if (!question) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
  if (question.status !== 'PENDING') return (
    <div className="empty-state"><AlertCircle size={48} /><p>This question is no longer accepting answers.</p></div>
  )

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Activity monitoring notice */}
      <div className="alert alert-info d-flex gap-2 mb-4 py-2 small">
        <AlertCircle size={16} className="flex-shrink-0 mt-1" />
        <span>
          <strong>Transparency notice:</strong> Basic activity indicators (tab switches, copy/paste events, time spent)
          are recorded while you answer this question. This data is shown to the question creator as a neutral activity report.
        </span>
      </div>

      {/* Question display */}
      <div className="sc-card mb-4">
        <div className="d-flex gap-3 mb-3">
          <img src={getAvatar(question.creatorAvatarPath, question.creatorUsername)} alt="" className="avatar-circle" />
          <div>
            <span className="fw-semibold">{question.creatorFullName}</span>
            <span className="text-muted small ms-2">@{question.creatorUsername}</span>
          </div>
        </div>
        <h5 className="fw-bold mb-2" style={{ color:'var(--sc-navy)' }}>{question.title}</h5>
        <p className="text-muted small mb-3" style={{ whiteSpace:'pre-wrap' }}>{question.description}</p>
        <div className="d-flex gap-3 small text-muted">
          <span>📚 {question.topicName}</span>
          <span>⭐ {question.maxPoints} pts max</span>
        </div>
      </div>

      {/* Activity indicators */}
      <div className="d-flex gap-3 mb-3 small text-muted">
        <span>🔀 Tab switches: <strong>{tabSwitches}</strong></span>
        <span>📋 Copy: <strong>{copyCount}</strong></span>
        <span>📌 Paste: <strong>{pasteCount}</strong></span>
        <span>⏱ {Math.round((Date.now() - startTime) / 60000)}m elapsed</span>
      </div>

      {/* Answer form */}
      <div className="sc-card">
        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label fw-medium small">Your Answer</label>
          <textarea
            ref={textareaRef}
            className="form-control mb-3"
            rows={10}
            placeholder="Write your detailed answer here…"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          <div className="d-flex gap-2">
            <button type="submit" className="btn fw-semibold"
              style={{ background:'var(--sc-navy)', color:'#fff', borderRadius:8 }}
              disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <Send size={15} className="me-2" />}
              Submit Answer
            </button>
            <button type="button" className="btn btn-outline-secondary" style={{ borderRadius:8 }}
              onClick={() => navigate('/answer')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
