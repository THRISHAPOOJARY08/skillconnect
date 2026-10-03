import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import QuestionCard from '../../components/questions/QuestionCard'
import EvaluationModal from '../../components/questions/EvaluationModal'
import AskQuestionPage from '../questions/AskQuestionPage'
import apiClient from '../../api/apiClient'
import { useAuth } from '../../context/AuthContext'

export default function GroupDetailPage() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const [group, setGroup]       = useState(null)
  const [questions, setQuestions] = useState([])
  const [tab, setTab]           = useState('feed')
  const [evalQ, setEvalQ]       = useState(null)

  const load = async () => {
    const [g, qs] = await Promise.all([
      apiClient.get(`/groups/${id}`),
      apiClient.get(`/groups/${id}/questions`)
    ])
    setGroup(g.data)
    setQuestions(qs.data)
  }

  useEffect(() => { load() }, [id])

  if (!group) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  return (
    <div>
      {/* Header */}
      <div className="sc-card mb-4 d-flex align-items-center gap-3">
        <div className="rounded-3 d-flex align-items-center justify-content-center"
          style={{ width:52, height:52, background:'var(--sc-blue)20', fontSize:'1.5rem' }}>👥</div>
        <div>
          <h5 className="fw-bold mb-0">{group.name}</h5>
          <p className="text-muted small mb-0">{group.topicName || 'General'} · {group.memberCount} members · {group.visibility}</p>
          {group.description && <p className="small mb-0 mt-1">{group.description}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        {['feed','ask'].map(t => (
          <button key={t} className={`btn btn-sm ${tab===t?'':'btn-outline-secondary'}`}
            style={tab===t ? { background:'var(--sc-navy)', color:'#fff', borderRadius:8 } : { borderRadius:8 }}
            onClick={() => setTab(t)}>
            {t === 'feed' ? '💬 Questions Feed' : '❓ Ask Group'}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        questions.length === 0
          ? <div className="empty-state" style={{fontSize:'2rem'}}>💬 <p className="mt-2">No questions yet in this group.</p></div>
          : questions.map(q => (
              <QuestionCard key={q.id} q={q} showReply showEvaluate onEvaluate={q => setEvalQ(q)} />
            ))
      )}

      {tab === 'ask' && (
        <div style={{ maxWidth:700 }}>
          <p className="text-muted small mb-3">This question will be posted to all group members.</p>
          <GroupAskForm groupId={parseInt(id)} onDone={() => { setTab('feed'); load() }} />
        </div>
      )}

      {evalQ && (
        <EvaluationModal question={evalQ} onClose={() => setEvalQ(null)} onDone={() => { setEvalQ(null); load() }} />
      )}
    </div>
  )
}

function GroupAskForm({ groupId, onDone }) {
  const [topics, setTopics] = useState([])
  const [form, setForm] = useState({ title:'', description:'', topicId:'', difficulty:'MEDIUM', maxPoints:10 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { apiClient.get('/questions/topics').then(r => setTopics(r.data)) }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post(`/groups/${groupId}/questions`, {
        ...form, topicId: parseInt(form.topicId), maxPoints: parseInt(form.maxPoints), recipientIds: []
      })
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className="sc-card">
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-medium">Title *</label>
          <input className="form-control" value={form.title} onChange={e => setForm({...form, title:e.target.value})} required />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-medium">Description *</label>
          <textarea className="form-control" rows={3} value={form.description}
            onChange={e => setForm({...form, description:e.target.value})} required />
        </div>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small fw-medium">Topic *</label>
            <select className="form-select" value={form.topicId} onChange={e => setForm({...form, topicId:e.target.value})} required>
              <option value="">Choose</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Difficulty</label>
            <select className="form-select" value={form.difficulty} onChange={e => setForm({...form, difficulty:e.target.value})}>
              <option>EASY</option><option>MEDIUM</option><option>HARD</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Max Points</label>
            <input type="number" className="form-control" min={1} max={100} value={form.maxPoints}
              onChange={e => setForm({...form, maxPoints:e.target.value})} required />
          </div>
        </div>
        <button type="submit" className="btn fw-semibold"
          style={{ background:'var(--sc-navy)', color:'#fff', borderRadius:8 }} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Post to Group
        </button>
      </form>
    </div>
  )
}
