const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const initDb = require('./database/initDb');
const viewRoutes = require('./routes/viewRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandlerMiddleware');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

(async () => {
    try {
        await initDb();
        console.log('[App] Database initialized successfully.');
    } catch (err) {
        console.error('[App] Failed to initialize database:', err);
        process.exit(1);
    }
})();

app.set('port', PORT);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || undefined));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>CodeCase - 404</title>
        </head>
        <body>
            <h1>[ 404 ] Página não encontrada</h1>
            <p>O caminho solicitado não existe neste Scriptorium.</p>
            <a href="/">← Voltar ao início</a>
        </body>
        </html>
    `);
});

app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[App] CodeCase running on http://localhost:${PORT}`);
    });
}

module.exports = app;
