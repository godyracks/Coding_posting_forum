const db = require('../config/db');

// Reply to a message OR another reply
exports.replyToMessage = async (req, res) => {
    try {
        const { parent_id, content } = req.body; // Parent can be a message OR a reply
        const user_id = req.user.id;

        const replyId = `reply:${Date.now()}`;
        const replyDoc = {
            _id: replyId,
            type: "reply",
            parent_id, // Can be a message_id or a reply_id
            user_id,
            content,
            created_at: new Date().toISOString()
        };

        // Insert reply document
        await db.insert(replyDoc);

        // If an image is uploaded, attach it to the reply document
        if (req.file) {
            const replyWithRev = await db.get(replyId); // Get latest _rev
            await db.attachment.insert(
                replyId,
                req.file.originalname,
                req.file.buffer,
                req.file.mimetype,
                { rev: replyWithRev._rev }
            );
        }

        res.status(201).json({ message: "Reply posted successfully!", replyId });
    } catch (error) {
        console.error("❌ Error posting reply:", error.message);
        res.status(500).json({ error: "Error posting reply", details: error.message });
    }
};

// Retrieve a reply with attachments
exports.getReplyById = async (req, res) => {
    try {
        const { reply_id } = req.params;
        const reply = await db.get(reply_id, { attachments: true });

        res.json(reply);
    } catch (error) {
        console.error("❌ Error fetching reply:", error.message);
        res.status(404).json({ error: "Reply not found" });
    }
};
