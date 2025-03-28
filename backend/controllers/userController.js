const User = require('../models/User');
const Message = require('../models/Message'); // Import Message for getUserStats
const db = require('../config/db'); // Import db for direct CouchDB operations

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }
        res.json(user);
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

exports.blockUser = async (req, res) => {
    const { id } = req.params;
    const { is_blocked } = req.body;
    try {
        await User.updateBlockStatus(id, is_blocked);
        res.json({ message: `User ${id} has been ${is_blocked ? 'blocked' : 'unblocked'}` });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user status' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    try {
        const updatedUser = await User.update(id, { name, status });
        if (!updatedUser) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error(`Error updating user with ID ${id}:`, error);
        res.status(500).json({ error: 'Error updating user profile' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const users = await User.findAll();
        const messages = await Message.findAll();
        const stats = users.map((user) => {
            const userMessages = messages.filter((m) => m.user_id === user._id && m.type === "message");
            const userReplies = messages.filter((m) => m.user_id === user._id && m.type === "reply");
            return {
                _id: user._id,
                name: user.name,
                postCount: userMessages.length,
                replyCount: userReplies.length,
            };
        });
        res.json(stats);
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ error: "Error fetching user stats" });
    }
};

// Add deleteUser method
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: `User with ID ${id} not found` });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin user' });
        }
        await db.destroy(id, user._rev); // Use db directly to delete
        res.json({ message: `User ${id} deleted successfully` });
    } catch (error) {
        console.error(`Error deleting user with ID ${id}:`, error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};