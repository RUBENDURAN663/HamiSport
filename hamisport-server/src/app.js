const express   = require('express')
const cors      = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const authRoutes      = require('./routes/auth.routes')
const libraryRoutes   = require('./routes/library.routes')
const aiRoutes        = require('./routes/ai.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const favoriteRoutes  = require('./routes/favorite.routes')
const routineRoutes   = require('./routes/routine.routes')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

// ─── Rate Limiters ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' }
})

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 15,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Límite de consultas al asistente alcanzado. Intenta de nuevo en un minuto.' }
})

// ─── Middlewares globales ─────────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(globalLimiter)

// ─── Rutas ────────────────────────────────────────────────────────────────────

app.use('/api/auth',      authLimiter, authRoutes)
app.use('/api/library',               libraryRoutes)
app.use('/api/ai',        aiLimiter,   aiRoutes)
app.use('/api/dashboard',             dashboardRoutes)
app.use('/api/favorites',             favoriteRoutes)
app.use('/api/routines',              routineRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HAMISPORT API corriendo' })
})

app.use(errorMiddleware)

module.exports = app