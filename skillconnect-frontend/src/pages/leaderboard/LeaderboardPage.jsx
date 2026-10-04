import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import apiClient from '../../api/apiClient'
import { useAuth } from '../../context/AuthContext'
import { getAvatar } from '../../utils/avatar'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [data, setData]   = useState([])
  const [filter, setFilter] = useState('overall')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiClient.get(`/leaderboard?filter=${filter}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [filter])

  const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="sc-page-title mb-0">🏆 Leaderboard</h4>
        <div className="d-flex gap-2">
          {['overall','weekly','monthly'].map(f => (
            <button key={f}
              className={`btn btn-sm ${filter !== f ? 'filter-pill-inactive' : ''}`}
                  style={{
                    borderRadius: 20,
                    background: filter === f ? 'linear-gradient(135deg,#4f46e5,#3b82f6)' : undefined,
                    color: filter === f ? '#fff' : undefined,
                    fontWeight: 600, fontSize: '.8rem',
                    border: 'none',
                    transition: 'all .2s ease'
                  }}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner-border text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state sc-card">
          <Trophy size={48} />
          <p>No data yet. Answer questions and get evaluated to appear here!</p>
        </div>
      ) : (
        <div className="sc-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Top 3 podium */}
          {data.length >= 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              padding: '1.5rem',
              display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap'
            }}>
              {data.slice(0, Math.min(3, data.length)).map(row => (
                <div key={row.userId} style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>{RANK_MEDAL[row.rank] || `#${row.rank}`}</div>
                  <img src={getAvatar(row.avatarPath, row.username)} alt=""
                    style={{
                      width: row.rank === 1 ? 64 : 52, height: row.rank === 1 ? 64 : 52,
                      borderRadius: '50%', border: `3px solid ${row.rank === 1 ? '#fbbf24' : row.rank === 2 ? '#94a3b8' : '#cd7f32'}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,.3)', objectFit: 'cover'
                    }} />
                  <div style={{ fontWeight: 700, fontSize: '.85rem', marginTop: '.4rem' }}>{row.fullName}</div>
                  <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>{row.totalPoints} pts</div>
                </div>
              ))}
            </div>
          )}

          {/* Full table */}
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ fontSize: '.875rem' }}>
              <thead style={{ borderBottom: '2px solid var(--sc-border)' }}>
                <tr>
                  <th style={{ padding: '.75rem 1.25rem', fontWeight: 700, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sc-muted)' }}>Rank</th>
                  <th style={{ padding: '.75rem', fontWeight: 700, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sc-muted)' }}>User</th>
                  <th style={{ padding: '.75rem', textAlign: 'right', fontWeight: 700, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sc-muted)' }}>Points</th>
                  <th style={{ padding: '.75rem', textAlign: 'right', fontWeight: 700, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sc-muted)' }}>Answers</th>
                  <th style={{ padding: '.75rem 1.25rem', textAlign: 'right', fontWeight: 700, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sc-muted)' }}>Avg</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const isMe = row.username === user?.username
                  return (
                    <tr key={row.userId} className={`animate-fade-up ${isMe ? 'lb-row-me' : ''}`}
                      style={{
                        background: isMe ? '#eff6ff' : 'transparent',
                        borderBottom: '1px solid var(--sc-border)',
                        animationDelay: `${i * .03}s`
                      }}>
                      <td style={{ padding: '.7rem 1.25rem', fontWeight: 800, fontSize: '1rem' }}>
                        {RANK_MEDAL[row.rank] || <span style={{ color: 'var(--sc-muted)' }}>#{row.rank}</span>}
                      </td>
                      <td style={{ padding: '.7rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                          <img src={getAvatar(row.avatarPath, row.username)} alt=""
                            className="avatar-circle sm" />
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {row.fullName}
                              {isMe && <span style={{ marginLeft: '.4rem', background: '#3b82f6', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '.65rem', fontWeight: 700 }}>You</span>}
                            </div>
                            <div style={{ fontSize: '.72rem', color: 'var(--sc-muted)' }}>@{row.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '.7rem', textAlign: 'right', fontWeight: 800, color: '#4f46e5', fontSize: '1rem' }}>{row.totalPoints}</td>
                      <td style={{ padding: '.7rem', textAlign: 'right', color: 'var(--sc-muted)' }}>{row.answersCount}</td>
                      <td style={{ padding: '.7rem 1.25rem', textAlign: 'right', color: 'var(--sc-muted)' }}>{row.avgScore}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
