const Channel = require('../models/Channel');

exports.createChannel = async (req, res) => {
    try {
        const { name } = req.body;
        const created_by = req.user.id;

        const channel = await Channel.create({ name, created_by });
        res.status(201).json(channel);
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ error: 'Error creating channel' });
    }
};

exports.getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.findAll();
        res.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ error: 'Error fetching channels' });
    }
};

exports.searchChannels = async (req, res) => {
    try {
        const { query } = req.query;
        const channels = await Channel.searchByName(query);
        res.json(channels);
    } catch (error) {
        console.error('Error searching channels:', error);
        res.status(500).json({ error: "Error searching channels" });
    }
};

// New method: Delete a channel (admin only)
exports.deleteChannel = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Channel.delete(id);
        if (!result) {
            return res.status(404).json({ error: `Channel with ID ${id} not found` });
        }
        res.json({ message: `Channel ${id} deleted successfully` });
    } catch (error) {
        console.error(`Error deleting channel with ID ${id}:`, error);
        res.status(500).json({ error: 'Error deleting channel' });
    }
};