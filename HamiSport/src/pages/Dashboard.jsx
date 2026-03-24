import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardService from '../services/dashboard.service'
import Navbar from '../components/layout/Navbar'

const Dashboard = () => {
  const { user, logout }   = useAuth()
  const [stats, setStats]  = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  // Form cambio de contraseña
  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [pwMsg, setPwMsg]     = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await DashboardService.getStats()
      setStats(data.stats)
      setHistory(data.history)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg('')

    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg('error:Las contraseñas nuevas no coinciden')
      return
    }

    if (pwForm.newPw.length < 6) {
      setPwMsg('error:La contraseña debe tener al menos 6 caracteres')
      return
    }

    setPwLoading(true)
    try {
      await DashboardService.changePassword(pwForm.current, pwForm.newPw)
      setPwMsg('success:Contraseña actualizada correctamente')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (error) {
      setPwMsg('error:' + (error.response?.data?.message || 'Error al cambiar contraseña'))
    } finally {
      setPwLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const difficultyColor = {
    principiante: '#1D9E75',
    intermedio:   '#EF9F27',
    avanzado:     '#E24B4A'
  }

  const tabs = [
    { id: 'profile',   label: 'Perfil' },
    { id: 'stats',     label: 'Estadísticas' },
    { id: 'history',   label: 'Historial' },
    { id: 'security',  label: 'Seguridad' }
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Header perfil */}
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>{getInitials(user?.name)}</div>
          <div>
            <h1 style={styles.profileName}>{user?.name}</h1>
            <p style={styles.profileEmail}>{user?.email}</p>
            <div style={styles.roleBadge}>
              {user?.role === 'admin' ? '⚡ Administrador' : '👤 Usuario'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '8px 20px',
              background: activeTab === tab.id ? 'var(--purple-2)' : 'var(--navy-2)',
              border: `0.5px solid ${activeTab === tab.id ? 'var(--violet)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              color: activeTab === tab.id ? 'var(--violet-light)' : 'var(--muted)',
              fontSize: '13px', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '500' : '400'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PERFIL ── */}
        {activeTab === 'profile' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Información de perfil</h2>
            <div style={styles.infoGrid}>
              {[
                { label: 'Nombre completo', value: user?.name },
                { label: 'Correo electrónico', value: user?.email },
                { label: 'Rol', value: user?.role === 'admin' ? 'Administrador' : 'Usuario' },
                { label: 'Miembro desde', value: formatDate(stats?.joinDate) },
                { label: 'Ejercicios vistos', value: stats?.exercisesViewed || 0 },
                { label: 'Consultas a HAMI', value: stats?.aiQueries || 0 }
              ].map((item, i) => (
                <div key={i} style={styles.infoItem}>
                  <span style={styles.infoLabel}>{item.label}</span>
                  <span style={styles.infoValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ESTADÍSTICAS ── */}
        {activeTab === 'stats' && (
          <div>
            <div style={styles.statsGrid}>
              {[
                { label: 'Ejercicios vistos',    value: stats?.exercisesViewed || 0, icon: '🏋️', color: '#4E3A8E' },
                { label: 'Consultas a HAMI',     value: stats?.aiQueries       || 0, icon: '🤖', color: '#8B6FD4' },
                { label: 'Visitas biblioteca',   value: stats?.libraryVisits   || 0, icon: '📚', color: '#1D9E75' },
                { label: 'Visitas nutrición',    value: stats?.nutritionVisits || 0, icon: '🥗', color: '#EF9F27' }
              ].map((stat, i) => (
                <div key={i} style={{ ...styles.statCard, borderColor: stat.color + '44' }}>
                  <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ ...styles.card, marginTop: '16px' }}>
              <h2 style={styles.cardTitle}>Resumen de actividad</h2>
              {stats?.exercisesViewed === 0 && stats?.aiQueries === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>
                  Aún no tienes actividad registrada. ¡Explora la biblioteca y habla con HAMI!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Ejercicios vistos',  value: stats?.exercisesViewed || 0, total: 20, color: '#4E3A8E' },
                    { label: 'Consultas IA',        value: stats?.aiQueries       || 0, total: 50, color: '#8B6FD4' },
                    { label: 'Visitas biblioteca',  value: stats?.libraryVisits   || 0, total: 30, color: '#1D9E75' },
                    { label: 'Visitas nutrición',   value: stats?.nutritionVisits || 0, total: 20, color: '#EF9F27' }
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{item.value}</span>
                      </div>
                      <div style={styles.progressBg}>
                        <div style={{
                          ...styles.progressBar,
                          width: `${Math.min((item.value / item.total) * 100, 100)}%`,
                          background: item.color
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {activeTab === 'history' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Ejercicios vistos recientemente</h2>
            {history.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
                No has visto ningún ejercicio aún. ¡Explora la biblioteca!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((ex, i) => (
                  <div key={i} style={styles.historyItem}>
                    {ex.image_url ? (
                      <img src={ex.image_url} alt={ex.name} style={styles.historyImg}/>
                    ) : (
                      <div style={styles.historyImgPlaceholder}>
                        <span style={{ fontSize: '18px' }}>🏋️</span>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={styles.historyName}>{ex.name}</div>
                      {ex.muscles && (
                        <div style={styles.historyMuscles}>{ex.muscles}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                        background: (difficultyColor[ex.difficulty] || '#888') + '22',
                        color: difficultyColor[ex.difficulty] || '#888',
                        border: `0.5px solid ${(difficultyColor[ex.difficulty] || '#888')}44`
                      }}>
                        {ex.difficulty}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {formatDate(ex.viewed_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SEGURIDAD ── */}
        {activeTab === 'security' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Cambiar contraseña</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
              Usa una contraseña segura de al menos 6 caracteres
            </p>

            {pwMsg && (
              <div style={{
                background: pwMsg.startsWith('error') ? 'rgba(226,75,74,0.1)' : 'rgba(29,158,117,0.1)',
                border: `0.5px solid ${pwMsg.startsWith('error') ? 'rgba(226,75,74,0.3)' : 'rgba(29,158,117,0.3)'}`,
                borderRadius: 'var(--radius-md)',
                color: pwMsg.startsWith('error') ? '#F09595' : '#5DCAA5',
                fontSize: '13px', padding: '10px 14px', marginBottom: '20px'
              }}>
                {pwMsg.split(':')[1]}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contraseña actual</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.current}
                  onChange={e => setPwForm({...pwForm, current: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nueva contraseña</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.newPw}
                  onChange={e => setPwForm({...pwForm, newPw: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar nueva contraseña</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.confirm}
                  onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
                  required
                />
              </div>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: pwLoading ? 0.7 : 1 }}
                disabled={pwLoading}
              >
                {pwLoading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  profileHeader: {
    display: 'flex', alignItems: 'center', gap: '20px',
    marginBottom: '32px', flexWrap: 'wrap'
  },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'var(--purple-2)',
    border: '2px solid var(--violet)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '500', color: 'var(--violet-light)',
    flexShrink: 0
  },
  profileName:  { fontSize: '22px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' },
  profileEmail: { fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' },
  roleBadge: {
    display: 'inline-block', fontSize: '11px', fontWeight: '500',
    background: 'rgba(139,111,212,0.15)', color: 'var(--violet-light)',
    border: '0.5px solid var(--border)', borderRadius: '20px',
    padding: '3px 10px'
  },
  card: {
    background: 'var(--navy-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px'
  },
  cardTitle: { fontSize: '17px', fontWeight: '500', color: 'var(--white)', marginBottom: '20px' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '0' },
  infoItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '0.5px solid var(--border-soft)'
  },
  infoLabel: { fontSize: '13px', color: 'var(--muted)' },
  infoValue: { fontSize: '13px', fontWeight: '500', color: 'var(--white)' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px'
  },
  statCard: {
    background: 'var(--navy-2)', border: '0.5px solid',
    borderRadius: 'var(--radius-lg)', padding: '20px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px', textAlign: 'center'
  },
  statValue: { fontSize: '28px', fontWeight: '500', color: 'var(--white)' },
  statLabel: { fontSize: '12px', color: 'var(--muted)' },
  progressBg: {
    width: '100%', height: '6px',
    background: 'var(--violet-surface)',
    borderRadius: '3px', overflow: 'hidden'
  },
  progressBar: {
    height: '100%', borderRadius: '3px',
    transition: 'width 0.5s ease'
  },
  historyItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px', background: 'var(--violet-surface)',
    border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)'
  },
  historyImg: {
    width: '52px', height: '52px',
    objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0
  },
  historyImgPlaceholder: {
    width: '52px', height: '52px',
    background: 'var(--navy-2)', borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  historyName:    { fontSize: '14px', fontWeight: '500', color: 'var(--white)', marginBottom: '3px' },
  historyMuscles: { fontSize: '12px', color: 'var(--muted)' },
  formGroup: { marginBottom: '14px' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '500',
    color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: '5px'
  },
  input: {
    width: '100%', padding: '10px 14px',
    background: 'var(--violet-surface)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--white)',
    fontSize: '13px', outline: 'none', fontFamily: 'inherit'
  },
  btnPrimary: {
    background: 'var(--purple-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--violet-light)',
    fontSize: '14px', fontWeight: '500', padding: '11px 24px', cursor: 'pointer'
  }
}

export default Dashboard