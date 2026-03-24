import api from './api'

const AuthService = {

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  login: async (email, password, remember = false) => {
  const response = await api.post('/auth/login', { email, password, remember })
  return response.data
},

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('hamisport_token')
    localStorage.removeItem('hamisport_user')
  }

}

export default AuthService