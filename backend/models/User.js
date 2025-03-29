const db = require('../config/db');
const bcrypt = require('bcryptjs');

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
                status, // Default: 'beginner'
                is_blocked: 0, // Default: not blocked
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
            return null;
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

    // Block or unblock a user (use is_blocked)
    static async updateBlockStatus(id, is_blocked) {
        try {
            const user = await db.get(id);
            if (!user) {
                console.error(`❌ User not found: ${id}`);
                return null;
            }
            user.is_blocked = is_blocked; // Update is_blocked (0 or 1)
            return await db.insert(user);
        } catch (error) {
            console.error(`❌ Error updating block status for user ${id}:`, error.message);
            return null;
        }
    }

    // Update user name and status (for non-blocking updates)
    static async update(id, { name, status }) {
        try {
            const user = await db.get(id);
            if (!user) {
                console.error(`❌ User not found: ${id}`);
                return null;
            }
            user.name = name || user.name;
            user.status = status || user.status; // Status remains 'beginner' unless explicitly changed
            return await db.insert(user);
        } catch (error) {
            console.error(`❌ Error updating user ${id}:`, error.message);
            throw new Error("Database error: Unable to update user");
        }
    }

    // Ensure hardcoded admin exists
    static async ensureAdmin() {
        try {
            const adminEmail = 'admin@email.com';
            const admin = await User.findByEmail(adminEmail);
            if (!admin) {
                const password = 'admin123';
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(password, salt);

                await User.create({
                    name: 'System Admin',
                    email: adminEmail,
                    password_hash,
                    role: 'admin',
                    status: 'beginner' // Admin also starts as 'beginner'
                });
                console.log('✅ Hardcoded admin created with email: admin@email.com');
            } else {
                console.log('✅ Admin already exists');
            }
        } catch (error) {
            console.error('❌ Error ensuring admin:', error.message);
        }
    }
}

module.exports = User;