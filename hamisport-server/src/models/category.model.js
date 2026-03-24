const pool = require('../config/db')

const CategoryModel = {

  getAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY name ASC'
    )
    return rows
  },

  getBySlug: async (slug) => {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ?',
      [slug]
    )
    return rows[0] || null
  },

  create: async (name, slug, icon, color, description) => {
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, icon, color, description) VALUES (?, ?, ?, ?, ?)',
      [name, slug, icon, color, description]
    )
    return result.insertId
  },

  update: async (id, name, icon, color, description) => {
    await pool.execute(
      'UPDATE categories SET name=?, icon=?, color=?, description=? WHERE id=?',
      [name, icon, color, description, id]
    )
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id])
  }

}

module.exports = CategoryModel