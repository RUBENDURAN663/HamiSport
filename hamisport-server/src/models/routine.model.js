const pool = require('../config/db')

const RoutineModel = {

  // Obtener todas las rutinas del usuario con sus ejercicios
  getByUser: async (userId) => {
    const [routines] = await pool.execute(
      `SELECT id, user_id, day, name, created_at, updated_at
       FROM routines WHERE user_id = ? ORDER BY FIELD(day,
       'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo')`,
      [userId]
    )

    if (routines.length === 0) return []

    for (const routine of routines) {
      const [exercises] = await pool.execute(
        `SELECT e.id, e.name, e.muscles, e.difficulty, e.image_url,
                re.order_index
         FROM routine_exercises re
         JOIN exercises e ON re.exercise_id = e.id
         WHERE re.routine_id = ?
         ORDER BY re.order_index ASC`,
        [routine.id]
      )
      routine.exercises = exercises
    }

    return routines
  },

  // Obtener una rutina por día
  getByDay: async (userId, day) => {
    const [rows] = await pool.execute(
      `SELECT id, user_id, day, name FROM routines
       WHERE user_id = ? AND day = ?`,
      [userId, day]
    )
    if (!rows[0]) return null

    const [exercises] = await pool.execute(
      `SELECT e.id, e.name, e.muscles, e.difficulty, e.image_url,
              re.order_index
       FROM routine_exercises re
       JOIN exercises e ON re.exercise_id = e.id
       WHERE re.routine_id = ?
       ORDER BY re.order_index ASC`,
      [rows[0].id]
    )
    rows[0].exercises = exercises
    return rows[0]
  },

  // Crear rutina
  create: async (userId, day, name) => {
    const [result] = await pool.execute(
      'INSERT INTO routines (user_id, day, name) VALUES (?, ?, ?)',
      [userId, day, name]
    )
    return result.insertId
  },

  // Actualizar nombre de rutina
  updateName: async (id, userId, name) => {
    await pool.execute(
      'UPDATE routines SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, userId]
    )
  },

  // Eliminar rutina
  delete: async (id, userId) => {
    await pool.execute(
      'DELETE FROM routines WHERE id = ? AND user_id = ?',
      [id, userId]
    )
  },

  // Contar rutinas del usuario
  countByUser: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as total FROM routines WHERE user_id = ?',
      [userId]
    )
    return rows[0].total
  },

  // Contar ejercicios de una rutina — para calcular order_index
  countExercises: async (routineId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as total FROM routine_exercises WHERE routine_id = ?',
      [routineId]
    )
    return rows[0].total
  },

  // Agregar ejercicio a rutina
  addExercise: async (routineId, exerciseId, orderIndex) => {
    await pool.execute(
      `INSERT IGNORE INTO routine_exercises (routine_id, exercise_id, order_index)
       VALUES (?, ?, ?)`,
      [routineId, exerciseId, orderIndex]
    )
  },

  // Quitar ejercicio de rutina
  removeExercise: async (routineId, exerciseId) => {
    await pool.execute(
      'DELETE FROM routine_exercises WHERE routine_id = ? AND exercise_id = ?',
      [routineId, exerciseId]
    )
  },

  // Obtener IDs de ejercicios en todas las rutinas del usuario
  getExerciseIdsByUser: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT DISTINCT re.exercise_id, r.day, r.id as routine_id
       FROM routine_exercises re
       JOIN routines r ON re.routine_id = r.id
       WHERE r.user_id = ?`,
      [userId]
    )
    return rows
  },

  // Verificar que la rutina pertenece al usuario
  belongsToUser: async (routineId, userId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM routines WHERE id = ? AND user_id = ?',
      [routineId, userId]
    )
    return rows.length > 0
  }

}

module.exports = RoutineModel