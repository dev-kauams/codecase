const AuthService = require('../services/authService');

class AuthController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const admin = await AuthService.authenticateAdmin(username, password);

            res.cookie('aether_admin_user', JSON.stringify(admin), {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'strict'
            });

            return res.json({
                success: true,
                message: 'Autenticação realizada com sucesso.',
                user: admin
            });
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: err.message
            });
        }
    }

    static async logout(req, res) {
        res.clearCookie('aether_admin_user');
        return res.json({
            success: true,
            message: 'Sessão encerrada com sucesso.'
        });
    }

    static async getMe(req, res) {
        if (req.user) {
            return res.json({ success: true, user: req.user });
        }
        return res.status(401).json({ success: false, error: 'Não autenticado.' });
    }
}

module.exports = AuthController;
