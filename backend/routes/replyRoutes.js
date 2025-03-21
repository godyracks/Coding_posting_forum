const express = require('express');
const { replyToMessage, getReplyById } = require('../controllers/replyController'); // ✅ Correct path
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Reply to a message OR another reply (nested replies)
router.post('/', authMiddleware, upload.single('image'), replyToMessage);

// Get a reply by ID
router.get('/:reply_id', authMiddleware, getReplyById);

module.exports = router;
