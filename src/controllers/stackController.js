const StackModel = require('../models/StackModel');

class StackController {
    static async getAll(req, res, next) {
        try {
            const stacks = await StackModel.getAll();
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

            const existing = await StackModel.getAll();
            const lowerName = name.trim().toLowerCase();
            if (existing.some(s => s.name.toLowerCase() === lowerName)) {
                return res.status(400).json({ success: false, error: 'Esta stack já existe.' });
            }

            const newStack = await StackModel.create({ name: name.trim(), color });
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

module.exports = StackController;
