import { useEffect, useRef, useState } from 'react'
import useVoice from '../../hooks/useVoice'

const statusConfig = {
  idle: {
    label:  'Toca para hablar o escribe tu consulta',
    color:  'var(--purple-2)',
    border: 'var(--border)',
    pulse:  false
  },
  listening: {
    label:  'Escuchando...',
    color:  '#1D3A2A',
    border: 'rgba(29,158,117,0.6)',
    pulse:  true
  },
  thinking: {
    label:  'Procesando...',
    color:  'var(--violet-surface)',
    border: 'rgba(139,111,212,0.6)',
    pulse:  true
  },
  speaking: {
    label:  'HAMI está respondiendo',
    color:  '#1A1A3F',
    border: 'rgba(78,58,142,0.8)',
    pulse:  true
  },
  error: {
    label:  'Error',
    color:  'rgba(226,75,74,0.15)',
    border: 'rgba(226,75,74,0.5)',
    pulse:  false
  }
}

const VoiceAssistant = ({ onClose }) => {
  const {
    status, transcript, response,
    error, isSupported, startListening, stopListening,
    processMessage
  } = useVoice()

  const [textInput, setTextInput] = useState('')
  const overlayRef = useRef(null)

  useEffect(() => {
    const synth = window.speechSynthesis
    setTimeout(() => {
      const greeting = new SpeechSynthesisUtterance(
        '¡Hola! Soy HAMI, tu asistente deportivo. ¿En qué puedo ayudarte hoy?'
      )
      greeting.lang = 'es-ES'
      greeting.rate = 1.0
      const voices = synth.getVoices()
      const spanishVoice = voices.find(v => v.lang.startsWith('es'))
      if (spanishVoice) greeting.voice = spanishVoice
      synth.speak(greeting)
    }, 400)
    return () => synth.cancel()
  }, [])

  const handleMicClick = () => {
    if (status === 'idle' || status === 'error') {
      startListening()
    } else if (status === 'listening') {
      stopListening()
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (!textInput.trim() || status === 'thinking' || status === 'speaking') return
    processMessage(textInput.trim())
    setTextInput('')
  }

  const cfg = statusConfig[status] || statusConfig.idle

  return (
    <div style={styles.overlay} ref={overlayRef}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.hamiDot}></div>
            <div>
              <div style={styles.hamiName}>HAMI</div>
              <div style={styles.hamiSub}>Asistente deportivo IA</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Área principal */}
        <div style={styles.mainArea}>

          {/* Botón micrófono */}
          <div style={styles.micWrapper}>
            {cfg.pulse && (
              <>
                <div style={{ ...styles.pulseRing, animationDelay: '0s', borderColor: cfg.border }}></div>
                <div style={{ ...styles.pulseRing, animationDelay: '0.4s', borderColor: cfg.border }}></div>
              </>
            )}
            <button
              style={{
                ...styles.micBtn,
                background: cfg.color,
                border: `1px solid ${cfg.border}`,
                cursor: status === 'thinking' || status === 'speaking' ? 'default' : 'pointer'
              }}
              onClick={handleMicClick}
              disabled={status === 'thinking' || status === 'speaking'}
            >
              {status === 'listening' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round">
                  <rect x="6" y="4" width="4" height="16" rx="2"/>
                  <rect x="14" y="4" width="4" height="16" rx="2"/>
                </svg>
              ) : status === 'thinking' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="var(--violet-light)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="12" cy="12" r="8" strokeDasharray="4 2"/>
                </svg>
              ) : status === 'speaking' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="var(--lavender)" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="var(--violet-light)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
          </div>

          {/* Estado */}
          <p style={{
            ...styles.statusLabel,
            color: status === 'listening' ? '#5DCAA5'
                 : status === 'error'     ? '#F09595'
                 : status === 'speaking'  ? 'var(--violet-light)'
                 : 'var(--muted)'
          }}>
            {error || cfg.label}
          </p>

          {/* Transcript */}
          {transcript && (
            <div style={styles.bubbleUser}>
              <span style={styles.bubbleLabel}>Tú</span>
              <p style={styles.bubbleText}>{transcript}</p>
            </div>
          )}

          {/* Respuesta */}
          {response && (
            <div style={styles.bubbleHami}>
              <span style={styles.bubbleLabel}>HAMI</span>
              <p style={styles.bubbleText}>{response}</p>
            </div>
          )}

          {/* Sugerencias cuando está idle y sin transcript */}
          {status === 'idle' && !transcript && (
            <div style={styles.suggestions}>
              <p style={styles.suggestLabel}>Puedes preguntarme sobre...</p>
              <div style={styles.suggestRow}>
                {[
                  '¿Cómo hago sentadillas correctamente?',
                  '¿Qué comer antes de entrenar?',
                  'Rutina para ganar músculo',
                  '¿Cómo mejorar mi velocidad?'
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{ ...styles.suggestChip, cursor: 'pointer' }}
                    onClick={() => processMessage(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Input de texto — respaldo al micrófono */}
        <div style={styles.textInputArea}>
          <form onSubmit={handleTextSubmit} style={styles.textForm}>
            <input
              style={styles.textInput}
              type="text"
              placeholder="O escribe tu consulta aquí..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              disabled={status === 'thinking' || status === 'speaking'}
            />
            <button
              type="submit"
              style={{
                ...styles.sendBtn,
                opacity: !textInput.trim() || status === 'thinking' || status === 'speaking' ? 0.5 : 1
              }}
              disabled={!textInput.trim() || status === 'thinking' || status === 'speaking'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--violet-light)" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Aviso si no soporta voz */}
        {!isSupported && (
          <div style={styles.unsupportedMsg}>
            ⚠️ Tu navegador no soporta reconocimiento de voz. Usa el campo de texto.
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: '20px'
  },
  modal: {
    background: 'var(--navy-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    width: '100%', maxWidth: '460px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 22px',
    borderBottom: '0.5px solid var(--border)',
    background: 'var(--violet-surface)'
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  hamiDot: {
    width: '36px', height: '36px',
    borderRadius: '50%',
    background: 'var(--purple-2)',
    border: '0.5px solid var(--border)'
  },
  hamiName: {
    fontSize: '15px', fontWeight: '500',
    color: 'var(--white)', letterSpacing: '0.05em'
  },
  hamiSub: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--muted)', fontSize: '16px', cursor: 'pointer'
  },
  mainArea: {
    padding: '28px 24px 20px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '16px',
    minHeight: '280px'
  },
  micWrapper: {
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100px', height: '100px'
  },
  pulseRing: {
    position: 'absolute',
    width: '80px', height: '80px',
    borderRadius: '50%',
    border: '1.5px solid',
    animation: 'pulseRing 1.4s ease-out infinite'
  },
  micBtn: {
    width: '72px', height: '72px',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s',
    position: 'relative', zIndex: 1
  },
  statusLabel: {
    fontSize: '13px', letterSpacing: '0.02em',
    textAlign: 'center', maxWidth: '280px'
  },
  bubbleUser: {
    width: '100%',
    background: 'rgba(139,111,212,0.1)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px'
  },
  bubbleHami: {
    width: '100%',
    background: 'var(--violet-surface)',
    border: '0.5px solid rgba(139,111,212,0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px'
  },
  bubbleLabel: {
    fontSize: '10px', fontWeight: '500',
    color: 'var(--violet)', letterSpacing: '0.08em',
    textTransform: 'uppercase', display: 'block', marginBottom: '6px'
  },
  bubbleText: {
    fontSize: '13px', color: 'var(--white)',
    lineHeight: '1.6'
  },
  suggestions: { width: '100%' },
  suggestLabel: {
    fontSize: '11px', color: 'var(--muted)',
    marginBottom: '10px', textAlign: 'center'
  },
  suggestRow: {
    display: 'flex', flexWrap: 'wrap',
    gap: '6px', justifyContent: 'center'
  },
  suggestChip: {
    fontSize: '11px', color: 'var(--muted)',
    background: 'var(--navy)',
    border: '0.5px solid var(--border)',
    borderRadius: '20px', padding: '5px 10px'
  },
  textInputArea: {
    padding: '0 20px 20px',
    borderTop: '0.5px solid var(--border)',
    paddingTop: '16px'
  },
  textForm: {
    display: 'flex', gap: '8px', alignItems: 'center'
  },
  textInput: {
    flex: 1, padding: '10px 14px',
    background: 'var(--violet-surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit'
  },
  sendBtn: {
    width: '38px', height: '38px',
    background: 'var(--purple-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0
  },
  unsupportedMsg: {
    padding: '12px 22px',
    background: 'rgba(226,75,74,0.1)',
    borderTop: '0.5px solid rgba(226,75,74,0.2)',
    fontSize: '12px', color: '#F09595',
    textAlign: 'center'
  }
}

export default VoiceAssistant