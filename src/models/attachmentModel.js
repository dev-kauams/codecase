const { getDatabase } = require('../../config/database');

class attachmentModel {
    static async create({ exercise_id, original_name, stored_filename, file_path, mime_type, file_size }) {
        const db = await getDatabase();
        const res = await db.execute(`
            INSERT INTO attachments (exercise_id, original_name, stored_filename, file_path, mime_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id
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
        return await db.query('SELECT * FROM attachments WHERE exercise_id = ? ORDER BY created_at ASC', [exerciseId]);
    }

    static async findById(id) {
        const db = await getDatabase();
        return await db.queryOne('SELECT * FROM attachments WHERE id = ?', [id]);
    }

    static async delete(id) {
        const db = await getDatabase();
        return await db.execute('DELETE FROM attachments WHERE id = ?', [id]);
    }
}

module.exports = attachmentModel;
