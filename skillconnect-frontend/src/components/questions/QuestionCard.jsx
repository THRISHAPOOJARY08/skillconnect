import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAvatar } from '../../utils/avatar'
import { formatDateOnly } from '../../utils/date'

const DIFF_CLASS = { EASY: 'badge-easy', MEDIUM: 'badge-medium', HARD: 'badge-hard' }
const STATUS_CLASS = {
  PENDING:   'badge-pending',
  ANSWERED:  'badge-answered',
  EVALUATED: 'badge-evaluated',
  CLOSED:    'badge-closed',
}

export default function QuestionCard({ q, showReply = false, showEvaluate = false, onEvaluate }) {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const avatar = getAvatar(q.creatorAvatarPath, q.creatorUsername)

  return (
    <div className="sc-card hoverable mb-3 animate-fade-up">
      <div className="d-flex gap-3">
        <img src={avatar} alt="" className="avatar-circle" />
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
            <div>
              <span style={{ fontWeight: 700, color: 'var(--sc-text)' }}>{q.creatorFullName}</span>
              <span style={{ color: 'var(--sc-muted)', fontSize: '.8rem', marginLeft: '.4rem' }}>@{q.creatorUsername}</span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className={`${DIFF_CLASS[q.difficulty] || 'badge-pending'}`}
                style={{ borderRadius: 20, padding: '.15rem .65rem', fontSize: '.72rem', fontWeight: 700 }}>
                {q.difficulty}
              </span>
              <span className={`${STATUS_CLASS[q.status] || 'badge-pending'}`}
                style={{ borderRadius: 20, padding: '.15rem .65rem', fontSize: '.72rem', fontWeight: 700 }}>
                {q.status}
              </span>
            </div>
          </div>

          {/* Question title — use var(--sc-text) so it's visible in both light and dark mode */}
          <p style={{ fontWeight: 600, marginTop: '.6rem', marginBottom: '.5rem', color: 'var(--sc-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {q.title}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', fontSize: '.78rem', color: 'var(--sc-muted)', marginBottom: '.5rem' }}>
            <span className="topic-chip">📚 {q.topicName}</span>
            <span className="badge-medium" style={{ borderRadius: 20, padding: '.15rem .65rem', fontWeight: 600 }}>⭐ {q.maxPoints} pts</span>
            <span>🕒 {formatDateOnly(q.createdAt)}</span>
          </div>

          {/* Answer section */}
          {q.answer && (
            <div className="qcard-answer-box" style={{ marginTop: '.75rem', padding: '.9rem', borderRadius: 12 }}>
              <p style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: '.4rem', color: '#0d9488' }}>
                ✍️ Answered by @{q.answer.answererUsername}
              </p>
              <p style={{ fontSize: '.85rem', marginBottom: '.5rem', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--sc-text)' }}>{q.answer.content}</p>

              {q.answer.evaluation && (
                <div className="qcard-eval-box" style={{ padding: '.65rem .9rem', borderRadius: 8 }}>
                  <p style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: '.25rem', color: '#0d9488' }}>
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
