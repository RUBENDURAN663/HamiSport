const express     = require('express')
const router      = express.Router()
const DashboardController = require('../controllers/dashboard.controller')
const authMiddleware      = require('../middlewares/auth.middleware')

router.get('/stats',       authMiddleware, DashboardController.getStats)
router.post('/activity',   authMiddleware, DashboardController.logActivity)
router.put('/password',    authMiddleware, DashboardController.changePassword)

module.exports = router