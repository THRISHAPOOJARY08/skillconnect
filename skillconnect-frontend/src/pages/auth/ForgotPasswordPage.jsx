import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/apiClient'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--sc-bg)' }}>
      <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: 400, borderRadius: 16 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2rem' }}>🔒</div>
          <h5 className="fw-bold mt-2" style={{ color: 'var(--sc-navy)' }}>Forgot Password</h5>
        </div>

        {sent ? (
          <div className="alert alert-success text-center">
            Reset link sent! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <label className="form-label fw-medium small">Email Address</label>
            <input type="email" className="form-control mb-3"
              placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn w-100 fw-semibold"
              style={{ background: 'var(--sc-navy)', color: '#fff', borderRadius: 8 }}
              disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Send Reset Link
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
