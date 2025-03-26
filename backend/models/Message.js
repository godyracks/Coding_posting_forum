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
            likes: { 
                up: 0, 
                down: 0,
                users_liked: [],
                users_disliked: []
            }
        };
        return await db.messages.insert(messageDoc);
    }

    static async findByChannel(channel_id) {
        try {
            const messages = await db.messages.find({ 
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
            return await db.messages.insert(replyDoc);
        } catch (error) {
            console.error('Error adding reply:', error);
            return null;
        }
    }

    static async likeMessage({ message_id, user_id }) {
        try {
            const message = await db.messages.get(message_id);

            // Check if user has already liked
            if (message.likes.users_liked.includes(user_id)) {
                return message.likes;
            }

            // Remove from disliked if previously disliked
            const dislikedIndex = message.likes.users_disliked.indexOf(user_id);
            if (dislikedIndex > -1) {
                message.likes.users_disliked.splice(dislikedIndex, 1);
                message.likes.down = Math.max(0, message.likes.down - 1);
            }

            // Add like
            message.likes.up += 1;
            message.likes.users_liked.push(user_id);

            // Update the message
            await db.messages.insert(message);

            return message.likes;
        } catch (error) {
            console.error('Error liking message:', error);
            throw error;
        }
    }

    static async dislikeMessage({ message_id, user_id }) {
        try {
            const message = await db.messages.get(message_id);

            // Check if user has already disliked
            if (message.likes.users_disliked.includes(user_id)) {
                return message.likes;
            }

            // Remove from liked if previously liked
            const likedIndex = message.likes.users_liked.indexOf(user_id);
            if (likedIndex > -1) {
                message.likes.users_liked.splice(likedIndex, 1);
                message.likes.up = Math.max(0, message.likes.up - 1);
            }

            // Add dislike
            message.likes.down += 1;
            message.likes.users_disliked.push(user_id);

            // Update the message
            await db.messages.insert(message);

            return message.likes;
        } catch (error) {
            console.error('Error disliking message:', error);
            throw error;
        }
    }

    static async getMessageById(message_id) {
        try {
            const message = await db.messages.get(message_id);
            
            // Fetch replies for this message
            const replies = await db.messages.find({
                selector: { 
                    type: "reply", 
                    message_id: message_id 
                }
            });

            // Organize replies recursively
            const organizeReplies = (parentId) => 
                replies.docs
                    .filter(reply => reply.parent_id === parentId)
                    .map(reply => ({
                        ...reply,
                        replies: organizeReplies(reply._id)
                    }));

            // Attach organized replies to the message
            return {
                ...message,
                replies: organizeReplies(message._id)
            };
        } catch (error) {
            console.error('Error retrieving message:', error);
            throw error;
        }
    }

    static async getAllMessagesInChannel(channel_id) {
        try {
            // Fetch all messages in the channel
            const messages = await db.messages.find({ 
                selector: { 
                    type: "message", 
                    channel_id 
                } 
            });

            // Fetch all replies
            const replies = await db.messages.find({ 
                selector: { 
                    type: "reply" 
                } 
            });

            // Organize replies recursively
            const organizeReplies = (parentId) => 
                replies.docs
                    .filter(reply => reply.parent_id === parentId)
                    .map(reply => ({
                        ...reply,
                        replies: organizeReplies(reply._id)
                    }));

            // Attach replies to their respective messages
            return messages.docs.map(message => ({
                ...message,
                replies: organizeReplies(message._id)
            }));
        } catch (error) {
            console.error('Error retrieving messages:', error);
            return [];
        }
    }
}

module.exports = Message;