const express = require('express');
const {
    postMessage,
    getMessageById,
    getAllMessages,
    likeMessage,
    dislikeMessage
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Fetch all messages
router.get('/', authMiddleware, getAllMessages);

// Post a message with an optional image
router.post('/', authMiddleware, postMessage); // Multer is applied in the controller

// Retrieve a message
router.get('/:message_id', authMiddleware, getMessageById);

// Like a message
router.post('/:id/like', authMiddleware, likeMessage);

// Dislike a message
router.post('/:id/dislike', authMiddleware, dislikeMessage);

module.exports = router;