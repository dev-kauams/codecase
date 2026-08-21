const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../../config/database');

async function initDb() {
    console.log('[Database] Starting initialization...');
    try {
        const db = await getDatabase();
        const sqlPath = path.join(__dirname, '../../database.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`database.sql not found at ${sqlPath}`);
        }

        const sqlScript = fs.readFileSync(sqlPath, 'utf-8');
        db.execScript(sqlScript);
        
        console.log('[Database] Tables and seed data successfully initialized.');
    } catch (err) {
        console.error('[Database] Initialization error:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    initDb();
}

module.exports = initDb;
