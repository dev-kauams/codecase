const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const tagController = require('../controllers/tagController');
const stackController = require('../controllers/stackController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public endpoints
router.get('/exercises', exerciseController.getAll);
router.get('/exercises/:id', exerciseController.getById);
router.get('/tags', tagController.getAll);
router.get('/stacks', stackController.getAll);

router.post('/submissions', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]), exerciseController.submit);

router.get('/admin/stats', authMiddleware, exerciseController.getStats);
router.get('/admin/submissions', authMiddleware, exerciseController.getPendingSubmissions);
router.post('/admin/submissions/:id/approve', authMiddleware, exerciseController.approveSubmission);
router.post('/admin/submissions/:id/reject', authMiddleware, exerciseController.rejectSubmission);

router.post('/exercises', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]), exerciseController.create);

router.put('/exercises/:id', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]), exerciseController.update);

router.delete('/exercises/:id', authMiddleware, exerciseController.delete);
router.delete('/exercises/attachments/:attachmentId', authMiddleware, exerciseController.deleteAttachment);

router.post('/tags', authMiddleware, tagController.create);
router.post('/stacks', authMiddleware, stackController.create);
router.delete('/tags/:id', authMiddleware, tagController.delete);
router.delete('/stacks/:id', authMiddleware, stackController.delete);

module.exports = router;
