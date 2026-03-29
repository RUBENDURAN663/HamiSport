const express             = require('express')
const router              = express.Router()
const DashboardController = require('../controllers/dashboard.controller')
const authMiddleware      = require('../middlewares/auth.middleware')
const validate            = require('../middlewares/validate.middleware')
const {
  updateProfileRules,
  changePasswordRules
}                         = require('../middlewares/rules.middleware')

router.get('/stats',    authMiddleware,                                DashboardController.getStats)
router.post('/activity', authMiddleware,                               DashboardController.logActivity)
router.put('/profile',  authMiddleware, updateProfileRules,  validate, DashboardController.updateProfile)
router.put('/password', authMiddleware, changePasswordRules, validate, DashboardController.changePassword)

module.exports = router