const { body } = require('express-validator')

// ── AUTH ──────────────────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .isEmail()
    .withMessage('El correo no tiene un formato válido')
    .isLength({ max: 150 })
    .withMessage('El correo es demasiado largo')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contraseña debe tener entre 6 y 100 caracteres')
]

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .isEmail()
    .withMessage('El correo no tiene un formato válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
]

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

const updateProfileRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .isEmail()
    .withMessage('El correo no tiene un formato válido')
    .isLength({ max: 150 })
    .withMessage('El correo es demasiado largo')
    .normalizeEmail(),

  body('avatarUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('La URL de la imagen no es válida')
    .isLength({ max: 500 })
    .withMessage('La URL de la imagen es demasiado larga')
]

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6, max: 100 })
    .withMessage('La nueva contraseña debe tener entre 6 y 100 caracteres')
]

// ── AI ────────────────────────────────────────────────────────────────────────

const chatRules = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('El mensaje no puede estar vacío')
    .isLength({ min: 1, max: 500 })
    .withMessage('El mensaje no puede superar los 500 caracteres'),

  body('history')
    .optional()
    .isArray()
    .withMessage('El historial debe ser un array')
    .custom((history) => {
      if (!Array.isArray(history)) return true
      if (history.length > 20) {
        throw new Error('El historial no puede tener más de 20 mensajes')
      }
      const validRoles = ['user', 'assistant']
      for (const msg of history) {
        if (!msg.role || !validRoles.includes(msg.role)) {
          throw new Error('El historial contiene roles inválidos')
        }
        if (!msg.content || typeof msg.content !== 'string') {
          throw new Error('El historial contiene mensajes inválidos')
        }
        if (msg.content.length > 500) {
          throw new Error('Un mensaje del historial es demasiado largo')
        }
      }
      return true
    })
]

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  chatRules
}