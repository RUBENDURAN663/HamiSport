const pool = require('../config/db')

const ActivityModel = {

  // Registrar actividad
  log: async (userId, type, referenceId = null) => {
    await pool.execute(
      'INSERT INTO user_activity (user_id, type, reference_id) VALUES (?, ?, ?)',
      [userId, type, referenceId]
    )
  },

  // Obtener historial de ejercicios vistos
  getExerciseHistory: async (userId) => {
    const [rows] = await pool.execute(`
      SELECT e.id, e.name, e.muscles, e.difficulty, e.image_url,
             ua.created_at as viewed_at
      FROM user_activity ua
      INNER JOIN exercises e ON ua.reference_id = e.id
      WHERE ua.user_id = ? AND ua.type = 'exercise_view'
      ORDER BY ua.created_at DESC
      LIMIT 20
    `, [userId])
    return rows
  },

  // Obtener estadísticas del usuario
  getStats: async (userId) => {
    const [exercises] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_activity WHERE user_id = ? AND type = "exercise_view"',
      [userId]
    )
    const [queries] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_activity WHERE user_id = ? AND type = "ai_query"',
      [userId]
    )
    const [library] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_activity WHERE user_id = ? AND type = "library_visit"',
      [userId]
    )
    const [nutrition] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_activity WHERE user_id = ? AND type = "nutrition_visit"',
      [userId]
    )
    const [joinDate] = await pool.execute(
      'SELECT created_at FROM users WHERE id = ?',
      [userId]
    )

    return {
      exercisesViewed: exercises[0].total,
      aiQueries:       queries[0].total,
      libraryVisits:   library[0].total,
      nutritionVisits: nutrition[0].total,
      joinDate:        joinDate[0]?.created_at
    }
  }

}

module.exports = ActivityModel