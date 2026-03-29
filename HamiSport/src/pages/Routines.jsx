/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import RoutineService from '../services/routine.service'
import Navbar from '../components/layout/Navbar'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const DAY_COLORS = {
  Lunes:     { color: 'var(--med)',     bg: 'rgba(26,107,138,0.12)',  border: 'rgba(26,107,138,0.3)'  },
  Martes:    { color: 'var(--carine)',  bg: 'rgba(27,79,138,0.12)',   border: 'rgba(27,79,138,0.3)'   },
  Miércoles: { color: 'var(--violet)',  bg: 'rgba(91,66,181,0.12)',   border: 'rgba(91,66,181,0.3)'   },
  Jueves:    { color: 'var(--med-2)',   bg: 'rgba(46,155,191,0.12)',  border: 'rgba(46,155,191,0.3)'  },
  Viernes:   { color: 'var(--success)', bg: 'rgba(29,158,117,0.12)', border: 'rgba(29,158,117,0.3)'  },
  Sábado:    { color: '#EF9F27',        bg: 'rgba(239,159,39,0.12)', border: 'rgba(239,159,39,0.3)'  },
  Domingo:   { color: '#E24B4A',        bg: 'rgba(226,75,74,0.12)',  border: 'rgba(226,75,74,0.3)'   }
}

const DIFFICULTY_COLOR = {
  principiante: '#1D9E75',
  intermedio:   '#EF9F27',
  avanzado:     '#E24B4A'
}

const Routines = () => {
  const { user }                          = useAuth()
  const [routines, setRoutines]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeDay, setActiveDay]         = useState('Lunes')
  const [creating, setCreating]           = useState(false)
  const [newName, setNewName]             = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError]     = useState('')
  const [editingId, setEditingId]         = useState(null)
  const [editName, setEditName]           = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [msg, setMsg]                     = useState('')

  useEffect(() => { loadRoutines() }, [])

  const loadRoutines = async () => {
    setLoading(true)
    try {
      const data = await RoutineService.getAll()
      setRoutines(data.routines)
    } catch (error) {
      console.error('Error cargando rutinas:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeRoutine = routines.find(r => r.day === activeDay) || null
  const totalRoutines = routines.length

  const showMsg = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreateLoading(true)
    setCreateError('')
    try {
      await RoutineService.create(activeDay, newName.trim())
      await loadRoutines()
      setCreating(false)
      setNewName('')
      showMsg('success:Rutina creada correctamente')
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Error al crear rutina')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateName = async (id) => {
    if (!editName.trim()) return
    try {
      await RoutineService.updateName(id, editName.trim())
      setRoutines(prev => prev.map(r =>
        r.id === id ? { ...r, name: editName.trim() } : r
      ))
      setEditingId(null)
      setEditName('')
      showMsg('success:Nombre actualizado')
    } catch (error) {
      showMsg('error:' + (error.response?.data?.message || 'Error al actualizar'))
    }
  }

  const handleDelete = async (id) => {
    try {
      await RoutineService.delete(id)
      setRoutines(prev => prev.filter(r => r.id !== id))
      setDeleteConfirm(null)
      showMsg('success:Rutina eliminada')
    } catch (error) {
      showMsg('error:' + (error.response?.data?.message || 'Error al eliminar'))
    }
  }

  const handleRemoveExercise = useCallback(async (routineId, exerciseId) => {
    try {
      await RoutineService.removeExercise(routineId, exerciseId)
      setRoutines(prev => prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.filter(e => e.id !== exerciseId) }
          : r
      ))
    } catch (error) {
      showMsg('error:Error al quitar ejercicio')
    }
  }, [])

  if (loading) return (
    <div style={s.loadingWrap}>
      <Navbar />
      <div style={s.loadingInner}>
        <div style={s.loadingSpinner} />
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '16px' }}>
          Cargando rutinas...
        </p>
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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes wave {
          0%,100% { transform: translateX(0) translateY(0); }
          50%     { transform: translateX(-25px) translateY(-8px); }
        }
        @keyframes wave2 {
          0%,100% { transform: translateX(0) translateY(0); }
          50%     { transform: translateX(20px) translateY(10px); }
        }
        @keyframes wave3 {
          0%,100% { transform: translateX(0) translateY(0); }
          50%     { transform: translateX(-15px) translateY(12px); }
        }
        .day-btn:hover { opacity: 0.85; }
        .ex-item:hover {
          background: rgba(46,114,191,0.1) !important;
          border-color: rgba(46,155,191,0.3) !important;
        }
        .remove-ex-btn:hover {
          background: rgba(226,75,74,0.2) !important;
          border-color: rgba(226,75,74,0.5) !important;
        }
        .delete-routine-btn:hover {
          background: rgba(226,75,74,0.15) !important;
          border-color: rgba(226,75,74,0.4) !important;
          color: #F09595 !important;
        }
        .edit-routine-btn:hover {
          background: rgba(46,155,191,0.12) !important;
        }
        .routine-input:focus {
          border-color: rgba(46,155,191,0.5) !important;
          box-shadow: 0 0 0 3px rgba(46,155,191,0.08);
          outline: none;
        }
        .create-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,107,138,0.35);
        }
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

        {/* Header */}
        <div style={{ ...s.header, animation: 'fadeInUp 0.4s ease forwards' }}>
          <div>
            <h1 style={s.title}>Mis Rutinas</h1>
            <p style={s.subtitle}>Planifica tu semana de entrenamiento</p>
          </div>
          <div style={s.headerRight}>
            <span style={s.counterBadge}>
              {totalRoutines}/7 días planificados
            </span>
          </div>
        </div>

        {/* Mensaje global */}
        {msg && (
          <div style={{
            ...s.msgBox,
            background:  msg.startsWith('error') ? 'rgba(226,75,74,0.1)'  : 'rgba(29,158,117,0.1)',
            borderColor: msg.startsWith('error') ? 'rgba(226,75,74,0.3)'  : 'rgba(29,158,117,0.3)',
            color:       msg.startsWith('error') ? '#F09595'               : '#5DCAA5',
            animation: 'fadeInUp 0.3s ease forwards'
          }}>
            {msg.startsWith('error') ? '✕' : '✓'} {msg.split(':')[1]}
          </div>
        )}

        <div style={s.layout}>

          {/* Panel izquierdo — días de la semana */}
          <div style={s.sidePanel}>
            <div style={s.sidePanelTitle}>Días de la semana</div>
            {DAYS.map(day => {
              const hasRoutine = routines.some(r => r.day === day)
              const dc         = DAY_COLORS[day]
              const isActive   = activeDay === day
              return (
                <button
                  key={day}
                  className="day-btn"
                  onClick={() => {
                    setActiveDay(day)
                    setCreating(false)
                    setCreateError('')
                    setEditingId(null)
                    setDeleteConfirm(null)
                  }}
                  style={{
                    ...s.dayBtn,
                    background:  isActive ? dc.bg    : 'transparent',
                    borderColor: isActive ? dc.color : 'var(--border)',
                    color:       isActive ? dc.color : 'var(--muted)'
                  }}
                >
                  <span style={{ fontWeight: isActive ? '500' : '400' }}>{day}</span>
                  {hasRoutine ? (
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: dc.color, flexShrink: 0
                    }} />
                  ) : (
                    <span style={{
                      fontSize: '10px', color: 'var(--muted)',
                      opacity: 0.6
                    }}>—</span>
                  )}
                </button>
              )
            })}

            {/* Barra de progreso semanal */}
            <div style={s.weekProgress}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Semana planificada</span>
                <span style={{ fontSize: '11px', color: 'var(--white)', fontWeight: '500' }}>
                  {Math.round((totalRoutines / 7) * 100)}%
                </span>
              </div>
              <div style={s.progressBg}>
                <div style={{
                  ...s.progressBar,
                  width: `${(totalRoutines / 7) * 100}%`
                }} />
              </div>
            </div>
          </div>

          {/* Panel derecho — contenido del día */}
          <div style={s.mainPanel}>
            {activeRoutine ? (
              // Rutina existente
              <div style={{ animation: 'fadeInUp 0.3s ease forwards' }}>

                {/* Header de la rutina */}
                <div style={s.routineHeader}>
                  <div style={{ flex: 1 }}>
                    {editingId === activeRoutine.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          className="routine-input"
                          style={s.inlineInput}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdateName(activeRoutine.id)
                            if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                          }}
                          autoFocus
                          maxLength={100}
                        />
                        <button style={s.iconBtn} onClick={() => handleUpdateName(activeRoutine.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                        <button style={s.iconBtn} onClick={() => { setEditingId(null); setEditName('') }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '500',
                          padding: '3px 10px', borderRadius: '20px',
                          background: DAY_COLORS[activeDay].bg,
                          color: DAY_COLORS[activeDay].color,
                          border: `0.5px solid ${DAY_COLORS[activeDay].border}`
                        }}>
                          {activeDay}
                        </span>
                        <h2 style={s.routineName}>{activeRoutine.name}</h2>
                      </div>
                    )}
                    <p style={s.routineCount}>
                      {activeRoutine.exercises.length} {activeRoutine.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                    </p>
                  </div>

                  {editingId !== activeRoutine.id && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="edit-routine-btn"
                        style={s.btnSecondary}
                        onClick={() => { setEditingId(activeRoutine.id); setEditName(activeRoutine.name) }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Renombrar
                      </button>
                      {deleteConfirm === activeRoutine.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>¿Eliminar?</span>
                          <button style={s.btnDanger} onClick={() => handleDelete(activeRoutine.id)}>
                            Sí, eliminar
                          </button>
                          <button style={s.btnSecondary} onClick={() => setDeleteConfirm(null)}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className="delete-routine-btn"
                          style={s.btnSecondaryDanger}
                          onClick={() => setDeleteConfirm(activeRoutine.id)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de ejercicios */}
                {activeRoutine.exercises.length === 0 ? (
                  <div style={s.emptyExercises}>
                    <div style={s.emptyIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(46,155,191,0.4)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '6px' }}>
                      Esta rutina está vacía
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.7 }}>
                      Ve a la Biblioteca y usa el botón "Agregar a rutina" en los ejercicios
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeRoutine.exercises.map((ex, idx) => (
                      <div key={ex.id} className="ex-item" style={s.exerciseItem}>
                        <div style={s.exerciseOrder}>
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        {ex.image_url ? (
                          <img src={ex.image_url} alt={ex.name} style={s.exerciseImg} />
                        ) : (
                          <div style={s.exerciseImgPlaceholder}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                              stroke="rgba(46,155,191,0.4)" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z"/>
                            </svg>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.exerciseName}>{ex.name}</div>
                          {ex.muscles && (
                            <div style={s.exerciseMuscles}>
                              {ex.muscles.split(',').slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                            background: (DIFFICULTY_COLOR[ex.difficulty] || '#888') + '22',
                            color: DIFFICULTY_COLOR[ex.difficulty] || '#888',
                            border: `0.5px solid ${(DIFFICULTY_COLOR[ex.difficulty] || '#888')}44`
                          }}>
                            {ex.difficulty}
                          </span>
                          <button
                            className="remove-ex-btn"
                            style={s.removeExBtn}
                            onClick={() => handleRemoveExercise(activeRoutine.id, ex.id)}
                            title="Quitar ejercicio"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hint para agregar más */}
                <div style={s.addHint}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <span>Para agregar ejercicios ve a la{' '}
                    <a href="/library" style={{ color: 'var(--med-2)', textDecoration: 'none' }}>
                      Biblioteca
                    </a>
                    {' '}y usa el botón "Agregar a rutina"
                  </span>
                </div>

              </div>
            ) : (
              // Sin rutina para este día
              <div style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                {!creating ? (
                  <div style={s.emptyDay}>
                    <div style={{
                      ...s.emptyDayIcon,
                      background: DAY_COLORS[activeDay].bg,
                      border: `0.5px solid ${DAY_COLORS[activeDay].border}`
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                        stroke={DAY_COLORS[activeDay].color} strokeWidth="1.5" strokeLinecap="round">
                        <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z"/>
                      </svg>
                    </div>
                    <h3 style={s.emptyDayTitle}>Sin rutina para el {activeDay}</h3>
                    <p style={s.emptyDaySubtitle}>
                      Crea una rutina para este día y agrégale ejercicios desde la biblioteca
                    </p>
                    {totalRoutines < 7 ? (
                      <button
                        className="create-btn"
                        style={s.btnCreate}
                        onClick={() => {
                          setCreating(true)
                          setNewName(`Rutina del ${activeDay}`)
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Crear rutina para el {activeDay}
                      </button>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#F09595', marginTop: '8px' }}>
                        Ya tienes 7 rutinas — una por día de la semana
                      </p>
                    )}
                  </div>
                ) : (
                  // Formulario de creación
                  <div style={s.createForm}>
                    <h3 style={s.createTitle}>Nueva rutina — {activeDay}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
                      Dale un nombre a tu rutina del {activeDay}
                    </p>

                    {createError && (
                      <div style={s.errorBox}>{createError}</div>
                    )}

                    <form onSubmit={handleCreate}>
                      <label style={s.label}>Nombre de la rutina</label>
                      <input
                        className="routine-input"
                        style={s.input}
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder={`Ej: Piernas y glúteos`}
                        maxLength={100}
                        autoFocus
                        required
                      />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                          type="submit"
                          className="create-btn"
                          style={{ ...s.btnCreate, opacity: createLoading ? 0.7 : 1 }}
                          disabled={createLoading}
                        >
                          {createLoading ? 'Creando...' : 'Crear rutina'}
                        </button>
                        <button
                          type="button"
                          style={s.btnSecondary}
                          onClick={() => { setCreating(false); setCreateError(''); setNewName('') }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────

const s = {
  page: { minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' },
  waveBg: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' },
  wave: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '320px' },
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
  container: {
    position: 'relative', zIndex: 1,
    maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 64px'
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '28px', flexWrap: 'wrap', gap: '12px'
  },
  title:    { fontSize: '28px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--muted)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  counterBadge: {
    fontSize: '12px', fontWeight: '500',
    background: 'rgba(46,155,191,0.1)', color: 'var(--med-2)',
    border: '0.5px solid rgba(46,155,191,0.25)',
    borderRadius: '20px', padding: '5px 14px'
  },
  msgBox: {
    borderRadius: 'var(--radius-md)', border: '0.5px solid',
    fontSize: '13px', padding: '11px 16px', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '8px'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '20px', alignItems: 'start'
  },
  sidePanel: {
    background: 'var(--navy-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '6px',
    position: 'sticky', top: '80px'
  },
  sidePanelTitle: {
    fontSize: '10px', fontWeight: '500', color: 'var(--muted)',
    letterSpacing: '0.07em', textTransform: 'uppercase',
    marginBottom: '6px', padding: '0 4px'
  },
  dayBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', borderRadius: 'var(--radius-md)',
    border: '0.5px solid', fontSize: '13px', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'inherit', textAlign: 'left'
  },
  weekProgress: { marginTop: '12px', padding: '0 4px' },
  progressBg: {
    width: '100%', height: '4px',
    background: 'rgba(238,244,250,0.06)', borderRadius: '2px', overflow: 'hidden'
  },
  progressBar: {
    height: '100%', borderRadius: '2px',
    background: 'linear-gradient(90deg, var(--med), var(--carine))',
    transition: 'width 0.6s ease'
  },
  mainPanel: {
    background: 'var(--navy-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px', minHeight: '400px'
  },
  routineHeader: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: '16px',
    marginBottom: '20px', flexWrap: 'wrap'
  },
  routineName:  { fontSize: '20px', fontWeight: '500', color: 'var(--white)' },
  routineCount: { fontSize: '12px', color: 'var(--muted)', marginTop: '4px' },
  inlineInput: {
    padding: '6px 12px', background: 'var(--navy-3)',
    border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '16px', fontWeight: '500',
    fontFamily: 'inherit', width: '280px'
  },
  iconBtn: {
    width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
    background: 'transparent', border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer'
  },
  exerciseItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px',
    background: 'rgba(15,32,64,0.5)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.2s'
  },
  exerciseOrder: {
    fontSize: '12px', fontWeight: '500', color: 'var(--muted)',
    minWidth: '24px', textAlign: 'center'
  },
  exerciseImg: {
    width: '48px', height: '48px', objectFit: 'cover',
    borderRadius: 'var(--radius-md)', flexShrink: 0
  },
  exerciseImgPlaceholder: {
    width: '48px', height: '48px', background: 'var(--navy-3)',
    borderRadius: 'var(--radius-md)', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  exerciseName:    { fontSize: '14px', fontWeight: '500', color: 'var(--white)', marginBottom: '2px' },
  exerciseMuscles: { fontSize: '12px', color: 'var(--muted)' },
  removeExBtn: {
    width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
    background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.2)',
    color: '#F09595', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
  },
  emptyExercises: {
    textAlign: 'center', padding: '40px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
  },
  emptyIcon: {
    width: '60px', height: '60px', borderRadius: '50%',
    background: 'rgba(46,155,191,0.08)', border: '0.5px solid rgba(46,155,191,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  addHint: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginTop: '16px', padding: '10px 14px',
    background: 'rgba(46,155,191,0.05)',
    border: '0.5px solid rgba(46,155,191,0.12)',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px', color: 'var(--muted)'
  },
  emptyDay: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center', padding: '40px 20px'
  },
  emptyDayIcon: {
    width: '72px', height: '72px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
  },
  emptyDayTitle:    { fontSize: '18px', fontWeight: '500', color: 'var(--white)', marginBottom: '8px' },
  emptyDaySubtitle: { fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '24px', maxWidth: '320px' },
  createForm: { maxWidth: '440px' },
  createTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--white)', marginBottom: '6px' },
  errorBox: {
    background: 'rgba(226,75,74,0.1)', border: '0.5px solid rgba(226,75,74,0.3)',
    borderRadius: 'var(--radius-md)', color: '#F09595',
    fontSize: '13px', padding: '10px 14px', marginBottom: '16px'
  },
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
  btnCreate: {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
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
    transition: 'all 0.2s', fontFamily: 'inherit'
  },
  btnSecondaryDanger: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'transparent', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--muted)',
    fontSize: '13px', padding: '9px 16px', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'inherit'
  },
  btnDanger: {
    display: 'inline-flex', alignItems: 'center',
    background: 'rgba(226,75,74,0.15)', border: '0.5px solid rgba(226,75,74,0.4)',
    borderRadius: 'var(--radius-md)', color: '#F09595',
    fontSize: '12px', padding: '7px 14px', cursor: 'pointer',
    fontFamily: 'inherit'
  }
}

export default Routines