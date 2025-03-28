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

    static async searchByName(query) {
        try {
            const channels = await db.find({
                selector: {
                    type: "channel",
                    name: { $regex: new RegExp(query, 'i') } // Case-insensitive search
                }
            });
            return channels.docs.length ? channels.docs : [];
        } catch (error) {
            console.error("❌ Error searching channels:", error.message);
            return [];
        }
    }

    // Ensure this delete method is present
    static async delete(id) {
        try {
            const channel = await db.get(id);
            if (!channel) {
                return null; // Channel not found
            }
            await db.destroy(id, channel._rev);
            return true; // Successfully deleted
        } catch (error) {
            console.error(`❌ Error deleting channel ${id}:`, error.message);
            throw new Error("Database error: Unable to delete channel");
        }
    }
}

module.exports = Channel;