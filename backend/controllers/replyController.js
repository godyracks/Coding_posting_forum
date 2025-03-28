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

// Reply to a message OR another reply
exports.replyToMessage = [
    upload.single('image'), // Handle single image upload
    async (req, res) => {
        try {
            const { message_id, parent_id, content } = req.body; // parent_id can be message_id or another reply_id
            const user_id = req.user.id;
            const image = req.file ? req.file.filename : null; // Get the uploaded image filename

            const replyId = `reply:${Date.now()}`;
            const replyDoc = {
                _id: replyId,
                type: "reply",
                message_id: message_id || parent_id, // Ensure message_id is always set
                parent_id: parent_id || message_id, // Parent can be message or reply
                user_id,
                content,
                image, // Store image filename
                created_at: new Date().toISOString(),
                likes: { up: 0, down: 0 },
                liked_by: [],
                disliked_by: []
            };

            await db.insert(replyDoc);
            res.status(201).json({
                message: "Reply posted successfully!",
                replyId,
                image: image ? `/uploads/${image}` : null // Return full image URL
            });
        } catch (error) {
            console.error("❌ Error posting reply:", error.message);
            res.status(500).json({ error: "Error posting reply", details: error.message });
        }
    }
];

// Retrieve a reply
exports.getReplyById = async (req, res) => {
    try {
        const { reply_id } = req.params;
        const reply = await db.get(reply_id);

        // Add image URL to response if image exists
        if (reply.image) {
            reply.imageUrl = `/uploads/${reply.image}`;
        }

        res.json(reply);
    } catch (error) {
        console.error("❌ Error fetching reply:", error.message);
        res.status(404).json({ error: "Reply not found" });
    }
};

const updateReplyLikes = async (replyId, userId, action) => {
    try {
        const doc = await db.get(replyId);

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
        console.error(`Error in ${action} reply:`, error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Like a reply
exports.likeReply = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await updateReplyLikes(id, user_id, 'like');

        if (!result.success) {
            return res.status(500).json({
                error: "Failed to like reply",
                details: result.error
            });
        }

        res.status(200).json({
            message: "Reply liked successfully",
            likes: result.likes
        });
    } catch (error) {
        console.error("Controller error liking reply:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
};

// Dislike a reply
exports.dislikeReply = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await updateReplyLikes(id, user_id, 'dislike');

        if (!result.success) {
            return res.status(500).json({
                error: "Failed to dislike reply",
                details: result.error
            });
        }

        res.status(200).json({
            message: "Reply disliked successfully",
            likes: result.likes
        });
    } catch (error) {
        console.error("Controller error disliking reply:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
};