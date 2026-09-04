const bcrypt = require('bcryptjs');
const adminModel = require('../models/adminModel');

class authService {
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    static async authenticateAdmin(username, password) {
        if (!username || !password) {
            throw new Error('Usuário e senha são obrigatórios.');
        }

        const admin = await adminModel.findByUsername(username);
        if (!admin) {
            throw new Error('Credenciais inválidas.');
        }

        const isMatch = await this.comparePassword(password, admin.password_hash);
        if (!isMatch) {
            throw new Error('Credenciais inválidas.');
        }

        return {
            id: admin.id,
            username: admin.username,
            email: admin.email
        };
    }
}

module.exports = authService;
