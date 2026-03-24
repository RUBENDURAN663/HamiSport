import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LibraryService from '../services/library.service'
import Navbar from '../components/layout/Navbar'
import DashboardService from '../services/dashboard.service'

// ── Utilidades ─────────────────────────────────────────────────────────────

const getVideoEmbed = (url) => {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` }
  const ttMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/)
  if (ttMatch) return { type: 'tiktok', embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` }
  return null
}

const truncateText = (text, max = 180) => {
  if (!text) return ''
  const clean = text.replace(/<[^>]*>/g, '').trim()
  return clean.length <= max ? clean : clean.substring(0, max).trim() + '...'
}

// ── Modal ──────────────────────────────────────────────────────────────────

const ExerciseModal = ({ exercise, onClose }) => {
  const [showFull, setShowFull] = useState(false)
  const videoEmbed  = getVideoEmbed(exercise.video_url)
  const description = exercise.description ? exercise.description.replace(/<[^>]*>/g, '').trim() : ''
  const shortDesc   = truncateText(description, 180)
  const hasMore     = description.length > 180

  const diffConfig = {
    principiante: { color: '#1D9E75', bg: 'rgba(29,158,117,0.12)', border: 'rgba(29,158,117,0.3)' },
    intermedio:   { color: '#EF9F27', bg: 'rgba(239,159,39,0.12)',  border: 'rgba(239,159,39,0.3)'  },
    avanzado:     { color: '#E24B4A', bg: 'rgba(226,75,74,0.12)',   border: 'rgba(226,75,74,0.3)'   }
  }
  const diff = diffConfig[exercise.difficulty] || diffConfig.intermedio

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      <div
        style={mStyles.modal}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ animation: 'modalIn 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>

          {/* Imagen header */}
          <div style={mStyles.imgWrap}>
            {exercise.image_url
              ? <img src={exercise.image_url} alt={exercise.name} style={mStyles.img} />
              : <div style={mStyles.imgPlaceholder}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(46,155,191,0.3)" strokeWidth="1" strokeLinecap="round">
                    <path d="M6 4v6a6 6 0 0012 0V4"/>
                    <line x1="3" y1="4" x2="9" y2="4"/>
                    <line x1="15" y1="4" x2="21" y2="4"/>
                    <line x1="12" y1="16" x2="12" y2="21"/>
                  </svg>
                </div>
            }
            <div style={mStyles.imgOverlay}></div>

            {/* Botón cerrar */}
            <button style={mStyles.closeBtn} onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Título + badges sobre imagen */}
            <div style={mStyles.titleOverlay}>
              <h2 style={mStyles.name}>{exercise.name}</h2>
              <div style={mStyles.badgeRow}>
                <span style={{ ...mStyles.diffBadge, color: diff.color, background: diff.bg, border: `0.5px solid ${diff.border}` }}>
                  {exercise.difficulty}
                </span>
                {exercise.categories && exercise.categories.split(', ').map((cat, i) => (
                  <span key={i} style={mStyles.catBadge}>{cat}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div style={mStyles.body}>

            {/* Músculos */}
            {exercise.muscles && exercise.muscles !== 'Ver detalle' && (
              <div style={mStyles.section}>
                <div style={mStyles.sectionLabel}>Músculos trabajados</div>
                <div style={mStyles.musclesList}>
                  {exercise.muscles.split(',').map((m, i) => (
                    <span key={i} style={mStyles.muscleTag}>{m.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            {description ? (
              <div style={mStyles.section}>
                <div style={mStyles.sectionLabel}>Descripción</div>
                <p style={mStyles.descText}>{showFull ? description : shortDesc}</p>
                {hasMore && (
                  <button style={mStyles.showMoreBtn} onClick={() => setShowFull(!showFull)}>
                    {showFull ? 'Ver menos ↑' : 'Ver más ↓'}
                  </button>
                )}
              </div>
            ) : null}

            {/* Video embed */}
            {videoEmbed ? (
              <div style={mStyles.section}>
                <div style={mStyles.sectionLabel}>
                  {videoEmbed.type === 'tiktok' ? 'Video TikTok' : 'Video YouTube'}
                </div>
                <div style={{
                  position: 'relative', width: '100%',
                  paddingBottom: videoEmbed.type === 'tiktok' ? '177%' : '56.25%',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000'
                }}>
                  <iframe
                    src={videoEmbed.embedUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={exercise.name}
                  />
                </div>
              </div>
            ) : exercise.video_url ? (
  <div style={mStyles.section}>
    <a href={exercise.video_url} target="_blank" rel="noreferrer" style={mStyles.externalLink}>
      Ver video tutorial
    </a>
  </div>
) : null}

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página Library ─────────────────────────────────────────────────────────

const Library = () => {
  const { user } = useAuth()
  const [categories, setCategories]         = useState([])
  const [exercises, setExercises]           = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch]                 = useState('')
  const [loading, setLoading]               = useState(true)
  const [selectedExercise, setSelectedExercise] = useState(null)

  useEffect(() => {
    loadCategories()
    loadExercises()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await LibraryService.getCategories()
      setCategories(data.categories)
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  const loadExercises = async (params = {}) => {
    setLoading(true)
    try {
      DashboardService.logActivity('library_visit')
      const data = await LibraryService.getExercises(params)
      setExercises(data.exercises)
    } catch (error) {
      console.error('Error cargando ejercicios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (slug) => {
    if (activeCategory === slug) {
      setActiveCategory(null)
      loadExercises()
    } else {
      setActiveCategory(slug)
      loadExercises({ category: slug })
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    if (value.length > 2)        loadExercises({ search: value })
    else if (value.length === 0) loadExercises()
  }

  const difficultyColor = {
    principiante: '#1D9E75',
    intermedio:   '#EF9F27',
    avanzado:     '#E24B4A'
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerMove {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes wave1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(50px,-40px) scale(1.08); }
        }
        @keyframes wave2 {
          0%,100% { transform: translate(0,0) scale(1.05); }
          50%      { transform: translate(-60px,50px) scale(0.95); }
        }
        .ex-card:hover {
          border-color: rgba(46,155,191,0.5) !important;
          transform: translateY(-3px);
        }
        .cat-btn:hover {
          border-color: rgba(46,155,191,0.4) !important;
          color: var(--med-light) !important;
        }
      `}</style>

      {/* Fondo ondas */}
      <div style={styles.waveBg}>
        <div style={styles.wave1}></div>
        <div style={styles.wave2}></div>
        <div style={styles.waveOverlay}></div>
      </div>

      <Navbar />

      <div style={styles.container}>

        {/* Header */}
        <div style={{ ...styles.header, animation: 'fadeInUp 0.4s ease forwards' }}>
          <div>
            <h1 style={styles.title}>Biblioteca</h1>
            <p style={styles.subtitle}>Explora ejercicios por categoría deportiva</p>
          </div>
          {user?.role === 'admin' && (
            <a href="/admin" style={styles.adminBtn}>Panel Admin</a>
          )}
        </div>

        {/* Buscador */}
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Buscar ejercicios por nombre o músculo..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Categorías */}
        <div style={styles.categoriesRow}>
          <button
            className="cat-btn"
            style={{ ...styles.categoryBtn, ...(activeCategory === null ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory(null); loadExercises() }}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className="cat-btn"
              style={{
                ...styles.categoryBtn,
                ...(activeCategory === cat.slug ? {
                  background: 'rgba(26,107,138,0.15)',
                  borderColor: 'var(--med-2)',
                  color: 'var(--med-light)'
                } : {})
              }}
              onClick={() => handleCategoryClick(cat.slug)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={{ ...styles.skeleton, height: '170px', borderRadius: '14px 14px 0 0' }}></div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ ...styles.skeleton, height: '15px', width: '65%', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ ...styles.skeleton, height: '12px', width: '45%', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
              No hay ejercicios en esta categoría aún.
            </p>
            {user?.role === 'admin' && (
              <a href="/admin" style={styles.adminBtn}>Agregar ejercicios</a>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {exercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="ex-card"
                style={{
                  ...styles.card,
                  animation: `fadeInUp 0.4s ease ${Math.min(idx * 0.04, 0.3)}s forwards`,
                  opacity: 0
                }}
                onClick={() => {
                  setSelectedExercise(exercise)
                  DashboardService.logActivity('exercise_view', exercise.id)
                }}
              >
                {/* Shimmer */}
                <div style={styles.shimmerWrap}>
                  <div style={styles.shimmerLine}></div>
                </div>

                {/* Imagen */}
                {exercise.image_url
                  ? <div style={styles.cardImgWrap}>
                      <img src={exercise.image_url} alt={exercise.name} style={styles.cardImg} />
                      <div style={styles.cardImgOverlay}></div>
                    </div>
                  : <div style={styles.cardImgPlaceholder}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(46,155,191,0.3)" strokeWidth="1.2" strokeLinecap="round">
                        <path d="M6 4v6a6 6 0 0012 0V4"/>
                        <line x1="3" y1="4" x2="9" y2="4"/>
                        <line x1="15" y1="4" x2="21" y2="4"/>
                      </svg>
                    </div>
                }

                {/* Badge dificultad */}
                <div style={{
                  ...styles.diffBadgeFloat,
                  color: difficultyColor[exercise.difficulty],
                  background: difficultyColor[exercise.difficulty] + '22',
                  border: `0.5px solid ${difficultyColor[exercise.difficulty]}44`
                }}>
                  {exercise.difficulty}
                </div>

                {/* Video indicator */}
                {exercise.video_url && (
                  <div style={styles.videoIndicator}>▶</div>
                )}

                {/* Cuerpo */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{exercise.name}</h3>
                  {exercise.muscles && exercise.muscles !== 'Ver detalle' && (
                    <p style={styles.cardMuscles}>
                      {exercise.muscles.split(',').slice(0, 2).join(', ')}
                    </p>
                  )}
                  {exercise.categories && (
                    <p style={styles.cardCategories}>{exercise.categories}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

    </div>
  )
}

// ── Estilos página ─────────────────────────────────────────────────────────

const styles = {
  page: { minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' },
  waveBg: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' },
  wave1: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,107,138,0.12) 0%, transparent 70%)',
    top: '-100px', right: '-100px', animation: 'wave1 18s ease-in-out infinite'
  },
  wave2: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(27,79,138,0.1) 0%, transparent 70%)',
    bottom: '5%', left: '-80px', animation: 'wave2 22s ease-in-out infinite'
  },
  waveOverlay: { position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.6)' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 60px', position: 'relative', zIndex: 1 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '28px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--muted)' },
  adminBtn: {
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--white)',
    fontSize: '13px', fontWeight: '500', padding: '9px 18px', cursor: 'pointer', textDecoration: 'none'
  },
  searchWrap: { position: 'relative', marginBottom: '20px' },
  searchIcon: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--muted)'
  },
  searchInput: {
    width: '100%', padding: '12px 14px 12px 44px',
    background: 'rgba(15,32,64,0.7)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--white)',
    fontSize: '14px', outline: 'none', backdropFilter: 'blur(8px)'
  },
  categoriesRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' },
  categoryBtn: {
    padding: '8px 16px', background: 'rgba(15,32,64,0.7)',
    border: '0.5px solid var(--border)', borderRadius: '20px',
    color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
  },
  categoryBtnActive: { background: 'rgba(26,107,138,0.2)', borderColor: 'var(--med-2)', color: 'var(--med-light)' },
  emptyState: { textAlign: 'center', padding: '80px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: {
    background: 'rgba(15,32,64,0.75)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    cursor: 'pointer', transition: 'border-color 0.25s, transform 0.25s',
    position: 'relative', backdropFilter: 'blur(8px)'
  },
  shimmerWrap: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 },
  shimmerLine: {
    position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(46,155,191,0.05), transparent)',
    animation: 'shimmerMove 4s ease-in-out infinite'
  },
  cardImgWrap: { position: 'relative', height: '170px', overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardImgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(10,22,40,0.7) 0%, transparent 50%)'
  },
  cardImgPlaceholder: {
    height: '170px', background: 'rgba(26,107,138,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderBottom: '0.5px solid var(--border)'
  },
  diffBadgeFloat: {
    position: 'absolute', top: '10px', right: '10px', zIndex: 2,
    fontSize: '10px', fontWeight: '500', padding: '3px 9px', borderRadius: '20px'
  },
  videoIndicator: {
    position: 'absolute', top: '10px', left: '10px', zIndex: 2,
    fontSize: '10px', color: 'var(--white)',
    background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '3px 8px'
  },
  cardBody: { padding: '14px 16px' },
  cardTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--white)', marginBottom: '5px' },
  cardMuscles: { fontSize: '12px', color: 'var(--med-light)', marginBottom: '4px' },
  cardCategories: { fontSize: '11px', color: 'var(--muted)' },
  skeletonCard: {
    background: 'rgba(15,32,64,0.6)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden'
  },
  skeleton: {
    background: 'linear-gradient(90deg, rgba(26,107,138,0.08) 25%, rgba(46,155,191,0.12) 50%, rgba(26,107,138,0.08) 75%)',
    backgroundSize: '200% 100%', animation: 'shimmerMove 1.5s infinite'
  }
}

// ── Estilos modal ──────────────────────────────────────────────────────────

const mStyles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)'
  },
  modal: {
    width: '100%', maxWidth: '520px',
    maxHeight: '90vh', overflowY: 'auto',
    background: 'var(--navy-2)',
    border: '0.5px solid rgba(46,155,191,0.2)',
    borderRadius: 'var(--radius-xl)', overflow: 'hidden'
  },
  imgWrap: { position: 'relative', height: '220px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgPlaceholder: {
    height: '220px', background: 'rgba(26,107,138,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  imgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.2) 50%, transparent 100%)'
  },
  closeBtn: {
    position: 'absolute', top: '14px', right: '14px', zIndex: 10,
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'rgba(10,22,40,0.7)', border: '0.5px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.8)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  },
  titleOverlay: { position: 'absolute', bottom: '16px', left: '18px', right: '18px', zIndex: 5 },
  name: {
    fontSize: '22px', fontWeight: '500', color: '#fff',
    marginBottom: '8px', lineHeight: '1.2',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
  },
  badgeRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  diffBadge: { fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px' },
  catBadge: {
    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
    background: 'rgba(26,107,138,0.2)', color: 'var(--med-light)',
    border: '0.5px solid rgba(26,107,138,0.35)'
  },
  body: { padding: '20px 22px 24px' },
  section: { marginBottom: '20px' },
  sectionLabel: {
    fontSize: '10px', fontWeight: '500', color: 'var(--med-2)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px'
  },
  musclesList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  muscleTag: {
    fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
    background: 'rgba(26,107,138,0.1)', color: 'var(--med-light)',
    border: '0.5px solid rgba(26,107,138,0.25)'
  },
  descText: { fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7' },
  showMoreBtn: {
    background: 'none', border: 'none', color: 'var(--med-2)',
    fontSize: '12px', cursor: 'pointer', marginTop: '6px',
    padding: '0', fontFamily: 'inherit'
  },
  externalLink: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: 'none', borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '13px', fontWeight: '500', textDecoration: 'none'
  }
}

export default Library