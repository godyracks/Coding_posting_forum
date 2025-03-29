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
            return await db.insert(channelDoc);
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

    static async delete(id) {
        try {
            const channel = await db.get(id);
            if (!channel) return null;
            await db.destroy(id, channel._rev);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting channel ${id}:`, error.message);
            throw new Error("Database error: Unable to delete channel");
        }
    }

    // Updated: Avoid $regex, filter in memory instead
    static async searchByName(query) {
        try {
            const channels = await db.find({ selector: { type: "channel" } });
            if (!query) return channels.docs; // Return all if no query
            return channels.docs.filter(channel =>
                channel.name.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error("❌ Error searching channels:", error.message);
            return [];
        }
    }
}

module.exports = Channel;