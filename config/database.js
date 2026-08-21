const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const dbDirectory = path.join(__dirname, '../database');
const dbFilePath = path.join(dbDirectory, 'aether.db');

if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

let dbInstance = null;

async function getDatabase() {
    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs();
    let db;

    if (fs.existsSync(dbFilePath)) {
        const fileBuffer = fs.readFileSync(dbFilePath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run("PRAGMA foreign_keys = ON;");

    function saveToDisk() {
        try {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbFilePath, buffer);
        } catch (err) {
            console.error('Error persisting database to disk:', err);
        }
    }

    dbInstance = {
        rawDb: db,
        saveToDisk,
        
        query(sql, params = []) {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const results = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
        },

        queryOne(sql, params = []) {
            const results = this.query(sql, params);
            return results.length > 0 ? results[0] : null;
        },

        execute(sql, params = []) {
            db.run(sql, params);
            
            const lastIdRes = db.exec("SELECT last_insert_rowid() AS id");
            const changesRes = db.exec("SELECT changes() AS total");
            
            const lastInsertRowid = (lastIdRes.length && lastIdRes[0].values.length) ? lastIdRes[0].values[0][0] : 0;
            const changes = (changesRes.length && changesRes[0].values.length) ? changesRes[0].values[0][0] : 0;

            saveToDisk();

            return { lastInsertRowid, changes };
        },

        execScript(sqlScript) {
            db.run(sqlScript);
            saveToDisk();
        }
    };

    return dbInstance;
}

module.exports = {
    getDatabase,
    dbFilePath
};
