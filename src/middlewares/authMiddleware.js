const adminModel = require('../models/adminModel');

const authMiddleware = async (req, res, next) => {
    const adminUser = req.signedCookies.codecase_admin_user;

    if (!adminUser) {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                error: 'Acesso negado. Autenticação administrativa necessária.'
            });
        }
        return res.redirect('/admin/login');
    }

    try {
        const user = JSON.parse(adminUser);
        if (!user.id || !user.username) throw new Error('Sessão inválida.');

        const admin = await adminModel.findById(Number(user.id));
        if (!admin || admin.username !== user.username) throw new Error('Sessão inválida.');

        req.user = admin;
        next();
    } catch (e) {
        res.clearCookie('codecase_admin_user');
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ success: false, error: 'Sessão inválida.' });
        }
        return res.redirect('/admin/login');
    }
};

module.exports = authMiddleware;
