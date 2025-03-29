const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) cb(null, true);
        else cb(new Error('Only images are allowed!'));
    }
});

exports.postMessage = [
    upload.single('image'),
    async (req, res) => {
        try {
            const { channel_id, content } = req.body;
            const user_id = req.user.id;
            const image = req.file ? req.file.filename : null;

            const messageId = `message:${Date.now()}`;
            const messageDoc = {
                _id: messageId,
                type: "message",
                channel_id,
                user_id,
                content,
                image,
                created_at: new Date().toISOString(),
                likes: { up: 0, down: 0 },
                liked_by: [],
                disliked_by: []
            };

            const createdMessage = await db.insert(messageDoc);
            console.log("✅ Message created:", createdMessage);
            res.status(201).json({
                message: "Message posted successfully!",
                messageId,
                image: image ? `/uploads/${image}` : null
            });
        } catch (error) {
            console.error("❌ Error posting message:", error.message);
            res.status(500).json({ error: "Error posting message", details: error.message });
        }
    }
];

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await db.find({ selector: { type: "message" } });
        const replies = await db.find({ selector: { type: "reply" } });
        const users = await db.find({ selector: { type: "user" } });

        const userMap = users.docs.reduce((map, user) => {
            map[user._id] = { name: user.name, status: user.status };
            return map;
        }, {});

        const organizeReplies = (parentId) =>
            replies.docs
                .filter(reply => reply.parent_id === parentId)
                .map(reply => ({
                    ...reply,
                    user: userMap[reply.user_id] || { name: reply.user_id, status: "unknown" },
                    replies: organizeReplies(reply._id)
                }));

        const messagesWithReplies = messages.docs.map(message => ({
            ...message,
            user: userMap[message.user_id] || { name: message.user_id, status: "unknown" },
            replies: organizeReplies(message._id),
            imageUrl: message.image ? `/uploads/${message.image}` : null // Fixed typo from 'image.image'
        }));

        res.json(messagesWithReplies);
    } catch (error) {
        console.error("❌ Error fetching messages:", error.message);
        res.status(500).json({ error: "Error fetching messages" });
    }
};

exports.getMessageById = async (req, res) => {
    try {
        const { message_id } = req.params;
        const message = await db.get(message_id);
        const users = await db.find({ selector: { type: "user" } });

        const userMap = users.docs.reduce((map, user) => {
            map[user._id] = { name: user.name, status: user.status };
            return map;
        }, {});

        const replies = await db.find({ selector: { type: "reply", message_id } });
        const organizeReplies = (parentId) =>
            replies.docs
                .filter(reply => reply.parent_id === parentId)
                .map(reply => ({
                    ...reply,
                    user: userMap[reply.user_id] || { name: reply.user_id, status: "unknown" },
                    replies: organizeReplies(reply._id)
                }));

        const updatedMessage = {
            ...message,
            user: userMap[message.user_id] || { name: message.user_id, status: "unknown" },
            replies: organizeReplies(message._id),
            imageUrl: message.image ? `/uploads/${message.image}` : null,
        };
        res.json(updatedMessage);
    } catch (error) {
        console.error("❌ Error fetching message:", error.message);
        res.status(404).json({ error: "Message not found" });
    }
};

const updateMessageLikes = async (messageId, userId, action) => {
    try {
        const doc = await db.get(messageId);
        doc.likes = doc.likes || { up: 0, down: 0 };
        doc.liked_by = doc.liked_by || [];
        doc.disliked_by = doc.disliked_by || [];

        if (action === 'like') {
            if (doc.disliked_by.includes(userId)) {
                doc.disliked_by = doc.disliked_by.filter(id => id !== userId);
                doc.likes.down = Math.max(0, doc.likes.down - 1);
            }
            if (!doc.liked_by.includes(userId)) {
                doc.liked_by.push(userId);
                doc.likes.up += 1;
            }
        } else if (action === 'dislike') {
            if (doc.liked_by.includes(userId)) {
                doc.liked_by = doc.liked_by.filter(id => id !== userId);
                doc.likes.up = Math.max(0, doc.likes.up - 1);
            }
            if (!doc.disliked_by.includes(userId)) {
                doc.disliked_by.push(userId);
                doc.likes.down += 1;
            }
        }

        const response = await db.insert({ ...doc, _rev: doc._rev });
        return { success: true, likes: doc.likes };
    } catch (error) {
        console.error(`Error in ${action} message:`, error);
        return { success: false, error: error.message };
    }
};

exports.likeMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const result = await updateMessageLikes(id, user_id, 'like');
        if (!result.success) return res.status(500).json({ error: "Failed to like message", details: result.error });
        res.status(200).json({ message: "Message liked successfully", likes: result.likes });
    } catch (error) {
        console.error("Controller error liking message:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.dislikeMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const result = await updateMessageLikes(id, user_id, 'dislike');
        if (!result.success) return res.status(500).json({ error: "Failed to dislike message", details: result.error });
        res.status(200).json({ message: "Message disliked successfully", likes: result.likes });
    } catch (error) {
        console.error("Controller error disliking message:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Message.delete(id);
        if (!result) return res.status(404).json({ error: `Message with ID ${id} not found` });
        res.json({ message: `Message ${id} deleted successfully` });
    } catch (error) {
        console.error(`Error deleting message with ID ${id}:`, error);
        res.status(500).json({ error: 'Error deleting message' });
    }
};

exports.searchMessages = async (req, res) => {
    const { query, user_id } = req.query;

    try {
        let messages = [];
        if (user_id) {
            messages = await Message.searchByUser(user_id);
        } else if (query) {
            messages = await Message.searchByContent(query);
        } else {
            return res.status(400).json({ error: "Provide either 'query' or 'user_id' parameter" });
        }

        // If messages is null/undefined, default to empty array
        if (!messages) messages = [];

        const users = await db.find({ selector: { type: "user" } });
        const userMap = users.docs.reduce((map, user) => {
            map[user._id] = { name: user.name || user._id, status: user.status || "unknown" };
            return map;
        }, {});

        const replies = await db.find({ selector: { type: "reply" } }) || { docs: [] };
        const organizeReplies = (parentId) =>
            replies.docs
                .filter(reply => reply.parent_id === parentId)
                .map(reply => ({
                    ...reply,
                    user: userMap[reply.user_id] || { name: reply.user_id, status: "unknown" },
                    replies: organizeReplies(reply._id)
                }));

        const enrichedMessages = messages.map(message => ({
            ...message,
            user: userMap[message.user_id] || { name: message.user_id, status: "unknown" },
            replies: organizeReplies(message._id),
            imageUrl: message.image ? `/uploads/${message.image}` : null
        }));

        res.status(200).json(enrichedMessages); // Always return 200 with results (even if empty)
    } catch (error) {
        console.error("Error searching messages:", error.message);
        res.status(500).json({ error: "Error searching messages", details: error.message });
    }
};