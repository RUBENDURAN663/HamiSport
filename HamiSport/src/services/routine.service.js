import api from './api'

const RoutineService = {

  getAll: async () => {
    const response = await api.get('/routines')
    return response.data
  },

  getExerciseIds: async () => {
    const response = await api.get('/routines/exercise-ids')
    return response.data
  },

  create: async (day, name) => {
    const response = await api.post('/routines', { day, name })
    return response.data
  },

  updateName: async (id, name) => {
    const response = await api.put(`/routines/${id}`, { name })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/routines/${id}`)
    return response.data
  },

  addExercise: async (routineId, exerciseId) => {
    const response = await api.post(`/routines/${routineId}/exercises`, { exerciseId })
    return response.data
  },

  removeExercise: async (routineId, exerciseId) => {
    const response = await api.delete(`/routines/${routineId}/exercises/${exerciseId}`)
    return response.data
  }

}

export default RoutineService