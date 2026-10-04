import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, MessageSquare, Star, Trophy, Users, TrendingUp, Clock, Zap, BookOpen, ArrowRight, Megaphone, Send, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'

function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div className="stat-card d-flex align-items-center gap-3 animate-fade-up"
      style={{ '--stat-color': color }}>
      <div className="stat-icon" style={{ background: gradient || `${color}20` }}>
        <Icon size={22} color={gradient ? '#fff' : color} />
      </div>
      <div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

const ACTIVITY_ICONS = {
  QUESTION_ASKED:    { label: 'Asked a question',    color: '#3b82f6', bg: '#eff6ff', emoji: '❓' },
  ANSWER_SUBMITTED:  { label: 'Submitted an answer', color: '#10b981', bg: '#f0fdf4', emoji: '✍️' },
  EVALUATION_GIVEN:  { label: 'Evaluated an answer', color: '#f59e0b', bg: '#fffbeb', emoji: '⭐' },
  GROUP_CREATED:     { label: 'Created a group',     color: '#8b5cf6', bg: '#f5f3ff', emoji: '👥' },
}

export default function DashboardHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [pendingQ, setPendingQ]     = useState(0)
  // Announcements state
  const [announcements, setAnnouncements] = useState([])
  const [connections, setConnections]     = useState([])
  const [annMsg, setAnnMsg]               = useState('')
  const [annRecipient, setAnnRecipient]   = useState('')
  const [annPosting, setAnnPosting]       = useState(false)
  const [annError, setAnnError]           = useState('')

  const loadAnnouncements = () =>
    apiClient.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {})

  useEffect(() => {
    apiClient.get('/dashboard/summary')
      .then(r => setSummary(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    apiClient.get('/questions/received/count')
      .then(r => setPendingQ(r.data.count || 0))
      .catch(() => {})
    apiClient.get('/connections')
      .then(r => setConnections(r.data))
      .catch(() => {})
    loadAnnouncements()
  }, [])

  const handlePostAnnouncement = async e => {
    e.preventDefault()
    if (!annMsg.trim()) { setAnnError('Message is required'); return }
    setAnnPosting(true); setAnnError('')
    try {
      await apiClient.post('/announcements', {
        message: annMsg,
        recipientId: annRecipient ? Number(annRecipient) : null
      })
      setAnnMsg(''); setAnnRecipient('')
      loadAnnouncements()
    } catch (err) {
      setAnnError(err.response?.data?.message || 'Failed to post')
    } finally { setAnnPosting(false) }
  }

  const { logout } = useAuth()
  const handleSignOut = () => { logout(); navigate('/login') }

  const avatarSrc = getAvatar(user?.avatarPath, user?.username)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="d-flex align-items-center gap-4" style={{ position: 'relative', zIndex: 1 }}>
          <img src={avatarSrc} alt="avatar" className="avatar-circle xl"
            style={{ border: '3px solid rgba(255,255,255,.4)', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}
/>
          <div>
            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.875rem', margin: 0 }}>{greeting} 👋</p>
            <h4 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-.02em', margin: '.2rem 0 .4rem', color: '#fff' }}>
              {user?.fullName}
            </h4>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem', margin: 0 }}>
              @{user?.username} · Keep learning and growing!
            </p>
          </div>
          <div className="ms-auto d-none d-md-flex gap-2 align-items-center">
            <button className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(10px)', fontWeight: 600 }}
              onClick={() => navigate('/ask')}>
              <HelpCircle size={14} className="me-1" /> Ask Question
            </button>
            <button className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(10px)', fontWeight: 600 }}
              onClick={() => navigate('/connections')}>
              <Users size={14} className="me-1" /> Connect
            </button>
            <button className="btn btn-sm"
              style={{ background: 'rgba(255,50,50,.35)', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,100,100,.4)', backdropFilter: 'blur(10px)', fontWeight: 600 }}
              onClick={handleSignOut}>
              <LogOut size={14} className="me-1" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="row g-3 mb-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2">
              <div className="stat-card">
                <div className="skeleton mb-2" style={{ height: 52, width: 52, borderRadius: 14 }} />
                <div className="skeleton mb-1" style={{ height: 28, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-xl-2">
            <StatCard icon={HelpCircle}    label="Questions Asked"   value={summary?.questionsAsked}   color="#3b82f6" gradient="linear-gradient(135deg,#3b82f6,#2563eb)" />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <StatCard icon={MessageSquare} label="Answers Submitted" value={summary?.answersSubmitted} color="#10b981" gradient="linear-gradient(135deg,#10b981,#059669)" />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <StatCard icon={Star}          label="Evaluated"         value={summary?.answersEvaluated} color="#f59e0b" gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <StatCard icon={Zap}           label="Total Points"      value={summary?.totalPoints}      color="#8b5cf6" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <StatCard icon={Trophy}        label="Connection Rank"   value={`#${summary?.connectionRank ?? '—'}`} color="#ef4444" gradient="linear-gradient(135deg,#ef4444,#dc2626)" />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <StatCard icon={Users}         label="Connections"       value={summary?.connectionCount}  color="#0d9488" gradient="linear-gradient(135deg,#0d9488,#0f766e)" />
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="sc-card h-100">
            <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', marginBottom: '1rem', fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Quick Actions
            </h6>
            <div className="d-flex flex-column gap-2">
              {[
                { label: 'Ask a Question', icon: HelpCircle,    color: '#3b82f6', bg: '#eff6ff',  route: '/ask' },
                { label: 'Answer Questions', icon: MessageSquare, color: '#10b981', bg: '#f0fdf4',
                  badge: pendingQ, route: '/answer' },
                { label: 'Find Connections', icon: Users,        color: '#8b5cf6', bg: '#f5f3ff',  route: '/connections' },
                { label: 'My Progress',     icon: TrendingUp,   color: '#f59e0b', bg: '#fffbeb',  route: '/progress' },
                { label: 'Leaderboard',     icon: Trophy,       color: '#ef4444', bg: '#fef2f2',  route: '/leaderboard' },
              ].map(({ label, icon: Icon, color, bg, route, badge }) => (
                <button key={route} className="quick-action-btn"
                  style={{ background: bg, color }}
                  onClick={() => navigate(route)}>
                  <div className="qa-icon" style={{ background: color, color: '#fff' }}>
                    <Icon size={16} />
                  </div>
                  <span>{label}</span>
                  {badge > 0 && (
                    <span style={{
                      marginLeft: 'auto', background: color, color: '#fff',
                      borderRadius: 20, padding: '1px 8px', fontSize: '.7rem', fontWeight: 700
                    }}>{badge}</span>
                  )}
                  <ArrowRight size={14} style={{ marginLeft: badge > 0 ? '.25rem' : 'auto', opacity: .5 }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-lg-8">
          <div className="sc-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', margin: 0, fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Recent Activity
              </h6>
              <span style={{ fontSize: '.75rem', color: 'var(--sc-muted)' }}>Last 10 actions</span>
            </div>

            {!summary?.recentActivities?.length ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <Clock size={40} />
                <p>No activity yet. Start by asking a question!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {summary.recentActivities.slice(0, 8).map((a, i) => {
                  const info = ACTIVITY_ICONS[a.type] || { label: a.type, color: '#64748b', bg: '#f8fafc', emoji: '📌' }
                  return (
                    <div key={i} className="animate-fade-up d-flex align-items-center gap-3"
                      style={{
                        padding: '.7rem .9rem', borderRadius: 10,
                        background: info.bg, border: `1px solid ${info.color}20`,
                        animationDelay: `${i * .04}s`
                      }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: info.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0
                      }}>{info.emoji}</div>
                      <div>
                        <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--sc-text)' }}>{info.label}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--sc-muted)' }}>
                          {new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="row g-4 mt-2">
        {/* Post Announcement */}
        <div className="col-lg-5">
          <div className="sc-card h-100">
            <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', marginBottom: '1rem', fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <Megaphone size={14} className="me-2" />Post Announcement
            </h6>
            <form onSubmit={handlePostAnnouncement}>
              {annError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.5rem .75rem', marginBottom: '.75rem', color: '#b91c1c', fontSize: '.8rem' }}>
                  {annError}
                </div>
              )}
              <div className="mb-2">
                <select className="form-select form-select-sm"
                  value={annRecipient}
                  onChange={e => setAnnRecipient(e.target.value)}>
                  <option value="">📢 Everyone (all connections)</option>
                  {connections.map(c => (
                    <option key={c.id} value={c.id}>👤 {c.fullName} (@{c.username})</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <textarea className="form-control" rows={3}
                  placeholder="Share something with your connections…"
                  value={annMsg}
                  onChange={e => { setAnnMsg(e.target.value); setAnnError('') }}
                  style={{ resize: 'none', fontSize: '.875rem' }}
                />
              </div>
              <button type="submit" className="btn btn-sm w-100"
                disabled={annPosting}
                style={{ background: 'var(--sc-navy)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>
                {annPosting
                  ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</>
                  : <><Send size={13} className="me-1" />Post Announcement</>}
              </button>
            </form>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="col-lg-7">
          <div className="sc-card h-100">
            <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', marginBottom: '1rem', fontSize: '.875rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <Megaphone size={14} className="me-2" />Announcements Feed
            </h6>
            {announcements.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
                <Megaphone size={36} style={{ opacity: .3 }} />
                <p style={{ fontSize: '.85rem' }}>No announcements yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', maxHeight: 320, overflowY: 'auto' }}>
                {announcements.map(a => (
                  <div key={a.id} className="animate-fade-up d-flex gap-3 align-items-start"
                    style={{ padding: '.75rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <img src={getAvatar(a.senderAvatarPath, a.senderUsername)} alt=""
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--sc-navy)' }}>{a.senderFullName}</span>
                        {a.recipientFullName && (
                          <span style={{ fontSize: '.7rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>
                            → {a.recipientFullName}
                          </span>
                        )}
                        <span style={{ fontSize: '.7rem', color: 'var(--sc-muted)', marginLeft: 'auto' }}>
                          {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: '.3rem 0 0', fontSize: '.85rem', color: 'var(--sc-text)', wordBreak: 'break-word' }}>{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
