import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import apiClient from '../../api/apiClient'
import { useAuth } from '../../context/AuthContext'
import { useActivityMonitor } from '../../hooks/useActivityMonitor'
import { getAvatar } from '../../utils/avatar'
import { formatDate } from '../../utils/date'

const DIFF_COLORS = { EASY: '#10b981', MEDIUM: '#f59e0b', HARD: '#ef4444' }

function ChatList({ questions, selected, onSelect }) {
  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--sc-navy)' }}>
          Questions for You
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--sc-muted)', marginTop: '.2rem' }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="chat-list-items">
        {questions.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--sc-muted)' }}>
            <MessageSquare size={32} style={{ opacity: .3, marginBottom: '.75rem' }} />
            <p style={{ fontSize: '.85rem', margin: 0 }}>No questions yet</p>
          </div>
        ) : questions.map(q => (
          <div key={q.id} className={`chat-item${selected?.id === q.id ? ' active' : ''}`}
            onClick={() => onSelect(q)}>
            <img src={getAvatar(q.creatorAvatarPath, q.creatorUsername)} alt=""
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e2e8f0' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="chat-item-title">{q.title}</div>
              <div className="chat-item-meta">
                <span style={{ color: DIFF_COLORS[q.difficulty], fontWeight: 600 }}>{q.difficulty}</span>
                {' · '}{q.topicName}{' · '}{q.maxPoints} pts
              </div>
              <div className="chat-item-meta" style={{ marginTop: '.15rem' }}>
                @{q.creatorUsername}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {q.status === 'PENDING'
                ? <div className="chat-unread-dot" />
                : <CheckCircle size={14} color="#10b981" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatWindow({ question, onAnswerSubmitted }) {
  const { user } = useAuth()
  const [content, setContent]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [startTime]               = useState(Date.now())
  const textareaRef               = useRef(null)
  const messagesEndRef            = useRef(null)

  const { events, tabSwitches, copyCount, pasteCount } = useActivityMonitor(textareaRef)

  useEffect(() => {
    setContent(''); setError(''); setSubmitted(false)
  }, [question?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [question, submitted])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!content.trim()) { setError('Answer cannot be empty'); return }
    setLoading(true)
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    try {
      const { data: answer } = await apiClient.post(`/answers/${question.id}`, { content })
      try {
        await apiClient.post(`/activity-logs/${answer.id}`, [
          ...events,
          { eventType: 'TIME_SPENT', timestamp: new Date().toISOString(), metadata: `${timeSpent}s` }
        ])
      } catch { /* best effort */ }
      setSubmitted(true)
      onAnswerSubmitted(question.id)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (!question) {
    return (
      <div className="chat-window">
        <div className="chat-empty">
          <MessageSquare size={48} style={{ opacity: .2 }} />
          <p style={{ margin: 0, fontSize: '.9rem' }}>Select a question to start answering</p>
        </div>
      </div>
    )
  }

  const alreadyAnswered = question.status !== 'PENDING'

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <img src={getAvatar(question.creatorAvatarPath, question.creatorUsername)} alt=""
          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{question.creatorFullName}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--sc-muted)' }}>@{question.creatorUsername}</div>
        </div>
        <div className="ms-auto d-flex gap-2 align-items-center">
          <span style={{
            background: `${DIFF_COLORS[question.difficulty]}20`,
            color: DIFF_COLORS[question.difficulty],
            borderRadius: 20, padding: '.2rem .75rem', fontSize: '.75rem', fontWeight: 700
          }}>{question.difficulty}</span>
          <span className="topic-chip">📚 {question.topicName}</span>
          <span className="badge-medium" style={{ borderRadius: 20, padding: '.2rem .75rem', fontSize: '.75rem', fontWeight: 700 }}>
            ⭐ {question.maxPoints} pts
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Monitoring notice */}
        <div className="monitor-notice" style={{
          borderRadius: 10, padding: '.65rem 1rem',
          fontSize: '.78rem',
          display: 'flex', gap: '.5rem', alignItems: 'flex-start'
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Activity indicators (tab switches, copy/paste, time spent) are recorded while answering.</span>
        </div>

        {/* Question bubble */}
        <div className="chat-bubble-wrap">
          <img src={getAvatar(question.creatorAvatarPath, question.creatorUsername)} alt=""
            style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }} />
          <div>
            <div className="chat-bubble question">
              <div className="bubble-sender">{question.creatorFullName}</div>
              {question.title}
              <div className="bubble-meta">
                <span>📚 {question.topicName}</span>
                <span>⭐ Max {question.maxPoints} pts</span>
              </div>
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--sc-muted)', marginTop: '.3rem', paddingLeft: '.5rem' }}>
              {formatDate(question.createdAt)}
            </div>
          </div>
        </div>

        {/* Already answered / submitted state */}
        {(alreadyAnswered || submitted) && (
          <div className="chat-bubble-wrap right">
            <img src={getAvatar(user?.avatarPath, user?.username)} alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }} />
            <div>
              <div className="chat-bubble answer">
                <div className="bubble-sender" style={{ opacity: .8 }}>{user?.fullName} (You)</div>
                {submitted ? content : 'Answer already submitted.'}
                <div className="bubble-meta">
                  <span>✓ Submitted</span>
                  {question.status === 'EVALUATED' && <span>⭐ Evaluated</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!alreadyAnswered && !submitted ? (
        <div className="chat-input-area">
          {/* Activity indicators */}
          <div style={{ display: 'flex', gap: '.75rem', marginBottom: '.6rem', fontSize: '.72rem', color: 'var(--sc-muted)' }}>
            <span>🔀 Switches: <strong>{tabSwitches}</strong></span>
            <span>📋 Copy: <strong>{copyCount}</strong></span>
            <span>📌 Paste: <strong>{pasteCount}</strong></span>
            <span>⏱ {Math.round((Date.now() - startTime) / 60000)}m</span>
          </div>
          {error && (
            <div style={{ background: '#fef2f2', borderRadius: 8, padding: '.5rem .75rem', marginBottom: '.6rem', color: '#b91c1c', fontSize: '.8rem' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                className="form-control"
                rows={3}
                placeholder="Write your answer here…"
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-sc-primary"
                style={{ flexShrink: 0, padding: '.7rem 1.2rem', borderRadius: 12 }}
                disabled={loading || !content.trim()}>
                {loading
                  ? <span className="spinner-border spinner-border-sm" />
                  : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{
          padding: '1rem 1.5rem', background: '#f0fdf4',
          borderTop: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '.75rem'
        }}>
          <CheckCircle size={18} color="#10b981" />
          <span style={{ fontSize: '.875rem', color: '#065f46', fontWeight: 600 }}>
            {question.status === 'EVALUATED'
              ? 'This answer has been evaluated.'
              : 'Answer submitted successfully!'}
          </span>
        </div>
      )}
    </div>
  )
}

export default function AnswerQuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [selected, setSelected]   = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    apiClient.get('/questions/received')
      .then(r => { setQuestions(r.data); if (r.data.length > 0) setSelected(r.data[0]) })
      .finally(() => setLoading(false))
  }, [])

  const handleAnswerSubmitted = (questionId) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status: 'ANSWERED' } : q))
    setSelected(prev => prev?.id === questionId ? { ...prev, status: 'ANSWERED' } : prev)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner-border text-primary" />
    </div>
  )

  return (
    <div>
      <h4 className="sc-page-title">Answer Questions</h4>
      <div className="chat-layout">
        <ChatList questions={questions} selected={selected} onSelect={setSelected} />
        <ChatWindow question={selected} onAnswerSubmitted={handleAnswerSubmitted} />
      </div>
    </div>
  )
}
