const bcrypt = require('bcryptjs');
const AdminModel = require('../models/AdminModel');

const JWT_SECRET = process.env.JWT_SECRET || 'codecase_secret_key_2026';

class AuthService {
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

        const admin = await AdminModel.findByUsername(username);
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

module.exports = AuthService;
