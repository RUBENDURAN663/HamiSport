const pool = require('../config/db')

const adminMiddleware = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    )

    if (!rows[0] || rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado — se requiere rol admin' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ message: 'Error al verificar permisos' })
  }
}

module.exports = adminMiddleware