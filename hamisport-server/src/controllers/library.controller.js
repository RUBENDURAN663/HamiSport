const CategoryModel = require('../models/category.model')
const ExerciseModel = require('../models/exercise.model')
const axios         = require('axios')
const pool = require('../config/db')

const LibraryController = {

  // ── CATEGORÍAS ──────────────────────────────

  getCategories: async (req, res) => {
    try {
      const categories = await CategoryModel.getAll()
      res.json({ categories })
    } catch (error) {
      console.error('Error getCategories:', error.message)
      res.status(500).json({ message: 'Error al obtener categorías' })
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, slug, icon, color, description } = req.body
      if (!name || !slug || !icon || !color) {
        return res.status(400).json({ message: 'Nombre, slug, icono y color son obligatorios' })
      }
      const id = await CategoryModel.create(name, slug, icon, color, description)
      res.status(201).json({ message: 'Categoría creada', id })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El slug ya existe' })
      }
      res.status(500).json({ message: 'Error al crear categoría' })
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params
      const { name, icon, color, description } = req.body
      await CategoryModel.update(id, name, icon, color, description)
      res.json({ message: 'Categoría actualizada' })
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar categoría' })
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params
      await CategoryModel.delete(id)
      res.json({ message: 'Categoría eliminada' })
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar categoría' })
    }
  },

  // ── EJERCICIOS ──────────────────────────────

  getExercises: async (req, res) => {
    try {
      const { category, search } = req.query

      let exercises
      if (search) {
        exercises = await ExerciseModel.search(search)
      } else if (category) {
        exercises = await ExerciseModel.getByCategory(category)
      } else {
        exercises = await ExerciseModel.getAll()
      }

      res.json({ exercises })
    } catch (error) {
      console.error('Error getExercises:', error.message)
      res.status(500).json({ message: 'Error al obtener ejercicios' })
    }
  },

  getExerciseById: async (req, res) => {
    try {
      const exercise = await ExerciseModel.getById(req.params.id)
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' })
      }
      res.json({ exercise })
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener ejercicio' })
    }
  },

  createExercise: async (req, res) => {
    try {
      const { categoryIds, ...exerciseData } = req.body

      if (!exerciseData.name || !exerciseData.description) {
        return res.status(400).json({ message: 'Nombre y descripción son obligatorios' })
      }

      const exerciseId = await ExerciseModel.create(exerciseData, req.user.id)

      if (categoryIds && categoryIds.length > 0) {
        await ExerciseModel.assignCategories(exerciseId, categoryIds)
      }

      res.status(201).json({ message: 'Ejercicio creado', id: exerciseId })
    } catch (error) {
      console.error('Error createExercise:', error.message)
      res.status(500).json({ message: 'Error al crear ejercicio' })
    }
  },

  updateExercise: async (req, res) => {
    try {
      const { id } = req.params
      const { categoryIds, ...exerciseData } = req.body

      await ExerciseModel.update(id, exerciseData)

      if (categoryIds && categoryIds.length > 0) {
        await ExerciseModel.assignCategories(id, categoryIds)
      }

      res.json({ message: 'Ejercicio actualizado' })
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar ejercicio' })
    }
  },

  deleteExercise: async (req, res) => {
    try {
      await ExerciseModel.delete(req.params.id)
      res.json({ message: 'Ejercicio eliminado' })
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar ejercicio' })
    }
  },

  // ── IMPORTAR DESDE WGER ─────────────────────

  importFromWger: async (req, res) => {
    try {
      const { categoryIds } = req.body

      const response = await axios.get(
        'https://wger.de/api/v2/exerciseinfo/?format=json&language=4&limit=20',
        { timeout: 15000 }
      )

      const exercises = response.data.results
      let imported = 0
      let skipped  = 0

      for (const ex of exercises) {
        const translation = ex.translations?.find(t => t.language === 4)
                         || ex.translations?.find(t => t.language === 2)

        if (!translation || !translation.name || translation.name.trim() === '') {
          skipped++
          continue
        }

        const [existing] = await pool.execute(
          'SELECT id FROM exercises WHERE wger_id = ?',
          [ex.id]
        )

        if (existing.length > 0) {
          skipped++
          continue
        }

        const muscles = ex.muscles?.map(m => m.name_en).join(', ') || 'Ver detalle'

        const exerciseData = {
          name:        translation.name.trim(),
          description: translation.description
            ? translation.description.replace(/<[^>]*>/g, '').trim() || 'Sin descripción'
            : 'Sin descripción',
          muscles:    muscles,
          difficulty: 'intermedio',
          wger_id:    ex.id,
          image_url:  ex.images?.[0]?.image || null
        }

        const exerciseId = await ExerciseModel.create(exerciseData, req.user.id)

        if (categoryIds && categoryIds.length > 0) {
          await ExerciseModel.assignCategories(exerciseId, categoryIds)
        }

        imported++
      }

      res.json({
        message: `${imported} ejercicios importados, ${skipped} omitidos`
      })

    } catch (error) {
      console.error('Error importFromWger:', error.message)
      res.status(500).json({ message: 'Error al importar: ' + error.message })
    }
  },

  // ── AUTO ASIGNAR CATEGORÍAS ─────────────────

  autoAssignCategories: async (req, res) => {
    try {
      const [exercises] = await pool.execute(
        'SELECT id, name, muscles FROM exercises WHERE wger_id IS NOT NULL'
      )

      const rules = [
        {
          categoryId: 1,
          keywords: [
            'bench', 'press', 'curl', 'row', 'deadlift', 'squat', 'pull',
            'push', 'fly', 'extension', 'chest', 'back', 'shoulder', 'tricep',
            'bicep', 'pecho', 'espalda', 'hombro', 'barra', 'mancuerna',
            'pectoral', 'dorsal', 'trapecio', 'remo', 'jalón', 'press banca',
            'quadriceps', 'hamstring', 'glute', 'calf', 'lunge'
          ]
        },
        {
          categoryId: 2,
          keywords: [
            'sprint', 'agility', 'kick', 'leg', 'run', 'speed', 'endurance',
            'calf', 'hamstring', 'quadricep', 'hip', 'pierna', 'velocidad',
            'resistencia', 'cardio', 'jump', 'salto', 'lateral', 'change'
          ]
        },
        {
          categoryId: 3,
          keywords: [
            'jump', 'vertical', 'leap', 'explosive', 'salto', 'explosivo',
            'agility', 'agilidad', 'lateral', 'quickness', 'wrist', 'forearm',
            'core', 'balance', 'coordination', 'coordinación'
          ]
        },
        {
          categoryId: 4,
          keywords: [
            'run', 'cardio', 'endurance', 'aerobic', 'jog', 'sprint', 'stride',
            'correr', 'resistencia', 'aeróbico', 'calf', 'hip flexor',
            'hamstring', 'glute', 'ankle', 'tobillo', 'step', 'pace'
          ]
        },
        {
          categoryId: 5,
          keywords: [
            'bodyweight', 'plank', 'push-up', 'pull-up', 'burpee', 'squat',
            'lunge', 'core', 'balance', 'stability', 'functional', 'abs',
            'abdomen', 'plancha', 'flexión', 'sentadilla', 'peso corporal',
            'crunch', 'sit-up', 'mountain', 'climber', 'dip', 'bridge'
          ]
        }
      ]

      let assigned = 0

      for (const exercise of exercises) {
        const text = `${exercise.name} ${exercise.muscles || ''}`.toLowerCase()
        const matchedCategories = []

        for (const rule of rules) {
          const matches = rule.keywords.some(k => text.includes(k.toLowerCase()))
          if (matches) matchedCategories.push(rule.categoryId)
        }

        if (matchedCategories.length === 0) matchedCategories.push(5)

        for (const categoryId of matchedCategories) {
          await pool.execute(
            'INSERT IGNORE INTO exercise_categories (exercise_id, category_id) VALUES (?, ?)',
            [exercise.id, categoryId]
          )
        }

        assigned++
      }

      res.json({ message: `${assigned} ejercicios reasignados automáticamente` })

    } catch (error) {
      console.error('Error autoAssignCategories:', error.message)
      res.status(500).json({ message: 'Error al reasignar: ' + error.message })
    }
  }

}

module.exports = LibraryController