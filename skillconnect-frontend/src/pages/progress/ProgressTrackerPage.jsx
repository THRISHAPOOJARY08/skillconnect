import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import apiClient from '../../api/apiClient'

export default function ProgressTrackerPage() {
  const [summary, setSummary]     = useState(null)
  const [topics, setTopics]       = useState([])
  const [timeSeries, setTS]       = useState([])
  const [period, setPeriod]       = useState('weekly')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get('/progress/summary'),
      apiClient.get('/progress/topic-scores'),
      apiClient.get(`/progress/time-series?period=${period}`)
    ]).then(([s, t, ts]) => {
      setSummary(s.data)
      setTopics(t.data)
      setTS(ts.data)
    }).finally(() => setLoading(false))
  }, [period])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  const overall = summary?.totalPointsEarned ?? 0
  const evaluated = summary?.totalEvaluated ?? 0
  const avg = summary?.averageScore ?? 0

  const COLORS = ['#4f46e5','#10b981','#f59e0b','#ef4444','#0d9488','#8b5cf6','#0891b2','#be185d']

  return (
    <div className="animate-fade-in">
      <h4 className="sc-page-title">📈 Progress Tracker</h4>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Points',       val: overall,                       color: '#4f46e5', grad: 'linear-gradient(135deg,#4f46e5,#3b82f6)' },
          { label: 'Answers Submitted',  val: summary?.totalAnswers ?? 0,    color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#059669)' },
          { label: 'Answers Evaluated',  val: evaluated,                     color: '#8b5cf6', grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
          { label: 'Average Score',      val: avg,                           color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
        ].map(({ label, val, color, grad }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="stat-card text-center animate-fade-up" style={{ '--stat-color': color }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '.3rem', fontWeight: 600 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Period toggle + Line chart */}
      <div className="sc-card mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', margin: 0 }}>Points Over Time</h6>
          <div className="d-flex gap-2">
            {['weekly','monthly'].map(p => (
              <button key={p} className="btn btn-sm"
                style={{
                  borderRadius: 20, border: 'none', fontWeight: 600, fontSize: '.78rem',
                  background: period === p ? 'linear-gradient(135deg,#4f46e5,#3b82f6)' : '#f1f5f9',
                  color: period === p ? '#fff' : 'var(--sc-muted)'
                }}
                onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {timeSeries.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <TrendingUp size={40} />
            <p>No evaluation data yet. Answer questions to see progress!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }} />
              <Line type="monotone" dataKey="points" stroke="#4f46e5" strokeWidth={3}
                dot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} name="Points" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Topic bar chart */}
      <div className="sc-card mb-4">
        <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', marginBottom: '1rem' }}>Topic-wise Performance</h6>
        {topics.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <TrendingUp size={40} />
            <p>No topic data yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topics} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="topicName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }} />
              <Legend wrapperStyle={{ fontSize: '.8rem' }} />
              <Bar dataKey="earnedPoints" name="Earned" fill="#4f46e5" radius={[6,6,0,0]} />
              <Bar dataKey="maxPoints" name="Max" fill="#e2e8f0" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Topic progress table */}
      <div className="sc-card">
        <h6 style={{ fontWeight: 700, color: 'var(--sc-navy)', marginBottom: '1rem' }}>Topic Progress</h6>
        {topics.length === 0 ? (
          <p style={{ color: 'var(--sc-muted)', fontSize: '.875rem' }}>Answer and get evaluated to see topic progress.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {topics.map((t, i) => (
              <div key={t.topicId} className="animate-fade-up" style={{ animationDelay: `${i * .05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{t.topicName}</span>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: 'var(--sc-muted)' }}>
                    <span><strong style={{ color: COLORS[i % COLORS.length] }}>{t.earnedPoints}</strong> / {t.maxPoints} pts</span>
                    <span style={{
                      fontWeight: 700,
                      color: t.percentage >= 80 ? '#15803d' : t.percentage >= 50 ? '#d97706' : '#dc2626'
                    }}>{t.percentage}%</span>
                  </div>
                </div>
                <div className="sc-progress-bar">
                  <div className="fill" style={{ width: `${t.percentage}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
