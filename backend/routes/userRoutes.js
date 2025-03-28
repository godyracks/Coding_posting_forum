const express = require('express');
const { blockUser, getAllUsers, getUserById, updateUser } = require('../controllers/userController'); // Add getUserById
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin only: Block/Unblock users
router.put('/admin/block-user/:id', authMiddleware, roleMiddleware, blockUser);

// Get all users
router.get('/', authMiddleware, getAllUsers);

// Get a single user by ID
router.get('/:id', authMiddleware, getUserById); // New route

router.put('/:id', authMiddleware, updateUser);      // New route for updating profile


module.exports = router;