import axios from 'axios'

// Determine API base URL (production-first)
// 1. VITE_API_BASE (preferred)
// 2. VITE_API_URL + '/api'
// 3. runtime origin '/api'
// 4. local dev fallback
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : (import.meta.env.DEV ? 'http://localhost:5000/api' : `${window.location.origin}/api`))
const isDevelopment = import.meta.env.DEV

if (!isDevelopment && !import.meta.env.VITE_API_BASE) {
  console.warn('⚠️ VITE_API_BASE is not set. Using defaults: ', API_BASE);
}

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

export const authAPI = {
  syncFirebaseUser: async (userData) => {
    // Send Firebase user details to backend for MongoDB sync
    return api.post('/users/firebase', userData);
  }
};

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
