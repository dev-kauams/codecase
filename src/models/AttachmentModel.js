const { getDatabase } = require('../../config/database');

class AttachmentModel {
    static async create({ exercise_id, original_name, stored_filename, file_path, mime_type, file_size }) {
        const db = await getDatabase();
        const res = db.execute(`
            INSERT INTO attachments (exercise_id, original_name, stored_filename, file_path, mime_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [exercise_id, original_name, stored_filename, file_path, mime_type, file_size]);

        return {
            id: res.lastInsertRowid,
            exercise_id,
            original_name,
            stored_filename,
            file_path,
            mime_type,
            file_size
        };
    }

    static async getByExerciseId(exerciseId) {
        const db = await getDatabase();
        return db.query('SELECT * FROM attachments WHERE exercise_id = ? ORDER BY created_at ASC', [exerciseId]);
    }

    static async findById(id) {
        const db = await getDatabase();
        return db.queryOne('SELECT * FROM attachments WHERE id = ?', [id]);
    }

    static async delete(id) {
        const db = await getDatabase();
        return db.execute('DELETE FROM attachments WHERE id = ?', [id]);
    }
}

module.exports = AttachmentModel;
