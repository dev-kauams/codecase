const { getDatabase } = require('../../config/database');
const slugify = require('slugify');

class stackModel {
    static async getAll() {
        const db = await getDatabase();
        return await db.query(`
            SELECT s.*, COUNT(es.exercise_id) AS exercise_count 
            FROM stacks s 
            LEFT JOIN exercise_stacks es ON s.id = es.stack_id 
            GROUP BY s.id 
            ORDER BY s.name ASC
        `);
    }

    static async findBySlug(slug) {
        const db = await getDatabase();
        return await db.queryOne('SELECT * FROM stacks WHERE slug = ?', [slug]);
    }

    static async findById(id) {
        const db = await getDatabase();
        return await db.queryOne('SELECT * FROM stacks WHERE id = ?', [id]);
    }

    static async create({ name, color }) {
        const db = await getDatabase();
        const slug = slugify(name, { lower: true, strict: true });
        const stackColor = color || '#d97986';
        const res = await db.execute('INSERT INTO stacks (name, slug, color) VALUES (?, ?, ?) RETURNING id', [name, slug, stackColor]);
        return { id: res.lastInsertRowid, name, slug, color: stackColor };
    }

    static async getStacksForExercise(exerciseId) {
        const db = await getDatabase();
        return await db.query(`
            SELECT s.* 
            FROM stacks s
            JOIN exercise_stacks es ON s.id = es.stack_id
            WHERE es.exercise_id = ?
            ORDER BY s.name ASC
        `, [exerciseId]);
    }
}

module.exports = stackModel;
