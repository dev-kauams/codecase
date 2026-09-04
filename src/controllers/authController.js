const authService = require('../services/authService');

class authController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const admin = await authService.authenticateAdmin(username, password);

            res.cookie('codecase_admin_user', JSON.stringify(admin), {
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'strict'
            });

            return res.json({
                success: true,
                message: 'Autenticação realizada com sucesso.',
                user: admin
            });
        } catch (err) {
            console.error('[Auth] Falha no login:', err);
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas.'
            });
        }
    }

    static async logout(req, res) {
        res.clearCookie('codecase_admin_user', {
            httpOnly: true,
            signed: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
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

module.exports = authController;
