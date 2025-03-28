const User = require('../models/User');
const Message = require('../models/Message'); // Import Message for getUserStats

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

// New method: Update user profile
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

// Note: Fixed syntax issue from your original
exports.getUserStats = async (req, res) => {
    try {
        const users = await User.findAll();
        const messages = await Message.findAll(); // Requires Message.findAll() from Message model
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