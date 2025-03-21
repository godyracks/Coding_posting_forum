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
