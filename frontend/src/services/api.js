import axios from 'axios'

// Determine API base URL based on environment
// In development (npm run dev): uses .env.development
// In production (npm run build): uses .env.production
// Can be overridden by .env.local or VITE_API_BASE env variable
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
const isDevelopment = import.meta.env.DEV

// Log API configuration
if (isDevelopment) {
  console.log(`🔧 Development Mode - API: ${API_BASE}`)
} else {
  console.log(`🚀 Production Mode - API: ${API_BASE}`)
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
  }
}

// helper API methods
export const authAPI = {
  register: (data) => api.post('/users/create', data),
  login: (data) => api.post('/users/login', data)
}

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getResources: () => api.get('/dashboard/resources'),
  search: (q) => api.post('/dashboard/search', { query: q })
}

export const toolsAPI = {
  getMyTools: () => api.get('/tools/mytools'),
  connectTool: (toolName, payload) => api.post(`/tools/connect/${toolName}`, payload),
  disconnectTool: (toolName) => api.post(`/tools/disconnect/${toolName}`),
  redirect: (toolName, query) => api.get(`/tools/redirect/${toolName}`, { params: { query } }),
  recommend: (payload) => api.post('/tools/recommend', payload)
}

export default api
