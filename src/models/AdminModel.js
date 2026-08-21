const { getDatabase } = require('../../config/database');

class AdminModel {
    static async findByUsername(username) {
        const db = await getDatabase();
        return db.queryOne('SELECT * FROM administrators WHERE username = ?', [username]);
    }

    static async findById(id) {
        const db = await getDatabase();
        return db.queryOne('SELECT id, username, email, created_at, updated_at FROM administrators WHERE id = ?', [id]);
    }

    static async create({ username, email, passwordHash }) {
        const db = await getDatabase();
        const res = db.execute(
            'INSERT INTO administrators (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return res.lastInsertRowid;
    }
}

module.exports = AdminModel;
