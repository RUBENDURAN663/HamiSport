const ActivityModel = require('../models/activity.model')
const UserModel     = require('../models/user.model')
const bcrypt        = require('bcryptjs')

const DashboardController = {

  // GET /api/dashboard/stats
  getStats: async (req, res) => {
    try {
      const stats   = await ActivityModel.getStats(req.user.id)
      const history = await ActivityModel.getExerciseHistory(req.user.id)
      res.json({ stats, history })
    } catch (error) {
      console.error('Error getStats:', error.message)
      res.status(500).json({ message: 'Error al obtener estadísticas' })
    }
  },

  // POST /api/dashboard/activity
  logActivity: async (req, res) => {
    try {
      const { type, referenceId } = req.body
      const validTypes = ['exercise_view', 'ai_query', 'library_visit', 'nutrition_visit']

      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Tipo de actividad inválido' })
      }

      await ActivityModel.log(req.user.id, type, referenceId || null)
      res.json({ message: 'Actividad registrada' })
    } catch (error) {
      console.error('Error logActivity:', error.message)
      res.status(500).json({ message: 'Error al registrar actividad' })
    }
  },

  // PUT /api/dashboard/profile
  updateProfile: async (req, res) => {
    try {
      const { name, email, avatarUrl } = req.body

      if (!name || !email) {
        return res.status(400).json({ message: 'Nombre y correo son obligatorios' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El correo no tiene un formato válido' })
      }

      // Verificar que el email no lo use otro usuario
      const existing = await UserModel.findByEmailExcludingId(email, req.user.id)
      if (existing) {
        return res.status(409).json({ message: 'Ese correo ya está en uso por otra cuenta' })
      }

      await UserModel.updateProfile(req.user.id, name, email, avatarUrl || null)

      const updatedUser = await UserModel.findById(req.user.id)
      res.json({ message: 'Perfil actualizado correctamente', user: updatedUser })
    } catch (error) {
      console.error('Error updateProfile:', error.message)
      res.status(500).json({ message: 'Error al actualizar perfil' })
    }
  },

  // PUT /api/dashboard/password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Ambas contraseñas son obligatorias' })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' })
      }

      const user     = await UserModel.findById(req.user.id)
      const fullUser = await UserModel.findByEmail(user.email)

      const isMatch = await bcrypt.compare(currentPassword, fullUser.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta' })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await UserModel.updatePassword(req.user.id, hashedPassword)

      res.json({ message: 'Contraseña actualizada correctamente' })
    } catch (error) {
      console.error('Error changePassword:', error.message)
      res.status(500).json({ message: 'Error al cambiar contraseña' })
    }
  }

}

module.exports = DashboardController