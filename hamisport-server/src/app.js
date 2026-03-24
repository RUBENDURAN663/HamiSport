const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const authRoutes    = require('./routes/auth.routes')
const libraryRoutes = require('./routes/library.routes')
const aiRoutes      = require('./routes/ai.routes')
const errorMiddleware = require('./middlewares/error.middleware')
const dashboardRoutes = require('./routes/dashboard.routes')

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/auth',      authRoutes)
app.use('/api/library',   libraryRoutes)
app.use('/api/ai',        aiRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HAMISPORT API corriendo' })
})

app.use(errorMiddleware)

module.exports = app