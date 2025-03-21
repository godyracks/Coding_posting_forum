const db = require('../config/db');

class Channel {
    static async create({ name, created_by }) {
        try {
            const channelDoc = {
                _id: `channel:${Date.now()}`,
                type: "channel",
                name,
                created_by,
                created_at: new Date().toISOString()
            };
            return await db.insert(channelDoc); // ✅ Use db.insert() instead of db.channels.insert()
        } catch (error) {
            console.error("❌ Error creating channel:", error.message);
            throw new Error("Database error: Unable to create channel");
        }
    }

    static async findAll() {
        try {
            const channels = await db.find({ selector: { type: "channel" } });
            return channels.docs.length ? channels.docs : [];
        } catch (error) {
            console.error("❌ Error retrieving channels:", error.message);
            return [];
        }
    }
}

module.exports = Channel;
