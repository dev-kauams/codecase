const fs = require('fs');
const path = require('path');
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
        db.execScript(sqlScript);
        
        console.log('[Database] Tabelas e dados inicializados com sucesso.');
    } catch (err) {
        console.error('[Database] Erro de inicialização:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    initDb();
}

module.exports = initDb;
