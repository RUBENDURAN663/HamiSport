import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LibraryService from '../services/library.service'
import Navbar from '../components/layout/Navbar'

const Admin = () => {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const [tab, setTab] = useState('exercises')

  const [categories, setCategories] = useState([])
  const [exercises, setExercises]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [importing, setImporting]   = useState(false)
  const [message, setMessage]       = useState('')
  const [wgerCategories, setWgerCategories] = useState([])

  // Form ejercicio
  const [showExForm, setShowExForm] = useState(false)
  const [editingEx, setEditingEx]   = useState(null)
  const [exForm, setExForm] = useState({
    name: '', description: '', muscles: '',
    difficulty: 'intermedio', image_url: '', video_url: '', categoryIds: []
  })

  // Form categoría
  const [showCatForm, setShowCatForm] = useState(false)
  const [catForm, setCatForm] = useState({
    name: '', slug: '', icon: '', color: '#4E3A8E', description: ''
  })

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/')
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [catData, exData] = await Promise.all([
        LibraryService.getCategories(),
        LibraryService.getExercises()
      ])
      setCategories(catData.categories)
      setExercises(exData.exercises)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMsg = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 4000)
  }

  // ── EJERCICIOS ──

  const handleExSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEx) {
        await LibraryService.updateExercise(editingEx.id, exForm)
        showMsg('Ejercicio actualizado')
      } else {
        await LibraryService.createExercise(exForm)
        showMsg('Ejercicio creado')
      }
      setShowExForm(false)
      setEditingEx(null)
      resetExForm()
      loadData()
    } catch (error) {
      showMsg('Error: ' + (error.response?.data?.message || 'Error desconocido'))
    }
  }

  const handleEditEx = (ex) => {
    setEditingEx(ex)
    setExForm({
      name:        ex.name,
      description: ex.description || '',
      muscles:     ex.muscles || '',
      difficulty:  ex.difficulty,
      image_url:   ex.image_url || '',
      video_url:   ex.video_url || '',
      categoryIds: ex.category_ids ? ex.category_ids.split(',').map(Number) : []
    })
    setShowExForm(true)
  }

  const handleDeleteEx = async (id) => {
    if (!window.confirm('¿Eliminar este ejercicio?')) return
    try {
      await LibraryService.deleteExercise(id)
      showMsg('Ejercicio eliminado')
      loadData()
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      showMsg('Error al eliminar')
    }
  }

  const resetExForm = () => {
    setExForm({
      name: '', description: '', muscles: '',
      difficulty: 'intermedio', image_url: '', video_url: '', categoryIds: []
    })
  }

  const handleImportWger = async () => {
    setImporting(true)
    try {
      const data = await LibraryService.importFromWger(wgerCategories)
      showMsg(data.message)
      loadData()
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showMsg('Error al importar desde WGER')
    } finally {
      setImporting(false)
    }
  }

  const handleAutoAssign = async () => {
    setImporting(true)
    try {
      const data = await LibraryService.autoAssignCategories()
      showMsg(data.message)
      loadData()
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showMsg('Error al reasignar categorías')
    } finally {
      setImporting(false)
    }
  }

  const toggleWgerCategory = (id) => {
    setWgerCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // ── CATEGORÍAS ──

  const handleCatSubmit = async (e) => {
    e.preventDefault()
    try {
      await LibraryService.createCategory(catForm)
      showMsg('Categoría creada')
      setShowCatForm(false)
      setCatForm({ name: '', slug: '', icon: '', color: '#4E3A8E', description: '' })
      loadData()
    } catch (error) {
      showMsg('Error: ' + (error.response?.data?.message || 'Error desconocido'))
    }
  }

  const handleDeleteCat = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      await LibraryService.deleteCategory(id)
      showMsg('Categoría eliminada')
      loadData()
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      showMsg('Error al eliminar')
    }
  }

  const toggleCategoryInForm = (id) => {
    setExForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(c => c !== id)
        : [...prev.categoryIds, id]
    }))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' }}>
            Panel Admin
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Gestiona ejercicios y categorías de HAMISPORT
          </p>
        </div>

        {/* Mensaje */}
        {message && (
          <div style={{
            background: message.startsWith('Error') ? 'rgba(226,75,74,0.1)' : 'rgba(29,158,117,0.1)',
            border: `0.5px solid ${message.startsWith('Error') ? 'rgba(226,75,74,0.3)' : 'rgba(29,158,117,0.3)'}`,
            borderRadius: 'var(--radius-md)',
            color: message.startsWith('Error') ? '#F09595' : '#5DCAA5',
            fontSize: '13px', padding: '10px 14px', marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['exercises', 'categories'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px',
              background: tab === t ? 'var(--purple-2)' : 'var(--navy-2)',
              border: `0.5px solid ${tab === t ? 'var(--violet)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              color: tab === t ? 'var(--violet-light)' : 'var(--muted)',
              fontSize: '13px', cursor: 'pointer', fontWeight: tab === t ? '500' : '400'
            }}>
              {t === 'exercises' ? 'Ejercicios' : 'Categorías'}
            </button>
          ))}
        </div>

        {/* ── TAB EJERCICIOS ── */}
        {tab === 'exercises' && (
          <div>

            {/* Botones principales */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => { setShowExForm(true); setEditingEx(null); resetExForm() }}
                style={styles.btnPrimary}>
                + Nuevo ejercicio
              </button>
              <button
                onClick={handleImportWger}
                disabled={importing}
                style={{ ...styles.btnSecondary, opacity: importing ? 0.7 : 1 }}>
                {importing ? 'Importando...' : 'Importar desde WGER'}
              </button>
              <button
                onClick={handleAutoAssign}
                disabled={importing}
                style={{ ...styles.btnSecondary, opacity: importing ? 0.7 : 1 }}>
                Auto-asignar categorías
              </button>
            </div>

            {/* Selector de categorías para importar WGER */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                CATEGORÍAS PARA IMPORTACIÓN WGER
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleWgerCategory(cat.id)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                      cursor: 'pointer', border: '0.5px solid',
                      background: wgerCategories.includes(cat.id) ? cat.color + '22' : 'var(--navy)',
                      borderColor: wgerCategories.includes(cat.id) ? cat.color : 'var(--border)',
                      color: wgerCategories.includes(cat.id) ? cat.color : 'var(--muted)'
                    }}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form ejercicio */}
            {showExForm && (
              <div style={styles.formCard}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--white)', marginBottom: '20px' }}>
                  {editingEx ? 'Editar ejercicio' : 'Nuevo ejercicio'}
                </h3>
                <form onSubmit={handleExSubmit}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input style={styles.input} value={exForm.name}
                        onChange={e => setExForm({...exForm, name: e.target.value})} required/>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Músculos</label>
                      <input style={styles.input} placeholder="Ej: Pecho, Tríceps"
                        value={exForm.muscles}
                        onChange={e => setExForm({...exForm, muscles: e.target.value})}/>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Dificultad</label>
                      <select style={styles.input} value={exForm.difficulty}
                        onChange={e => setExForm({...exForm, difficulty: e.target.value})}>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>URL imagen</label>
                      <input style={styles.input} placeholder="https://..."
                        value={exForm.image_url}
                        onChange={e => setExForm({...exForm, image_url: e.target.value})}/>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>URL video</label>
                      <input style={styles.input} placeholder="https://youtube.com/..."
                        value={exForm.video_url}
                        onChange={e => setExForm({...exForm, video_url: e.target.value})}/>
                    </div>
                  </div>
                  <div style={{ ...styles.formGroup, marginTop: '4px' }}>
                    <label style={styles.label}>Descripción *</label>
                    <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                      value={exForm.description}
                      onChange={e => setExForm({...exForm, description: e.target.value})} required/>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Categorías</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {categories.map(cat => (
                        <button type="button" key={cat.id}
                          onClick={() => toggleCategoryInForm(cat.id)}
                          style={{
                            padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                            cursor: 'pointer', border: '0.5px solid',
                            background: exForm.categoryIds.includes(cat.id) ? cat.color + '22' : 'var(--navy)',
                            borderColor: exForm.categoryIds.includes(cat.id) ? cat.color : 'var(--border)',
                            color: exForm.categoryIds.includes(cat.id) ? cat.color : 'var(--muted)'
                          }}>
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="submit" style={styles.btnPrimary}>
                      {editingEx ? 'Guardar cambios' : 'Crear ejercicio'}
                    </button>
                    <button type="button" onClick={() => { setShowExForm(false); setEditingEx(null) }} style={styles.btnSecondary}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabla ejercicios */}
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Nombre', 'Músculos', 'Dificultad', 'Categorías', 'Acciones'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exercises.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: 'var(--muted)' }}>
                        No hay ejercicios aún
                      </td>
                    </tr>
                  ) : exercises.map(ex => (
                    <tr key={ex.id} style={styles.tr}>
                      <td style={styles.td}>{ex.name}</td>
                      <td style={{ ...styles.td, color: 'var(--muted)', fontSize: '12px' }}>{ex.muscles || '—'}</td>
                      <td style={styles.td}>
                        <span style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                          background: ex.difficulty === 'principiante' ? 'rgba(29,158,117,0.15)' : ex.difficulty === 'avanzado' ? 'rgba(226,75,74,0.15)' : 'rgba(239,159,39,0.15)',
                          color: ex.difficulty === 'principiante' ? '#5DCAA5' : ex.difficulty === 'avanzado' ? '#F09595' : '#FAC775'
                        }}>
                          {ex.difficulty}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: 'var(--muted)', fontSize: '12px' }}>{ex.categories || '—'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEditEx(ex)} style={styles.btnEdit}>Editar</button>
                          <button onClick={() => handleDeleteEx(ex.id)} style={styles.btnDelete}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB CATEGORÍAS ── */}
        {tab === 'categories' && (
          <div>
            <button onClick={() => setShowCatForm(!showCatForm)} style={{ ...styles.btnPrimary, marginBottom: '20px' }}>
              + Nueva categoría
            </button>

            {showCatForm && (
              <div style={styles.formCard}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--white)', marginBottom: '20px' }}>
                  Nueva categoría
                </h3>
                <form onSubmit={handleCatSubmit}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input style={styles.input} value={catForm.name}
                        onChange={e => setCatForm({...catForm, name: e.target.value})} required/>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Slug *</label>
                      <input style={styles.input} placeholder="ej: crossfit" value={catForm.slug}
                        onChange={e => setCatForm({...catForm, slug: e.target.value})} required/>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Icono (emoji)</label>
                      <input style={styles.input} placeholder="🏋️" value={catForm.icon}
                        onChange={e => setCatForm({...catForm, icon: e.target.value})}/>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Color</label>
                      <input type="color" style={{ ...styles.input, height: '40px', padding: '4px' }}
                        value={catForm.color}
                        onChange={e => setCatForm({...catForm, color: e.target.value})}/>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción</label>
                    <input style={styles.input} value={catForm.description}
                      onChange={e => setCatForm({...catForm, description: e.target.value})}/>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="submit" style={styles.btnPrimary}>Crear categoría</button>
                    <button type="button" onClick={() => setShowCatForm(false)} style={styles.btnSecondary}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Icono', 'Nombre', 'Slug', 'Descripción', 'Acciones'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} style={styles.tr}>
                      <td style={styles.td}>{cat.icon}</td>
                      <td style={styles.td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, display: 'inline-block' }}></span>
                          {cat.name}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: 'var(--muted)', fontSize: '12px', fontFamily: 'monospace' }}>{cat.slug}</td>
                      <td style={{ ...styles.td, color: 'var(--muted)', fontSize: '12px' }}>{cat.description || '—'}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleDeleteCat(cat.id)} style={styles.btnDelete}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  btnPrimary: {
    background: 'var(--purple-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--violet-light)',
    fontSize: '13px', fontWeight: '500', padding: '9px 18px', cursor: 'pointer'
  },
  btnSecondary: {
    background: 'transparent', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--muted)',
    fontSize: '13px', padding: '9px 18px', cursor: 'pointer'
  },
  btnEdit: {
    background: 'rgba(139,111,212,0.1)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--violet-light)',
    fontSize: '11px', padding: '4px 10px', cursor: 'pointer'
  },
  btnDelete: {
    background: 'rgba(226,75,74,0.1)', border: '0.5px solid rgba(226,75,74,0.2)',
    borderRadius: 'var(--radius-sm)', color: '#F09595',
    fontSize: '11px', padding: '4px 10px', cursor: 'pointer'
  },
  formCard: {
    background: 'var(--navy-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px'
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px', marginBottom: '12px'
  },
  formGroup: { marginBottom: '12px' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '500',
    color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: '5px'
  },
  input: {
    width: '100%', padding: '9px 12px',
    background: 'var(--violet-surface)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--white)',
    fontSize: '13px', outline: 'none', fontFamily: 'inherit'
  },
  tableWrap: {
    background: 'var(--navy-2)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', fontSize: '11px', fontWeight: '500',
    color: 'var(--violet)', textAlign: 'left', letterSpacing: '0.06em',
    textTransform: 'uppercase', borderBottom: '0.5px solid var(--border)',
    background: 'var(--violet-surface)'
  },
  td: { padding: '12px 16px', fontSize: '13px', color: 'var(--white)' },
  tr: { borderBottom: '0.5px solid var(--border)' }
}

export default Admin