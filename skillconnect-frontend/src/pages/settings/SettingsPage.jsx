import { useState } from 'react'
import { Eye, EyeOff, Save } from 'lucide-react'
import apiClient from '../../api/apiClient'

export default function SettingsPage() {
  const [form, setForm]     = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [msg, setMsg]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { setMsg('error:Passwords do not match'); return }
    setLoading(true)
    try {
      await apiClient.put('/users/me/password', { oldPassword: form.oldPassword, newPassword: form.newPassword })
      setMsg('success:Password changed successfully!')
      setForm({ oldPassword:'', newPassword:'', confirm:'' })
    } catch (err) {
      setMsg(`error:${err.response?.data?.message || 'Failed'}`)
    } finally {
      setLoading(false)
    }
  }

  const isError = msg.startsWith('error:')
  const msgText = msg.replace(/^(error|success):/, '')

  return (
    <div style={{ maxWidth:520 }}>
      <h4 className="fw-bold mb-4" style={{ color:'var(--sc-navy)' }}>Settings</h4>

      <div className="sc-card">
        <h6 className="fw-bold mb-3" style={{ color:'var(--sc-navy)' }}>Change Password</h6>

        {msgText && (
          <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} py-2 small mb-3`}>{msgText}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Current Password</label>
            <div className="input-group">
              <input name="oldPassword" type={showPw ? 'text' : 'password'} className="form-control border-end-0"
                value={form.oldPassword} onChange={e => setForm({...form, oldPassword:e.target.value})} required />
              <button type="button" className="btn btn-outline-secondary border-start-0"
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">New Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters"
              value={form.newPassword} onChange={e => setForm({...form, newPassword:e.target.value})} required minLength={6} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Confirm New Password</label>
            <input type="password" className="form-control"
              value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} required />
          </div>
          <button type="submit" className="btn fw-semibold"
            style={{ background:'var(--sc-navy)', color:'#fff', borderRadius:8 }} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <Save size={15} className="me-2" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
