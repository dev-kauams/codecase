const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', viewController.renderHome);
router.get('/exercise/:id', viewController.renderExercise);
router.get('/admin/login', viewController.renderLogin);

router.get('/admin/dashboard', authMiddleware, viewController.renderAdminDashboard);
router.get('/admin/exercise/new', authMiddleware, viewController.renderAdminExerciseForm);
router.get('/admin/exercise/edit/:id', authMiddleware, viewController.renderAdminExerciseForm);

module.exports = router;
