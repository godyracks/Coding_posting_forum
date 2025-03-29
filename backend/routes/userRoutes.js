const express = require('express');
const { registerUser, loginUser, getAllUsers, deleteUser, blockUser, getUserStats, getUserById } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', authMiddleware, roleMiddleware, getAllUsers);
router.delete('/admin/:id', authMiddleware, roleMiddleware, deleteUser);
router.put('/admin/block-user/:id', authMiddleware, roleMiddleware, blockUser);
router.get('/stats', authMiddleware, getUserStats);
router.get('/:id', authMiddleware, getUserById); // Add this route

module.exports = router;