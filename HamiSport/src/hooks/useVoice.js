/* eslint-disable no-unused-vars */
import { useState, useCallback, useRef } from 'react'
import AIService from '../services/ai.service'
import DashboardService from '../services/dashboard.service'

const useVoice = () => {
  const [status, setStatus]         = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse]     = useState('')
  const [error, setError]           = useState('')
  const [history, setHistory]       = useState([])

  const recognitionRef = useRef(null)
  const synthRef       = useRef(window.speechSynthesis)
  const hasResultRef   = useRef(false)
  const historyRef     = useRef([])

  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const getBestVoice = useCallback(() => {
    const voices = synthRef.current.getVoices()
    if (!voices.length) return null

    const neuralVoice = voices.find(v =>
      v.lang.startsWith('es') &&
      (v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Microsoft'))
    )
    if (neuralVoice) return neuralVoice

    const onlineVoice = voices.find(v =>
      v.lang.startsWith('es') && !v.localService
    )
    if (onlineVoice) return onlineVoice

    const anySpanish = voices.find(v => v.lang.startsWith('es'))
    if (anySpanish) return anySpanish

    return voices[0] || null
  }, [])

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      synthRef.current.cancel()

      const trySpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text)
        const bestVoice = getBestVoice()

        if (bestVoice) {
          utterance.voice = bestVoice
          utterance.lang  = bestVoice.lang
          const isNeural  = bestVoice.name.includes('Neural') || bestVoice.name.includes('Google')
          utterance.rate  = isNeural ? 1.05 : 0.92
          utterance.pitch = isNeural ? 1.0  : 1.05
        } else {
          utterance.lang  = 'es-ES'
          utterance.rate  = 0.92
          utterance.pitch = 1.05
        }

        utterance.volume  = 1.0
        utterance.onend   = () => resolve()
        utterance.onerror = () => resolve()
        synthRef.current.speak(utterance)
      }

      const voices = synthRef.current.getVoices()
      if (voices.length === 0) {
        synthRef.current.onvoiceschanged = () => {
          synthRef.current.onvoiceschanged = null
          trySpeak()
        }
      } else {
        trySpeak()
      }
    })
  }, [getBestVoice])

  const processMessage = useCallback(async (text) => {
    if (!text.trim()) return

    setTranscript(text)
    setStatus('thinking')
    DashboardService.logActivity('ai_query')

    const userMessage    = { role: 'user', content: text }
    const currentHistory = historyRef.current
    const updatedHistory = [...currentHistory, userMessage]

    try {
      const data  = await AIService.sendMessage(text, currentHistory)
      const reply = data.reply

      const assistantMessage = { role: 'assistant', content: reply }
      const newHistory       = [...updatedHistory, assistantMessage]

      historyRef.current = newHistory
      setHistory(newHistory)
      setResponse(reply)
      setStatus('speaking')
      await speak(reply)
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
      hasResultRef.current  = true
      let finalTranscript   = ''
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

    recognition.onspeechend = () => recognition.stop()

    recognition.onerror = (event) => {
      if (event.error === 'network') {
        const retryCount = (recognitionRef.current?._retryCount || 0) + 1
        if (retryCount <= 3) {
          setError(`Reconectando micrófono... (intento ${retryCount}/3)`)
          const delay = retryCount * 1200
          setTimeout(() => {
            try {
              const newRecognition               = new SpeechRecognition()
              newRecognition.lang                = 'es-MX'
              newRecognition.interimResults      = true
              newRecognition.maxAlternatives     = 3
              newRecognition.continuous          = false
              newRecognition._retryCount         = retryCount
              newRecognition.onstart             = recognition.onstart
              newRecognition.onresult            = recognition.onresult
              newRecognition.onspeechend         = recognition.onspeechend
              newRecognition.onerror             = recognition.onerror
              newRecognition.onend               = recognition.onend
              recognitionRef.current             = newRecognition
              newRecognition.start()
            } catch (e) {
              setError('No se pudo reconectar el micrófono. Usa el texto.')
              setStatus('error')
              setTimeout(() => { setStatus('idle'); setError('') }, 4000)
            }
          }, delay)
        } else {
          setError('El micrófono no está disponible ahora. Usa el campo de texto.')
          setStatus('error')
          setTimeout(() => { setStatus('idle'); setError('') }, 5000)
        }
      } else if (event.error === 'no-speech') {
        setError('No escuché nada. Intenta hablar más cerca del micrófono.')
        setStatus('error')
        setTimeout(() => { setStatus('idle'); setError('') }, 4000)
      } else if (event.error === 'not-allowed') {
        setError('Debes permitir el acceso al micrófono.')
        setStatus('error')
        setTimeout(() => { setStatus('idle'); setError('') }, 4000)
      } else {
        setError(`Error: ${event.error}. Intenta de nuevo.`)
        setStatus('error')
        setTimeout(() => { setStatus('idle'); setError('') }, 4000)
      }
    }

    recognition.onend = () => {
      if (!hasResultRef.current && status !== 'error') {
        setStatus('idle')
      }
    }

    recognitionRef.current            = recognition
    recognitionRef.current._retryCount = 0

    try {
      recognition.start()
    } catch (e) {
      setError('No se pudo iniciar el micrófono. Intenta de nuevo.')
      setStatus('error')
      setTimeout(() => { setStatus('idle'); setError('') }, 3000)
    }
  }, [isSupported, processMessage, status])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    synthRef.current.cancel()
    setStatus('idle')
  }, [])

  const clearHistory = useCallback(() => {
    historyRef.current = []
    setHistory([])
    setTranscript('')
    setResponse('')
  }, [])

  return {
    status, transcript, response,
    error, isSupported, history,
    startListening, stopListening,
    processMessage, clearHistory
  }
}

export default useVoice