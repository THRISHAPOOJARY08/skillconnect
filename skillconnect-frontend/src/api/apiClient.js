import axios from 'axios'

// In production (Vercel), use the VITE_API_URL env var pointing to Render.
// In development, use '/api' which Vite proxies to localhost:8080.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillconnect_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('skillconnect_token')
      localStorage.removeItem('skillconnect_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default apiClient
