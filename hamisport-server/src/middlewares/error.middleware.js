const errorMiddleware = (err, req, res, next) => {
  console.error('Error no manejado:', err.stack)
  res.status(500).json({
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message })
  })
}

module.exports = errorMiddleware