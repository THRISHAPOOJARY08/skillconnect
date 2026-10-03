import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'

function UserCard({ u, onAction, loading }) {
  const avatar = getAvatar(u.avatarPath, u.username)

  const statusBadge = () => {
    if (u.connectionStatus === 'ACCEPTED')
      return (
        <span className="badge rounded-pill"
          style={{ background: '#d1fae5', color: '#065f46', fontSize: '.7rem' }}>
          <UserCheck size={10} className="me-1" />Connected
        </span>
      )
    if (u.connectionStatus === 'PENDING_SENT')
      return (
        <span className="badge rounded-pill bg-secondary" style={{ fontSize: '.7rem' }}>
          Pending…
        </span>
      )
    return null
  }

  return (
    <div className="sc-card hoverable h-100 d-flex flex-column w-100" style={{ gap: 0 }}>
      {/* Top: avatar + name */}
      <div className="d-flex align-items-center gap-3 mb-2">
        <img src={avatar} alt=""
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e2e8f0' }} />
        <div style={{ minWidth: 0 }}>
          <div className="fw-semibold" style={{ fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {u.fullName}
          </div>
          <div className="text-muted" style={{ fontSize: '.78rem' }}>@{u.username}</div>
        </div>
        <div className="ms-auto flex-shrink-0">{statusBadge()}</div>
      </div>

      {/* Bio */}
      {u.bio && (
        <p style={{ fontSize: '.78rem', color: '#64748b', margin: '0 0 .5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {u.bio}
        </p>
      )}

      {/* Skills */}
      {u.skills && (
        <div className="d-flex flex-wrap gap-1 mb-2">
          {u.skills.split(',').slice(0, 3).map(s => s.trim()).filter(Boolean).map(s => (
            <span key={s} className="badge rounded-pill"
              style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '.68rem', fontWeight: 500 }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Points */}
      <div style={{ fontSize: '.78rem', color: '#92400e', marginBottom: '.75rem' }}>
        ⭐ <strong>{u.totalPoints ?? 0}</strong> pts
      </div>

      {/* Action button — always at the bottom */}
      <div className="mt-auto">
        {u.connectionStatus === 'PENDING_RECEIVED' ? (
          <div className="d-flex gap-2">
            <button className="btn btn-sm flex-grow-1 fw-semibold"
              style={{ background: 'var(--sc-navy)', color: '#fff', borderRadius: 8, fontSize: '.8rem' }}
              onClick={() => onAction('accept', u)} disabled={loading}>
              Accept
            </button>
            <button className="btn btn-sm btn-outline-danger flex-grow-1"
              style={{ borderRadius: 8, fontSize: '.8rem' }}
              onClick={() => onAction('reject', u)} disabled={loading}>
              Reject
            </button>
          </div>
        ) : u.connectionStatus === 'ACCEPTED' ? (
          <button className="btn btn-sm w-100"
            style={{ background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: '.8rem', fontWeight: 600 }}
            disabled>
            <UserCheck size={13} className="me-1" />Connected
          </button>
        ) : u.connectionStatus === 'PENDING_SENT' ? (
          <button className="btn btn-sm w-100 btn-outline-secondary"
            style={{ borderRadius: 8, fontSize: '.8rem' }} disabled>
            Request Sent
          </button>
        ) : (
          <button className="btn btn-sm w-100 fw-semibold"
            style={{ background: 'var(--sc-blue)', color: '#fff', borderRadius: 8, fontSize: '.8rem' }}
            onClick={() => onAction('connect', u)} disabled={loading}>
            <UserPlus size={13} className="me-1" />Connect
          </button>
        )}
      </div>
    </div>
  )
}

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [pending, setPending]   = useState([])
  const [connections, setConns] = useState([])
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState('discover') // discover | connections | pending

  const loadPending = () => apiClient.get('/connections/pending').then(r => {
    const users = r.data.map(c => ({
      ...c,
      id: c.requesterId,
      fullName: c.requesterFullName,
      username: c.requesterUsername,
      avatarPath: c.requesterAvatarPath,
      connectionStatus: 'PENDING_RECEIVED',
      _connectionId: c.id
    }))
    setPending(users)
  })

  const loadConnections = () => apiClient.get('/connections').then(r => setConns(r.data))

  const loadAllUsers = async () => {
    setLoading(true)
    try {
      const [allRes, connRes, sentRes] = await Promise.all([
        apiClient.get('/users/all'),
        apiClient.get('/connections'),
        apiClient.get('/connections/sent'),
      ])
      const accepted  = allRes.data.map ? allRes.data : []
      setAllUsers(accepted)
      setConns(connRes.data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => {
    loadAllUsers()
    loadPending()
  }, [])

  const handleSearch = async e => {
    e.preventDefault()
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`)
      setResults(data)
    } catch { }
    setLoading(false)
  }

  const handleAction = async (action, u) => {
    setLoading(true)
    try {
      if (action === 'connect') {
        await apiClient.post(`/connections/request/${u.id}`)
        const markSent = list => list.map(x => x.id === u.id ? { ...x, connectionStatus: 'PENDING_SENT' } : x)
        setResults(markSent)
        setAllUsers(markSent)
      } else if (action === 'accept') {
        await apiClient.put(`/connections/${u._connectionId}/accept`)
        await loadPending()
        await loadConnections()
        setAllUsers(list => list.map(x => x.id === u.id ? { ...x, connectionStatus: 'ACCEPTED' } : x))
      } else if (action === 'reject') {
        await apiClient.put(`/connections/${u._connectionId}/reject`)
        await loadPending()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0" style={{ color:'var(--sc-navy)' }}>Connections</h4>
        <div className="d-flex gap-2">
          {['discover','connections','pending'].map(t => (
            <button key={t} className={`btn btn-sm ${tab===t ? '' : 'btn-outline-secondary'}`}
              style={tab===t ? { background:'var(--sc-navy)', color:'#fff', borderRadius:8 } : { borderRadius:8 }}
              onClick={() => setTab(t)}>
              {t === 'pending' && pending.length > 0 && <span className="badge bg-danger me-1">{pending.length}</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'discover' && (
        <div>
          <form className="d-flex gap-2 mb-4" onSubmit={handleSearch}>
            <input className="form-control" placeholder="Search by name, username, or skills…"
              value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit" className="btn" style={{ background:'var(--sc-navy)', color:'#fff', borderRadius:8 }}>
              <Search size={16} />
            </button>
          </form>

          {loading && <div className="text-center py-4"><div className="spinner-border text-primary" /></div>}

          {/* Show search results if query active, else show all users */}
          {(() => {
            const display = query.trim() ? results : allUsers
            if (!loading && display.length === 0) {
              return <div className="empty-state"><Users size={48} /><p>No users found</p></div>
            }
            return (
              <div className="row g-3 align-items-stretch">
                {display.map(u => (
                  <div key={u.id} className="col-sm-6 col-xl-4 d-flex">
                    <UserCard u={u} onAction={handleAction} loading={loading} />
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {tab === 'connections' && (
        <div>
          {connections.length === 0
            ? <div className="empty-state"><Users size={48} /><p>No connections yet. Discover people to connect with!</p></div>
            : <div className="row g-3">
                {connections.map(u => (
                  <div key={u.id} className="col-md-6 col-xl-4">
                    <UserCard u={{ ...u, connectionStatus: 'ACCEPTED' }} onAction={handleAction} loading={loading} />
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {tab === 'pending' && (
        <div>
          {pending.length === 0
            ? <div className="empty-state"><UserCheck size={48} /><p>No pending requests</p></div>
            : <div className="row g-3">
                {pending.map(u => (
                  <div key={u.id} className="col-md-6 col-xl-4">
                    <UserCard u={u} onAction={handleAction} loading={loading} />
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  )
}
