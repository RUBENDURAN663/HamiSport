const ActivityModel = require('../models/activity.model')
const UserModel     = require('../models/user.model')
const bcrypt        = require('bcryptjs')
const RoutineModel  = require('../models/routine.model')

const VALID_DAYS   = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MAX_ROUTINES = 7

const RoutineController = {

  // GET /api/routines
  getAll: async (req, res) => {
    try {
      const routines = await RoutineModel.getByUser(req.user.id)
      res.json({ routines })
    } catch (error) {
      console.error('Error getAll routines:', error.message)
      res.status(500).json({ message: 'Error al obtener rutinas' })
    }
  },

  // POST /api/routines
  create: async (req, res) => {
    try {
      const { day, name } = req.body

      if (!day || !VALID_DAYS.includes(day)) {
        return res.status(400).json({ message: 'El día no es válido' })
      }

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' })
      }

      if (name.trim().length > 100) {
        return res.status(400).json({ message: 'El nombre es demasiado largo' })
      }

      const count = await RoutineModel.countByUser(req.user.id)
      if (count >= MAX_ROUTINES) {
        return res.status(400).json({ message: 'Ya tienes 7 rutinas. Elimina una para crear otra.' })
      }

      const id = await RoutineModel.create(req.user.id, day, name.trim())
      res.status(201).json({ message: 'Rutina creada', id })

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: `Ya tienes una rutina para el ${req.body.day}` })
      }
      console.error('Error create routine:', error.message)
      res.status(500).json({ message: 'Error al crear rutina' })
    }
  },

  // PUT /api/routines/:id
  updateName: async (req, res) => {
    try {
      const { name }  = req.body
      const routineId = parseInt(req.params.id)

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' })
      }

      const belongs = await RoutineModel.belongsToUser(routineId, req.user.id)
      if (!belongs) {
        return res.status(404).json({ message: 'Rutina no encontrada' })
      }

      await RoutineModel.updateName(routineId, req.user.id, name.trim())
      res.json({ message: 'Rutina actualizada' })

    } catch (error) {
      console.error('Error updateName routine:', error.message)
      res.status(500).json({ message: 'Error al actualizar rutina' })
    }
  },

  // DELETE /api/routines/:id
  delete: async (req, res) => {
    try {
      const routineId = parseInt(req.params.id)

      const belongs = await RoutineModel.belongsToUser(routineId, req.user.id)
      if (!belongs) {
        return res.status(404).json({ message: 'Rutina no encontrada' })
      }

      await RoutineModel.delete(routineId, req.user.id)
      res.json({ message: 'Rutina eliminada' })

    } catch (error) {
      console.error('Error delete routine:', error.message)
      res.status(500).json({ message: 'Error al eliminar rutina' })
    }
  },

  // POST /api/routines/:id/exercises
  addExercise: async (req, res) => {
    try {
      const routineId  = parseInt(req.params.id)
      const exerciseId = parseInt(req.body.exerciseId)

      if (!exerciseId || isNaN(exerciseId)) {
        return res.status(400).json({ message: 'ID de ejercicio inválido' })
      }

      const belongs = await RoutineModel.belongsToUser(routineId, req.user.id)
      if (!belongs) {
        return res.status(404).json({ message: 'Rutina no encontrada' })
      }

      // Contar ejercicios actuales de la rutina para el order_index
      const orderIndex = await RoutineModel.countExercises(routineId)

      await RoutineModel.addExercise(routineId, exerciseId, orderIndex)
      res.json({ message: 'Ejercicio agregado a la rutina' })

    } catch (error) {
      console.error('Error addExercise routine:', error.message)
      res.status(500).json({ message: 'Error al agregar ejercicio' })
    }
  },

  // DELETE /api/routines/:id/exercises/:exerciseId
  removeExercise: async (req, res) => {
    try {
      const routineId  = parseInt(req.params.id)
      const exerciseId = parseInt(req.params.exerciseId)

      const belongs = await RoutineModel.belongsToUser(routineId, req.user.id)
      if (!belongs) {
        return res.status(404).json({ message: 'Rutina no encontrada' })
      }

      await RoutineModel.removeExercise(routineId, exerciseId)
      res.json({ message: 'Ejercicio eliminado de la rutina' })

    } catch (error) {
      console.error('Error removeExercise routine:', error.message)
      res.status(500).json({ message: 'Error al eliminar ejercicio' })
    }
  },

  // GET /api/routines/exercise-ids
  getExerciseIds: async (req, res) => {
    try {
      const data = await RoutineModel.getExerciseIdsByUser(req.user.id)
      res.json({ data })
    } catch (error) {
      console.error('Error getExerciseIds:', error.message)
      res.status(500).json({ message: 'Error al obtener ejercicios de rutinas' })
    }
  }

}

module.exports = RoutineController