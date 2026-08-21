const path = require('path');
const fs = require('fs');
const ExerciseModel = require('../models/ExerciseModel');
const AttachmentModel = require('../models/AttachmentModel');

class ExerciseController {
    static async getAll(req, res, next) {
        try {
            const { search, difficulty, stack, tag, limit, offset } = req.query;
            const exercises = await ExerciseModel.findAll({
                search,
                difficulty,
                stack,
                tag,
                limit: limit ? parseInt(limit) : 100,
                offset: offset ? parseInt(offset) : 0
            });

            return res.json({
                success: true,
                count: exercises.length,
                data: exercises
            });
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            let exercise;

            if (/^\d+$/.test(id)) {
                exercise = await ExerciseModel.findById(parseInt(id));
            } else {
                exercise = await ExerciseModel.findBySlug(id);
            }

            if (!exercise) {
                return res.status(404).json({
                    success: false,
                    error: 'Exercício não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: exercise
            });
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { title, summary, statement, difficulty, tags, stacks } = req.body;

            if (!title || !summary || !statement || !difficulty) {
                return res.status(400).json({
                    success: false,
                    error: 'Preencha todos os campos obrigatórios (título, resumo, enunciado, dificuldade).'
                });
            }

            let imageUrl = null;
            if (req.files && req.files['image'] && req.files['image'].length > 0) {
                const file = req.files['image'][0];
                imageUrl = `/public/uploads/images/${file.filename}`;
            }

            const parsedTags = Array.isArray(tags) ? tags.map(Number) : (tags ? [Number(tags)] : []);
            const parsedStacks = Array.isArray(stacks) ? stacks.map(Number) : (stacks ? [Number(stacks)] : []);

            const exercise = await ExerciseModel.create({
                title,
                summary,
                statement,
                difficulty,
                image_url: imageUrl,
                tagIds: parsedTags,
                stackIds: parsedStacks
            });

            // Handle file attachments upload
            if (req.files && req.files['attachments']) {
                for (const attFile of req.files['attachments']) {
                    await AttachmentModel.create({
                        exercise_id: exercise.id,
                        original_name: attFile.originalname,
                        stored_filename: attFile.filename,
                        file_path: `/public/uploads/attachments/${attFile.filename}`,
                        mime_type: attFile.mimetype,
                        file_size: attFile.size
                    });
                }
            }

            const updatedExercise = await ExerciseModel.findById(exercise.id);

            return res.status(201).json({
                success: true,
                message: 'Exercício criado com sucesso!',
                data: updatedExercise
            });
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, summary, statement, difficulty, tags, stacks } = req.body;

            const existing = await ExerciseModel.findById(parseInt(id));
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Exercício não encontrado.' });
            }

            let imageUrl = existing.image_url;
            if (req.files && req.files['image'] && req.files['image'].length > 0) {
                const file = req.files['image'][0];
                imageUrl = `/public/uploads/images/${file.filename}`;
            }

            const parsedTags = tags !== undefined ? (Array.isArray(tags) ? tags.map(Number) : (tags ? [Number(tags)] : [])) : undefined;
            const parsedStacks = stacks !== undefined ? (Array.isArray(stacks) ? stacks.map(Number) : (stacks ? [Number(stacks)] : [])) : undefined;

            const updated = await ExerciseModel.update(parseInt(id), {
                title,
                summary,
                statement,
                difficulty,
                image_url: imageUrl,
                tagIds: parsedTags,
                stackIds: parsedStacks
            });

            // Process any newly added attachment files
            if (req.files && req.files['attachments']) {
                for (const attFile of req.files['attachments']) {
                    await AttachmentModel.create({
                        exercise_id: id,
                        original_name: attFile.originalname,
                        stored_filename: attFile.filename,
                        file_path: `/public/uploads/attachments/${attFile.filename}`,
                        mime_type: attFile.mimetype,
                        file_size: attFile.size
                    });
                }
            }

            const finalExercise = await ExerciseModel.findById(parseInt(id));

            return res.json({
                success: true,
                message: 'Exercício atualizado com sucesso!',
                data: finalExercise
            });
        } catch (err) {
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const exercise = await ExerciseModel.findById(parseInt(id));
            if (!exercise) {
                return res.status(404).json({ success: false, error: 'Exercício não encontrado.' });
            }

            // Remove attachment files from disk
            if (exercise.attachments && exercise.attachments.length > 0) {
                for (const att of exercise.attachments) {
                    const fullPath = path.join(__dirname, '../../', att.file_path);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }

            await ExerciseModel.delete(parseInt(id));

            return res.json({
                success: true,
                message: 'Exercício e seus anexos excluídos com sucesso.'
            });
        } catch (err) {
            next(err);
        }
    }

    static async deleteAttachment(req, res, next) {
        try {
            const { attachmentId } = req.params;
            const attachment = await AttachmentModel.findById(parseInt(attachmentId));
            if (!attachment) {
                return res.status(404).json({ success: false, error: 'Anexo não encontrado.' });
            }

            const fullPath = path.join(__dirname, '../../', attachment.file_path);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }

            await AttachmentModel.delete(parseInt(attachmentId));

            return res.json({
                success: true,
                message: 'Anexo removido com sucesso.'
            });
        } catch (err) {
            next(err);
        }
    }

    static async getStats(req, res, next) {
        try {
            const stats = await ExerciseModel.getStats();
            return res.json({
                success: true,
                data: stats
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ExerciseController;
