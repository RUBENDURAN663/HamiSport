const pool = require('../config/db')

const UserModel = {

  // Crear tabla si no existe
  createTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await pool.execute(sql)
  },

  // Buscar usuario por email
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    return rows[0] || null
  },

  // Buscar usuario por ID
  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    )
    return rows[0] || null
  },

  // Crear nuevo usuario
  create: async (name, email, hashedPassword) => {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )
    return result.insertId
  },

  // Actualizar contraseña
  updatePassword: async (id, hashedPassword) => {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    )
  }

}

module.exports = UserModel