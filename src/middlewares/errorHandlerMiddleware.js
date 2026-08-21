const errorHandler = (err, req, res, next) => {
    console.error('[Error Handler]', err);

    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    const message = err.message || 'Ocorreu um erro interno no servidor.';

    if (req.originalUrl.startsWith('/api/')) {
        return res.status(status).json({
            success: false,
            error: message
        });
    }

    res.status(status).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>CodeCase - Erro ${status}</title>
            <link rel="stylesheet" href="/css/main.css">
            <link rel="stylesheet" href="/css/retro-grid.css">
        </head>
        <body class="retro-grid">
            <div style="max-width: 600px; margin: 80px auto; padding: 24px; border: 3px double var(--accent-red); background: var(--bg-surface); color: var(--text-main); font-family: monospace;">
                <h1 style="color: var(--accent-red); font-size: 1.5rem;">[ ERRO SISTÊMICO ${status} ]</h1>
                <p style="margin: 16px 0;">${message}</p>
                <a href="/" style="display: inline-block; border: 3px double var(--border-color); padding: 8px 16px; color: var(--accent-green); text-decoration: none; font-weight: bold;">← RETORNAR AO HUB</a>
            </div>
        </body>
        </html>
    `);
};

module.exports = errorHandler;
