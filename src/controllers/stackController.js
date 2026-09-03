const stackModel = require('../models/stackModel');

class stackController {
    static async getAll(req, res, next) {
        try {
            const stacks = await stackModel.getAll();
            return res.json({
                success: true,
                data: stacks
            });
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { name, color } = req.body;
            if (!name || name.trim() === '') {
                return res.status(400).json({ success: false, error: 'O nome da stack é obrigatório.' });
            }

            const existing = await stackModel.getAll();
            const lowerName = name.trim().toLowerCase();
            if (existing.some(s => s.name.toLowerCase() === lowerName)) {
                return res.status(400).json({ success: false, error: 'Esta stack já existe.' });
            }

            const newStack = await stackModel.create({ name: name.trim(), color });
            return res.status(201).json({
                success: true,
                message: 'Stack criada com sucesso!',
                data: newStack
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = stackController;
