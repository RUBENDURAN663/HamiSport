import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import VoiceAssistant from '../voice/VoiceAssistant'

const Navbar = () => {
  const { user, logout }          = useAuth()
  const navigate                  = useNavigate()
  const location                  = useLocation()
  const [showVoice, setShowVoice] = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/',           label: 'Inicio' },
    { path: '/library',    label: 'Biblioteca' },
    { path: '/nutrition',  label: 'Nutrición' },
    { path: '/dashboard',  label: 'Mi perfil' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin' }] : [])
  ]

  return (
    <>
      <style>{`
        .mic-btn-nav:hover {
          background: linear-gradient(135deg, #6B52B5, #2E9BBF) !important;
          transform: scale(1.04);
        }
        .logout-btn-nav:hover {
          background: rgba(226,75,74,0.2) !important;
          border-color: rgba(226,75,74,0.6) !important;
        }
      `}</style>

      <nav style={styles.nav}>
        <div style={styles.inner}>

          {/* Logo — solo texto sin ícono */}
          <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
            <span style={styles.logoText}>
              HAMI<span style={{ color: 'var(--violet)' }}>SPORT</span>
            </span>
          </Link>

          {/* Links desktop */}
          <div style={styles.links} className="hide-mobile">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={{
                ...styles.link,
                ...(isActive(link.path) ? styles.linkActive : {})
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Derecha */}
          <div style={styles.rightRow}>

            {/* Botón IA HAMI — llamativo */}
            <button
              className="mic-btn-nav"
              style={styles.micBtn}
              onClick={() => setShowVoice(true)}
              title="Asistente IA HAMI"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span style={styles.micBtnText}>IA HAMI</span>
            </button>

            {/* Botón salir — rojo */}
            <button
              className="logout-btn-nav hide-mobile"
              style={styles.logoutBtn}
              onClick={handleLogout}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Salir
            </button>

            {/* Hamburguesa móvil */}
            <button
              className="show-mobile"
              style={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="var(--violet-light)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="var(--violet-light)" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div style={styles.mobileMenu} className="fade-in-fast">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.mobileLink,
                  ...(isActive(link.path) ? styles.mobileLinkActive : {})
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div style={styles.mobileDivider}/>
            <div style={styles.mobileUser}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{user?.name}</span>
              <button style={styles.mobileLogout} onClick={handleLogout}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Salir
              </button>
            </div>
          </div>
        )}
      </nav>

      {showVoice && <VoiceAssistant onClose={() => setShowVoice(false)} />}
    </>
  )
}

const styles = {
  nav: {
    background: 'var(--navy-2)',
    borderBottom: '0.5px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 50
  },
  inner: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '0 20px', height: '58px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '16px'
  },
  logo: {
    display: 'flex', alignItems: 'center',
    textDecoration: 'none', flexShrink: 0
  },
  logoText: {
    fontSize: '16px', fontWeight: '500',
    letterSpacing: '0.1em', color: 'var(--white)'
  },
  links: { display: 'flex', gap: '22px', flex: 1 },
  link: {
    fontSize: '13px', color: 'var(--muted)',
    textDecoration: 'none', transition: 'color 0.2s'
  },
  linkActive: { color: 'var(--violet-light)' },
  rightRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  micBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    background: 'linear-gradient(135deg, #4E3A8E, #1A6B8A)',
    border: '0.5px solid rgba(139,111,212,0.4)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--white)', padding: '8px 14px',
    cursor: 'pointer', transition: 'all 0.2s',
    flexShrink: 0
  },
  micBtnText: {
    fontSize: '12px', fontWeight: '500',
    letterSpacing: '0.04em', color: 'var(--white)'
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(226,75,74,0.1)',
    border: '0.5px solid rgba(226,75,74,0.35)',
    borderRadius: 'var(--radius-md)',
    color: '#F09595', fontSize: '12px', fontWeight: '500',
    padding: '8px 14px', cursor: 'pointer',
    transition: 'all 0.2s'
  },
  hamburger: {
    background: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '4px', cursor: 'pointer'
  },
  mobileMenu: {
    background: 'var(--navy-2)',
    borderTop: '0.5px solid var(--border)',
    padding: '12px 20px 16px',
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  mobileLink: {
    padding: '11px 12px', fontSize: '14px',
    color: 'var(--muted)', textDecoration: 'none',
    borderRadius: 'var(--radius-md)', transition: 'all 0.2s'
  },
  mobileLinkActive: {
    color: 'var(--violet-light)',
    background: 'rgba(139,111,212,0.1)'
  },
  mobileDivider: {
    height: '0.5px', background: 'var(--border)', margin: '8px 0'
  },
  mobileUser: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '4px 12px'
  },
  mobileLogout: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(226,75,74,0.1)',
    border: '0.5px solid rgba(226,75,74,0.35)',
    borderRadius: 'var(--radius-md)',
    color: '#F09595', fontSize: '12px',
    padding: '7px 14px', cursor: 'pointer'
  }
}

export default Navbar