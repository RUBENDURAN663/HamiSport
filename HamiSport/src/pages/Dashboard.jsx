/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardService from '../services/dashboard.service'
import FavoriteService from '../services/favorite.service'
import Navbar from '../components/layout/Navbar'

const Dashboard = () => {
  const { user }               = useAuth()
  const [stats, setStats]      = useState(null)
  const [history, setHistory]  = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading]  = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  // Perfil editable
  const [profileForm, setProfileForm]       = useState({ name: '', email: '', avatarUrl: '' })
  const [profileMsg, setProfileMsg]         = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  // Cambio de contraseña
  const [pwForm, setPwForm]       = useState({ current: '', newPw: '', confirm: '' })
  const [pwMsg, setPwMsg]         = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (user) {
      setProfileForm({
        name:      user.name       || '',
        email:     user.email      || '',
        avatarUrl: user.avatar_url || ''
      })
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dashData, favData] = await Promise.all([
        DashboardService.getStats(),
        FavoriteService.getAll()
      ])
      setStats(dashData.stats)
      setHistory(dashData.history)
      setFavorites(favData.favorites)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileLoading(true)
    try {
      const data = await DashboardService.updateProfile(
        profileForm.name,
        profileForm.email,
        profileForm.avatarUrl
      )
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('hamisport_user', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('storage'))
      setProfileMsg('success:Perfil actualizado correctamente')
      setEditingProfile(false)
    } catch (error) {
      setProfileMsg('error:' + (error.response?.data?.message || 'Error al actualizar perfil'))
    } finally {
      setProfileLoading(false)
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

  const handleRemoveFavorite = useCallback(async (exerciseId) => {
    try {
      await FavoriteService.toggle(exerciseId)
      setFavorites(prev => prev.filter(f => f.id !== exerciseId))
    } catch (error) {
      console.error('Error removiendo favorito:', error)
    }
  }, [])

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
    { id: 'profile',   label: 'Perfil',        icon: <IconUser /> },
    { id: 'stats',     label: 'Estadísticas',   icon: <IconChart /> },
    { id: 'history',   label: 'Historial',      icon: <IconHistory /> },
    { id: 'favorites', label: 'Favoritos',      icon: <IconHeart />, count: favorites.length },
    { id: 'security',  label: 'Seguridad',      icon: <IconLock /> }
  ]

  const currentAvatar = profileForm.avatarUrl || user?.avatar_url

  if (loading) return (
    <div style={s.loadingWrap}>
      <Navbar />
      <div style={s.loadingInner}>
        <div style={s.loadingSpinner} />
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '16px' }}>Cargando tu perfil...</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes wave {
          0%   { transform: translateX(0) translateY(0); }
          50%  { transform: translateX(-25px) translateY(-8px); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes wave2 {
          0%   { transform: translateX(0) translateY(0); }
          50%  { transform: translateX(20px) translateY(10px); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes wave3 {
          0%   { transform: translateX(0) translateY(0); }
          50%  { transform: translateX(-15px) translateY(12px); }
          100% { transform: translateX(0) translateY(0); }
        }
        .dash-tab-btn:hover { opacity: 0.85; }
        .dash-card { animation: fadeInUp 0.35s ease forwards; }
        .dash-history-item:hover {
          background: rgba(46,114,191,0.12) !important;
          border-color: rgba(46,155,191,0.3) !important;
          transform: translateX(4px);
          transition: all 0.2s ease;
        }
        .dash-fav-item:hover {
          border-color: rgba(226,75,74,0.3) !important;
          transform: translateX(4px);
          transition: all 0.2s ease;
        }
        .dash-stat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(46,155,191,0.35) !important;
          transition: all 0.2s ease;
        }
        .dash-input:focus {
          border-color: rgba(46,155,191,0.5) !important;
          box-shadow: 0 0 0 3px rgba(46,155,191,0.08);
          outline: none;
        }
        .dash-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,107,138,0.35);
        }
        .dash-btn-secondary:hover { background: rgba(46,155,191,0.12) !important; }
        .dash-remove-btn:hover { background: rgba(226,75,74,0.2) !important; border-color: rgba(226,75,74,0.5) !important; }
        .avatar-edit-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(10,22,40,0.6);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s; cursor: pointer;
        }
        .avatar-wrap:hover .avatar-edit-overlay { opacity: 1; }
      `}</style>

      {/* Ondas de fondo */}
      <div style={s.waveBg}>
        <svg style={{ ...s.wave, animation: 'wave 14s ease-in-out infinite' }}
          viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(26,107,138,0.07)"
            d="M0,160L60,170.7C120,181,240,203,360,192C480,181,600,139,720,128C840,117,960,139,1080,154.7C1200,171,1320,181,1380,186.7L1440,192L1440,320L0,320Z"/>
        </svg>
        <svg style={{ ...s.wave, animation: 'wave2 18s ease-in-out infinite' }}
          viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(27,79,138,0.06)"
            d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,218.7C1120,213,1280,171,1360,149.3L1440,128L1440,320L0,320Z"/>
        </svg>
        <svg style={{ ...s.wave, animation: 'wave3 22s ease-in-out infinite' }}
          viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(74,107,138,0.05)"
            d="M0,96L120,112C240,128,480,160,720,165.3C960,171,1200,149,1320,138.7L1440,128L1440,320L0,320Z"/>
        </svg>
      </div>

      <Navbar />

      <div style={s.container}>

        {/* ── HEADER DE PERFIL ── */}
        <div style={s.profileHeader} className="dash-card">
          <div className="avatar-wrap" style={s.avatarWrap}
            onClick={() => { setActiveTab('profile'); setEditingProfile(true) }}>
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" style={s.avatarImg}
                onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <div style={s.avatarInitials}>{getInitials(user?.name)}</div>
            )}
            <div className="avatar-edit-overlay"><IconCamera /></div>
          </div>

          <div style={s.profileInfo}>
            <h1 style={s.profileName}>{user?.name}</h1>
            <p style={s.profileEmail}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span style={s.roleBadge}>
                {user?.role === 'admin' ? '⚡ Administrador' : '👤 Usuario'}
              </span>
              <span style={s.joinBadge}>
                Miembro desde {formatDate(stats?.joinDate)}
              </span>
            </div>
          </div>

          <div style={s.quickStats}>
            {[
              { value: stats?.exercisesViewed || 0, label: 'Ejercicios' },
              { value: stats?.aiQueries       || 0, label: 'Consultas IA' },
              { value: favorites.length        || 0, label: 'Favoritos' }
            ].map((q, i) => (
              <div key={i} style={s.quickStat}>
                <div style={s.quickStatValue}>{q.value}</div>
                <div style={s.quickStatLabel}>{q.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={s.tabsRow}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="dash-tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...s.tabBtn,
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, var(--med), var(--carine))'
                  : 'var(--navy-2)',
                border: `0.5px solid ${activeTab === tab.id ? 'var(--med-2)' : 'var(--border)'}`,
                color:      activeTab === tab.id ? 'var(--white)' : 'var(--muted)',
                fontWeight: activeTab === tab.id ? '500' : '400'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: '500',
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(226,75,74,0.2)',
                    color:      activeTab === tab.id ? 'var(--white)' : '#F09595',
                    borderRadius: '20px', padding: '1px 6px',
                    lineHeight: '1.6'
                  }}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* ── PERFIL ── */}
        {activeTab === 'profile' && (
          <div className="dash-card">
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Información de perfil</h2>
                {!editingProfile && (
                  <button className="dash-btn-secondary" style={s.btnSecondary}
                    onClick={() => { setEditingProfile(true); setProfileMsg('') }}>
                    <IconEdit /> Editar perfil
                  </button>
                )}
              </div>

              {profileMsg && (
                <div style={{
                  ...s.msgBox,
                  background:  profileMsg.startsWith('error') ? 'rgba(226,75,74,0.1)'  : 'rgba(29,158,117,0.1)',
                  borderColor: profileMsg.startsWith('error') ? 'rgba(226,75,74,0.3)'  : 'rgba(29,158,117,0.3)',
                  color:       profileMsg.startsWith('error') ? '#F09595'               : '#5DCAA5'
                }}>
                  {profileMsg.split(':')[1]}
                </div>
              )}

              {!editingProfile ? (
                <div style={s.infoGrid}>
                  {[
                    { label: 'Nombre completo',    value: user?.name },
                    { label: 'Correo electrónico', value: user?.email },
                    { label: 'Rol',                value: user?.role === 'admin' ? 'Administrador' : 'Usuario' },
                    { label: 'Imagen de perfil',   value: user?.avatar_url ? 'Configurada' : 'Sin imagen' },
                    { label: 'Miembro desde',      value: formatDate(stats?.joinDate) },
                  ].map((item, i) => (
                    <div key={i} style={s.infoItem}>
                      <span style={s.infoLabel}>{item.label}</span>
                      <span style={s.infoValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Nombre completo</label>
                      <input className="dash-input" style={s.input}
                        type="text" value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Tu nombre completo" required />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Correo electrónico</label>
                      <input className="dash-input" style={s.input}
                        type="email" value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="tu@email.com" required />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>URL de imagen de perfil</label>
                      <input className="dash-input" style={s.input}
                        type="url" value={profileForm.avatarUrl}
                        onChange={e => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                        placeholder="https://ejemplo.com/mi-foto.jpg" />
                      <p style={s.inputHint}>Pega la URL directa de una imagen. Puedes usar imgur.com</p>
                    </div>
                    {profileForm.avatarUrl && (
                      <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                        <label style={s.label}>Vista previa</label>
                        <img src={profileForm.avatarUrl} alt="Preview" style={s.avatarPreview}
                          onError={e => { e.target.style.display = 'none' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button type="submit" className="dash-btn-primary" style={s.btnPrimary}
                      disabled={profileLoading}>
                      {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button type="button" className="dash-btn-secondary" style={s.btnSecondary}
                      onClick={() => {
                        setEditingProfile(false)
                        setProfileMsg('')
                        setProfileForm({
                          name:      user?.name       || '',
                          email:     user?.email      || '',
                          avatarUrl: user?.avatar_url || ''
                        })
                      }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── ESTADÍSTICAS ── */}
        {activeTab === 'stats' && (
          <div className="dash-card">
            <div style={s.statsGrid}>
              {[
                { label: 'Ejercicios vistos',  value: stats?.exercisesViewed || 0, color: 'var(--med)',     icon: <IconDumbbell /> },
                { label: 'Consultas a HAMI',   value: stats?.aiQueries       || 0, color: 'var(--violet)',  icon: <IconBot /> },
                { label: 'Visitas biblioteca', value: stats?.libraryVisits   || 0, color: 'var(--success)', icon: <IconBook /> },
                { label: 'Visitas nutrición',  value: stats?.nutritionVisits || 0, color: '#EF9F27',        icon: <IconLeaf /> }
              ].map((stat, i) => (
                <div key={i} className="dash-stat-card" style={{ ...s.statCard, borderColor: stat.color + '33' }}>
                  <div style={{ ...s.statIcon, background: stat.color + '18', color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div style={s.statValue}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ ...s.card, marginTop: '16px' }}>
              <h2 style={s.cardTitle}>Resumen de actividad</h2>
              {stats?.exercisesViewed === 0 && stats?.aiQueries === 0 ? (
                <p style={s.emptyText}>Aún no tienes actividad registrada. ¡Explora la biblioteca y habla con HAMI!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Ejercicios vistos',  value: stats?.exercisesViewed || 0, total: 20, color: 'var(--med)' },
                    { label: 'Consultas IA',        value: stats?.aiQueries       || 0, total: 50, color: 'var(--violet)' },
                    { label: 'Visitas biblioteca',  value: stats?.libraryVisits   || 0, total: 30, color: 'var(--success)' },
                    { label: 'Visitas nutrición',   value: stats?.nutritionVisits || 0, total: 20, color: '#EF9F27' }
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{item.value}</span>
                      </div>
                      <div style={s.progressBg}>
                        <div style={{
                          ...s.progressBar,
                          width: `${Math.min((item.value / item.total) * 100, 100)}%`,
                          background: item.color
                        }} />
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
          <div className="dash-card">
            <div style={s.card}>
              <h2 style={s.cardTitle}>Ejercicios vistos recientemente</h2>
              {history.length === 0 ? (
                <p style={s.emptyText}>No has visto ningún ejercicio aún. ¡Explora la biblioteca!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map((ex, i) => (
                    <div key={i} className="dash-history-item" style={s.historyItem}>
                      {ex.image_url ? (
                        <img src={ex.image_url} alt={ex.name} style={s.historyImg} />
                      ) : (
                        <div style={s.historyImgPlaceholder}><IconDumbbell /></div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.historyName}>{ex.name}</div>
                        {ex.muscles && <div style={s.historyMuscles}>{ex.muscles}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
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
          </div>
        )}

        {/* ── FAVORITOS ── */}
        {activeTab === 'favorites' && (
          <div className="dash-card">
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Mis ejercicios favoritos</h2>
                <span style={{
                  fontSize: '12px', color: 'var(--muted)',
                  background: 'var(--navy-3)',
                  border: '0.5px solid var(--border)',
                  borderRadius: '20px', padding: '3px 10px'
                }}>
                  {favorites.length} {favorites.length === 1 ? 'ejercicio' : 'ejercicios'}
                </span>
              </div>

              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(226,75,74,0.08)',
                    border: '0.5px solid rgba(226,75,74,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(226,75,74,0.5)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <p style={s.emptyText}>
                    Aún no tienes favoritos. ¡Marca ejercicios con el corazón en la biblioteca!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {favorites.map((ex, i) => (
                    <div key={ex.id} className="dash-fav-item" style={s.favItem}>
                      {ex.image_url ? (
                        <img src={ex.image_url} alt={ex.name} style={s.historyImg} />
                      ) : (
                        <div style={{ ...s.historyImgPlaceholder, background: 'rgba(226,75,74,0.06)' }}>
                          <IconDumbbell />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.historyName}>{ex.name}</div>
                        {ex.muscles && (
                          <div style={s.historyMuscles}>
                            {ex.muscles.split(',').slice(0, 2).join(', ')}
                          </div>
                        )}
                        {ex.categories && (
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                            {ex.categories}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
                          background: (difficultyColor[ex.difficulty] || '#888') + '22',
                          color: difficultyColor[ex.difficulty] || '#888',
                          border: `0.5px solid ${(difficultyColor[ex.difficulty] || '#888')}44`
                        }}>
                          {ex.difficulty}
                        </span>
                        <button
                          className="dash-remove-btn"
                          style={s.removeBtn}
                          onClick={() => handleRemoveFavorite(ex.id)}
                          title="Quitar de favoritos"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F09595"
                            stroke="#F09595" strokeWidth="1" strokeLinecap="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEGURIDAD ── */}
        {activeTab === 'security' && (
          <div className="dash-card">
            <div style={s.card}>
              <h2 style={s.cardTitle}>Cambiar contraseña</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
                Usa una contraseña segura de al menos 6 caracteres
              </p>

              {pwMsg && (
                <div style={{
                  ...s.msgBox,
                  background:  pwMsg.startsWith('error') ? 'rgba(226,75,74,0.1)'  : 'rgba(29,158,117,0.1)',
                  borderColor: pwMsg.startsWith('error') ? 'rgba(226,75,74,0.3)'  : 'rgba(29,158,117,0.3)',
                  color:       pwMsg.startsWith('error') ? '#F09595'               : '#5DCAA5'
                }}>
                  {pwMsg.split(':')[1]}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ maxWidth: '420px' }}>
                {[
                  { label: 'Contraseña actual',          key: 'current' },
                  { label: 'Nueva contraseña',           key: 'newPw' },
                  { label: 'Confirmar nueva contraseña', key: 'confirm' }
                ].map(field => (
                  <div key={field.key} style={s.formGroup}>
                    <label style={s.label}>{field.label}</label>
                    <input
                      className="dash-input" style={s.input}
                      type="password" placeholder="••••••••"
                      value={pwForm[field.key]}
                      onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                      required
                    />
                  </div>
                ))}
                <button type="submit" className="dash-btn-primary" style={s.btnPrimary}
                  disabled={pwLoading}>
                  {pwLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── ICONOS SVG ────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconChart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
)
const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
    <polyline points="3 3 3 7 7 7"/>
  </svg>
)
const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconDumbbell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z"/>
  </svg>
)
const IconBot = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <path d="M12 11V7"/>
    <circle cx="12" cy="5" r="2"/>
    <line x1="8" y1="15" x2="8.01" y2="15"/>
    <line x1="16" y1="15" x2="16.01" y2="15"/>
  </svg>
)
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const IconLeaf = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.92a1 1 0 0 0 1.71.99C7 19 9 17 12 17c5 0 9-4 9-9s-4-9-9-9"/>
  </svg>
)

// ── ESTILOS ───────────────────────────────────────────────────────────────────

const s = {
  page: { minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' },
  waveBg: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' },
  wave: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '320px', opacity: 1 },
  loadingWrap: { minHeight: '100vh', background: 'var(--navy)' },
  loadingInner: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)'
  },
  loadingSpinner: {
    width: '36px', height: '36px',
    border: '3px solid var(--border)', borderTopColor: 'var(--med)',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite'
  },
  container: { position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '32px 20px 64px' },
  profileHeader: {
    display: 'flex', alignItems: 'center', gap: '24px',
    marginBottom: '32px', background: 'var(--navy-2)',
    border: '0.5px solid var(--border)', borderRadius: 'var(--radius-xl)',
    padding: '28px', flexWrap: 'wrap'
  },
  avatarWrap: { position: 'relative', width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer' },
  avatarImg: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--med-2)' },
  avatarInitials: {
    width: '80px', height: '80px', borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: '2px solid var(--med-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '26px', fontWeight: '500', color: 'var(--white)'
  },
  profileInfo:  { flex: 1, minWidth: '160px' },
  profileName:  { fontSize: '22px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' },
  profileEmail: { fontSize: '13px', color: 'var(--muted)' },
  roleBadge: {
    display: 'inline-block', fontSize: '11px', fontWeight: '500',
    background: 'rgba(46,155,191,0.12)', color: 'var(--med-2)',
    border: '0.5px solid rgba(46,155,191,0.25)', borderRadius: '20px', padding: '3px 10px'
  },
  joinBadge: {
    display: 'inline-block', fontSize: '11px', color: 'var(--muted)',
    border: '0.5px solid var(--border-soft)', borderRadius: '20px', padding: '3px 10px'
  },
  quickStats: {
    display: 'flex', gap: '1px', background: 'var(--border-soft)',
    borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0
  },
  quickStat:      { padding: '12px 20px', textAlign: 'center', background: 'var(--navy-3)' },
  quickStatValue: { fontSize: '20px', fontWeight: '500', color: 'var(--white)' },
  quickStatLabel: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },
  tabsRow:   { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tabBtn: {
    padding: '9px 18px', borderRadius: 'var(--radius-md)',
    fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
  },
  card: {
    background: 'var(--navy-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardTitle:  { fontSize: '17px', fontWeight: '500', color: 'var(--white)' },
  infoGrid:   { display: 'flex', flexDirection: 'column' },
  infoItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '13px 0', borderBottom: '0.5px solid var(--border-soft)'
  },
  infoLabel: { fontSize: '13px', color: 'var(--muted)' },
  infoValue: { fontSize: '13px', fontWeight: '500', color: 'var(--white)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' },
  statCard: {
    background: 'var(--navy-2)', border: '0.5px solid',
    borderRadius: 'var(--radius-lg)', padding: '22px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '10px', textAlign: 'center', cursor: 'default'
  },
  statIcon: { width: '44px', height: '44px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '30px', fontWeight: '500', color: 'var(--white)' },
  statLabel: { fontSize: '12px', color: 'var(--muted)' },
  progressBg: { width: '100%', height: '5px', background: 'rgba(238,244,250,0.06)', borderRadius: '3px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '3px', transition: 'width 0.6s ease' },
  historyItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px 14px', background: 'rgba(15,32,64,0.5)',
    border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)',
    transition: 'all 0.2s ease', cursor: 'default'
  },
  favItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px 14px',
    background: 'rgba(226,75,74,0.04)',
    border: '0.5px solid rgba(226,75,74,0.12)',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.2s ease', cursor: 'default'
  },
  historyImg: { width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 },
  historyImgPlaceholder: {
    width: '52px', height: '52px', background: 'var(--navy-3)',
    borderRadius: 'var(--radius-md)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--muted)'
  },
  historyName:    { fontSize: '14px', fontWeight: '500', color: 'var(--white)', marginBottom: '3px' },
  historyMuscles: { fontSize: '12px', color: 'var(--muted)' },
  removeBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#F09595',
    background: 'rgba(226,75,74,0.08)',
    border: '0.5px solid rgba(226,75,74,0.2)',
    borderRadius: 'var(--radius-sm)', padding: '4px 8px',
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' },
  formGroup: { marginBottom: '0' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '500',
    color: 'var(--muted)', letterSpacing: '0.04em',
    textTransform: 'uppercase', marginBottom: '6px'
  },
  input: {
    width: '100%', padding: '11px 14px', background: 'var(--navy-3)',
    border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '14px', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
  },
  inputHint:    { fontSize: '11px', color: 'var(--muted)', marginTop: '5px', lineHeight: '1.5' },
  avatarPreview: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--med-2)' },
  msgBox: { borderRadius: 'var(--radius-md)', border: '0.5px solid', fontSize: '13px', padding: '11px 14px', marginBottom: '20px' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: 'none', borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '14px', fontWeight: '500',
    padding: '11px 22px', cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s', fontFamily: 'inherit'
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'transparent', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--muted)',
    fontSize: '13px', padding: '9px 16px', cursor: 'pointer',
    transition: 'background 0.2s', fontFamily: 'inherit'
  },
  emptyText: { fontSize: '14px', color: 'var(--muted)', textAlign: 'center', padding: '28px 0', lineHeight: '1.6' }
}

export default Dashboard