import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ usernameOrEmail: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/login', form)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Brand */}
        <div className="text-center mb-4">
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(79,70,229,.4)'
          }}>
            <Zap size={26} color="#fff" />
          </div>
          <h4 style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em', marginBottom: '.3rem' }}>
            Welcome back
          </h4>
          <p style={{ color: '#64748b', fontSize: '.875rem', margin: 0 }}>
            Sign in to your SkillConnect account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, padding: '.7rem 1rem', marginBottom: '1rem',
            color: '#b91c1c', fontSize: '.85rem', display: 'flex', gap: '.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>
              Username or Email
            </label>
            <input
              name="usernameOrEmail"
              className="form-control"
              placeholder="Enter username or email"
              value={form.usernameOrEmail}
              onChange={handleChange}
              required
              style={{ padding: '.65rem .9rem' }}
            />
          </div>

          <div className="mb-4">
            <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.4rem' }}>
              Password
            </label>
            <div className="input-group">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-control border-end-0"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{ padding: '.65rem .9rem' }}
              />
              <button type="button" className="btn btn-outline-secondary border-start-0"
                style={{ borderRadius: '0 10px 10px 0', background: '#f8fafc' }}
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center mb-4">
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ borderRadius: 4 }} />
              <span style={{ color: '#475569' }}>Remember me</span>
            </label>
          </div>

          <button type="submit" className="btn w-100 btn-sc-primary"
            style={{ padding: '.7rem', fontSize: '.95rem' }}
            disabled={loading}>
            {loading
              ? <span className="spinner-border spinner-border-sm me-2" />
              : null}
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
            Create new
          </Link>
        </div>

      </div>
    </div>
  )
}
