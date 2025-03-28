const db = require('../config/db');

class Message {
    static async create({ channel_id, user_id, content, image }) {
        const messageDoc = {
            _id: `message:${Date.now()}`,
            type: "message",
            channel_id,
            user_id,
            content,
            image: image || null,
            created_at: new Date().toISOString(),
            likes: { 
                up: 0, 
                down: 0,
                users_liked: [],
                users_disliked: []
            }
        };
        return await db.insert(messageDoc);
    }

    static async findByChannel(channel_id) {
        try {
            const messages = await db.find({ 
                selector: { 
                    type: "message", 
                    channel_id 
                } 
            });
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
                parent_id,
                user_id,
                content,
                created_at: new Date().toISOString(),
                likes: { 
                    up: 0, 
                    down: 0,
                    users_liked: [],
                    users_disliked: []
                }
            };
            return await db.insert(replyDoc);
        } catch (error) {
            console.error('Error adding reply:', error);
            return null;
        }
    }

    static async likeMessage({ message_id, user_id }) {
        try {
            const message = await db.get(message_id);

            if (message.likes.users_liked.includes(user_id)) {
                return message.likes;
            }

            const dislikedIndex = message.likes.users_disliked.indexOf(user_id);
            if (dislikedIndex > -1) {
                message.likes.users_disliked.splice(dislikedIndex, 1);
                message.likes.down = Math.max(0, message.likes.down - 1);
            }

            message.likes.up += 1;
            message.likes.users_liked.push(user_id);

            await db.insert(message);
            return message.likes;
        } catch (error) {
            console.error('Error liking message:', error);
            throw error;
        }
    }

    static async dislikeMessage({ message_id, user_id }) {
        try {
            const message = await db.get(message_id);

            if (message.likes.users_disliked.includes(user_id)) {
                return message.likes;
            }

            const likedIndex = message.likes.users_liked.indexOf(user_id);
            if (likedIndex > -1) {
                message.likes.users_liked.splice(likedIndex, 1);
                message.likes.up = Math.max(0, message.likes.up - 1);
            }

            message.likes.down += 1;
            message.likes.users_disliked.push(user_id);

            await db.insert(message);
            return message.likes;
        } catch (error) {
            console.error('Error disliking message:', error);
            throw error;
        }
    }

    static async getMessageById(message_id) {
        try {
            const message = await db.get(message_id);
            
            const replies = await db.find({
                selector: { 
                    type: "reply", 
                    message_id: message_id 
                }
            });

            const organizeReplies = (parentId) => 
                replies.docs
                    .filter(reply => reply.parent_id === parentId)
                    .map(reply => ({
                        ...reply,
                        replies: organizeReplies(reply._id)
                    }));

            return {
                ...message,
                replies: organizeReplies(message._id),
                image: message.image ? `/uploads/${message.image}` : null
            };
        } catch (error) {
            console.error('Error retrieving message:', error);
            throw error;
        }
    }

    static async getAllMessagesInChannel(channel_id) {
        try {
            const messages = await db.find({ 
                selector: { 
                    type: "message", 
                    channel_id 
                } 
            });

            const replies = await db.find({ 
                selector: { 
                    type: "reply" 
                } 
            });

            const organizeReplies = (parentId) => 
                replies.docs
                    .filter(reply => reply.parent_id === parentId)
                    .map(reply => ({
                        ...reply,
                        replies: organizeReplies(reply._id)
                    }));

            return messages.docs.map(message => ({
                ...message,
                replies: organizeReplies(message._id),
                image: message.image ? `/uploads/${message.image}` : null
            }));
        } catch (error) {
            console.error('Error retrieving messages:', error);
            return [];
        }
    }

    // Ensure this delete method is present
    static async delete(id) {
        try {
            const message = await db.get(id);
            if (!message) {
                return null; // Message not found
            }
            await db.destroy(id, message._rev);
            return true; // Successfully deleted
        } catch (error) {
            console.error(`❌ Error deleting message ${id}:`, error.message);
            throw new Error("Database error: Unable to delete message");
        }
    }
}

module.exports = Message;