/* eslint-disable no-unused-vars */
import api from './api'

const DashboardService = {

  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  logActivity: async (type, referenceId = null) => {
    try {
      await api.post('/dashboard/activity', { type, referenceId })
    } catch (error) {
      // Silencioso — no interrumpir la experiencia del usuario
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/dashboard/password', { currentPassword, newPassword })
    return response.data
  }

}

export default DashboardService