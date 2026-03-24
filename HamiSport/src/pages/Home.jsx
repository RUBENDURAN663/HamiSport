import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import DashboardService from '../services/dashboard.service'

const motivationalTips = [
  { text: 'El dolor que sientes hoy será la fuerza que sentirás mañana.', author: 'Arnold Schwarzenegger' },
  { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali' },
  { text: 'El único mal entrenamiento es el que no hiciste.', author: 'Anónimo' },
  { text: 'Tu cuerpo puede hacerlo. Es tu mente la que necesitas convencer.', author: 'Anónimo' },
  { text: 'El éxito no es dado, se gana con sangre, sudor y determinación.', author: 'Anónimo' },
  { text: 'Entrena como si fueras el número dos. Compite como si fueras el número uno.', author: 'Anónimo' }
]

const Home = () => {
  const { user }              = useAuth()
  const [stats, setStats]     = useState(null)
  const [greeting, setGreeting]     = useState('')
  const [tipIndex, setTipIndex]     = useState(0)
  const [tipVisible, setTipVisible] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12)      setGreeting('Buenos días')
    else if (hour < 18) setGreeting('Buenas tardes')
    else                setGreeting('Buenas noches')
    setTipIndex(Math.floor(Math.random() * motivationalTips.length))
    // eslint-disable-next-line react-hooks/immutability
    loadStats()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % motivationalTips.length)
        setTipVisible(true)
      }, 400)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const data = await DashboardService.getStats()
      setStats(data.stats)
    } catch (error) {
      console.error('Error cargando stats:', error)
    }
  }

  const modules = [
    {
      path:  '/library',
      icon:  '🏋️',
      title: 'Biblioteca',
      desc:  'Ejercicios organizados por categoría deportiva y nivel',
      color: 'var(--med)',
      colorHex: '#1A6B8A',
      stat:  stats ? `${stats.exercisesViewed} vistos` : null,
      delay: '0s'
    },
    {
      path:  '/nutrition',
      icon:  '🥗',
      title: 'Nutrición',
      desc:  'Guías, calculadora de calorías y planes por deporte',
      color: 'var(--carine)',
      colorHex: '#1B4F8A',
      stat:  stats ? `${stats.nutritionVisits} visitas` : null,
      delay: '0.1s'
    },
    {
      path:  '/dashboard',
      icon:  '📊',
      title: 'Mi perfil',
      desc:  'Tu progreso, historial y configuración personal',
      color: 'var(--grisalho)',
      colorHex: '#4A6B8A',
      stat:  stats ? `${stats.aiQueries} consultas IA` : null,
      delay: '0.2s'
    }
  ]

  const currentTip = motivationalTips[tipIndex]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes shimmerMove {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes wave1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(60px, -40px) scale(1.1); }
          66%  { transform: translate(-40px, 60px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes wave2 {
          0%   { transform: translate(0px, 0px) scale(1.05); }
          33%  { transform: translate(-70px, 50px) scale(0.9); }
          66%  { transform: translate(50px, -60px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1.05); }
        }
        @keyframes wave3 {
          0%   { transform: translate(0px, 0px) scale(0.95); }
          33%  { transform: translate(40px, 70px) scale(1.05); }
          66%  { transform: translate(-60px, -40px) scale(1); }
          100% { transform: translate(0px, 0px) scale(0.95); }
        }
        @keyframes wave4 {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(-50px, -50px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .module-card-home { transition: border-color 0.25s, transform 0.25s; }
        .module-card-home:hover { transform: translateY(-3px); }
      `}</style>

      {/* Fondo con ondas animadas */}
      <div style={styles.waveBg}>
        <div style={styles.wave1}></div>
        <div style={styles.wave2}></div>
        <div style={styles.wave3}></div>
        <div style={styles.wave4}></div>
        <div style={styles.waveOverlay}></div>
      </div>

      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={{ ...styles.heroLeft, animation: 'fadeInUp 0.5s ease forwards' }}>
            <div style={styles.greetingBadge}>
              <span style={styles.greetingDot}></span>
              {greeting}, {user?.name?.split(' ')[0]}
            </div>
            <h1 style={styles.heroTitle}>
              Tu entrenamiento,<br/>
              <span style={styles.heroTitleAccent}>más inteligente.</span>
            </h1>
            <p style={styles.heroDesc}>
              Explora ejercicios, consulta tu asistente IA y alcanza tus objetivos deportivos desde un solo lugar.
            </p>
            <div style={styles.heroCtas}>
              <Link to="/library" style={styles.ctaPrimary}>
                Explorar biblioteca
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link to="/nutrition" style={styles.ctaSecondary}>Ver nutrición</Link>
            </div>
          </div>

          {stats && (
            <div style={{ ...styles.heroStats, animation: 'fadeInDown 0.5s ease 0.2s forwards', opacity: 0 }}>
              {[
                { val: stats.exercisesViewed, lbl: 'Ejercicios vistos', icon: '🏋️' },
                { val: stats.aiQueries,       lbl: 'Consultas HAMI',    icon: '🤖' },
                { val: stats.libraryVisits,   lbl: 'Visitas',           icon: '📚' }
              ].map((s, i) => (
                <div key={i} style={styles.heroStatCard}>
                  <span style={styles.heroStatIcon}>{s.icon}</span>
                  <div style={styles.heroStatVal}>{s.val}</div>
                  <div style={styles.heroStatLbl}>{s.lbl}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.container}>

        {/* Módulos */}
        <div style={{ marginBottom: '48px' }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Explora HAMISPORT</h2>
            <p style={styles.sectionDesc}>Todo lo que necesitas para tu entrenamiento</p>
          </div>
          <div style={styles.modulesGrid}>
            {modules.map((mod) => (
              <Link
                key={mod.path}
                to={mod.path}
                className="module-card-home"
                style={{
                  ...styles.moduleCard,
                  borderColor: mod.colorHex + '44',
                  animation: `fadeInUp 0.5s ease ${mod.delay} forwards`,
                  opacity: 0
                }}
              >
                <div style={styles.shimmerWrap}>
                  <div style={styles.shimmerLine}></div>
                </div>
                <div style={{ ...styles.moduleIconWrap, background: mod.colorHex + '22', border: `0.5px solid ${mod.colorHex}44` }}>
                  <span style={{ fontSize: '28px' }}>{mod.icon}</span>
                </div>
                <div style={styles.moduleBody}>
                  <div style={styles.moduleTitle}>{mod.title}</div>
                  <div style={styles.moduleDesc}>{mod.desc}</div>
                  {mod.stat && (
                    <div style={{ ...styles.moduleStat, color: mod.colorHex }}>
                      {mod.stat}
                    </div>
                  )}
                </div>
                <div style={{ ...styles.moduleArrow, color: mod.colorHex, transition: 'transform 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Frase motivacional */}
        <div style={styles.tipCard}>
          <div style={styles.tipLeft}>
            <div style={styles.tipIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="var(--med-2)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={styles.tipLabel}>Frase del momento</span>
          </div>
          <div style={{
            ...styles.tipContent,
            opacity: tipVisible ? 1 : 0,
            transform: tipVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease'
          }}>
            <p style={styles.tipText}>"{currentTip.text}"</p>
            <p style={styles.tipAuthor}>— {currentTip.author}</p>
          </div>
          <div style={styles.tipDots}>
            {motivationalTips.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  setTipVisible(false)
                  setTimeout(() => { setTipIndex(i); setTipVisible(true) }, 300)
                }}
                style={{
                  ...styles.tipDot,
                  background: i === tipIndex ? 'var(--med-2)' : 'var(--border)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        {/* Banner IA */}
        <div style={styles.aiBanner}>
          <div style={styles.aiBannerBg}></div>
          <div style={styles.aiBannerContent}>
            <div style={styles.aiPulseWrap}>
              <div style={styles.aiPulseRing}></div>
              <div style={styles.aiPulseRing2}></div>
              <div style={styles.aiIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="var(--violet-light)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
            </div>
            <div style={styles.aiBannerText}>
              <div style={styles.aiBannerTitle}>
                Habla con <span style={{ color: 'var(--med-light)' }}>HAMI</span>
              </div>
              <div style={styles.aiBannerDesc}>
                Tu asistente deportivo IA disponible 24/7. Pregúntale sobre ejercicios, nutrición, rutinas y más — por voz o texto.
              </div>
            </div>
            <div style={styles.aiBannerRight}>
              <div style={styles.aiBadge}>
                <span style={styles.aiBadgeDot}></span>
                IA activa
              </div>
              <p style={styles.aiBannerHint}>Toca el botón IA HAMI en el navbar</p>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div style={styles.adminBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <span style={{ fontSize: '13px', color: 'var(--violet-light)' }}>
                Panel de administración disponible
              </span>
            </div>
            <Link to="/admin" style={styles.adminLink}>Ir al panel</Link>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  /* Ondas de fondo */
  waveBg: {
    position: 'fixed', inset: 0,
    zIndex: 0, overflow: 'hidden',
    pointerEvents: 'none'
  },
  wave1: {
    position: 'absolute',
    width: '700px', height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,107,138,0.18) 0%, transparent 70%)',
    top: '-200px', left: '-150px',
    animation: 'wave1 15s ease-in-out infinite'
  },
  wave2: {
    position: 'absolute',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(27,79,138,0.16) 0%, transparent 70%)',
    top: '20%', right: '-100px',
    animation: 'wave2 18s ease-in-out infinite'
  },
  wave3: {
    position: 'absolute',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,107,138,0.14) 0%, transparent 70%)',
    bottom: '10%', left: '20%',
    animation: 'wave3 20s ease-in-out infinite'
  },
  wave4: {
    position: 'absolute',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(45,27,105,0.15) 0%, transparent 70%)',
    bottom: '-100px', right: '10%',
    animation: 'wave4 12s ease-in-out infinite'
  },
  waveOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(10,22,40,0.55)'
  },
  hero: {
    position: 'relative', zIndex: 1,
    borderBottom: '0.5px solid var(--border)'
  },
  heroInner: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '52px 20px 48px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    gap: '32px', flexWrap: 'wrap'
  },
  heroLeft: { flex: 1, minWidth: '280px' },
  greetingBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', fontWeight: '500', color: 'var(--med-light)',
    background: 'rgba(26,107,138,0.12)', border: '0.5px solid rgba(26,107,138,0.3)',
    borderRadius: '20px', padding: '6px 16px', marginBottom: '20px'
  },
  greetingDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'var(--med-2)', display: 'inline-block',
    animation: 'pulse 2s ease-in-out infinite'
  },
  heroTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: '500', color: 'var(--white)',
    lineHeight: '1.2', letterSpacing: '-0.02em',
    marginBottom: '14px'
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg, var(--med-2), var(--carine-2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'block'
  },
  heroDesc: {
    fontSize: '15px', color: 'var(--muted)',
    lineHeight: '1.7', marginBottom: '28px', maxWidth: '420px'
  },
  heroCtas: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  ctaPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    color: 'var(--white)', fontSize: '14px', fontWeight: '500',
    padding: '12px 24px', borderRadius: 'var(--radius-md)',
    textDecoration: 'none', transition: 'opacity 0.2s'
  },
  ctaSecondary: {
    display: 'inline-flex', alignItems: 'center',
    background: 'transparent', color: 'var(--muted)',
    fontSize: '14px', padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    border: '0.5px solid var(--border)', textDecoration: 'none'
  },
  heroStats: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  heroStatCard: {
    background: 'rgba(15,32,64,0.8)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 20px', textAlign: 'center',
    backdropFilter: 'blur(12px)', minWidth: '100px'
  },
  heroStatIcon: { fontSize: '20px', display: 'block', marginBottom: '6px' },
  heroStatVal:  { fontSize: '22px', fontWeight: '500', color: 'var(--white)' },
  heroStatLbl:  { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },
  container: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '48px 20px 60px',
    position: 'relative', zIndex: 1
  },
  sectionHeader: { marginBottom: '24px' },
  sectionTitle: { fontSize: '20px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' },
  sectionDesc:  { fontSize: '13px', color: 'var(--muted)' },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px'
  },
  moduleCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    textDecoration: 'none',
    background: 'rgba(15,32,64,0.7)',
    border: '0.5px solid',
    borderRadius: 'var(--radius-lg)', padding: '20px 22px',
    position: 'relative', overflow: 'hidden',
    backdropFilter: 'blur(8px)'
  },
  shimmerWrap: {
    position: 'absolute', inset: 0,
    overflow: 'hidden', pointerEvents: 'none'
  },
  shimmerLine: {
    position: 'absolute', top: 0, left: '-100%',
    width: '60%', height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(46,155,191,0.06), transparent)',
    animation: 'shimmerMove 3s ease-in-out infinite'
  },
  moduleIconWrap: {
    width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  moduleBody:  { flex: 1 },
  moduleTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' },
  moduleDesc:  { fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '6px' },
  moduleStat:  { fontSize: '11px', fontWeight: '500', letterSpacing: '0.03em' },
  moduleArrow: { flexShrink: 0 },
  tipCard: {
    background: 'rgba(15,32,64,0.7)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px 28px',
    marginBottom: '16px', backdropFilter: 'blur(8px)'
  },
  tipLeft: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  tipIconWrap: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'rgba(26,107,138,0.15)',
    border: '0.5px solid rgba(26,107,138,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  tipLabel: {
    fontSize: '11px', fontWeight: '500',
    color: 'var(--med-2)', letterSpacing: '0.08em', textTransform: 'uppercase'
  },
  tipContent:  { marginBottom: '16px' },
  tipText:     { fontSize: '16px', color: 'var(--white)', lineHeight: '1.65', fontStyle: 'italic', marginBottom: '8px' },
  tipAuthor:   { fontSize: '12px', color: 'var(--muted)' },
  tipDots:     { display: 'flex', gap: '6px' },
  tipDot:      { width: '6px', height: '6px', borderRadius: '50%', transition: 'background 0.3s' },
  aiBanner: {
    position: 'relative', overflow: 'hidden',
    background: 'rgba(21,18,40,0.8)',
    border: '0.5px solid rgba(123,111,212,0.3)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '12px', backdropFilter: 'blur(8px)'
  },
  aiBannerBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(26,107,138,0.15) 0%, rgba(27,79,138,0.1) 50%, transparent 100%)',
    pointerEvents: 'none'
  },
  aiBannerContent: {
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center',
    gap: '20px', padding: '24px 28px', flexWrap: 'wrap'
  },
  aiPulseWrap: {
    position: 'relative', flexShrink: 0,
    width: '56px', height: '56px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  aiPulseRing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '1px solid rgba(46,155,191,0.3)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  aiPulseRing2: {
    position: 'absolute', inset: '-8px', borderRadius: '50%',
    border: '0.5px solid rgba(46,155,191,0.15)',
    animation: 'pulse 2s ease-in-out 0.5s infinite'
  },
  aiIconWrap: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'var(--purple-2)',
    border: '0.5px solid rgba(123,111,212,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1
  },
  aiBannerText:  { flex: 1, minWidth: '200px' },
  aiBannerTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--white)', marginBottom: '6px' },
  aiBannerDesc:  { fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' },
  aiBannerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  aiBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', fontWeight: '500', color: 'var(--med-light)',
    background: 'rgba(26,107,138,0.15)',
    border: '0.5px solid rgba(26,107,138,0.3)',
    padding: '5px 12px', borderRadius: '20px'
  },
  aiBadgeDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#5DCAA5', animation: 'pulse 1.5s ease-in-out infinite'
  },
  aiBannerHint: { fontSize: '11px', color: 'var(--muted)', textAlign: 'right' },
  adminBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(26,107,138,0.06)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 18px', flexWrap: 'wrap', gap: '10px'
  },
  adminLink: {
    fontSize: '13px', fontWeight: '500', color: 'var(--white)',
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: 'none', borderRadius: 'var(--radius-md)',
    padding: '7px 16px', textDecoration: 'none'
  }
}

export default Home