const authMiddleware = (req, res, next) => {
    const adminUser = req.cookies.codecase_admin_user;

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
        req.user = JSON.parse(adminUser);
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
