const groq = require('../config/gemini')

const SYSTEM_PROMPT = `
Eres HAMI, el asistente inteligente de HAMISPORT.
Eres un experto en entrenamiento deportivo, ejercicio físico, nutrición y rendimiento atlético.

Tu personalidad:
- Motivador, directo y claro
- Respondes siempre en español
- Tus respuestas son concisas — máximo 3 párrafos cortos
- Usas lenguaje accesible, no demasiado técnico
- Cuando no sabes algo, lo dices honestamente

Puedes ayudar con:
- Rutinas de entrenamiento para cualquier deporte
- Ejercicios específicos por grupo muscular
- Consejos de nutrición deportiva
- Técnica y ejecución de ejercicios
- Recuperación y descanso
- Motivación y mentalidad deportiva

NO respondes preguntas que no estén relacionadas con deporte, ejercicio o nutrición.
Si te preguntan algo fuera de tu área, redirige amablemente hacia temas deportivos.
`

const AIController = {

  chat: async (req, res) => {
    try {
      const { message } = req.body

      if (!message || message.trim() === '') {
        return res.status(400).json({ message: 'El mensaje no puede estar vacío' })
      }

      if (message.length > 500) {
        return res.status(400).json({ message: 'El mensaje es demasiado largo' })
      }

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system',  content: SYSTEM_PROMPT },
          { role: 'user',    content: message }
        ],
        max_tokens:  300,
        temperature: 0.7
      })

      const reply = completion.choices[0]?.message?.content || 'No pude generar una respuesta.'

      res.json({ reply })

    } catch (error) {
      console.error('Error en AI chat:', error.message)
      res.status(500).json({ message: 'Error al procesar tu consulta' })
    }
  }

}

module.exports = AIController