import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { token, loading } = useAuth()
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{height:'100vh'}}><div className="spinner-border text-primary" /></div>
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
