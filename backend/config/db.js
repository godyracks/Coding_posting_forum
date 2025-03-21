const nano = require('nano')(process.env.COUCHDB_URL);

const dbName = 'project';

async function ensureDatabaseExists() {
    try {
        const existingDbs = await nano.db.list();

        if (!existingDbs.includes(dbName)) {
            console.log(`📌 Creating database: ${dbName}`);
            await nano.db.create(dbName);
        } else {
            console.log(`✅ Database '${dbName}' already exists.`);
        }
    } catch (error) {
        console.error(`❌ Error checking/creating database '${dbName}':`, error.message);
    }
}

// Ensure database exists at startup
ensureDatabaseExists();

const db = nano.db.use(dbName);

module.exports = db;
