import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery]           = useState('')
  const [unread, setUnread]         = useState(0)
  const [notifications, setNotifs]  = useState([])
  const [showBell, setShowBell]     = useState(false)
  const bellRef = useRef(null)

  // Poll for unread notifications every 30 s
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await apiClient.get('/notifications?unread=true')
        setUnread(data.unreadCount ?? 0)
        setNotifs(data.notifications ?? [])
      } catch { /* ignore */ }
    }
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const markAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all')
      setUnread(0)
      setNotifs(notifs => notifs.map(n => ({ ...n, read: true })))
    } catch { /* ignore */ }
  }

  const avatarSrc = getAvatar(user?.avatarPath, user?.username)

  return (
    <header className="sc-navbar">
      {/* Hamburger (mobile) */}
      <button className="btn btn-sm d-md-none me-2" onClick={onMenuToggle}>
        <Menu size={20} />
      </button>

      {/* Search */}
      <form className="d-flex flex-grow-1" style={{ maxWidth: 420 }} onSubmit={handleSearch}>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={15} className="text-muted" />
          </span>
          <input
            className="form-control border-start-0 ps-0"
            placeholder="Search users, questions, groups…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Notification bell */}
        <div className="position-relative" ref={bellRef}>
          <button className="btn btn-sm btn-light position-relative" onClick={() => setShowBell(v => !v)}>
            <Bell size={18} />
            {unread > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {showBell && (
            <div className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow" style={{ width: 340, zIndex: 2000 }}>
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                <strong className="small">Notifications</strong>
                {unread > 0 && <button className="btn btn-link btn-sm p-0" onClick={markAllRead}>Mark all read</button>}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0
                  ? <p className="text-muted small text-center p-3 mb-0">No notifications</p>
                  : notifications.slice(0, 20).map(n => (
                    <div key={n.id} className={`px-3 py-2 border-bottom ${!n.read ? 'bg-light' : ''}`} style={{ fontSize: '.85rem' }}>
                      <p className="mb-0">{n.message}</p>
                      <span className="text-muted" style={{ fontSize: '.75rem' }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* User avatar + name */}
        <div className="d-flex align-items-center gap-2">
          <img src={avatarSrc} alt="avatar" className="avatar-circle sm" />
          <span className="d-none d-sm-inline fw-medium" style={{ fontSize: '.9rem' }}>{user?.username}</span>
        </div>
      </div>
    </header>
  )
}
