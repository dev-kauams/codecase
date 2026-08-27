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
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
                <h1 style="font-size: 1.5rem;">[ Erro no sistema: ${status}</h1>
                <p style="margin: 16px 0;">${message}</p>
                <a href="/">Voltar</a>
        </body>
        </html>
    `);
};

module.exports = errorHandler;
