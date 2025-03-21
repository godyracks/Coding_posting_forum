require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const nano = require('nano')(process.env.COUCHDB_URL); // CouchDB Connection

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const channelRoutes = require('./routes/channelRoutes');
const replyRoutes = require('./routes/replyRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logs requests

// Test CouchDB Connection
(async () => {
    try {
        const dbInfo = await nano.db.list();
        console.log('✅ Connected to CouchDB successfully!');
        console.log('📂 Existing Databases:', dbInfo);
    } catch (error) {
        console.error('❌ CouchDB connection failed:', error.message);
        process.exit(1); // Exit if DB connection fails
    }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/replies', replyRoutes);

// Default route
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to the CouchDB Programming Forum API!' });
});

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
