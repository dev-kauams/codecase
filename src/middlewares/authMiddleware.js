const authMiddleware = (req, res, next) => {
    // Check session cookie or custom auth cookie
    const adminUser = req.cookies.aether_admin_user;

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
        res.clearCookie('aether_admin_user');
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ success: false, error: 'Sessão inválida.' });
        }
        return res.redirect('/admin/login');
    }
};

module.exports = authMiddleware;
