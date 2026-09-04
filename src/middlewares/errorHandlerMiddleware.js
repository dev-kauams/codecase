const errorHandler = (err, req, res, next) => {
    console.error('[Error Handler]', err);

    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    const message = status >= 500 ? 'Ocorreu um erro interno no servidor.' : (err.message || 'Requisição inválida.');

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
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
                <h1 style="font-size: 1.5rem;">[ Erro no sistema: ${status}</h1>
                <p style="margin: 16px 0;">${escapeHtml(message)}</p>
                <a href="/">Voltar</a>
        </body>
        </html>
    `);
};

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
}

module.exports = errorHandler;
