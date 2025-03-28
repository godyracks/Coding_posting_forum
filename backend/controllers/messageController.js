const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer storage setup (save to uploads folder)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename with timestamp
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});

// Create a new message with optional image upload
exports.postMessage = [
    upload.single('image'), // Handle single image upload
    async (req, res) => {
        try {
            const { channel_id, content } = req.body;
            const user_id = req.user.id;
            const image = req.file ? req.file.filename : null; // Get the uploaded image filename

            const messageId = `message:${Date.now()}`;
            const messageDoc = {
                _id: messageId,
                type: "message",
                channel_id,
                user_id,
                content,
                image, // Store image filename
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
                image: image ? `/uploads/${image}` : null // Return full image URL
            });
        } catch (error) {
            console.error("❌ Error posting message:", error.message);
            res.status(500).json({ error: "Error posting message", details: error.message });
        }
    }
];

// Retrieve a single message
exports.getMessageById = async (req, res) => {
    try {
        const { message_id } = req.params;
        const message = await db.get(message_id);

        // Add image URL to response if image exists
        if (message.image) {
            message.imageUrl = `/uploads/${message.image}`;
        }

        res.json(message);
    } catch (error) {
        console.error("❌ Error fetching message:", error.message);
        res.status(404).json({ error: "Message not found" });
    }
};

// Fetch all messages with nested replies
exports.getAllMessages = async (req, res) => {
    try {
        // Fetch all messages
        const messages = await db.find({ selector: { type: "message" } });

        // Fetch all replies
        const replies = await db.find({ selector: { type: "reply" } });

        // Function to organize replies recursively
        const organizeReplies = (parentId) =>
            replies.docs
                .filter(reply => reply.parent_id === parentId)
                .map(reply => ({
                    ...reply,
                    replies: organizeReplies(reply._id) // Recursively fetch nested replies
                }));

        // Attach replies and image URLs to their respective messages
        const messagesWithReplies = messages.docs.map(message => ({
            ...message,
            replies: organizeReplies(message._id),
            imageUrl: message.image ? `/uploads/${message.image}` : null // Add image URL
        }));

        res.json(messagesWithReplies);
    } catch (error) {
        console.error("❌ Error fetching messages:", error.message);
        res.status(500).json({ error: "Error fetching messages" });
    }
};

// Helper function to update message likes
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

        const response = await db.insert({
            ...doc,
            _rev: doc._rev
        });

        return {
            success: true,
            likes: doc.likes
        };
    } catch (error) {
        console.error(`Error in ${action} message:`, error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Like a message
exports.likeMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await updateMessageLikes(id, user_id, 'like');

        if (!result.success) {
            return res.status(500).json({
                error: "Failed to like message",
                details: result.error
            });
        }

        res.status(200).json({
            message: "Message liked successfully",
            likes: result.likes
        });
    } catch (error) {
        console.error("Controller error liking message:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
};

// Dislike a message
exports.dislikeMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await updateMessageLikes(id, user_id, 'dislike');

        if (!result.success) {
            return res.status(500).json({
                error: "Failed to dislike message",
                details: result.error
            });
        }

        res.status(200).json({
            message: "Message disliked successfully",
            likes: result.likes
        });
    } catch (error) {
        console.error("Controller error disliking message:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
};