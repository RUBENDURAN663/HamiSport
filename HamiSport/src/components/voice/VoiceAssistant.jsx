import { useEffect, useRef, useState } from 'react'
import useVoice from '../../hooks/useVoice'

const statusConfig = {
  idle: {
    label:     'Tócame y háblame\no escríbeme',
    ringColor: 'rgba(46,155,191,0.4)',
    btnGrad:   'linear-gradient(135deg, var(--med), var(--carine))',
    btnBorder: 'rgba(46,155,191,0.4)',
    pulse:     false
  },
  listening: {
    label:     'Escuchando...',
    ringColor: 'rgba(29,158,117,0.5)',
    btnGrad:   'linear-gradient(135deg, #0F6E56, #1D9E75)',
    btnBorder: 'rgba(29,158,117,0.7)',
    pulse:     true
  },
  thinking: {
    label:     'Procesando\ntu consulta...',
    ringColor: 'rgba(139,111,212,0.5)',
    btnGrad:   'linear-gradient(135deg, var(--purple-2), var(--purple-3))',
    btnBorder: 'rgba(139,111,212,0.6)',
    pulse:     true
  },
  speaking: {
    label:     'HAMI está\nrespondiendo',
    ringColor: 'rgba(46,114,191,0.5)',
    btnGrad:   'linear-gradient(135deg, var(--carine), var(--med))',
    btnBorder: 'rgba(46,114,191,0.6)',
    pulse:     true
  },
  error: {
    label:     'Algo salió\nmal',
    ringColor: 'rgba(226,75,74,0.4)',
    btnGrad:   'linear-gradient(135deg, #A32D2D, #E24B4A)',
    btnBorder: 'rgba(226,75,74,0.5)',
    pulse:     false
  }
}

const SUGGESTIONS = [
  '¿Cómo hago sentadillas correctamente?',
  '¿Qué debo comer antes de entrenar?',
  '¿Cuántas proteínas necesito al día?',
  'Dame una rutina para ganar músculo',
  '¿Cómo mejorar mi resistencia cardiovascular?',
  '¿Qué ejercicios puedo hacer en casa?',
  '¿Cómo evitar lesiones al correr?'
]

const VoiceAssistant = ({ onClose }) => {
  const {
    status, transcript, response,
    error, isSupported,
    startListening, stopListening, processMessage
  } = useVoice()

  const [textInput, setTextInput] = useState('')
  const [closing, setClosing]     = useState(false)
  const inputRef = useRef(null)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 280)
  }

  useEffect(() => {
    const synth = window.speechSynthesis
    const timer = setTimeout(() => {
      const greeting    = new SpeechSynthesisUtterance(
        '¡Hola! Soy HAMI, tu asistente IA. ¿En qué puedo ayudarte?'
      )
      greeting.lang     = 'es-ES'
      greeting.rate     = 0.95
      greeting.pitch    = 1.05
      const voices      = synth.getVoices()
      const best        = voices.find(v => v.lang.startsWith('es') && !v.localService)
                       || voices.find(v => v.lang.startsWith('es'))
      if (best) greeting.voice = best
      synth.speak(greeting)
    }, 350)
    return () => { clearTimeout(timer); synth.cancel() }
  }, [])

  const handleMicClick = () => {
    if (status === 'idle' || status === 'error') startListening()
    else if (status === 'listening') stopListening()
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (!textInput.trim() || status === 'thinking' || status === 'speaking') return
    processMessage(textInput.trim())
    setTextInput('')
  }

  const cfg = statusConfig[status] || statusConfig.idle
  const isActive = status === 'thinking' || status === 'speaking'

  return (
    <>
      <style>{`
        @keyframes hamiModalIn {
          from { opacity: 0; transform: scale(0.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes hamiModalOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.93) translateY(14px); }
        }
        @keyframes hamiOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hamiOverlayOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);    opacity: 0.65; }
          100% { transform: scale(2.0);  opacity: 0; }
        }
        @keyframes hamiSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes hamiBounce {
          0%, 80%, 100% { transform: scaleY(1); }
          40%           { transform: scaleY(1.7); }
        }
        @keyframes hamiGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46,155,191,0.0); }
          50%      { box-shadow: 0 0 28px 6px rgba(46,155,191,0.18); }
        }
        .hami-suggest-chip:hover {
          background: rgba(46,155,191,0.14) !important;
          border-color: rgba(46,155,191,0.38) !important;
          color: var(--med-light) !important;
          transform: translateY(-1px);
        }
        .hami-close:hover { color: #ff6b6b !important; }
        .hami-mic:hover:not(:disabled) {
          filter: brightness(1.12);
          transform: scale(1.05);
        }
        .hami-send:hover:not(:disabled) {
          filter: brightness(1.15);
          transform: scale(1.04);
        }
        .hami-input:focus {
          border-color: rgba(46,155,191,0.45) !important;
          box-shadow: 0 0 0 3px rgba(46,155,191,0.08);
          outline: none;
        }
      `}</style>

      {/* Overlay */}
      <div
        style={{
          ...s.overlay,
          animation: closing
            ? 'hamiOverlayOut 0.28s ease forwards'
            : 'hamiOverlayIn 0.25s ease forwards'
        }}
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          style={{
            ...s.modal,
            animation: closing
              ? 'hamiModalOut 0.28s cubic-bezier(0.4,0,1,1) forwards'
              : 'hamiModalIn 0.34s cubic-bezier(0.16,1,0.3,1) forwards'
          }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── HEADER ── */}
          <div style={s.header}>
            <div>
              <div style={s.hamiTitle}>HAMI</div>
              <div style={s.hamiSub}>
                <span style={s.onlineDot} />
                Asistente IA
              </div>
            </div>
            <button className="hami-close" style={s.closeBtn} onClick={handleClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#E24B4A" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── CUERPO PRINCIPAL ── */}
          <div style={s.body}>

            {/* Sección hero — micrófono + texto lado a lado */}
            <div style={s.heroRow}>

              {/* Lado izquierdo — micrófono con clip semicircular */}
              <div style={s.micSide}>
                <div style={s.micClipWrap}>
                  {/* Anillos de pulso */}
                  {cfg.pulse && (
                    <>
                      <div style={{ ...s.pulseRing, animationDelay: '0s',    borderColor: cfg.ringColor }} />
                      <div style={{ ...s.pulseRing, animationDelay: '0.5s',  borderColor: cfg.ringColor }} />
                      <div style={{ ...s.pulseRing, animationDelay: '1.0s',  borderColor: cfg.ringColor }} />
                    </>
                  )}
                  {/* Aura difuminada de fondo */}
                  <div style={{
                    ...s.micAura,
                    background: `radial-gradient(circle, ${cfg.ringColor} 0%, transparent 70%)`
                  }} />
                  {/* Botón micrófono */}
                  <button
                    className="hami-mic"
                    style={{
                      ...s.micBtn,
                      background: cfg.btnGrad,
                      border: `1.5px solid ${cfg.btnBorder}`,
                      cursor: isActive ? 'default' : 'pointer',
                      animation: status === 'idle' ? 'hamiGlow 3.5s ease-in-out infinite' : 'none'
                    }}
                    onClick={handleMicClick}
                    disabled={isActive}
                  >
                    <MicIcon status={status} />
                  </button>
                </div>
              </div>

              {/* Lado derecho — texto de estado */}
              <div style={s.textSide}>
                {cfg.label.split('\n').map((line, i) => (
                  <div key={i} style={{
                    ...s.heroText,
                    color: status === 'listening' ? '#5DCAA5'
                         : status === 'error'     ? '#F09595'
                         : status === 'speaking'  ? 'var(--med-light)'
                         : status === 'thinking'  ? 'var(--violet-light)'
                         : 'var(--white)',
                    marginBottom: i === 0 ? '2px' : 0
                  }}>
                    {line}
                  </div>
                ))}
                {status === 'speaking' && <SpeakingBars />}
                {error && (
                  <div style={s.errorText}>{error}</div>
                )}
              </div>
            </div>

            {/* Burbujas de conversación */}
            {(transcript || response) && (
              <div style={s.bubblesWrap}>
                {transcript && (
                  <div style={s.bubbleUser}>
                    <span style={s.bubbleLabelUser}>Tú</span>
                    <p style={s.bubbleText}>{transcript}</p>
                  </div>
                )}
                {response && (
                  <div style={s.bubbleHami}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={s.bubbleLabelHami}>HAMI</span>
                      {status === 'speaking' && <SpeakingBars />}
                    </div>
                    <p style={s.bubbleText}>{response}</p>
                  </div>
                )}
              </div>
            )}

            {/* Sugerencias — solo cuando idle y sin conversación activa */}
            {status === 'idle' && !transcript && (
              <div style={s.suggestWrap}>
                <p style={s.suggestTitle}>Puedes preguntarme sobre...</p>
                <div style={s.suggestGrid}>
                  {SUGGESTIONS.map((text, i) => (
                    <div
                      key={i}
                      className="hami-suggest-chip"
                      style={s.suggestChip}
                      onClick={() => processMessage(text)}
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── INPUT DE TEXTO ── */}
          <div style={s.inputArea}>
            {!isSupported && (
              <div style={s.unsupportedMsg}>
                ⚠️ Tu navegador no soporta voz. Usa el campo de texto.
              </div>
            )}
            <form onSubmit={handleTextSubmit} style={s.inputForm}>
              <input
                ref={inputRef}
                className="hami-input"
                style={{
                  ...s.textInput,
                  opacity: isActive ? 0.55 : 1
                }}
                type="text"
                placeholder="Escribe tu consulta aquí..."
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                disabled={isActive}
              />
              <button
                type="submit"
                className="hami-send"
                style={{
                  ...s.sendBtn,
                  opacity: !textInput.trim() || isActive ? 0.4 : 1
                }}
                disabled={!textInput.trim() || isActive}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="var(--white)" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}

// ── SUBCOMPONENTES ────────────────────────────────────────────────────────────

const MicIcon = ({ status }) => {
  if (status === 'listening') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round">
      <rect x="6" y="4" width="4" height="16" rx="2"/>
      <rect x="14" y="4" width="4" height="16" rx="2"/>
    </svg>
  )
  if (status === 'thinking') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="var(--violet-light)" strokeWidth="2" strokeLinecap="round"
      style={{ animation: 'hamiSpin 1.2s linear infinite' }}>
      <path d="M12 2a10 10 0 0 1 10 10"/>
      <path d="M12 2a10 10 0 0 0-10 10" strokeOpacity="0.3"/>
    </svg>
  )
  if (status === 'speaking') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="var(--med-light)" strokeWidth="2" strokeLinecap="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  )
  if (status === 'error') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="#F09595" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="var(--white)" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )
}

const SpeakingBars = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
    {[0, 0.15, 0.3].map((delay, i) => (
      <div key={i} style={{
        width: '3px', height: '14px',
        background: 'var(--med-light)',
        borderRadius: '2px',
        animation: `hamiBounce 0.8s ease-in-out ${delay}s infinite`
      }} />
    ))}
  </div>
)

// ── ESTILOS ───────────────────────────────────────────────────────────────────

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(5,10,20,0.84)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: '20px'
  },
  modal: {
    background: 'var(--navy-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%', maxWidth: '560px',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(46,155,191,0.08)'
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 18px',
    borderBottom: '0.5px solid var(--border)',
    background: 'linear-gradient(135deg, var(--navy-3) 0%, rgba(26,107,138,0.12) 100%)'
  },
  hamiTitle: {
    fontSize: '26px', fontWeight: '500',
    color: 'var(--white)', letterSpacing: '0.08em',
    lineHeight: 1
  },
  hamiSub: {
    fontSize: '12px', color: 'var(--muted)',
    marginTop: '5px', display: 'flex',
    alignItems: 'center', gap: '6px'
  },
  onlineDot: {
    display: 'inline-block',
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 0 2px rgba(29,158,117,0.25)'
  },
  closeBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.15s', borderRadius: '4px'
  },
  body: {
    padding: '28px 24px 20px',
    display: 'flex', flexDirection: 'column', gap: '20px'
  },
  heroRow: {
    display: 'flex', alignItems: 'center',
    gap: '28px', minHeight: '110px'
  },
  micSide: {
    flexShrink: 0, width: '110px', height: '110px',
    position: 'relative',
    // Clip semicircular — recorta la mitad derecha
    clipPath: 'inset(0 0 0 0 round 0 50% 50% 0)'
  },
  micClipWrap: {
    width: '110px', height: '110px',
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  pulseRing: {
    position: 'absolute',
    width: '88px', height: '88px',
    borderRadius: '50%', border: '1.5px solid',
    animation: 'pulseRing 1.8s ease-out infinite',
    pointerEvents: 'none'
  },
  micAura: {
    position: 'absolute',
    width: '140px', height: '140px',
    borderRadius: '50%',
    pointerEvents: 'none',
    opacity: 0.6
  },
  micBtn: {
    width: '80px', height: '80px',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1,
    transition: 'filter 0.2s, transform 0.15s'
  },
  textSide: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', gap: '4px'
  },
  heroText: {
    fontSize: '22px', fontWeight: '500',
    lineHeight: '1.25', letterSpacing: '-0.01em'
  },
  errorText: {
    fontSize: '12px', color: '#F09595',
    marginTop: '6px', lineHeight: '1.5'
  },
  bubblesWrap: {
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  bubbleUser: {
    background: 'rgba(46,114,191,0.08)',
    border: '0.5px solid rgba(46,114,191,0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px'
  },
  bubbleHami: {
    background: 'rgba(26,107,138,0.1)',
    border: '0.5px solid rgba(46,155,191,0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px'
  },
  bubbleLabelUser: {
    fontSize: '10px', fontWeight: '500',
    color: 'var(--carine-light)',
    background: 'rgba(46,114,191,0.15)',
    border: '0.5px solid rgba(46,114,191,0.25)',
    borderRadius: '20px', padding: '2px 8px',
    letterSpacing: '0.04em', display: 'inline-block', marginBottom: '6px'
  },
  bubbleLabelHami: {
    fontSize: '10px', fontWeight: '500',
    color: 'var(--med-light)', letterSpacing: '0.06em'
  },
  bubbleText: {
    fontSize: '13px', color: 'var(--white)',
    lineHeight: '1.65', margin: 0
  },
  suggestWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  suggestTitle: {
    fontSize: '11px', color: 'var(--muted)',
    textAlign: 'center', letterSpacing: '0.02em'
  },
  suggestGrid: {
    display: 'flex', flexWrap: 'wrap',
    gap: '6px', justifyContent: 'center'
  },
  suggestChip: {
    fontSize: '11px', color: 'var(--muted)',
    background: 'rgba(46,155,191,0.06)',
    border: '0.5px solid rgba(46,155,191,0.15)',
    borderRadius: '20px', padding: '6px 12px',
    cursor: 'pointer', transition: 'all 0.18s',
    userSelect: 'none', lineHeight: '1.4'
  },
  inputArea: {
    padding: '0 20px 20px',
    borderTop: '0.5px solid var(--border-soft)',
    paddingTop: '14px'
  },
  inputForm: { display: 'flex', gap: '8px', alignItems: 'center' },
  textInput: {
    flex: 1, padding: '11px 14px',
    background: 'var(--navy-3)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  sendBtn: {
    width: '40px', height: '40px', flexShrink: 0,
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: 'none', borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s'
  },
  unsupportedMsg: {
    padding: '8px 0 12px',
    fontSize: '12px', color: '#F09595', textAlign: 'center'
  }
}

export default VoiceAssistant