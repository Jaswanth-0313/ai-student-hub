import axios from 'axios'

// Determine API base URL (production-first)
// 1. VITE_API_BASE (preferred)
// 2. runtime origin '/api'
const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin + "/api"

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Store Firebase ID token for tool API calls
let currentFirebaseIdToken = null

export function setFirebaseIdToken(token) {
  currentFirebaseIdToken = token
  if (token) {
    api.defaults.headers.common['X-Firebase-Token'] = token
  } else {
    delete api.defaults.headers.common['X-Firebase-Token']
  }
}

// Add request interceptor for logging and token injection
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
  login: async (credentials) => api.post('/users/login', credentials),
  signup: async (userData) => api.post('/users/create', userData),
  syncFirebaseUser: async (userData) => {
    // Send Firebase user details to backend for MongoDB sync with retry
    const maxRetries = 3
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    let lastError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await api.post('/users/firebase', userData)
      } catch (err) {
        lastError = err
        console.warn(`⚠️ Firebase sync attempt ${attempt} failed`, err?.response?.status || err?.message)
        if (attempt < maxRetries) await delay(500 * attempt)
      }
    }

    console.error('❌ Firebase sync failed after retries; continuing without blocking UI', lastError)
    return { data: { message: 'Backend sync failed', warning: 'non-blocking', error: lastError?.message }}
  },
  forgotPassword: async (email) => api.post('/users/forgot-password', { email }),
  resetPassword: async (email, newPassword) => api.post('/users/reset-password', { email, newPassword }),
  verifyResetToken: async (token) => api.post('/users/verify-reset-token', { token })
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

export const studyAPI = {
  extract: (payload) => api.post('/study/extract', payload),
  summarize: (payload) => api.post('/study/summarize', payload),
  questions: (payload) => api.post('/study/questions', payload),
  explain: (payload) => api.post('/study/explain', payload),
  plan: (payload) => api.post('/study/plan', payload),
  evaluateQuiz: (payload) => api.post('/study/quiz/evaluate', payload)
}

export default api
