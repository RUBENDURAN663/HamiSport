const express      = require('express')
const router       = express.Router()
const AIController = require('../controllers/ai.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Ruta protegida — solo usuarios logueados pueden usar el asistente
router.post('/chat', authMiddleware, AIController.chat)

module.exports = router