import api from './api'

const FavoriteService = {

  getAll: async () => {
    const response = await api.get('/favorites')
    return response.data
  },

  getIds: async () => {
    const response = await api.get('/favorites/ids')
    return response.data
  },

  toggle: async (exerciseId) => {
    const response = await api.post(`/favorites/toggle/${exerciseId}`)
    return response.data
  }

}

export default FavoriteService