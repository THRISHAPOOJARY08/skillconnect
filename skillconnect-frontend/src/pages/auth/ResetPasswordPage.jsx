import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../../api/apiClient'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token    = params.get('token') || ''

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await apiClient.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--sc-bg)' }}>
      <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: 400, borderRadius: 16 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2rem' }}>🔑</div>
          <h5 className="fw-bold mt-2" style={{ color: 'var(--sc-navy)' }}>Reset Password</h5>
        </div>

        {done ? (
          <div className="alert alert-success text-center">Password reset! Redirecting to login…</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <div className="mb-3">
              <label className="form-label fw-medium small">New Password</label>
              <input type="password" className="form-control" placeholder="Min 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium small">Confirm Password</label>
              <input type="password" className="form-control" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" className="btn w-100 fw-semibold"
              style={{ background: 'var(--sc-navy)', color: '#fff', borderRadius: 8 }}
              disabled={loading || !token}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Reset Password
            </button>
          </form>
        )}

        <p className="text-center mt-3 small">
          <Link to="/login" className="text-decoration-none" style={{ color: 'var(--sc-blue)' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
