import api from './api'

const LibraryService = {

  // Categorías
  getCategories: async () => {
    const response = await api.get('/library/categories')
    return response.data
  },

  createCategory: async (data) => {
    const response = await api.post('/library/categories', data)
    return response.data
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/library/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/library/categories/${id}`)
    return response.data
  },

  // Ejercicios
  getExercises: async (params = {}) => {
    const response = await api.get('/library/exercises', { params })
    return response.data
  },

  getExerciseById: async (id) => {
    const response = await api.get(`/library/exercises/${id}`)
    return response.data
  },

  createExercise: async (data) => {
    const response = await api.post('/library/exercises', data)
    return response.data
  },

  updateExercise: async (id, data) => {
    const response = await api.put(`/library/exercises/${id}`, data)
    return response.data
  },

  deleteExercise: async (id) => {
    const response = await api.delete(`/library/exercises/${id}`)
    return response.data
  },

  importFromWger: async (categoryIds) => {
    const response = await api.post('/library/exercises/import-wger', { categoryIds })
    return response.data
  },

  autoAssignCategories: async () => {
    const response = await api.post('/library/exercises/auto-assign')
    return response.data
  }

}

export default LibraryService