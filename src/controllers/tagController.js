const tagModel = require('../models/tagModel');

class tagController {
    static async getAll(req, res, next) {
        try {
            const tags = await tagModel.getAll();
            return res.json({
                success: true,
                data: tags
            });
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { name } = req.body;
            if (typeof name !== 'string' || name.trim() === '' || name.trim().length > 50) {
                return res.status(400).json({ success: false, error: 'O nome da tag é obrigatório.' });
            }

            const existing = await tagModel.getAll();
            const lowerName = name.trim().toLowerCase();
            if (existing.some(t => t.name.toLowerCase() === lowerName)) {
                return res.status(400).json({ success: false, error: 'Esta tag já existe.' });
            }

            const newTag = await tagModel.create({ name: name.trim() });
            return res.status(201).json({
                success: true,
                message: 'Tag criada com sucesso!',
                data: newTag
            });
        } catch (err) {
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            const tag = await tagModel.findById(Number(req.params.id));
            if (!tag) return res.status(404).json({ success: false, error: 'Tag não encontrada.' });
            await tagModel.delete(tag.id);
            return res.json({ success: true, message: 'Tag excluída.' });
        } catch (err) { next(err); }
    }
}

module.exports = tagController;
