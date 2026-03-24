const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const UserModel = require('../models/user.model')

const AuthController = {

  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' })
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
      }

      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return res.status(409).json({ message: 'El correo ya está registrado' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const userId         = await UserModel.create(name, email, hashedPassword)

      const token = jwt.sign(
        { id: userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: { id: userId, name, email, role: 'user' }
      })

    } catch (error) {
      console.error('Error en register:', error.message)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  },

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password, remember } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios' })
      }

      const user = await UserModel.findByEmail(email)
      if (!user) {
        return res.status(401).json({ message: 'Credenciales incorrectas' })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas' })
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: remember ? '30d' : '7d' }
      )

      res.status(200).json({
        message: 'Login exitoso',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      })

    } catch (error) {
      console.error('Error en login:', error.message)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  },

  // GET /api/auth/me
  getMe: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }
      res.status(200).json({ user })
    } catch (error) {
      console.error('Error en getMe:', error.message)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

}

module.exports = AuthController