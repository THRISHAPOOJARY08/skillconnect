import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'
import {
  LayoutDashboard, HelpCircle, BookOpen, MessageSquare,
  Users, UsersRound, Trophy, TrendingUp, User, Settings, LogOut, Zap
} from 'lucide-react'

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [pendingQ, setPendingQ]     = useState(0)
  const [pendingConn, setPendingConn] = useState(0)

  useEffect(() => {
    // Fetch pending question count
    apiClient.get('/questions/received/count')
      .then(r => setPendingQ(r.data.count || 0))
      .catch(() => {})
    // Fetch pending connection count
    apiClient.get('/connections/pending/count')
      .then(r => setPendingConn(r.data.count || 0))
      .catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const avatarSrc = getAvatar(user?.avatarPath, user?.username)

  return (
    <>
      {mobileOpen && (
        <div className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,.5)', zIndex: 1039 }}
          onClick={onClose} />
      )}

      <nav className={`sc-sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Zap size={18} color="#fff" />
          </div>
          <span>SkillConnect</span>
        </div>

        {/* User mini-profile */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', gap: '.75rem'
        }}>
          <img src={avatarSrc} alt="avatar"
            className="avatar-circle sm"
            style={{ border: '2px solid rgba(255,255,255,.3)' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.72rem' }}>
              @{user?.username}
            </div>
          </div>
        </div>

        <div className="flex-grow-1 py-2">
          <div className="nav-section">Main</div>

          <NavLink to="/dashboard" className="nav-link" onClick={onClose}>
            <LayoutDashboard size={16} /><span>Home</span>
          </NavLink>
          <NavLink to="/ask" className="nav-link" onClick={onClose}>
            <HelpCircle size={16} /><span>Ask a Question</span>
          </NavLink>
          <NavLink to="/my-questions" className="nav-link" onClick={onClose}>
            <BookOpen size={16} /><span>My Questions</span>
          </NavLink>
          <NavLink to="/answer" className="nav-link" onClick={onClose}>
            <MessageSquare size={16} />
            <span>Answer Questions</span>
            {pendingQ > 0 && <span className="nav-badge">{pendingQ}</span>}
          </NavLink>

          <div className="nav-section">Social</div>

          <NavLink to="/connections" className="nav-link" onClick={onClose}>
            <Users size={16} />
            <span>Connections</span>
            {pendingConn > 0 && <span className="nav-badge">{pendingConn}</span>}
          </NavLink>
          <NavLink to="/groups" className="nav-link" onClick={onClose}>
            <UsersRound size={16} /><span>Groups</span>
          </NavLink>

          <div className="nav-section">Progress</div>

          <NavLink to="/leaderboard" className="nav-link" onClick={onClose}>
            <Trophy size={16} /><span>Leaderboard</span>
          </NavLink>
          <NavLink to="/progress" className="nav-link" onClick={onClose}>
            <TrendingUp size={16} /><span>Progress Tracker</span>
          </NavLink>

          <div className="nav-section">Account</div>

          <NavLink to="/profile" className="nav-link" onClick={onClose}>
            <User size={16} /><span>My Profile</span>
          </NavLink>
          <NavLink to="/settings" className="nav-link" onClick={onClose}>
            <Settings size={16} /><span>Settings</span>
          </NavLink>
        </div>

        <div style={{ padding: '.75rem 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button className="nav-link border-0 w-100 text-start"
            style={{ background: 'rgba(239,68,68,.15)', color: '#fca5a5' }}
            onClick={handleLogout}>
            <LogOut size={16} /><span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  )
}
