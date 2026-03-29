const express           = require('express')
const router            = express.Router()
const RoutineController = require('../controllers/routine.controller')
const authMiddleware    = require('../middlewares/auth.middleware')

router.get('/',                               authMiddleware, RoutineController.getAll)
router.get('/exercise-ids',                   authMiddleware, RoutineController.getExerciseIds)
router.post('/',                              authMiddleware, RoutineController.create)
router.put('/:id',                            authMiddleware, RoutineController.updateName)
router.delete('/:id',                         authMiddleware, RoutineController.delete)
router.post('/:id/exercises',                 authMiddleware, RoutineController.addExercise)
router.delete('/:id/exercises/:exerciseId',   authMiddleware, RoutineController.removeExercise)

module.exports = router