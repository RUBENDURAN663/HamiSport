const express        = require('express')
const router         = express.Router()
const LibraryController = require('../controllers/library.controller')
const authMiddleware  = require('../middlewares/auth.middleware')
const adminMiddleware = require('../middlewares/admin.middleware')

// ── Rutas públicas (requieren login) ──
router.get('/categories',     authMiddleware, LibraryController.getCategories)
router.get('/exercises',      authMiddleware, LibraryController.getExercises)
router.get('/exercises/:id',  authMiddleware, LibraryController.getExerciseById)

// ── Rutas solo admin ──
router.post('/categories',         authMiddleware, adminMiddleware, LibraryController.createCategory)
router.put('/categories/:id',      authMiddleware, adminMiddleware, LibraryController.updateCategory)
router.delete('/categories/:id',   authMiddleware, adminMiddleware, LibraryController.deleteCategory)

router.post('/exercises',          authMiddleware, adminMiddleware, LibraryController.createExercise)
router.put('/exercises/:id',       authMiddleware, adminMiddleware, LibraryController.updateExercise)
router.delete('/exercises/:id',    authMiddleware, adminMiddleware, LibraryController.deleteExercise)

router.post('/exercises/import-wger', authMiddleware, adminMiddleware, LibraryController.importFromWger)

router.post('/exercises/auto-assign', authMiddleware, adminMiddleware, LibraryController.autoAssignCategories)

module.exports = router