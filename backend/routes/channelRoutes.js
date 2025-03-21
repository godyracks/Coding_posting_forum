const express = require('express');
const { createChannel, getAllChannels } = require('../controllers/channelController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new channel
router.post('/', authMiddleware, createChannel);

// Get all channels
router.get('/', authMiddleware, getAllChannels);

module.exports = router;
