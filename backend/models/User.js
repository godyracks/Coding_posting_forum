const db = require('../config/db');

class User {
    // Create a new user
    static async create({ name, email, password_hash, role = "user", status = "beginner" }) {
        try {
            const userDoc = {
                _id: `user:${Date.now()}`,
                type: "user",
                name,
                email,
                password_hash,
                role,
                status,
                is_blocked: 0,
                created_at: new Date().toISOString()
            };
            return await db.insert(userDoc);
        } catch (error) {
            console.error("❌ Error creating user:", error.message);
            throw new Error("Database error: Unable to create user");
        }
    }

    // Find a user by email
    static async findByEmail(email) {
        try {
            const users = await db.find({ selector: { type: "user", email } });
            return users.docs.length ? users.docs[0] : null;
        } catch (error) {
            console.error("❌ Error finding user by email:", error.message);
            throw new Error("Database error: Unable to find user");
        }
    }

    // Find a user by ID
    static async findById(id) {
        try {
            return await db.get(id);
        } catch (error) {
            console.error(`❌ Error finding user with ID ${id}:`, error.message);
            return null; // Return null if user doesn't exist
        }
    }

    // Fetch all users
    static async findAll() {
        try {
            const users = await db.find({ selector: { type: "user" } });
            return users.docs.length ? users.docs : [];
        } catch (error) {
            console.error("❌ Error retrieving all users:", error.message);
            return [];
        }
    }

    // Block or unblock a user
    static async updateBlockStatus(id, is_blocked) {
        try {
            const user = await db.get(id);
            if (!user) {
                console.error(`❌ User not found: ${id}`);
                return null;
            }

            user.is_blocked = is_blocked;
            return await db.insert(user);
        } catch (error) {
            console.error(`❌ Error updating block status for user ${id}:`, error.message);
            return null;
        }
    }

    // New method: Update user name and status
    static async update(id, { name, status }) {
        try {
            const user = await db.get(id);
            if (!user) {
                console.error(`❌ User not found: ${id}`);
                return null;
            }

            user.name = name || user.name; // Only update if provided
            user.status = status || user.status; // Only update if provided
            return await db.insert(user); // Update in database
        } catch (error) {
            console.error(`❌ Error updating user ${id}:`, error.message);
            throw new Error("Database error: Unable to update user");
        }
    }
}

module.exports = User;