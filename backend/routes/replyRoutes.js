const express = require('express');
const { replyToMessage, getReplyById, likeReply, dislikeReply } = require('../controllers/replyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Reply to a message OR another reply
router.post('/', authMiddleware, replyToMessage);

// Get a reply by ID
router.get('/:reply_id', authMiddleware, getReplyById);

// Like a reply
router.post('/:id/like', authMiddleware, likeReply);

// Dislike a reply
router.post('/:id/dislike', authMiddleware, dislikeReply);

module.exports = router;