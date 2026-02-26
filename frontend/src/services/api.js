import axios from 'axios'

// Determine API base URL
// Priority:
// 1. `import.meta.env.VITE_API_BASE` (set at build time)
// 2. At runtime, use current origin + '/api' (for static builds served from same host)
// 3. Fallback to localhost for local development
const buildTimeApi = import.meta.env.VITE_API_BASE
const runtimeOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : null
const API_BASE = buildTimeApi || (runtimeOrigin ? `${runtimeOrigin}/api` : 'http://localhost:5000/api')
const isDevelopment = import.meta.env.DEV || (runtimeOrigin && runtimeOrigin.includes('localhost'))

// Log API configuration
if (isDevelopment) {
  console.log(`🔧 Development Mode - API: ${API_BASE}`)
} else {
  console.log(`🚀 Production/Runtime Mode - API: ${API_BASE}`)
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.url
    })
    return Promise.reject(error)
  }
)

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
    console.log('🔐 Auth token set')
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
    console.log('🔓 Auth token cleared')
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

export const supportAPI = {
  submit: (payload) => api.post('/support/submit', payload),
  myTickets: () => api.get('/support/my')
}

export const profileAPI = {
  me: () => api.get('/users/me'),
  changePassword: (payload) => api.put('/users/change-password', payload),
  updateProfile: (payload) => api.put('/users/update-profile', payload)
}

// Dev-C++ compile API helper
export const devcppAPI = {
  compile: (payload) => api.post('/tools/devcpp/compile', payload)
}

export default api
