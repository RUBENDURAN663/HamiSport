const express        = require('express')
const router         = express.Router()
const AIController   = require('../controllers/ai.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const validate       = require('../middlewares/validate.middleware')
const { chatRules }  = require('../middlewares/rules.middleware')

router.post('/chat', authMiddleware, chatRules, validate, AIController.chat)

module.exports = router