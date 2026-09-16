const { getDatabase } = require('../../config/database');

class submissionModel {
    static async create({ title, summary, statement, difficulty, image_url, author_email, tagIds = [], stackIds = [] }) {
        const db = await getDatabase();
        const result = await db.execute(`INSERT INTO exercise_submissions
            (title, author_email, summary, statement, difficulty, image_url) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
            [title, author_email, summary, statement, difficulty, image_url || null]);
        const id = result.lastInsertRowid;
        await this.setRelations(id, 'submission_tags', 'tag_id', tagIds);
        await this.setRelations(id, 'submission_stacks', 'stack_id', stackIds);
        return this.findById(id);
    }

    static async setRelations(id, table, column, ids) {
        const db = await getDatabase();
        for (const relationId of ids) {
            await db.execute(`INSERT INTO ${table} (submission_id, ${column}) VALUES (?, ?) ON CONFLICT DO NOTHING`, [id, relationId]);
        }
    }

    static async findById(id) {
        const db = await getDatabase();
        const submission = await db.queryOne('SELECT * FROM exercise_submissions WHERE id = ?', [id]);
        if (!submission) return null;
        submission.tags = await db.query('SELECT t.* FROM tags t JOIN submission_tags st ON st.tag_id = t.id WHERE st.submission_id = ? ORDER BY t.name', [id]);
        submission.stacks = await db.query('SELECT s.* FROM stacks s JOIN submission_stacks ss ON ss.stack_id = s.id WHERE ss.submission_id = ? ORDER BY s.name', [id]);
        return submission;
    }

    static async findPending() {
        const db = await getDatabase();
        const rows = await db.query("SELECT * FROM exercise_submissions WHERE status = 'pending' ORDER BY created_at ASC, id ASC");
        for (const row of rows) Object.assign(row, await this.findById(row.id));
        return rows;
    }

    static async markReviewed(id, status) {
        const db = await getDatabase();
        return db.execute('UPDATE exercise_submissions SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    }

    static async addAttachment(submissionId, attachment) {
        const db = await getDatabase();
        return db.execute(`INSERT INTO submission_attachments
            (submission_id, original_name, stored_filename, file_path, mime_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?)`, [submissionId, attachment.original_name, attachment.stored_filename,
            attachment.file_path, attachment.mime_type, attachment.file_size]);
    }

    static async getAttachments(submissionId) {
        const db = await getDatabase();
        return db.query('SELECT * FROM submission_attachments WHERE submission_id = ?', [submissionId]);
    }
}

module.exports = submissionModel;