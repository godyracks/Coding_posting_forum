const express = require('express');
const { blockUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin only: Block/Unblock users
router.put('/admin/block-user/:id', authMiddleware, roleMiddleware, blockUser);

// Admin only: Delete user
router.delete('/admin/:id', authMiddleware, roleMiddleware, deleteUser);

// Get all users
router.get('/', authMiddleware, getAllUsers);

// Get a single user by ID
router.get('/:id', authMiddleware, getUserById);

// Update user profile
router.put('/:id', authMiddleware, updateUser);

module.exports = router;