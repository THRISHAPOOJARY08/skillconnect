import { useState, useEffect } from 'react'
import { Users, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../api/apiClient'

export default function GroupsPage() {
  const [groups, setGroups]       = useState([])
  const [topics, setTopics]       = useState([])
  const [connections, setConns]   = useState([])
  const [showCreate, setShow]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', description: '', topicId: '', visibility: 'PUBLIC', memberIds: []
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    apiClient.get('/groups').then(r => setGroups(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    apiClient.get('/questions/topics').then(r => setTopics(r.data))
    apiClient.get('/connections').then(r => setConns(r.data))
  }, [])

  const toggleMember = id => setForm(f => ({
    ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter(x => x !== id) : [...f.memberIds, id]
  }))

  const handleCreate = async e => {
    e.preventDefault()
    setCreating(true)
    try {
      await apiClient.post('/groups', { ...form, topicId: form.topicId || null })
      setShow(false)
      setForm({ name:'', description:'', topicId:'', visibility:'PUBLIC', memberIds:[] })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0" style={{ color:'var(--sc-navy)' }}>Groups</h4>
        <button className="btn btn-sm" style={{ background:'var(--sc-navy)', color:'#fff', borderRadius:8 }}
          onClick={() => setShow(true)}>
          <Plus size={15} className="me-1" />Create Group
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : groups.length === 0 ? (
        <div className="empty-state"><Users size={48} /><p>You're not in any groups yet. Create one!</p></div>
      ) : (
        <div className="row g-3">
          {groups.map(g => (
            <div key={g.id} className="col-md-6 col-lg-4">
              <div className="sc-card h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width:44, height:44, background:'var(--sc-blue)20', fontSize:'1.3rem' }}>👥</div>
                  <div>
                    <div className="fw-bold">{g.name}</div>
                    <div className="small text-muted">{g.topicName || 'General'}</div>
                  </div>
                </div>
                {g.description && <p className="small text-muted mb-2">{g.description}</p>}
                <div className="d-flex gap-2 small text-muted mt-auto pt-2 border-top">
                  <span>👤 {g.memberCount} members</span>
                  <span className={`badge ${g.visibility === 'PUBLIC' ? 'bg-success' : 'bg-secondary'}`}>
                    {g.visibility}
                  </span>
                </div>
                <button className="btn btn-sm mt-2"
                  style={{ border:'1px solid var(--sc-blue)', color:'var(--sc-blue)', borderRadius:8 }}
                  onClick={() => navigate(`/groups/${g.id}`)}>
                  View Group →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create group modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5000, backdropFilter: 'blur(4px)', padding: '1rem'
        }}>
          <div className="animate-fade-up" style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
            boxShadow: '0 25px 60px rgba(0,0,0,.25)', overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
              padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>👥 Create Group</span>
              <button onClick={() => setShow(false)}
                style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: '.3rem .5rem', cursor: 'pointer', color: '#fff' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.6rem .9rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '.83rem' }}>
                  ⚠️ {error}
                </div>
              )}
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>Group Name *</label>
                  <input className="form-control" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>Description</label>
                  <textarea className="form-control" rows={2} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>Topic</label>
                    <select className="form-select" value={form.topicId}
                      onChange={e => setForm({ ...form, topicId: e.target.value })}>
                      <option value="">No specific topic</option>
                      {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>Visibility</label>
                    <select className="form-select" value={form.visibility}
                      onChange={e => setForm({ ...form, visibility: e.target.value })}>
                      <option value="PUBLIC">🌐 Public</option>
                      <option value="PRIVATE">🔒 Private</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>Invite Connections</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                    {connections.map(c => {
                      const sel = form.memberIds.includes(c.id)
                      return (
                        <button key={c.id} type="button" onClick={() => toggleMember(c.id)}
                          style={{
                            borderRadius: 20, border: `2px solid ${sel ? '#4f46e5' : '#e2e8f0'}`,
                            background: sel ? '#eff0ff' : '#fff', color: sel ? '#4f46e5' : 'var(--sc-text)',
                            fontWeight: sel ? 600 : 400, fontSize: '.8rem', padding: '.3rem .75rem',
                            cursor: 'pointer', transition: 'all .2s ease'
                          }}>
                          {c.fullName} {sel && '✓'}
                        </button>
                      )
                    })}
                    {connections.length === 0 && <p style={{ color: 'var(--sc-muted)', fontSize: '.85rem', margin: 0 }}>No connections to invite</p>}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sc-primary flex-grow-1" disabled={creating}>
                    {creating ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    Create Group
                  </button>
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: 10 }}
                    onClick={() => setShow(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
