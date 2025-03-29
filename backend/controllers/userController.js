const User = require('../models/User');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password_hash: hashedPassword,
            role: 'user',
            status: 'beginner' // Default status
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user || user.is_blocked === 1) { // Check is_blocked instead of status
            return res.status(401).json({ error: 'Invalid credentials or user blocked' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash); // Fix: password_hash, not password
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await User.delete(id); // Note: You don’t have a delete method; adjust if needed
        if (!result) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }
        res.json({ message: `User ${id} deleted successfully` });
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

exports.blockUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await User.updateBlockStatus(id, 1); // Set is_blocked to 1
        if (!result) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }
        res.json({ message: `User ${id} blocked successfully` });
    } catch (error) {
        console.error(`Error blocking user ${id}:`, error);
        res.status(500).json({ error: 'Error blocking user' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const users = await User.findAll();
        const messages = await db.find({ selector: { $or: [{ type: "message" }, { type: "reply" }] } });
        
        const stats = users.map((user) => {
            const userMessages = messages.docs.filter((m) => m.user_id === user._id && m.type === "message");
            const userReplies = messages.docs.filter((m) => m.user_id === user._id && m.type === "reply");
            const totalLikes = userMessages.reduce((sum, m) => sum + (m.likes?.up || 0), 0) +
                              userReplies.reduce((sum, m) => sum + (m.likes?.up || 0), 0);
            return {
                _id: user._id,
                name: user.name,
                postCount: userMessages.length,
                replyCount: userReplies.length,
                totalLikes
            };
        });
        res.json(stats);
    } catch (error) {
        console.error("Error fetching user stats:", error.message);
        res.status(500).json({ error: "Error fetching user stats" });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }
        const { password_hash, ...userData } = user; // Fix: password_hash, not password
        res.json(userData);
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error.message);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    try {
        // Ensure the user can only update their own profile
        if (req.user.id !== id) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }

        // Update only allowed fields
        const updatedUser = await User.update(id, { name, status });
        if (!updatedUser) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }

        // Remove sensitive data before sending response
        const { password_hash, ...userData } = updatedUser;
        res.json({ message: 'Profile updated successfully', user: userData });
    } catch (error) {
        console.error(`Error updating profile for user ${id}:`, error.message);
        res.status(500).json({ error: 'Error updating profile' });
    }
};

module.exports = exports;