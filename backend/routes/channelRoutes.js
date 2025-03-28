const express = require('express');
const { createChannel, getAllChannels, searchChannels, deleteChannel } = require('../controllers/channelController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Create a new channel (authenticated users)
router.post('/', authMiddleware, createChannel);

// Get all channels (authenticated users)
router.get('/', authMiddleware, getAllChannels);

// Search channels (authenticated users)
router.get('/search', authMiddleware, searchChannels);

// Delete a channel (admin only)
router.delete('/admin/:id', authMiddleware, roleMiddleware, deleteChannel);

module.exports = router;