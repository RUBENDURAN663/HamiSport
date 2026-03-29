const express        = require('express')
const router         = express.Router()
const AuthController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const validate       = require('../middlewares/validate.middleware')
const {
  registerRules,
  loginRules
}                    = require('../middlewares/rules.middleware')

router.post('/register', registerRules, validate, AuthController.register)
router.post('/login',    loginRules,    validate, AuthController.login)
router.get('/me',        authMiddleware,           AuthController.getMe)

module.exports = router