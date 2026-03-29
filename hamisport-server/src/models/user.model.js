const pool = require('../config/db')

const UserModel = {

  createTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        avatar_url  VARCHAR(500) NULL,
        password    VARCHAR(255) NOT NULL,
        role        ENUM('user','admin') DEFAULT 'user',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await pool.execute(sql)
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    return rows[0] || null
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar_url, role, created_at FROM users WHERE id = ?',
      [id]
    )
    return rows[0] || null
  },

  create: async (name, email, hashedPassword) => {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )
    return result.insertId
  },

  updatePassword: async (id, hashedPassword) => {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    )
  },

  updateProfile: async (id, name, email, avatarUrl) => {
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?',
      [name, email, avatarUrl, id]
    )
  },

  findByEmailExcludingId: async (email, id) => {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    )
    return rows[0] || null
  }

}

module.exports = UserModel