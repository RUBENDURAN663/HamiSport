import axios from 'axios'
import { triggerSessionExpired } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hamisport_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/')

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('hamisport_token')
      localStorage.removeItem('hamisport_user')
      triggerSessionExpired()
      setTimeout(() => {
        window.location.href = '/login'
      }, 1800)
    }

    return Promise.reject(error)
  }
)

export default api