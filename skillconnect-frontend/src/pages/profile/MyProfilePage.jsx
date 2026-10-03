import { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'

// Only the 2 photo avatars available for selection
const AVATARS = [
  { id: 11, path: '/avatars/female.jpg', label: 'Female' },
  { id: 12, path: '/avatars/male.jpg',   label: 'Male'   },
]

export default function MyProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [topics, setTopics]     = useState([])
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({})
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    apiClient.get('/users/me').then(r => {
      setProfile(r.data)
      setForm({
        fullName:  r.data.fullName,
        bio:       r.data.bio || '',
        college:   r.data.college || '',
        // Default to female(11) or male(12) based on heuristic if no explicit id stored
        avatarId:  r.data.avatarId && [11, 12].includes(r.data.avatarId)
                     ? r.data.avatarId
                     : (r.data.avatarId ?? 11),
        skills:    r.data.skills || '',
        interests: r.data.interests || '',
      })
    })
    apiClient.get('/progress/topic-scores').then(r => setTopics(r.data)).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.put('/users/me', form)
      setProfile(data)
      updateUser({ ...user, ...data })
      setEditing(false)
      setMsg('Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary" /></div>

  const avatarSrc = getAvatar(profile.avatarPath, profile.username)

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="sc-card text-center">
          <img src={avatarSrc} alt="avatar" className="avatar-circle lg mb-3 mx-auto d-block"
            style={{ width:88, height:88 }} />
          <h5 className="fw-bold">{profile.fullName}</h5>
          <p className="text-muted small">@{profile.username}</p>
          {profile.bio && <p className="small text-muted">{profile.bio}</p>}
          {profile.college && <p className="small"><i className="bi bi-mortarboard me-1" />{profile.college}</p>}

          <div className="d-flex justify-content-around mt-3 pt-3 border-top">
            <div className="text-center">
              <div className="fw-bold" style={{ color:'var(--sc-navy)' }}>{profile.totalPoints}</div>
              <div className="small text-muted">Points</div>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ color:'var(--sc-navy)' }}>{profile.totalAnswers}</div>
              <div className="small text-muted">Answers</div>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ color:'var(--sc-navy)' }}>{profile.connectionCount ?? 0}</div>
              <div className="small text-muted">Connections</div>
            </div>
          </div>

          {profile.skills && (
            <div className="mt-3 text-start">
              <p className="small fw-semibold mb-1">Skills</p>
              <div className="d-flex flex-wrap gap-1">
                {profile.skills.split(',').map(s => (
                  <span key={s} className="badge rounded-pill" style={{ background:'var(--sc-blue)20', color:'var(--sc-blue)' }}>{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-sm mt-3 w-100"
            style={{ border:'1.5px solid var(--sc-blue)', color:'var(--sc-blue)', borderRadius:8 }}
            onClick={() => setEditing(true)}>
            <Edit2 size={14} className="me-1" /> Edit Profile
          </button>
        </div>
      </div>

      <div className="col-lg-8">
        {msg && <div className={`alert ${msg.includes('failed') ? 'alert-danger' : 'alert-success'} py-2 small mb-3`}>{msg}</div>}

        {editing ? (
          <div className="sc-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Edit Profile</h6>
              <button className="btn btn-sm btn-light" onClick={() => setEditing(false)}><X size={14} /></button>
            </div>

            <p className="small fw-semibold mb-2">Avatar</p>
            <div className="d-flex gap-4 mb-3">
              {AVATARS.map(av => (
                <button key={av.id} type="button"
                  className="p-0 border-0 bg-transparent d-flex flex-column align-items-center gap-1"
                  onClick={() => setForm({ ...form, avatarId: av.id })}>
                  <img src={av.path} alt={av.label}
                    style={{
                      width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                      border: form.avatarId === av.id ? '4px solid var(--sc-blue)' : '4px solid transparent',
                      boxShadow: form.avatarId === av.id ? '0 0 0 3px #ede9fe' : 'none',
                      opacity: form.avatarId === av.id ? 1 : 0.55,
                      transition: 'all .2s'
                    }}
                  />
                  <span style={{ fontSize: '.75rem', fontWeight: 600, color: form.avatarId === av.id ? 'var(--sc-blue)' : '#64748b' }}>
                    {av.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="row g-3">
              {[
                ['fullName', 'Full Name', 'text'],
                ['college', 'College', 'text'],
              ].map(([name, label, type]) => (
                <div key={name} className="col-md-6">
                  <label className="form-label small fw-medium">{label}</label>
                  <input type={type} className="form-control" value={form[name]}
                    onChange={e => setForm({ ...form, [name]: e.target.value })} />
                </div>
              ))}
              <div className="col-12">
                <label className="form-label small fw-medium">Bio</label>
                <textarea className="form-control" rows={2} value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Skills (comma-separated)</label>
                <input className="form-control" value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Interests (comma-separated)</label>
                <input className="form-control" value={form.interests}
                  onChange={e => setForm({ ...form, interests: e.target.value })} />
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button className="btn flex-grow-1 fw-semibold"
                style={{ background:'var(--sc-navy)', color:'#fff', borderRadius:8 }}
                onClick={handleSave} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <Save size={15} className="me-1" />}
                Save Changes
              </button>
              <button className="btn btn-outline-secondary" style={{ borderRadius:8 }} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="sc-card mb-4">
            <h6 className="fw-bold mb-3" style={{ color:'var(--sc-navy)' }}>Account Info</h6>
            <div className="row g-2">
              <div className="col-sm-6"><span className="small text-muted">Email</span><p className="mb-0 fw-medium">{profile.email}</p></div>
              <div className="col-sm-6"><span className="small text-muted">College</span><p className="mb-0 fw-medium">{profile.college || '—'}</p></div>
              <div className="col-12 mt-2"><span className="small text-muted">Interests</span>
                <p className="mb-0 fw-medium">{profile.interests || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Topic-wise progress */}
        <div className="sc-card">
          <h6 className="fw-bold mb-3" style={{ color:'var(--sc-navy)' }}>Topic-wise Progress</h6>
          {topics.length === 0 ? (
            <p className="text-muted small">Answer and get evaluated to see topic progress here.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Topic</th>
                    <th className="text-end">Earned</th>
                    <th className="text-end">Max</th>
                    <th style={{ minWidth:120 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map(t => (
                    <tr key={t.topicId}>
                      <td className="fw-medium">{t.topicName}</td>
                      <td className="text-end">{t.earnedPoints}</td>
                      <td className="text-end">{t.maxPoints}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="flex-grow-1 bg-light rounded" style={{height:8}}>
                            <div className="rounded" style={{height:8, width:`${t.percentage}%`, background:'var(--sc-blue)'}} />
                          </div>
                          <span className="small fw-semibold" style={{ minWidth:36 }}>{t.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
