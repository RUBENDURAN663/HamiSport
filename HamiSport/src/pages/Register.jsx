import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { register } = useAuth()
  const navigate     = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInError {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.bgGradient}></div>

      {/* Panel izquierdo decorativo — solo desktop */}
      <div style={styles.leftPanel} className="hide-mobile">
        <div style={styles.leftContent}>
          <div style={styles.leftIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="rgba(197,184,240,0.6)" strokeWidth="1.2" strokeLinecap="round">
              <path d="M6 4v6a6 6 0 0012 0V4"/>
              <line x1="3" y1="4" x2="9" y2="4"/>
              <line x1="15" y1="4" x2="21" y2="4"/>
              <line x1="12" y1="16" x2="12" y2="21"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
          <h2 style={styles.leftTitle}>Empieza hoy<br/>sin costo.</h2>
          <p style={styles.leftDesc}>
            Únete a HAMISPORT y accede a cientos de ejercicios, guías de nutrición y tu asistente IA personal.
          </p>
          <div style={styles.featureList}>
            {[
              'Acceso completo a la biblioteca',
              'Asistente HAMI por voz y texto',
              'Calculadora nutricional',
              'Planes por deporte'
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <div style={styles.featureDot}></div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido derecho */}
      <div style={styles.content}>

        <div style={styles.logoRow}>
          <div style={styles.logoDot}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#C5B8F0" strokeWidth="2" strokeLinecap="round">
              <path d="M6 4v6a6 6 0 0012 0V4"/>
              <line x1="3" y1="4" x2="9" y2="4"/>
              <line x1="15" y1="4" x2="21" y2="4"/>
            </svg>
          </div>
          <span style={styles.logoText}>
            HAMI<span style={{ color: 'var(--violet)' }}>SPORT</span>
          </span>
        </div>

        <h1 style={styles.bigTitle}>Crea tu<br/>cuenta.</h1>
        <p style={styles.bigSubtitle}>Regístrate gratis y comienza tu entrenamiento hoy</p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#F09595" strokeWidth="2" strokeLinecap="round"
              style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre completo</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                style={styles.input}
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                style={styles.input}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                style={styles.input}
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            )}
          </button>
        </form>

        <p style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={styles.footerLink}>Inicia sesión</Link>
        </p>

      </div>

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    background: '#0a1628',
    animation: 'slideInRight 0.4s ease forwards'
  },
  bgGradient: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, #0D1B2A 0%, #1A2A3F 40%, #2D1B69 70%, #1A1040 100%)',
    zIndex: 0
  },
  leftPanel: {
    position: 'relative', zIndex: 1,
    flex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '48px',
    borderRight: '0.5px solid rgba(139,111,212,0.15)'
  },
  leftContent: { maxWidth: '340px' },
  leftIcon: {
    width: '80px', height: '80px', borderRadius: '20px',
    background: 'rgba(78,58,142,0.3)',
    border: '0.5px solid rgba(139,111,212,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '28px'
  },
  leftTitle: {
    fontSize: '32px', fontWeight: '500',
    color: '#F5F4FA', lineHeight: '1.2',
    letterSpacing: '-0.02em', marginBottom: '16px'
  },
  leftDesc: {
    fontSize: '14px', color: 'rgba(245,244,250,0.5)',
    lineHeight: '1.7', marginBottom: '32px'
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    fontSize: '14px', color: 'rgba(245,244,250,0.7)'
  },
  featureDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'var(--violet)', flexShrink: 0
  },
  content: {
    position: 'relative', zIndex: 1,
    flex: 1, maxWidth: '520px',
    padding: 'clamp(32px, 6vw, 64px) clamp(24px, 6vw, 64px)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center'
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '48px'
  },
  logoDot: {
    width: '36px', height: '36px', borderRadius: '9px',
    background: 'rgba(78,58,142,0.6)',
    border: '0.5px solid rgba(139,111,212,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  logoText: {
    fontSize: '16px', fontWeight: '500',
    letterSpacing: '0.08em', color: '#F5F4FA'
  },
  bigTitle: {
    fontSize: 'clamp(36px, 5vw, 52px)',
    fontWeight: '500', color: '#F5F4FA',
    lineHeight: '1.15', letterSpacing: '-0.02em',
    marginBottom: '12px'
  },
  bigSubtitle: {
    fontSize: '15px', color: 'rgba(245,244,250,0.5)',
    marginBottom: '36px', lineHeight: '1.6'
  },
  errorBox: {
    background: 'rgba(226,75,74,0.12)',
    border: '0.5px solid rgba(226,75,74,0.4)',
    borderRadius: '8px', color: '#F09595',
    fontSize: '13px', padding: '13px 16px',
    marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '10px',
    animation: 'fadeInError 0.3s ease'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  formGroup: { marginBottom: '18px' },
  label: {
    display: 'block', fontSize: '12px', fontWeight: '500',
    color: 'rgba(245,244,250,0.6)', letterSpacing: '0.04em',
    marginBottom: '8px', textTransform: 'uppercase'
  },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', width: '16px', height: '16px',
    color: 'rgba(139,111,212,0.6)', pointerEvents: 'none'
  },
  input: {
    width: '100%', padding: '14px 14px 14px 44px',
    background: 'rgba(30,24,48,0.6)',
    border: '0.5px solid rgba(139,111,212,0.25)',
    borderRadius: '10px', color: '#F5F4FA',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
    backdropFilter: 'blur(8px)'
  },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #4E3A8E, #6B52B5)',
    border: 'none', borderRadius: '10px',
    color: '#F5F4FA', fontSize: '15px', fontWeight: '500',
    cursor: 'pointer', marginTop: '8px',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.02em'
  },
  footer: {
    fontSize: '13px', color: 'rgba(245,244,250,0.45)',
    marginTop: '24px'
  },
  footerLink: {
    color: 'var(--violet-light)', fontWeight: '500'
  }
}

export default Register