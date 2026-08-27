const express = require('express');
const router = express.Router();
const ViewController = require('../controllers/viewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', ViewController.renderHome);
router.get('/exercise/:id', ViewController.renderExercise);
router.get('/admin/login', ViewController.renderLogin);

router.get('/admin/dashboard', authMiddleware, ViewController.renderAdminDashboard);
router.get('/admin/exercise/new', authMiddleware, ViewController.renderAdminExerciseForm);
router.get('/admin/exercise/edit/:id', authMiddleware, ViewController.renderAdminExerciseForm);

module.exports = router;
