const pool = require('../config/db')

const FavoriteModel = {

  // Agregar favorito
  add: async (userId, exerciseId) => {
    await pool.execute(
      'INSERT IGNORE INTO user_favorites (user_id, exercise_id) VALUES (?, ?)',
      [userId, exerciseId]
    )
  },

  // Quitar favorito
  remove: async (userId, exerciseId) => {
    await pool.execute(
      'DELETE FROM user_favorites WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    )
  },

  // Verificar si un ejercicio es favorito
  isFavorite: async (userId, exerciseId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM user_favorites WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    )
    return rows.length > 0
  },

  // Obtener todos los favoritos del usuario con detalle del ejercicio
  getByUser: async (userId) => {
    const [rows] = await pool.execute(`
      SELECT
        e.id, e.name, e.description, e.muscles,
        e.difficulty, e.image_url, e.video_url,
        uf.created_at AS saved_at,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories
      FROM user_favorites uf
      JOIN exercises e ON uf.exercise_id = e.id
      LEFT JOIN exercise_categories ec ON e.id = ec.exercise_id
      LEFT JOIN categories c ON ec.category_id = c.id
      WHERE uf.user_id = ?
      GROUP BY e.id, e.name, e.description, e.muscles,
               e.difficulty, e.image_url, e.video_url, uf.created_at
      ORDER BY uf.created_at DESC
    `, [userId])
    return rows
  },

  // Obtener solo los IDs de favoritos del usuario — para marcar cards
  getIdsByUser: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT exercise_id FROM user_favorites WHERE user_id = ?',
      [userId]
    )
    return rows.map(r => r.exercise_id)
  }

}

module.exports = FavoriteModel