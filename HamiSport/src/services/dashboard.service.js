import api from './api'

const DashboardService = {

  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  logActivity: async (type, referenceId = null) => {
    const response = await api.post('/dashboard/activity', { type, referenceId })
    return response.data
  },

  updateProfile: async (name, email, avatarUrl) => {
    const response = await api.put('/dashboard/profile', { name, email, avatarUrl })
    return response.data
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/dashboard/password', { currentPassword, newPassword })
    return response.data
  }

}

export default DashboardService