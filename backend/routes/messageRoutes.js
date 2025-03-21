const express = require('express');
const { postMessage, getMessageById, getAllMessages } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Route to fetch all messages
router.get('/', authMiddleware, getAllMessages);

// Route to post a message with an optional image
router.post('/', authMiddleware, upload.single('image'), postMessage);

// Route to retrieve a message with attachments
router.get('/:message_id', authMiddleware, getMessageById);

module.exports = router;
