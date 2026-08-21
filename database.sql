-- ===================================================
-- Aether Home - Database Schema & Seed Script
-- Author: @dev-kauams
-- ===================================================

-- Disable foreign key constraints during table creation
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS exercise_stacks;
DROP TABLE IF EXISTS exercise_tags;
DROP TABLE IF EXISTS stacks;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS administrators;

PRAGMA foreign_keys = ON;

-- 1. Administrators Table
CREATE TABLE administrators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exercises Table
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    statement TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Fácil', 'Médio', 'Difícil')),
    image_url VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for exercises search & filtering performance
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_created_at ON exercises(created_at);
CREATE INDEX idx_exercises_title ON exercises(title);

-- 3. Tags Table
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

-- 4. Exercise Tags Pivot Table
CREATE TABLE exercise_tags (
    exercise_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (exercise_id, tag_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_tags_exercise ON exercise_tags(exercise_id);
CREATE INDEX idx_exercise_tags_tag ON exercise_tags(tag_id);

-- 5. Stacks Table
CREATE TABLE stacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#00ffaa'
);

-- 6. Exercise Stacks Pivot Table
CREATE TABLE exercise_stacks (
    exercise_id INTEGER NOT NULL,
    stack_id INTEGER NOT NULL,
    PRIMARY KEY (exercise_id, stack_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (stack_id) REFERENCES stacks(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_stacks_exercise ON exercise_stacks(exercise_id);
CREATE INDEX idx_exercise_stacks_stack ON exercise_stacks(stack_id);

-- 7. Attachments Table
CREATE TABLE attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX idx_attachments_exercise ON attachments(exercise_id);


-- ===================================================
-- SEED DATA
-- Default Admin password: "admin123" (bcrypt hashed)
-- ===================================================

INSERT INTO administrators (username, email, password_hash) VALUES
('admin', 'admin@aetherhome.dev', '$2a$10$7RYCttBciKyPTLVe/3JsJ.BoCTpyocLiN7Of0/B34FyX9GdS.mqru');

-- Stacks Seed
INSERT INTO stacks (name, slug, color) VALUES
('HTML', 'html', '#e34f26'),
('CSS', 'css', '#1572b6'),
('JavaScript', 'javascript', '#f7df1e'),
('Node.js', 'nodejs', '#339933'),
('SQL', 'sql', '#00e5ff'),
('Python', 'python', '#3776ab'),
('Java', 'java', '#007396'),
('C', 'c', '#a8b9cc'),
('C++', 'cpp', '#00599c');

-- Tags Seed
INSERT INTO tags (name, slug) VALUES
('Autenticação', 'autenticacao'),
('Formulários', 'formularios'),
('DOM', 'dom'),
('Arrays', 'arrays'),
('Manipulação de Strings', 'manipulacao-de-strings'),
('Algoritmos', 'algoritmos'),
('Banco de Dados', 'banco-de-dados'),
('CRUD', 'crud'),
('Async/Await', 'async-await'),
('Estrutura de Dados', 'estrutura-de-dados');

-- Sample Exercises Seed
INSERT INTO exercises (id, title, slug, summary, statement, difficulty, image_url, created_at) VALUES
(
    1,
    'Sistema de Autenticação Retro',
    'sistema-de-autenticacao-retro',
    'Desenvolva um formulário de login com validação frontend e backend utilizando HTML, CSS e JavaScript.',
    '### Enunciado

Crie uma interface de autenticação utilizando **HTML, CSS e JavaScript** para o frontend e **Node.js** para o backend.

#### Requisitos Técnicos:
1. O formulário deve possuir campos para `email` e `senha`.
2. Valide se o formato do e-mail é válido antes do envio.
3. Exiba mensagens de erro dinâmicas em um painel retro estilizado com `border: 3px double`.
4. Ao enviar os dados com sucesso, simule uma requisição `POST /api/login` e armazene o token de sessão localmente.

```javascript
// Exemplo de verificação de e-mail no frontend
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```',
    'Fácil',
    '/public/images/sample-login.svg',
    '2026-08-10 10:00:00'
),
(
    2,
    'Filtro Dinâmico em Matrizes de Dados',
    'filtro-dinamico-em-matrizes-de-dados',
    'Implemente uma função em JavaScript para filtrar e ordenar uma lista complexa de objetos por múltiplos critérios.',
    '### Enunciado

Dado um array de objetos representando dados de sensores em um sistema técnico, crie uma função `filterSystemLogs(logs, criteria)` que filtre os registros de acordo com os seguintes campos:

- `severity`: ("low", "medium", "critical")
- `timestampRange`: [startTime, endTime]
- `searchQuery`: busca textual nas mensagens de log

#### Exemplo de Entrada:
```javascript
const logs = [
  { id: 1, severity: "critical", msg: "Kernel panic", time: 1600000000 },
  { id: 2, severity: "low", msg: "System check OK", time: 1600000500 }
];
```

#### Desafio Extra:
Garanta complexidade O(N) para a filtragem e ordenação decrescente por timestamp.',
    'Médio',
    NULL,
    '2026-08-11 14:30:00'
),
(
    3,
    'Modelagem SQL e Consultas Relacionais Complexas',
    'modelagem-sql-e-consultas-relacionais-complexas',
    'Crie tabelas normalizadas e escreva queries SQL avançadas com JOIN, GROUP BY e subqueries.',
    '### Enunciado

Construa um script SQL para um sistema de controle de inventário técnico.

#### Tarefas:
1. Crie as tabelas `equipamentos`, `manutencoes` e `tecnicos` com chaves primárias e estrangeiras apropriadas.
2. Escreva uma consulta SQL que retorne o nome do técnico, a quantidade de manutenções realizadas nos últimos 30 dias e o custo total acumulado.

```sql
SELECT 
    t.nome AS tecnico,
    COUNT(m.id) AS total_manutencoes,
    SUM(m.custo) AS custo_total
FROM tecnicos t
JOIN manutencoes m ON t.id = m.tecnico_id
WHERE m.data >= DATE("now", "-30 days")
GROUP BY t.id
ORDER BY custo_total DESC;
```',
    'Difícil',
    '/public/images/sample-sql.svg',
    '2026-08-12 09:15:00'
),
(
    4,
    'Conversor de Bases Numéricas em C++',
    'conversor-de-bases-numericas-em-cpp',
    'Desenvolva um programa CLI para converter números entre as bases Binária, Octal, Decimal e Hexadecimal.',
    '### Enunciado

Escreva um programa em **C++** que leia um número inteiro positivo na base decimal e exiba sua representação em:
1. Binário
2. Octal
3. Hexadecimal (em maiúsculas)

#### Requisitos:
- Utilize operações bitwise (`&`, `>>`, `|`) para a conversão binária.
- Formate a saída em colunas alinhadas com bordas ASCII.

```cpp
#include <iostream>
#include <bitset>
#include <iomanip>

int main() {
    int value = 255;
    std::cout << "Bin: " << std::bitset<16>(value) << std::endl;
    std::cout << "Hex: 0x" << std::hex << std::uppercase << value << std::endl;
    return 0;
}
```',
    'Fácil',
    NULL,
    '2026-08-12 11:00:00'
);

-- Seed Exercise Tags
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES
(1, 1), -- Autenticação
(1, 2), -- Formulários
(1, 3), -- DOM
(2, 4), -- Arrays
(2, 6), -- Algoritmos
(2, 10), -- Estrutura de Dados
(3, 7), -- Banco de Dados
(3, 8), -- CRUD
(4, 5), -- Manipulação de Strings
(4, 6); -- Algoritmos

-- Seed Exercise Stacks
INSERT INTO exercise_stacks (exercise_id, stack_id) VALUES
(1, 1), -- HTML
(1, 2), -- CSS
(1, 3), -- JS
(1, 4), -- Node.js
(2, 3), -- JS
(3, 5), -- SQL
(4, 9); -- C++
