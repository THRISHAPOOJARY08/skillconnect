import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'

const AVATARS = [
  { id: 1, path: '/avatars/female.jpg', label: 'Female' },
  { id: 2, path: '/avatars/male.jpg',   label: 'Male'   },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    fullName: '', bio: '', college: '', avatarId: 1, skills: '', interests: ''
  })
  const [showPw, setShowPw]         = useState(false)
  const [errors, setErrors]         = useState({})
  const [apiError, setApiError]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [step, setStep]             = useState(1) // 1=basic, 2=avatar+bio
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'available' | 'taken'
  const usernameTimer = useRef(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: '' })

    // Live username availability check
    if (name === 'username') {
      setUsernameStatus(null)
      clearTimeout(usernameTimer.current)
      if (value.trim().length >= 3) {
        setUsernameStatus('checking')
        usernameTimer.current = setTimeout(async () => {
          try {
            const { data } = await apiClient.get(`/auth/check-username?username=${encodeURIComponent(value.trim())}`)
            setUsernameStatus(data.available ? 'available' : 'taken')
            if (!data.available) setErrors(prev => ({ ...prev, username: 'Username is already taken' }))
          } catch { setUsernameStatus(null) }
        }, 500)
      }
    }
  }

  const validate1 = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name required'
    if (!form.username.trim() || form.username.length < 3) errs.username = 'Min 3 characters'
    if (!form.email.includes('@')) errs.email = 'Valid email required'
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleNext = () => {
    if (usernameStatus === 'taken') {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }))
      return
    }
    if (usernameStatus === 'checking') {
      setErrors(prev => ({ ...prev, username: 'Please wait while we check username availability' }))
      return
    }
    const errs = validate1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(2)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      const payload = {
        username:   form.username,
        email:      form.email,
        password:   form.password,
        fullName:   form.fullName,
        bio:        form.bio,
        college:    form.college,
        avatarId:   form.avatarId,
        skills:     form.skills,
        interests:  form.interests
      }
      const { data } = await apiClient.post('/auth/register', payload)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg" style={{ alignItems: 'flex-start', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="text-center mb-3">
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg,#4f46e5,#3b82f6)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto .75rem', boxShadow: '0 8px 24px rgba(79,70,229,.35)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
          </div>
          <h4 style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em', marginBottom: '.25rem' }}>Join SkillConnect</h4>
          <p style={{ color: '#64748b', fontSize: '.875rem', margin: 0 }}>Create your free account</p>
        </div>

        {/* Step indicator */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
          {[1,2].map(s => (
            <div key={s} className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{
                  width:32, height:32, fontSize:'.85rem',
                  background: s <= step ? 'var(--sc-navy)' : 'var(--sc-border)',
                  color: s <= step ? '#fff' : 'var(--sc-muted)'
                }}>
                {s < step ? <CheckCircle size={16} /> : s}
              </div>
              {s < 2 && <div style={{ width:40, height:2, background: s < step ? 'var(--sc-navy)' : 'var(--sc-border)' }} />}
            </div>
          ))}
        </div>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '.7rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '.85rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-medium small">Full Name *</label>
                <input name="fullName" className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  placeholder="Your full name" value={form.fullName} onChange={handleChange} />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium small d-flex align-items-center gap-2">
                  Username *
                  {usernameStatus === 'checking' && (
                    <span className="spinner-border spinner-border-sm text-secondary" style={{ width: 12, height: 12, borderWidth: 2 }} />
                  )}
                  {usernameStatus === 'available' && (
                    <CheckCircle size={14} color="#10b981" />
                  )}
                  {usernameStatus === 'taken' && (
                    <XCircle size={14} color="#ef4444" />
                  )}
                </label>
                <input name="username" autoComplete="username"
                  className={`form-control ${errors.username ? 'is-invalid' : usernameStatus === 'available' ? 'is-valid' : ''}`}
                  placeholder="Choose a username" value={form.username} onChange={handleChange} />
                {errors.username
                  ? <div className="invalid-feedback">{errors.username}</div>
                  : usernameStatus === 'available'
                    ? <div className="valid-feedback" style={{ display: 'block' }}>✓ Username is available</div>
                    : null
                }
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium small">Email *</label>
                <input name="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="your@email.com" value={form.email} onChange={handleChange} />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium small">Password *</label>
                <div className="input-group">
                  <input name="password" type={showPw ? 'text' : 'password'}
                    className={`form-control border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
                  <button type="button" className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium small">Confirm Password *</label>
                <input name="confirmPassword" type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>
            <button className="btn w-100 mt-4 btn-sc-primary"
              style={{ padding: '.65rem' }}
              onClick={handleNext}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <p className="small fw-semibold mb-2" style={{ color: 'var(--sc-navy)' }}>Choose your avatar</p>
            <div className="d-flex gap-4 mb-3">
              {AVATARS.map(av => (
                <button key={av.id} type="button"
                  onClick={() => setForm({ ...form, avatarId: av.id })}
                  className="p-0 border-0 bg-transparent d-flex flex-column align-items-center gap-1"
                  title={av.label}>
                  <img src={av.path} alt={av.label}
                    style={{
                      width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                      border: form.avatarId === av.id ? '4px solid #4f46e5' : '4px solid transparent',
                      boxShadow: form.avatarId === av.id ? '0 0 0 3px #ede9fe' : 'none',
                      opacity: form.avatarId === av.id ? 1 : 0.55,
                      transition: 'all .2s'
                    }}
                  />
                  <span style={{ fontSize: '.72rem', fontWeight: 600, color: form.avatarId === av.id ? '#4f46e5' : '#64748b' }}>
                    {av.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-medium small">Bio</label>
                <textarea name="bio" className="form-control" rows={2}
                  placeholder="Tell us about yourself…" value={form.bio} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-medium small">College (optional)</label>
                <input name="college" className="form-control"
                  placeholder="Your college or university" value={form.college} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium small">Skills (comma-separated)</label>
                <input name="skills" className="form-control"
                  placeholder="Java, Python, React…" value={form.skills} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium small">Interests (comma-separated)</label>
                <input name="interests" className="form-control"
                  placeholder="DSA, ML, Web Dev…" value={form.interests} onChange={handleChange} />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary flex-grow-1"
                style={{ borderRadius: 10 }} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="submit" className="btn flex-grow-1 btn-sc-primary"
                style={{ padding: '.65rem' }} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Create Account
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
