const express = require('express');
const {
    postMessage,
    getMessageById,
    getAllMessages,
    likeMessage,
    dislikeMessage,
    deleteMessage
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Fetch all messages
router.get('/', authMiddleware, getAllMessages);

// Post a message with an optional image
router.post('/', authMiddleware, postMessage);

// Retrieve a message
router.get('/:message_id', authMiddleware, getMessageById);

// Like a message
router.post('/:id/like', authMiddleware, likeMessage);

// Dislike a message
router.post('/:id/dislike', authMiddleware, dislikeMessage);

// Delete a message (admin only)
router.delete('/admin/:id', authMiddleware, roleMiddleware, deleteMessage);

module.exports = router;