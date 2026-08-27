const express = require('express');
const router = express.Router();
const ExerciseController = require('../controllers/exerciseController');
const TagController = require('../controllers/tagController');
const StackController = require('../controllers/stackController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public endpoints
router.get('/exercises', ExerciseController.getAll);
router.get('/exercises/:id', ExerciseController.getById);
router.get('/tags', TagController.getAll);
router.get('/stacks', StackController.getAll);

router.get('/admin/stats', authMiddleware, ExerciseController.getStats);

router.post('/exercises', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]), ExerciseController.create);

router.put('/exercises/:id', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]), ExerciseController.update);

router.delete('/exercises/:id', authMiddleware, ExerciseController.delete);
router.delete('/exercises/attachments/:attachmentId', authMiddleware, ExerciseController.deleteAttachment);

router.post('/tags', authMiddleware, TagController.create);
router.post('/stacks', authMiddleware, StackController.create);

module.exports = router;
