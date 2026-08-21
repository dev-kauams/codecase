const TagModel = require('../models/TagModel');

class TagController {
    static async getAll(req, res, next) {
        try {
            const tags = await TagModel.getAll();
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
            if (!name || name.trim() === '') {
                return res.status(400).json({ success: false, error: 'O nome da tag é obrigatório.' });
            }

            const existing = await TagModel.getAll();
            const lowerName = name.trim().toLowerCase();
            if (existing.some(t => t.name.toLowerCase() === lowerName)) {
                return res.status(400).json({ success: false, error: 'Esta tag já existe.' });
            }

            const newTag = await TagModel.create({ name: name.trim() });
            return res.status(201).json({
                success: true,
                message: 'Tag criada com sucesso!',
                data: newTag
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = TagController;
