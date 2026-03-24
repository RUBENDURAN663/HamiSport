const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Rutas públicas
router.post('/register', AuthController.register)
router.post('/login',    AuthController.login)

// Ruta protegida — requiere token
router.get('/me', authMiddleware, AuthController.getMe)

module.exports = router