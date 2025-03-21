const User = require('../models/User');

const roleMiddleware = async (req, res, next) => {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Fetch the user details from CouchDB
        const user = await User.findById(req.user.id);

        // Check if the user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        next(); // User is an admin, proceed with the request
    } catch (error) {
        res.status(500).json({ error: 'Server error. Unable to verify role.' });
    }
};

module.exports = roleMiddleware;
