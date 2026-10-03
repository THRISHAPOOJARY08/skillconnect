import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Plus, X } from 'lucide-react'
import apiClient from '../../api/apiClient'
import { getAvatar } from '../../utils/avatar'

export default function AskQuestionPage() {
  const navigate = useNavigate()
  const [topics, setTopics]         = useState([])
  const [connections, setConns]     = useState([])
  const [form, setForm]             = useState({
    title: '', topicId: '', difficulty: 'MEDIUM', maxPoints: 1, recipientIds: []
  })
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // New topic modal state
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [newTopicName, setNewTopicName]     = useState('')
  const [topicLoading, setTopicLoading]     = useState(false)
  const [topicError, setTopicError]         = useState('')

  useEffect(() => {
    apiClient.get('/questions/topics').then(r => setTopics(r.data))
    apiClient.get('/connections').then(r => setConns(r.data))
  }, [])

  const toggleRecipient = id => {
    setForm(f => ({
      ...f,
      recipientIds: f.recipientIds.includes(id)
        ? f.recipientIds.filter(x => x !== id)
        : [...f.recipientIds, id]
    }))
  }

  const handleTopicChange = e => {
    if (e.target.value === '__new__') {
      setShowTopicModal(true)
    } else {
      setForm({ ...form, topicId: e.target.value })
    }
  }

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) { setTopicError('Topic name is required'); return }
    setTopicLoading(true)
    setTopicError('')
    try {
      const { data } = await apiClient.post('/questions/topics', { name: newTopicName.trim() })
      setTopics(prev => [...prev, data])
      setForm(f => ({ ...f, topicId: String(data.id) }))
      setShowTopicModal(false)
      setNewTopicName('')
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Failed to create topic')
    } finally {
      setTopicLoading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.recipientIds.length === 0) { setError('Select at least one recipient'); return }
    if (!form.topicId) { setError('Please select a topic'); return }
    setLoading(true)
    try {
      await apiClient.post('/questions', {
        title: form.title,
        description: form.title, // backend still expects description; use title
        topicId: parseInt(form.topicId),
        difficulty: form.difficulty,
        maxPoints: parseInt(form.maxPoints),
        recipientIds: form.recipientIds
      })
      navigate('/my-questions')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h4 className="sc-page-title">Ask a Question</h4>

      <div className="sc-card animate-fade-up">
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '.7rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Question textarea */}
          <div className="mb-4">
            <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Your Question *
            </label>
            <textarea
              className="form-control"
              rows={6}
              placeholder="Write your question in detail. You can include examples, context, what you've already tried, etc."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              style={{ fontSize: '.95rem', lineHeight: '1.6', minHeight: 150 }}
            />
            <div style={{ fontSize: '.72rem', color: 'var(--sc-muted)', marginTop: '.4rem' }}>
              💡 Be specific and clear — detailed questions get better answers.
            </div>
          </div>

          {/* Topic / Difficulty / Points row */}
          <div className="row g-3 mb-4">
            <div className="col-md-5">
              <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Topic *
              </label>
              <select className="form-select" value={form.topicId} onChange={handleTopicChange} required>
                <option value="">Choose a topic</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                <option value="__new__" style={{ color: '#4f46e5', fontWeight: 600 }}>+ Create New Topic</option>
              </select>
            </div>
            <div className="col-md-4">
              <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Difficulty *
              </label>
              <select className="form-select" value={form.difficulty}
                onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="EASY">🟢 Easy</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HARD">🔴 Hard</option>
              </select>
            </div>
            <div className="col-md-3">
              <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Max Points *
              </label>
              <input type="number" className="form-control" min={1} max={100}
                value={form.maxPoints}
                onChange={e => setForm({ ...form, maxPoints: e.target.value })}
                required />
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-4">
            <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Select Recipients * <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--sc-muted)' }}>(from your connections)</span>
            </label>
            {connections.length === 0 ? (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 10, border: '1px dashed var(--sc-border)', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--sc-muted)', fontSize: '.875rem' }}>
                  You need connections to ask questions.{' '}
                  <a href="/connections" style={{ color: 'var(--sc-blue)', fontWeight: 600 }}>Find connections →</a>
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {connections.map(c => {
                  const selected = form.recipientIds.includes(c.id)
                  return (
                    <button key={c.id} type="button" onClick={() => toggleRecipient(c.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.5rem',
                        padding: '.4rem .85rem .4rem .5rem',
                        borderRadius: 20,
                        border: `2px solid ${selected ? '#4f46e5' : '#e2e8f0'}`,
                        background: selected ? '#eff0ff' : '#fff',
                        color: selected ? '#4f46e5' : 'var(--sc-text)',
                        fontWeight: selected ? 600 : 400,
                        fontSize: '.85rem',
                        transition: 'all .2s ease',
                        cursor: 'pointer',
                        transform: selected ? 'scale(1.03)' : 'scale(1)',
                      }}>
                      <img src={getAvatar(c.avatarPath, c.username)} alt=""
                        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                      {c.fullName}
                      {selected && <span style={{ fontSize: '.7rem' }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-sc-primary"
            style={{ padding: '.6rem 1.75rem', fontSize: '.9rem' }}
            disabled={loading}>
            {loading
              ? <span className="spinner-border spinner-border-sm me-2" />
              : <Send size={15} className="me-2" />}
            Post Question
          </button>
        </form>
      </div>

      {/* Create New Topic Modal */}
      {showTopicModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5000, backdropFilter: 'blur(4px)'
        }}>
          <div className="animate-fade-up" style={{
            background: '#fff', borderRadius: 20, padding: '2rem',
            width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,.25)'
          }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 style={{ fontWeight: 700, margin: 0, color: 'var(--sc-navy)' }}>Create New Topic</h5>
              <button className="btn btn-sm" style={{ borderRadius: 8, background: '#f1f5f9' }}
                onClick={() => { setShowTopicModal(false); setNewTopicName(''); setTopicError('') }}>
                <X size={16} />
              </button>
            </div>

            {topicError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.6rem .9rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '.83rem' }}>
                ⚠️ {topicError}
              </div>
            )}

            <div className="mb-4">
              <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>
                Topic Name
              </label>
              <input
                className="form-control"
                placeholder="e.g. Python, DBMS, Aptitude…"
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateTopic()}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button className="btn btn-sc-primary flex-grow-1"
                onClick={handleCreateTopic} disabled={topicLoading}>
                {topicLoading
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <Plus size={15} className="me-1" />}
                Create Topic
              </button>
              <button className="btn btn-outline-secondary" style={{ borderRadius: 10 }}
                onClick={() => { setShowTopicModal(false); setNewTopicName(''); setTopicError('') }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
