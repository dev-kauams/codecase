const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const viewRoutes = require('./routes/viewRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandlerMiddleware');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const cookieSecret = process.env.COOKIE_SECRET;

if (process.env.NODE_ENV === 'production' && (!cookieSecret || cookieSecret.length < 32)) {
    throw new Error('COOKIE_SECRET precisa ter pelo menos 32 caracteres em produção.');
}
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false
});

app.set('trust proxy', 1);

app.set('port', PORT);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(cookieSecret));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use((req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

    const origin = req.get('origin');
    if (origin && origin !== `${req.protocol}://${req.get('host')}`) {
        return res.status(403).json({ success: false, error: 'Origem da requisição não permitida.' });
    }
    next();
});

app.use('/uploads/attachments', express.static(path.join(__dirname, '../public/uploads/attachments'), {
    setHeaders: response => {
        response.setHeader('Content-Disposition', 'attachment');
        response.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));
app.use('/uploads/images', express.static(path.join(__dirname, '../public/uploads/images'), {
    setHeaders: response => response.setHeader('X-Content-Type-Options', 'nosniff')
}));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api', apiLimiter, apiRoutes);
app.use('/', viewRoutes);

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>CodeCase</title>
        </head>
        <body>
            <h1>404 - Página não encontrada</h1>
            <p>O caminho solicitado não existe no CodeCase.</p>
            <a href="/">Voltar ao início</a>
        </body>
        </html>
    `);
});

app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[App] CodeCase rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;
