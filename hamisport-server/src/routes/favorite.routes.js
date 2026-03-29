const express            = require('express')
const router             = express.Router()
const FavoriteController = require('../controllers/favorite.controller')
const authMiddleware     = require('../middlewares/auth.middleware')

router.get('/',              authMiddleware, FavoriteController.getAll)
router.get('/ids',           authMiddleware, FavoriteController.getIds)
router.post('/toggle/:exerciseId', authMiddleware, FavoriteController.toggle)

module.exports = router