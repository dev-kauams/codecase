const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { getDatabase } = require('../../config/database');

async function initDb() {
    console.log('[Database] Começando inicialização...');
    try {
        const db = await getDatabase();
        const sqlPath = path.join(__dirname, '../../database.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`database.sql não encontrado em ${sqlPath}`);
        }

        const sqlScript = fs.readFileSync(sqlPath, 'utf-8');
        await db.execScript(sqlScript);

        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        if (!username || !password) {
            throw new Error('ADMIN_USERNAME e ADMIN_PASSWORD precisam estar configurados.');
        }

        const existingAdmin = await db.queryOne('SELECT id FROM administrators WHERE username = ?', [username]);
        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash(password, 10);
            await db.execute(
                'INSERT INTO administrators (username, email, password_hash) VALUES (?, ?, ?) RETURNING id',
                [username, process.env.ADMIN_EMAIL || `${username}@codecase.dev`, passwordHash]
            );
        }
        
        console.log('[Database] Tabelas e dados inicializados com sucesso.');
    } catch (err) {
        console.error('[Database] Erro de inicialização:', err);
        throw err;
    }
}

if (require.main === module) {
    initDb().catch(() => process.exitCode = 1);
}

module.exports = initDb;
