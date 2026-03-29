import api from './api'

const AIService = {

  sendMessage: async (message, history = []) => {
    const response = await api.post('/ai/chat', { message, history })
    return response.data
  }

}

export default AIService