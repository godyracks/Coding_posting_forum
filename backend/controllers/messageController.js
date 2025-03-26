const db = require('../config/db');
const multer = require('multer');

// Multer storage setup (store files in memory before uploading to CouchDB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new message with optional image upload
exports.postMessage = async (req, res) => {
    try {
        const { channel_id, content } = req.body;
        const user_id = req.user.id;

        const messageId = `message:${Date.now()}`;
        const messageDoc = {
            _id: messageId,
            type: "message",
            channel_id,
            user_id,
            content,
            created_at: new Date().toISOString(),
            likes: { up: 0, down: 0 }
        };

        // Step 1: Insert the message document
        const createdMessage = await db.insert(messageDoc);
        console.log("✅ Message created:", createdMessage);

        // Step 2: If an image is uploaded, attach it to the document
        if (req.file) {
            // Fetch the latest _rev before adding an attachment
            const messageWithRev = await db.get(messageId);
            console.log("🔄 Retrieved latest _rev:", messageWithRev._rev);

            await db.attachment.insert(
                messageId,
                req.file.originalname,
                req.file.buffer,
                req.file.mimetype,
                { rev: messageWithRev._rev } // ✅ Use latest revision
            );
            console.log("📸 Image attached successfully");
        }

        res.status(201).json({ message: "Message posted successfully!", messageId });
    } catch (error) {
        console.error("❌ Error posting message:", error.message);
        res.status(500).json({ error: "Error posting message", details: error.message });
    }
};

// Retrieve a single message with attachments
exports.getMessageById = async (req, res) => {
    try {
        const { message_id } = req.params;
        const message = await db.get(message_id, { attachments: true });

        res.json(message);
    } catch (error) {
        console.error("❌ Error fetching message:", error.message);
        res.status(404).json({ error: "Message not found" });
    }
};

// Fetch all messages with nested replies
exports.getAllMessages = async (req, res) => {
    try {
        // Step 1: Fetch all messages
        const messages = await db.find({ selector: { type: "message" } });

        // Step 2: Fetch all replies
        const replies = await db.find({ selector: { type: "reply" } });

        // Step 3: Function to organize replies recursively
        const organizeReplies = (parentId) =>
            replies.docs
                .filter(reply => reply.parent_id === parentId)
                .map(reply => ({
                    ...reply,
                    replies: organizeReplies(reply._id) // Recursively fetch nested replies
                }));

        // Step 4: Attach replies to their respective messages
        const messagesWithReplies = messages.docs.map(message => ({
            ...message,
            replies: organizeReplies(message._id) // Fetch replies for each message
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
      // 1. Get the current message document
      const doc = await db.get(messageId);
      
      // 2. Initialize likes object if it doesn't exist
      doc.likes = doc.likes || { up: 0, down: 0 };
      
      // 3. Initialize user tracking arrays if they don't exist
      doc.liked_by = doc.liked_by || [];
      doc.disliked_by = doc.disliked_by || [];
      
      // 4. Handle the action
      if (action === 'like') {
        // Remove from dislikes if exists
        if (doc.disliked_by.includes(userId)) {
          doc.disliked_by = doc.disliked_by.filter(id => id !== userId);
          doc.likes.down = Math.max(0, doc.likes.down - 1);
        }
        
        // Add to likes if not already there
        if (!doc.liked_by.includes(userId)) {
          doc.liked_by.push(userId);
          doc.likes.up += 1;
        }
      } else if (action === 'dislike') {
        // Remove from likes if exists
        if (doc.liked_by.includes(userId)) {
          doc.liked_by = doc.liked_by.filter(id => id !== userId);
          doc.likes.up = Math.max(0, doc.likes.up - 1);
        }
        
        // Add to dislikes if not already there
        if (!doc.disliked_by.includes(userId)) {
          doc.disliked_by.push(userId);
          doc.likes.down += 1;
        }
      }
      
      // 5. Save the updated document
      const response = await db.insert({
        ...doc,
        _rev: doc._rev // Must include current revision
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