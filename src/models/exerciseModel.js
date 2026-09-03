const { getDatabase } = require('../../config/database');
const slugify = require('slugify');
const TagModel = require('./TagModel');
const StackModel = require('./StackModel');
const AttachmentModel = require('./AttachmentModel');

class ExerciseModel {
    static async findAll({ search, difficulty, stack, tag, limit = 50, offset = 0 } = {}) {
        const db = await getDatabase();
        let whereClauses = [];
        let params = [];

        // Normalize difficulty query parameter (e.g. easy -> Fácil, medium -> Médio, hard -> Difícil)
        if (difficulty) {
            let normDiff = difficulty.trim();
            const lower = normDiff.toLowerCase();
            if (lower === 'easy' || lower === 'facil' || lower === 'fácil') normDiff = 'Fácil';
            else if (lower === 'medium' || lower === 'medio' || lower === 'médio') normDiff = 'Médio';
            else if (lower === 'hard' || lower === 'dificil' || lower === 'difícil') normDiff = 'Difícil';
            
            whereClauses.push('e.difficulty = ?');
            params.push(normDiff);
        }

        // Stack filter (by slug or name or ID)
        if (stack) {
            whereClauses.push(`e.id IN (
                SELECT es.exercise_id 
                FROM exercise_stacks es
                JOIN stacks s ON es.stack_id = s.id
                WHERE s.slug = ? OR s.name = ? OR s.id = ?
            )`);
            params.push(stack.toLowerCase(), stack, parseInt(stack) || 0);
        }

        // Tag filter (by slug or name or ID)
        if (tag) {
            whereClauses.push(`e.id IN (
                SELECT et.exercise_id 
                FROM exercise_tags et
                JOIN tags t ON et.tag_id = t.id
                WHERE t.slug = ? OR t.name = ? OR t.id = ?
            )`);
            params.push(tag.toLowerCase(), tag, parseInt(tag) || 0);
        }

        // Search filter (title, summary, statement, tags, stacks)
        if (search && search.trim() !== '') {
            const term = `%${search.trim()}%`;
            whereClauses.push(`(
                e.title LIKE ? OR 
                e.summary LIKE ? OR 
                e.statement LIKE ? OR
                e.id IN (
                    SELECT et.exercise_id FROM exercise_tags et JOIN tags t ON et.tag_id = t.id WHERE t.name LIKE ?
                )
            )`);
            params.push(term, term, term, term);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const sql = `
            SELECT e.* 
            FROM exercises e
            ${whereSql}
            ORDER BY e.created_at DESC, e.id DESC
            LIMIT ? OFFSET ?
        `;

        const exercises = db.query(sql, [...params, limit, offset]);

        // Enrich exercises with tags, stacks, attachments
        for (let ex of exercises) {
            ex.tags = await TagModel.getTagsForExercise(ex.id);
            ex.stacks = await StackModel.getStacksForExercise(ex.id);
            ex.attachments = await AttachmentModel.getByExerciseId(ex.id);
        }

        return exercises;
    }

    static async findById(id) {
        const db = await getDatabase();
        const exercise = db.queryOne('SELECT * FROM exercises WHERE id = ?', [id]);
        if (!exercise) return null;

        exercise.tags = await TagModel.getTagsForExercise(exercise.id);
        exercise.stacks = await StackModel.getStacksForExercise(exercise.id);
        exercise.attachments = await AttachmentModel.getByExerciseId(exercise.id);
        return exercise;
    }

    static async findBySlug(slug) {
        const db = await getDatabase();
        const exercise = db.queryOne('SELECT * FROM exercises WHERE slug = ?', [slug]);
        if (!exercise) return null;

        exercise.tags = await TagModel.getTagsForExercise(exercise.id);
        exercise.stacks = await StackModel.getStacksForExercise(exercise.id);
        exercise.attachments = await AttachmentModel.getByExerciseId(exercise.id);
        return exercise;
    }

    static async create({ title, summary, statement, difficulty, image_url, tagIds = [], stackIds = [] }) {
        const db = await getDatabase();
        const baseSlug = slugify(title, { lower: true, strict: true }) || 'exercicio';
        let slug = baseSlug;
        let counter = 1;

        while (db.queryOne('SELECT id FROM exercises WHERE slug = ?', [slug])) {
            slug = `${baseSlug}-${counter++}`;
        }

        const res = db.execute(`
            INSERT INTO exercises (title, slug, summary, statement, difficulty, image_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [title, slug, summary, statement, difficulty, image_url || null]);

        const exerciseId = res.lastInsertRowid;

        if (tagIds && tagIds.length > 0) {
            await this.setTags(exerciseId, tagIds);
        }

        if (stackIds && stackIds.length > 0) {
            await this.setStacks(exerciseId, stackIds);
        }

        return await this.findById(exerciseId);
    }

    static async update(id, { title, summary, statement, difficulty, image_url, tagIds, stackIds }) {
        const db = await getDatabase();
        const current = await this.findById(id);
        if (!current) return null;

        let slug = current.slug;
        if (title && title !== current.title) {
            const baseSlug = slugify(title, { lower: true, strict: true }) || 'exercicio';
            slug = baseSlug;
            let counter = 1;
            while (true) {
                const existing = db.queryOne('SELECT id FROM exercises WHERE slug = ? AND id != ?', [slug, id]);
                if (!existing) break;
                slug = `${baseSlug}-${counter++}`;
            }
        }

        const finalTitle = title !== undefined ? title : current.title;
        const finalSummary = summary !== undefined ? summary : current.summary;
        const finalStatement = statement !== undefined ? statement : current.statement;
        const finalDifficulty = difficulty !== undefined ? difficulty : current.difficulty;
        const finalImageUrl = image_url !== undefined ? image_url : current.image_url;

        db.execute(`
            UPDATE exercises 
            SET title = ?, slug = ?, summary = ?, statement = ?, difficulty = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [finalTitle, slug, finalSummary, finalStatement, finalDifficulty, finalImageUrl, id]);

        if (Array.isArray(tagIds)) {
            await this.setTags(id, tagIds);
        }

        if (Array.isArray(stackIds)) {
            await this.setStacks(id, stackIds);
        }

        return await this.findById(id);
    }

    static async delete(id) {
        const db = await getDatabase();
        return db.execute('DELETE FROM exercises WHERE id = ?', [id]);
    }

    static async setTags(exerciseId, tagIds) {
        const db = await getDatabase();
        db.execute('DELETE FROM exercise_tags WHERE exercise_id = ?', [exerciseId]);
        for (let tagId of tagIds) {
            db.execute('INSERT OR IGNORE INTO exercise_tags (exercise_id, tag_id) VALUES (?, ?)', [exerciseId, tagId]);
        }
    }

    static async setStacks(exerciseId, stackIds) {
        const db = await getDatabase();
        db.execute('DELETE FROM exercise_stacks WHERE exercise_id = ?', [exerciseId]);
        for (let stackId of stackIds) {
            db.execute('INSERT OR IGNORE INTO exercise_stacks (exercise_id, stack_id) VALUES (?, ?)', [exerciseId, stackId]);
        }
    }

    static async getStats() {
        const db = await getDatabase();
        const totalExercises = db.queryOne('SELECT COUNT(*) AS count FROM exercises').count;
        const totalTags = db.queryOne('SELECT COUNT(*) AS count FROM tags').count;
        const totalStacks = db.queryOne('SELECT COUNT(*) AS count FROM stacks').count;

        return {
            totalExercises,
            totalTags,
            totalStacks
        };
    }
}

module.exports = ExerciseModel;
