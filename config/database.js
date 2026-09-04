let dbInstance = null;

async function getDatabase() {
    if (dbInstance) return dbInstance;

    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL não configurada. Crie uma conexão Neon para executar a aplicação.');
    }

    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    dbInstance = {
        async query(queryText, params = []) {
            return sql.query(toPostgresPlaceholders(queryText), params);
        },

        async queryOne(queryText, params = []) {
            const results = await this.query(queryText, params);
            return results.length > 0 ? results[0] : null;
        },

        async execute(queryText, params = []) {
            const result = await sql.query(toPostgresPlaceholders(queryText), params);
            return {
                lastInsertRowid: result[0]?.id || 0,
                changes: result.length
            };
        },

        async execScript(sqlScript) {
            for (const statement of sqlScript.split(';').map(item => item.trim()).filter(Boolean)) {
                await sql.query(statement);
            }
        }
    };

    return dbInstance;
}

module.exports = {
    getDatabase
};

function toPostgresPlaceholders(queryText) {
    let index = 0;
    return queryText.replace(/\?/g, () => `$${++index}`).replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
}
