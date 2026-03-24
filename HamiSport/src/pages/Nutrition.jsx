import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import DashboardService from '../services/dashboard.service'

// ── DATOS ──────────────────────────────────────────────────────────────────

const guides = [
  {
    id: 'volumen', label: 'Volumen', icon: '💪', color: '#2E9BBF',
    goal: 'Ganar masa muscular',
    calories: 'Superávit de 300-500 kcal sobre tu mantenimiento',
    macros: { protein: '2.0-2.5g por kg', carbs: '4-6g por kg', fat: '0.8-1g por kg' },
    foods: ['Arroz, avena, batata', 'Pollo, res, huevos, atún', 'Aguacate, frutos secos', 'Leche, yogur griego', 'Frutas y verduras'],
    tips: [
      'Come cada 3-4 horas para mantener síntesis proteica constante',
      'Consume proteína dentro de los 30 min post-entreno',
      'Prioriza carbohidratos complejos antes del entrenamiento',
      'No temas a las grasas saludables — son esenciales para las hormonas'
    ]
  },
  {
    id: 'definicion', label: 'Definición', icon: '🔥', color: '#E24B4A',
    goal: 'Reducir grasa corporal manteniendo músculo',
    calories: 'Déficit de 300-500 kcal bajo tu mantenimiento',
    macros: { protein: '2.2-2.8g por kg', carbs: '2-3g por kg', fat: '0.6-0.8g por kg' },
    foods: ['Verduras de hoja verde', 'Proteínas magras — pollo, pescado, claras', 'Arroz integral, avena', 'Frutas de bajo índice glucémico', 'Agua — mínimo 3 litros al día'],
    tips: [
      'Aumenta la proteína para preservar músculo en déficit',
      'Reduce carbohidratos pero no los elimines completamente',
      'Haz cardio en ayunas para optimizar la quema de grasa',
      'Duerme 7-9 horas — el cortisol alto acumula grasa abdominal'
    ]
  },
  {
    id: 'mantenimiento', label: 'Mantenimiento', icon: '⚖️', color: '#1D9E75',
    goal: 'Mantener composición corporal actual',
    calories: 'Igual a tu TDEE — sin superávit ni déficit',
    macros: { protein: '1.6-2.0g por kg', carbs: '3-5g por kg', fat: '0.8-1g por kg' },
    foods: ['Dieta variada y equilibrada', 'Proteínas en cada comida', 'Carbohidratos según actividad', 'Grasas saludables diarias', 'Hidratación constante'],
    tips: [
      'Pésate semanalmente en las mismas condiciones',
      'Ajusta calorías según cambios de peso',
      'Mantén consistencia — la adherencia es la clave',
      'Permite comidas libres ocasionales sin culpa'
    ]
  },
  {
    id: 'rendimiento', label: 'Rendimiento', icon: '⚡', color: '#EF9F27',
    goal: 'Maximizar el rendimiento deportivo',
    calories: 'Superávit moderado de 200-300 kcal',
    macros: { protein: '1.8-2.2g por kg', carbs: '5-8g por kg', fat: '1-1.2g por kg' },
    foods: ['Carbohidratos de rápida absorción pre-entreno', 'Proteína de alta calidad post-entreno', 'Plátano, dátiles para energía rápida', 'Bebidas isotónicas en sesiones largas', 'Creatina monohidrato como suplemento base'],
    tips: [
      'Carga de carbohidratos 24-48h antes de competencia',
      'Hidratación: 500ml antes, 200ml cada 20min durante',
      'Recovery shake dentro de los primeros 30 min post-sesión',
      'Evita grasas y fibra alta justo antes de entrenar'
    ]
  }
]

const sportPlans = [
  {
    sport: 'Gym', icon: '🏋️', color: '#2E9BBF',
    breakfast: 'Avena con plátano + 4 huevos revueltos + café negro',
    preWorkout: 'Arroz con pollo + ensalada verde (1-2h antes)',
    postWorkout: 'Batido de proteína + plátano (inmediatamente después)',
    lunch: 'Arroz integral + pechuga de pollo 200g + verduras al vapor',
    dinner: 'Salmón o atún + camote + brócoli',
    snacks: 'Yogur griego + frutos secos + fruta',
    hydration: '3-4 litros de agua al día'
  },
  {
    sport: 'Fútbol', icon: '⚽', color: '#1D9E75',
    breakfast: 'Tostadas integrales + huevos + jugo natural',
    preWorkout: 'Pasta o arroz + proteína magra (2-3h antes del partido)',
    postWorkout: 'Bebida isotónica + sandwich de pollo',
    lunch: 'Pasta integral + carne magra + ensalada',
    dinner: 'Arroz + pescado + vegetales',
    snacks: 'Plátano + barrita energética + frutos secos',
    hydration: '4-5 litros — especialmente en días de partido'
  },
  {
    sport: 'Basketball', icon: '🏀', color: '#EF9F27',
    breakfast: 'Granola + leche + frutas + huevos',
    preWorkout: 'Arroz con pollo o pasta + ensalada (2h antes)',
    postWorkout: 'Proteína + carbohidratos simples inmediatamente',
    lunch: 'Arroz integral + pollo o pavo + aguacate',
    dinner: 'Salmón + quinoa + espinacas',
    snacks: 'Plátano + mantequilla de maní + yogur',
    hydration: '3.5-4 litros — hidratación crítica en partidos'
  },
  {
    sport: 'Atletismo', icon: '🏃', color: '#E24B4A',
    breakfast: 'Avena + plátano + leche + claras de huevo',
    preWorkout: 'Tostadas con miel + plátano (45-60 min antes)',
    postWorkout: 'Bebida de recuperación con proteína y carbohidratos',
    lunch: 'Pasta integral + atún + tomate + aceite de oliva',
    dinner: 'Arroz + pollo + verduras al vapor',
    snacks: 'Dátiles + frutos secos + barrita energética',
    hydration: '4-6 litros en días de entrenamiento intenso'
  },
  {
    sport: 'Funcional', icon: '💪', color: '#7B6FD4',
    breakfast: 'Huevos revueltos + aguacate + tostadas integrales',
    preWorkout: 'Batata + pollo o atún (1.5h antes)',
    postWorkout: 'Batido proteína + avena + plátano',
    lunch: 'Arroz integral + carne magra + vegetales variados',
    dinner: 'Huevos + vegetales salteados + aguacate',
    snacks: 'Nueces + fruta + yogur griego natural',
    hydration: '3-4 litros con electrolitos en sesiones intensas'
  }
]

const activityLevels = [
  { value: 1.2,   label: 'Sedentario',  desc: 'Sin ejercicio' },
  { value: 1.375, label: 'Ligero',      desc: '1-3 días/semana' },
  { value: 1.55,  label: 'Moderado',    desc: '3-5 días/semana' },
  { value: 1.725, label: 'Activo',      desc: '6-7 días/semana' },
  { value: 1.9,   label: 'Muy activo',  desc: '2 veces al día' }
]

// ── CALCULADORA ────────────────────────────────────────────────────────────

const Calculator = () => {
  const [form, setForm] = useState({
    weight: '', height: '', age: '',
    sex: 'male', activity: 1.55, goal: 'mantenimiento'
  })
  const [result, setResult] = useState(null)
  const [animateResult, setAnimateResult] = useState(false)

  const calculate = (e) => {
    e.preventDefault()
    const { weight, height, age, sex, activity, goal } = form
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)
    const bmr = sex === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161
    const tdee = Math.round(bmr * activity)
    const heightM = h / 100
    const imc = (w / (heightM * heightM)).toFixed(1)
    const imcCategory =
      imc < 18.5 ? { label: 'Bajo peso',  color: '#2E9BBF' } :
      imc < 25   ? { label: 'Normal',      color: '#1D9E75' } :
      imc < 30   ? { label: 'Sobrepeso',   color: '#EF9F27' } :
                   { label: 'Obesidad',    color: '#E24B4A' }
    const goalCalories =
      goal === 'volumen'     ? tdee + 400 :
      goal === 'definicion'  ? tdee - 400 :
      goal === 'rendimiento' ? tdee + 200 : tdee
    const protein = Math.round(w * 2.0)
    const fat     = Math.round(w * 0.9)
    const carbs   = Math.round((goalCalories - protein * 4 - fat * 9) / 4)
    setResult({ bmr: Math.round(bmr), tdee, goalCalories, imc, imcCategory, protein, fat, carbs: Math.max(carbs, 0) })
    setAnimateResult(false)
    setTimeout(() => setAnimateResult(true), 50)
  }

  return (
    <div>
      <form onSubmit={calculate}>
        <div style={cStyles.grid}>
          {[
            { label: 'Peso (kg)',    key: 'weight', placeholder: '70',  min: 30,  max: 300, type: 'number' },
            { label: 'Altura (cm)', key: 'height', placeholder: '175', min: 100, max: 250, type: 'number' },
            { label: 'Edad',        key: 'age',    placeholder: '25',  min: 10,  max: 100, type: 'number' }
          ].map(field => (
            <div key={field.key} style={cStyles.formGroup}>
              <label style={cStyles.label}>{field.label}</label>
              <input
                style={cStyles.input}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm({...form, [field.key]: e.target.value})}
                required min={field.min} max={field.max}
              />
            </div>
          ))}
          <div style={cStyles.formGroup}>
            <label style={cStyles.label}>Sexo</label>
            <select style={cStyles.input} value={form.sex}
              onChange={e => setForm({...form, sex: e.target.value})}>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>

          <div style={{ ...cStyles.formGroup, gridColumn: '1 / -1' }}>
            <label style={cStyles.label}>Nivel de actividad</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {activityLevels.map(lvl => (
                <button type="button" key={lvl.value}
                  onClick={() => setForm({...form, activity: lvl.value})}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-md)',
                    fontSize: '12px', cursor: 'pointer', border: '0.5px solid',
                    background: form.activity === lvl.value ? 'rgba(26,107,138,0.25)' : 'rgba(15,32,64,0.6)',
                    borderColor: form.activity === lvl.value ? 'var(--med-2)' : 'var(--border)',
                    color: form.activity === lvl.value ? 'var(--med-light)' : 'var(--muted)',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ fontWeight: '500' }}>{lvl.label}</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...cStyles.formGroup, gridColumn: '1 / -1' }}>
            <label style={cStyles.label}>Objetivo</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {[
                { value: 'volumen',       label: '💪 Volumen',        color: '#2E9BBF' },
                { value: 'definicion',    label: '🔥 Definición',     color: '#E24B4A' },
                { value: 'mantenimiento', label: '⚖️ Mantenimiento',  color: '#1D9E75' },
                { value: 'rendimiento',   label: '⚡ Rendimiento',    color: '#EF9F27' }
              ].map(g => (
                <button type="button" key={g.value}
                  onClick={() => setForm({...form, goal: g.value})}
                  style={{
                    padding: '9px 18px', borderRadius: 'var(--radius-md)',
                    fontSize: '13px', cursor: 'pointer', border: '0.5px solid',
                    background: form.goal === g.value ? g.color + '22' : 'rgba(15,32,64,0.6)',
                    borderColor: form.goal === g.value ? g.color : 'var(--border)',
                    color: form.goal === g.value ? g.color : 'var(--muted)',
                    transition: 'all 0.2s', fontWeight: form.goal === g.value ? '500' : '400'
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" style={cStyles.btnCalc}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="12" y2="14"/>
          </svg>
          Calcular
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '28px', animation: animateResult ? 'fadeInUp 0.4s ease forwards' : 'none', opacity: animateResult ? 1 : 0 }}>

          {/* Métricas principales */}
          <div style={cStyles.resultSection}>
            <div style={cStyles.resultSectionLabel}>Resultados</div>
            <div style={cStyles.metricsGrid}>
              {[
                { label: 'IMC',        value: result.imc,          sub: result.imcCategory.label, color: result.imcCategory.color },
                { label: 'BMR reposo', value: result.bmr,           sub: 'kcal/día',               color: 'var(--med-light)' },
                { label: 'TDEE',       value: result.tdee,          sub: 'kcal/día',               color: 'var(--grisalho-light)' },
                { label: 'Objetivo',   value: result.goalCalories,  sub: 'kcal/día',               color: 'var(--carine-light)' }
              ].map((m, i) => (
                <div key={i} style={{ ...cStyles.metricCard, borderColor: m.color + '44' }}>
                  <div style={cStyles.metricLabel}>{m.label}</div>
                  <div style={{ ...cStyles.metricValue, color: m.color }}>{m.value}</div>
                  <div style={{ ...cStyles.metricSub, color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros con barras */}
          <div style={{ ...cStyles.resultSection, marginTop: '14px' }}>
            <div style={cStyles.resultSectionLabel}>Macronutrientes diarios</div>
            <div style={cStyles.macrosGrid}>
              {[
                { label: 'Proteína',      value: result.protein, kcal: result.protein * 4, color: '#1D9E75',  pct: Math.round((result.protein * 4 / result.goalCalories) * 100) },
                { label: 'Carbohidratos', value: result.carbs,   kcal: result.carbs * 4,   color: '#EF9F27',  pct: Math.round((result.carbs * 4 / result.goalCalories) * 100) },
                { label: 'Grasas',        value: result.fat,     kcal: result.fat * 9,     color: '#2E9BBF',  pct: Math.round((result.fat * 9 / result.goalCalories) * 100) }
              ].map((m, i) => (
                <div key={i} style={cStyles.macroCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{m.label}</span>
                    <span style={{ fontSize: '18px', fontWeight: '500', color: m.color }}>{m.value}g</span>
                  </div>
                  <div style={cStyles.macroBar}>
                    <div style={{ ...cStyles.macroBarFill, width: `${Math.min(m.pct, 100)}%`, background: m.color }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.kcal} kcal</span>
                    <span style={{ fontSize: '11px', color: m.color }}>{m.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────

const Nutrition = () => {
  const [activeTab, setActiveTab]     = useState('calculator')
  const [activeGuide, setActiveGuide] = useState(null)
  const [activeSport, setActiveSport] = useState(null)

  useEffect(() => {
    DashboardService.logActivity('nutrition_visit')
  }, [])

  const tabs = [
    { id: 'calculator', label: '📊', text: 'Calculadora' },
    { id: 'guides',     label: '📖', text: 'Guías' },
    { id: 'plans',      label: '🗓️', text: 'Planes' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(50px,-40px) scale(1.08); }
        }
        @keyframes wave2 {
          0%,100% { transform: translate(0,0) scale(1.05); }
          50%      { transform: translate(-60px,50px) scale(0.95); }
        }
        @keyframes guideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .guide-card-item:hover { transform: translateY(-3px) !important; }
        .sport-btn:hover { transform: scale(1.04); }
        .plan-meal:hover { border-color: rgba(46,155,191,0.4) !important; background: rgba(26,107,138,0.1) !important; }
      `}</style>

      {/* Ondas de fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,107,138,0.1) 0%, transparent 70%)',
          top: '-200px', left: '-150px', animation: 'wave1 18s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,79,138,0.09) 0%, transparent 70%)',
          bottom: '0', right: '-100px', animation: 'wave2 22s ease-in-out infinite'
        }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.55)' }}></div>
      </div>

      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 60px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.4s ease forwards' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' }}>
            Nutrición
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Calculadora, guías y planes alimenticios para tu deporte
          </p>
        </div>

        {/* Tabs mejorados */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', background: 'rgba(15,32,64,0.6)', padding: '5px', borderRadius: 'var(--radius-lg)', width: 'fit-content', border: '0.5px solid var(--border)', backdropFilter: 'blur(8px)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '10px 22px', borderRadius: 'var(--radius-md)',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, var(--med), var(--carine))'
                : 'transparent',
              border: 'none',
              color: activeTab === tab.id ? 'var(--white)' : 'var(--muted)',
              fontSize: '13px', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '500' : '400',
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', gap: '7px'
            }}>
              <span>{tab.label}</span>
              {tab.text}
            </button>
          ))}
        </div>

        {/* ── CALCULADORA ── */}
        {activeTab === 'calculator' && (
          <div style={{ animation: 'fadeInUp 0.35s ease forwards' }}>
            <div style={pStyles.card}>
              <div style={pStyles.cardHeader}>
                <div style={{ ...pStyles.cardIconWrap, background: 'rgba(26,107,138,0.15)', border: '0.5px solid rgba(26,107,138,0.3)' }}>
                  <span style={{ fontSize: '22px' }}>📊</span>
                </div>
                <div>
                  <h2 style={pStyles.cardTitle}>Calculadora IMC y calorías</h2>
                  <p style={pStyles.cardSubtitle}>Ingresa tus datos para obtener tu plan nutricional personalizado</p>
                </div>
              </div>
              <Calculator />
            </div>
          </div>
        )}

        {/* ── GUÍAS ── */}
        {activeTab === 'guides' && (
          <div style={{ animation: 'fadeInUp 0.35s ease forwards' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {guides.map((guide, idx) => (
                <div
                  key={guide.id}
                  className="guide-card-item"
                  style={{
                    background: activeGuide?.id === guide.id
                      ? guide.color + '18'
                      : 'rgba(15,32,64,0.7)',
                    border: `0.5px solid ${activeGuide?.id === guide.id ? guide.color + '88' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '22px 20px',
                    cursor: 'pointer', transition: 'all 0.25s',
                    backdropFilter: 'blur(8px)',
                    animation: `fadeInUp 0.4s ease ${idx * 0.08}s forwards`,
                    opacity: 0
                  }}
                  onClick={() => setActiveGuide(activeGuide?.id === guide.id ? null : guide)}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                    background: guide.color + '18', border: `0.5px solid ${guide.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '14px', fontSize: '24px'
                  }}>
                    {guide.icon}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--white)', marginBottom: '4px' }}>
                    {guide.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{guide.goal}</div>
                  <div style={{
                    marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', color: guide.color, fontWeight: '500'
                  }}>
                    {activeGuide?.id === guide.id ? '▲ Cerrar' : '▼ Ver guía'}
                  </div>
                </div>
              ))}
            </div>

            {activeGuide && (
              <div style={{ ...pStyles.card, animation: 'guideIn 0.3s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
                    background: activeGuide.color + '18', border: `0.5px solid ${activeGuide.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                  }}>
                    {activeGuide.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--white)', marginBottom: '3px' }}>
                      {activeGuide.label}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{activeGuide.goal}</p>
                  </div>
                  <div style={{
                    marginLeft: 'auto', background: activeGuide.color + '18',
                    border: `0.5px solid ${activeGuide.color}44`,
                    borderRadius: 'var(--radius-md)', padding: '8px 16px',
                    fontSize: '12px', color: activeGuide.color, fontWeight: '500'
                  }}>
                    {activeGuide.calories}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {/* Macros */}
                  <div style={pStyles.guideSection}>
                    <div style={{ ...pStyles.guideSectionLabel, color: activeGuide.color }}>
                      Macronutrientes
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Proteína',      value: activeGuide.macros.protein, color: '#1D9E75' },
                        { label: 'Carbohidratos', value: activeGuide.macros.carbs,   color: '#EF9F27' },
                        { label: 'Grasas',        value: activeGuide.macros.fat,     color: '#2E9BBF' }
                      ].map(m => (
                        <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(10,22,40,0.4)', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{m.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: m.color }}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alimentos */}
                  <div style={pStyles.guideSection}>
                    <div style={{ ...pStyles.guideSectionLabel, color: activeGuide.color }}>Alimentos clave</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {activeGuide.foods.map((food, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted)' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeGuide.color, flexShrink: 0 }}></div>
                          {food}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div style={{ ...pStyles.guideSection, gridColumn: 'span 2' }}>
                    <div style={{ ...pStyles.guideSectionLabel, color: activeGuide.color }}>Consejos clave</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {activeGuide.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 12px', background: 'rgba(10,22,40,0.4)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                          <span style={{ color: activeGuide.color, fontWeight: '500', flexShrink: 0, fontSize: '15px' }}>{i + 1}.</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PLANES POR DEPORTE ── */}
        {activeTab === 'plans' && (
          <div style={{ animation: 'fadeInUp 0.35s ease forwards' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {sportPlans.map((plan, idx) => (
                <button
                  key={plan.sport}
                  className="sport-btn"
                  onClick={() => setActiveSport(activeSport?.sport === plan.sport ? null : plan)}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '13px',
                    cursor: 'pointer', border: '0.5px solid', fontWeight: '500',
                    background: activeSport?.sport === plan.sport
                      ? plan.color + '22'
                      : 'rgba(15,32,64,0.7)',
                    borderColor: activeSport?.sport === plan.sport ? plan.color : 'var(--border)',
                    color: activeSport?.sport === plan.sport ? plan.color : 'var(--muted)',
                    transition: 'all 0.2s', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', gap: '7px',
                    animation: `fadeInUp 0.4s ease ${idx * 0.06}s forwards`,
                    opacity: 0
                  }}>
                  <span style={{ fontSize: '16px' }}>{plan.icon}</span>
                  {plan.sport}
                </button>
              ))}
            </div>

            {!activeSport && (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥗</div>
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  Selecciona un deporte para ver su plan nutricional
                </p>
              </div>
            )}

            {activeSport && (
              <div style={{ ...pStyles.card, animation: 'guideIn 0.3s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
                    background: activeSport.color + '18', border: `0.5px solid ${activeSport.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                  }}>
                    {activeSport.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--white)', marginBottom: '3px' }}>
                      Plan — {activeSport.sport}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Distribución nutricional diaria recomendada</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {[
                    { label: '🌅 Desayuno',    value: activeSport.breakfast   },
                    { label: '⚡ Pre-entreno', value: activeSport.preWorkout  },
                    { label: '💪 Post-entreno',value: activeSport.postWorkout },
                    { label: '🍽️ Almuerzo',    value: activeSport.lunch       },
                    { label: '🌙 Cena',        value: activeSport.dinner      },
                    { label: '🍎 Snacks',      value: activeSport.snacks      },
                    { label: '💧 Hidratación', value: activeSport.hydration   }
                  ].map((meal, i) => (
                    <div key={i} className="plan-meal" style={{
                      background: 'rgba(15,32,64,0.6)',
                      border: `0.5px solid ${activeSport.color}33`,
                      borderRadius: 'var(--radius-md)', padding: '14px 16px',
                      transition: 'all 0.2s', backdropFilter: 'blur(4px)',
                      animation: `fadeInUp 0.35s ease ${i * 0.05}s forwards`,
                      opacity: 0
                    }}>
                      <p style={{
                        fontSize: '11px', fontWeight: '500',
                        color: activeSport.color, letterSpacing: '0.05em',
                        marginBottom: '7px', textTransform: 'uppercase'
                      }}>
                        {meal.label}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.55' }}>
                        {meal.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ── ESTILOS ────────────────────────────────────────────────────────────────

const cStyles = {
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '14px', marginBottom: '20px'
  },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '11px', fontWeight: '500', color: 'var(--muted)',
    letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px'
  },
  input: {
    padding: '11px 13px',
    background: 'rgba(15,32,64,0.7)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '13px',
    outline: 'none', fontFamily: 'inherit',
    backdropFilter: 'blur(4px)'
  },
  btnCalc: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, var(--med), var(--carine))',
    border: 'none', borderRadius: 'var(--radius-md)',
    color: 'var(--white)', fontSize: '14px', fontWeight: '500',
    padding: '12px 28px', cursor: 'pointer'
  },
  resultSection: {
    background: 'rgba(15,32,64,0.6)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px',
    backdropFilter: 'blur(8px)'
  },
  resultSectionLabel: {
    fontSize: '10px', fontWeight: '500', color: 'var(--med-2)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px'
  },
  metricsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px'
  },
  metricCard: {
    background: 'rgba(10,22,40,0.6)', border: '0.5px solid',
    borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center'
  },
  metricLabel: { fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' },
  metricValue: { fontSize: '26px', fontWeight: '500' },
  metricSub:   { fontSize: '11px', marginTop: '3px' },
  macrosGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px'
  },
  macroCard: {
    background: 'rgba(10,22,40,0.6)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '14px 16px'
  },
  macroBar: {
    height: '6px', background: 'rgba(255,255,255,0.06)',
    borderRadius: '3px', overflow: 'hidden'
  },
  macroBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.6s ease' }
}

const pStyles = {
  card: {
    background: 'rgba(15,32,64,0.7)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '28px 24px',
    backdropFilter: 'blur(8px)'
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' },
  cardIconWrap: {
    width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  cardTitle:    { fontSize: '18px', fontWeight: '500', color: 'var(--white)', marginBottom: '3px' },
  cardSubtitle: { fontSize: '13px', color: 'var(--muted)' },
  guideSection: {
    background: 'rgba(10,22,40,0.5)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '16px 18px'
  },
  guideSectionLabel: {
    fontSize: '10px', fontWeight: '500',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px'
  }
}

export default Nutrition