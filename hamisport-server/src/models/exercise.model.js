const pool = require('../config/db')

const ExerciseModel = {

  // Obtener todos con sus categorías
  getAll: async () => {
    const [rows] = await pool.execute(`
      SELECT e.*,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS categories,
        GROUP_CONCAT(c.id   SEPARATOR ',')  AS category_ids
      FROM exercises e
      LEFT JOIN exercise_categories ec ON e.id = ec.exercise_id
      LEFT JOIN categories c           ON ec.category_id = c.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `)
    return rows
  },

  // Obtener por categoría slug
  getByCategory: async (slug) => {
    const [rows] = await pool.execute(`
      SELECT e.*,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS categories
      FROM exercises e
      INNER JOIN exercise_categories ec ON e.id = ec.exercise_id
      INNER JOIN categories c           ON ec.category_id = c.id
      WHERE c.slug = ?
      GROUP BY e.id
      ORDER BY e.name ASC
    `, [slug])
    return rows
  },

  // Obtener por ID
  getById: async (id) => {
    const [rows] = await pool.execute(`
      SELECT e.*,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS categories,
        GROUP_CONCAT(c.id   SEPARATOR ',')  AS category_ids
      FROM exercises e
      LEFT JOIN exercise_categories ec ON e.id = ec.exercise_id
      LEFT JOIN categories c           ON ec.category_id = c.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id])
    return rows[0] || null
  },

  // Crear ejercicio
  create: async (data, userId) => {
    const { name, description, muscles, difficulty, image_url, video_url, wger_id } = data
    const [result] = await pool.execute(
      `INSERT INTO exercises
        (name, description, muscles, difficulty, image_url, video_url, wger_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, muscles, difficulty, image_url || null, video_url || null, wger_id || null, userId]
    )
    return result.insertId
  },

  // Asignar categorías a ejercicio
  assignCategories: async (exerciseId, categoryIds) => {
    // Eliminar las anteriores
    await pool.execute(
      'DELETE FROM exercise_categories WHERE exercise_id = ?',
      [exerciseId]
    )
    // Insertar las nuevas
    for (const categoryId of categoryIds) {
      await pool.execute(
        'INSERT INTO exercise_categories (exercise_id, category_id) VALUES (?, ?)',
        [exerciseId, categoryId]
      )
    }
  },

  // Actualizar ejercicio
  update: async (id, data) => {
    const { name, description, muscles, difficulty, image_url, video_url } = data
    await pool.execute(
      `UPDATE exercises
       SET name=?, description=?, muscles=?, difficulty=?, image_url=?, video_url=?
       WHERE id=?`,
      [name, description, muscles, difficulty, image_url || null, video_url || null, id]
    )
  },

  // Eliminar ejercicio
  delete: async (id) => {
    await pool.execute('DELETE FROM exercises WHERE id = ?', [id])
  },

  // Buscar ejercicios
  search: async (query) => {
    const [rows] = await pool.execute(`
      SELECT e.*,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS categories
      FROM exercises e
      LEFT JOIN exercise_categories ec ON e.id = ec.exercise_id
      LEFT JOIN categories c           ON ec.category_id = c.id
      WHERE e.name LIKE ? OR e.muscles LIKE ? OR e.description LIKE ?
      GROUP BY e.id
      ORDER BY e.name ASC
    `, [`%${query}%`, `%${query}%`, `%${query}%`])
    return rows
  }

}

module.exports = ExerciseModel