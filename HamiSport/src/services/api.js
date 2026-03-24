import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor — agrega el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hamisport_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor — maneja token expirado globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hamisport_token')
      localStorage.removeItem('hamisport_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api