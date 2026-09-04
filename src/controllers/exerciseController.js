const exerciseModel = require('../models/exerciseModel');
const attachmentModel = require('../models/attachmentModel');
const { saveFile, deleteFile } = require('../services/fileStorageService');

class exerciseController {
    static async getAll(req, res, next) {
        try {
            const { search, difficulty, stack, tag, limit, offset } = req.query;
            const parsedLimit = limit === undefined ? 100 : Number.parseInt(limit, 10);
            const parsedOffset = offset === undefined ? 0 : Number.parseInt(offset, 10);
            if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100 ||
                !Number.isInteger(parsedOffset) || parsedOffset < 0) {
                return res.status(400).json({ success: false, error: 'Parâmetros de paginação inválidos.' });
            }

            const exercises = await exerciseModel.findAll({
                search,
                difficulty,
                stack,
                tag,
                limit: parsedLimit,
                offset: parsedOffset
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
                exercise = await exerciseModel.findById(parseInt(id));
            } else {
                exercise = await exerciseModel.findBySlug(id);
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

            if (!isValidExerciseInput({ title, summary, statement, difficulty })) {
                return res.status(400).json({
                    success: false,
                    error: 'Preencha todos os campos obrigatórios (título, resumo, enunciado, dificuldade).'
                });
            }

            let imageUrl = '/images/image-preview.svg'; // Imagem padrão
            if (req.files && req.files['image'] && req.files['image'].length > 0) {
                const file = req.files['image'][0];
                const savedImage = await saveFile(file, 'images');
                imageUrl = savedImage.url;
            }

            const parsedTags = parseIdList(tags);
            const parsedStacks = parseIdList(stacks);
            if (!parsedTags || !parsedStacks) {
                return res.status(400).json({ success: false, error: 'Tags ou stacks inválidas.' });
            }

            const exercise = await exerciseModel.create({
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
                    const savedAttachment = await saveFile(attFile, 'attachments');
                    await attachmentModel.create({
                        exercise_id: exercise.id,
                        original_name: attFile.originalname,
                        stored_filename: savedAttachment.filename,
                        file_path: savedAttachment.url,
                        mime_type: attFile.mimetype,
                        file_size: attFile.size
                    });
                }
            }

            const updatedExercise = await exerciseModel.findById(exercise.id);

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

            const existing = await exerciseModel.findById(parseInt(id));
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Exercício não encontrado.' });
            }

            let imageUrl = existing.image_url;
            if (req.files && req.files['image'] && req.files['image'].length > 0) {
                const file = req.files['image'][0];
                const savedImage = await saveFile(file, 'images');
                imageUrl = savedImage.url;
            }

            const parsedTags = tags !== undefined ? parseIdList(tags) : undefined;
            const parsedStacks = stacks !== undefined ? parseIdList(stacks) : undefined;
            if (parsedTags === null || parsedStacks === null ||
                (title !== undefined && typeof title !== 'string') ||
                (summary !== undefined && typeof summary !== 'string') ||
                (statement !== undefined && typeof statement !== 'string')) {
                return res.status(400).json({ success: false, error: 'Dados do exercício inválidos.' });
            }

            const updated = await exerciseModel.update(parseInt(id), {
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
                    const savedAttachment = await saveFile(attFile, 'attachments');
                    await attachmentModel.create({
                        exercise_id: id,
                        original_name: attFile.originalname,
                        stored_filename: savedAttachment.filename,
                        file_path: savedAttachment.url,
                        mime_type: attFile.mimetype,
                        file_size: attFile.size
                    });
                }
            }

            const finalExercise = await exerciseModel.findById(parseInt(id));

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
            const exercise = await exerciseModel.findById(parseInt(id));
            if (!exercise) {
                return res.status(404).json({ success: false, error: 'Exercício não encontrado.' });
            }

            // Remove attachment files from disk
            if (exercise.attachments && exercise.attachments.length > 0) {
                for (const att of exercise.attachments) {
                    await deleteFile(att.file_path);
                }
            }

            await exerciseModel.delete(parseInt(id));

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
            const attachment = await attachmentModel.findById(parseInt(attachmentId));
            if (!attachment) {
                return res.status(404).json({ success: false, error: 'Anexo não encontrado.' });
            }

            await deleteFile(attachment.file_path);

            await attachmentModel.delete(parseInt(attachmentId));

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
            const stats = await exerciseModel.getStats();
            return res.json({
                success: true,
                data: stats
            });
        } catch (err) {
            next(err);
        }
    }
}

function isValidExerciseInput({ title, summary, statement, difficulty }) {
    return typeof title === 'string' && title.trim().length > 0 && title.length <= 150 &&
        typeof summary === 'string' && summary.trim().length > 0 && summary.length <= 500 &&
        typeof statement === 'string' && statement.trim().length > 0 && statement.length <= 50000 &&
        ['Fácil', 'Médio', 'Difícil'].includes(difficulty);
}

function parseIdList(value) {
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const ids = values.map(item => Number(item));
    return ids.every(id => Number.isInteger(id) && id > 0) ? ids : null;
}

module.exports = exerciseController;
