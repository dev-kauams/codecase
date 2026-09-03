const { getDatabase } = require('../../config/database');
const slugify = require('slugify');

class tagModel {
    static async getAll() {
        const db = await getDatabase();
        return db.query(`
            SELECT t.*, COUNT(et.exercise_id) AS exercise_count 
            FROM tags t 
            LEFT JOIN exercise_tags et ON t.id = et.tag_id 
            GROUP BY t.id 
            ORDER BY t.name ASC
        `);
    }

    static async findBySlug(slug) {
        const db = await getDatabase();
        return db.queryOne('SELECT * FROM tags WHERE slug = ?', [slug]);
    }

    static async findById(id) {
        const db = await getDatabase();
        return db.queryOne('SELECT * FROM tags WHERE id = ?', [id]);
    }

    static async create({ name }) {
        const db = await getDatabase();
        const slug = slugify(name, { lower: true, strict: true });
        const res = db.execute('INSERT INTO tags (name, slug) VALUES (?, ?)', [name, slug]);
        return { id: res.lastInsertRowid, name, slug };
    }

    static async getTagsForExercise(exerciseId) {
        const db = await getDatabase();
        return db.query(`
            SELECT t.* 
            FROM tags t
            JOIN exercise_tags et ON t.id = et.tag_id
            WHERE et.exercise_id = ?
            ORDER BY t.name ASC
        `, [exerciseId]);
    }
}

module.exports = tagModel;
