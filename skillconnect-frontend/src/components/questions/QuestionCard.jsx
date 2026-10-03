import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAvatar } from '../../utils/avatar'

const DIFF_COLORS = { EASY: '#10b981', MEDIUM: '#f59e0b', HARD: '#ef4444' }
const STATUS_COLORS = {
  PENDING:   { bg: '#f1f5f9', color: '#475569' },
  ANSWERED:  { bg: '#dbeafe', color: '#1d4ed8' },
  EVALUATED: { bg: '#dcfce7', color: '#15803d' },
  CLOSED:    { bg: '#e5e7eb', color: '#374151' },
}

export default function QuestionCard({ q, showReply = false, showEvaluate = false, onEvaluate }) {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const avatar = getAvatar(q.creatorAvatarPath, q.creatorUsername)
  const sc = STATUS_COLORS[q.status] || STATUS_COLORS.PENDING
  const dc = DIFF_COLORS[q.difficulty] || '#64748b'

  return (
    <div className="sc-card hoverable mb-3 animate-fade-up">
      <div className="d-flex gap-3">
        <img src={avatar} alt="" className="avatar-circle" />
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
            <div>
              <span style={{ fontWeight: 700 }}>{q.creatorFullName}</span>
              <span style={{ color: 'var(--sc-muted)', fontSize: '.8rem', marginLeft: '.4rem' }}>@{q.creatorUsername}</span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span style={{ background: `${dc}20`, color: dc, borderRadius: 20, padding: '.15rem .65rem', fontSize: '.72rem', fontWeight: 700 }}>
                {q.difficulty}
              </span>
              <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '.15rem .65rem', fontSize: '.72rem', fontWeight: 700 }}>
                {q.status}
              </span>
            </div>
          </div>

          <p style={{ fontWeight: 600, marginTop: '.6rem', marginBottom: '.5rem', color: 'var(--sc-navy)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {q.title}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', fontSize: '.78rem', color: 'var(--sc-muted)', marginBottom: '.5rem' }}>
            <span className="topic-chip">📚 {q.topicName}</span>
            <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: 20, padding: '.15rem .65rem', fontWeight: 600 }}>⭐ {q.maxPoints} pts</span>
            <span>🕒 {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}</span>
          </div>

          {/* Answer section */}
          {q.answer && (
            <div style={{ marginTop: '.75rem', padding: '.9rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: '.4rem', color: '#0d9488' }}>
                ✍️ Answered by @{q.answer.answererUsername}
              </p>
              <p style={{ fontSize: '.85rem', marginBottom: '.5rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{q.answer.content}</p>

              {q.answer.evaluation && (
                <div style={{ padding: '.65rem .9rem', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: '.25rem', color: '#15803d' }}>
                    ⭐ {q.answer.evaluation.awardedPoints}/{q.answer.evaluation.maxPoints} pts
                  </p>
                  {q.answer.evaluation.feedback && (
                    <p style={{ fontSize: '.8rem', color: 'var(--sc-muted)', margin: 0 }}>💬 {q.answer.evaluation.feedback}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="d-flex gap-2 mt-3">
            {showEvaluate && q.status === 'ANSWERED' && q.creatorUsername === user?.username && (
              <button className="btn btn-sm btn-sc-primary"
                onClick={() => onEvaluate(q)}>
                ⭐ Evaluate Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
