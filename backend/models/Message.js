const db = require('../config/db');

class Message {
    static async create({ channel_id, user_id, content }) {
        const messageDoc = {
            _id: `message:${Date.now()}`,
            type: "message",
            channel_id,
            user_id,
            content,
            created_at: new Date().toISOString(),
            likes: { up: 0, down: 0 }
        };
        return await db.messages.insert(messageDoc);
    }

    static async findByChannel(channel_id) {
        try {
            const messages = await db.messages.find({ selector: { type: "message", channel_id } });
            return messages.docs;
        } catch (error) {
            console.error('Error retrieving messages:', error);
            return [];
        }
    }

    static async replyToMessage({ message_id, user_id, content, parent_id }) {
        try {
          const replyDoc = {
            _id: `reply:${Date.now()}`,
            type: "reply",
            message_id,
            parent_id, // ✅ Ensure parent_id is included
            user_id,
            content,
            created_at: new Date().toISOString(),
            likes: { up: 0, down: 0 } // ✅ Ensure likes are included in the database
          };
          return await db.messages.insert(replyDoc);
        } catch (error) {
          console.error('Error adding reply:', error);
          return null;
        }
      }
    
    
    
}

module.exports = Message;
