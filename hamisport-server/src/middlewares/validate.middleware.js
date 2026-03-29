const { validationResult } = require('express-validator')

// Middleware que lee los resultados de express-validator
// y responde con error si hay alguno
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]
    return res.status(400).json({ message: firstError.msg })
  }
  next()
}

module.exports = validate