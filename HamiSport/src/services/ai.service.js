import api from './api'

const AIService = {

  sendMessage: async (message) => {
    const response = await api.post('/ai/chat', { message })
    return response.data
  }

}

export default AIService