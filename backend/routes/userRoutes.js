const express = require('express');
const { blockUser, getAllUsers } = require('../controllers/userController'); // Make sure both functions exist
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin only: Block/Unblock users
router.put('/admin/block-user/:id', authMiddleware, roleMiddleware, blockUser);

// Get all users
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
