const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
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
