import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState({ users: [], questions: [], groups: [] })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('users')

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)
    apiClient.get(`/search?q=${encodeURIComponent(q)}`)
      .then(r => setResults(r.data))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <h4 className="fw-bold mb-1" style={{ color:'var(--sc-navy)' }}>
        <Search size={20} className="me-2" />Search Results
      </h4>
      <p className="text-muted small mb-4">Results for: <strong>"{q}"</strong></p>

      <div className="d-flex gap-2 mb-4">
        {['users','questions','groups'].map(t => (
          <button key={t} className={`btn btn-sm ${tab===t?'':'btn-outline-secondary'}`}
            style={tab===t ? { background:'var(--sc-navy)', color:'#fff', borderRadius:8 } : { borderRadius:8 }}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {results[t]?.length > 0 && <span className="badge bg-secondary ms-1">{results[t].length}</span>}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>}

      {!loading && tab === 'users' && (
        results.users?.length === 0
          ? <p className="text-muted">No users found.</p>
          : <div className="row g-3">
              {results.users.map(u => (
                <div key={u.id} className="col-md-6 col-lg-4">
                  <div className="sc-card d-flex gap-3">
                    <img src={getAvatar(u.avatarPath, u.username)} alt="" className="avatar-circle" />
                    <div className="min-w-0">
                      <div className="fw-semibold">{u.fullName}</div>
                      <div className="small text-muted">@{u.username}</div>
                      {u.skills && <div className="small text-muted text-truncate">{u.skills}</div>}
                      <div className="small" style={{ color:'#f59e0b' }}>⭐ {u.totalPoints} pts</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {!loading && tab === 'questions' && (
        results.questions?.length === 0
          ? <p className="text-muted">No questions found.</p>
          : results.questions.map(q => (
              <div key={q.id} className="sc-card mb-3">
                <h6 className="fw-bold mb-1" style={{ color:'var(--sc-navy)' }}>{q.title}</h6>
                <p className="small text-muted mb-1">{q.description?.slice(0,120)}…</p>
                <div className="d-flex gap-2 small text-muted">
                  <span>📚 {q.topicName}</span>
                  <span className="badge" style={{ background:'var(--sc-blue)20', color:'var(--sc-blue)' }}>{q.difficulty}</span>
                  <span className="badge" style={{ background:'#f59e0b20', color:'#d97706' }}>{q.status}</span>
                </div>
              </div>
            ))
      )}

      {!loading && tab === 'groups' && (
        results.groups?.length === 0
          ? <p className="text-muted">No groups found.</p>
          : <div className="row g-3">
              {results.groups.map(g => (
                <div key={g.id} className="col-md-6 col-lg-4">
                  <div className="sc-card">
                    <div className="fw-bold">{g.name}</div>
                    <div className="small text-muted">{g.topicName || 'General'} · {g.memberCount} members</div>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  )
}
