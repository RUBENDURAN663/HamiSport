/* eslint-disable no-unused-vars */
import { useState, useCallback, useRef } from 'react'
import AIService from '../services/ai.service'
import DashboardService from '../services/dashboard.service'

const useVoice = () => {
  const [status, setStatus]         = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse]     = useState('')
  const [error, setError]           = useState('')

  const recognitionRef  = useRef(null)
  const synthRef        = useRef(window.speechSynthesis)
  const hasResultRef    = useRef(false)

  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      synthRef.current.cancel()
      const utterance    = new SpeechSynthesisUtterance(text)
      utterance.lang     = 'es-ES'
      utterance.rate     = 1.0
      utterance.pitch    = 1.0

      const voices = synthRef.current.getVoices()
      const spanishVoice = voices.find(v => v.lang.startsWith('es') && v.localService)
                        || voices.find(v => v.lang.startsWith('es'))
      if (spanishVoice) utterance.voice = spanishVoice

      utterance.onend   = () => resolve()
      utterance.onerror = () => resolve()
      synthRef.current.speak(utterance)
    })
  }, [])

  

  const processMessage = useCallback(async (text) => {
  if (!text.trim()) return
  setTranscript(text)
  setStatus('thinking')
  DashboardService.logActivity('ai_query')

  try {
    const data = await AIService.sendMessage(text)
    setResponse(data.reply)
    setStatus('speaking')
    await speak(data.reply)
    setStatus('idle')
  } catch (err) {
    const errMsg = 'No pude procesar tu consulta. Intenta de nuevo.'
    setError(errMsg)
    setStatus('error')
    await speak(errMsg)
    setTimeout(() => { setStatus('idle'); setError('') }, 3000)
  }
}, [speak])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome.')
      setStatus('error')
      return
    }

    synthRef.current.cancel()
    hasResultRef.current = false

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition       = new SpeechRecognition()

    recognition.lang            = 'es-MX'
    recognition.interimResults  = true
    recognition.maxAlternatives = 3
    recognition.continuous      = false

    recognition.onstart = () => {
      setStatus('listening')
      setError('')
      setTranscript('')
      setResponse('')
    }

    recognition.onresult = (event) => {
  hasResultRef.current = true
  let finalTranscript = ''
  let interimTranscript = ''

  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript
    } else {
      interimTranscript += event.results[i][0].transcript
    }
  }

  if (finalTranscript) {
    recognition.stop()
    processMessage(finalTranscript)
  } else if (interimTranscript) {
    setTranscript(interimTranscript)
  }
}

    recognition.onspeechend = () => {
      recognition.stop()
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('No escuché nada. Intenta hablar más cerca del micrófono.')
      } else if (event.error === 'not-allowed') {
        setError('Debes permitir el acceso al micrófono.')
      } else if (event.error === 'network') {
        setError('Error de red. Verifica tu conexión.')
      } else {
        setError(`Error: ${event.error}. Intenta de nuevo.`)
      }
      setStatus('error')
      setTimeout(() => { setStatus('idle'); setError('') }, 4000)
    }

    recognition.onend = () => {
      if (!hasResultRef.current && status !== 'error') {
        setStatus('idle')
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (e) {
      setError('No se pudo iniciar el micrófono. Intenta de nuevo.')
      setStatus('error')
      setTimeout(() => { setStatus('idle'); setError('') }, 3000)
    }

  }, [isSupported, processMessage, status])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    synthRef.current.cancel()
    setStatus('idle')
  }, [])

 return {
  status, transcript, response,
  error, isSupported,
  startListening, stopListening,
  processMessage
}
}

export default useVoice