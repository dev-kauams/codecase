-- ===================================================
-- Codecase - Database Schema & Seed Script
-- Author: @dev-kauams
-- ===================================================

-- 1. Administrators Table
CREATE TABLE IF NOT EXISTS administrators (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    statement TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Fácil', 'Médio', 'Difícil')),
    image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for exercises search & filtering performance
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON exercises(created_at);
CREATE INDEX IF NOT EXISTS idx_exercises_title ON exercises(title);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

-- 4. Exercise Tags Pivot Table
CREATE TABLE IF NOT EXISTS exercise_tags (
    exercise_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (exercise_id, tag_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exercise_tags_exercise ON exercise_tags(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_tags_tag ON exercise_tags(tag_id);

-- 5. Stacks Table
CREATE TABLE IF NOT EXISTS stacks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#f05f6d'
);

-- 6. Exercise Stacks Pivot Table
CREATE TABLE IF NOT EXISTS exercise_stacks (
    exercise_id INTEGER NOT NULL,
    stack_id INTEGER NOT NULL,
    PRIMARY KEY (exercise_id, stack_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (stack_id) REFERENCES stacks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exercise_stacks_exercise ON exercise_stacks(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_stacks_stack ON exercise_stacks(stack_id);

-- 7. Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attachments_exercise ON attachments(exercise_id);


-- -- Stacks Seed
-- INSERT INTO stacks (name, slug, color) VALUES
-- ('HTML', 'html', '#f05f6d'),
-- ('CSS', 'css', '#ff8f84'),
-- ('JavaScript', 'javascript', '#f3a5ac'),
-- ('Node.js', 'nodejs', '#b94f60'),
-- ('SQL', 'sql', '#df7582'),
-- ('Python', 'python', '#c85b6b'),
-- ('Java', 'java', '#a9364d'),
-- ('C', 'c', '#ee6f7d'),
-- ('C++', 'cpp', '#784853');

-- -- Tags Seed
-- INSERT INTO tags (name, slug) VALUES
-- ('Autenticação', 'autenticacao'),
-- ('Formulários', 'formularios'),
-- ('DOM', 'dom'),
-- ('Arrays', 'arrays'),
-- ('Manipulação de Strings', 'manipulacao-de-strings'),
-- ('Algoritmos', 'algoritmos'),
-- ('Banco de Dados', 'banco-de-dados'),
-- ('CRUD', 'crud'),
-- ('Async/Await', 'async-await'),
-- ('Estrutura de Dados', 'estrutura-de-dados');

-- -- Seed Exercise Tags
-- INSERT INTO exercise_tags (exercise_id, tag_id) VALUES
-- (1, 1), -- Autenticação
-- (1, 2), -- Formulários
-- (1, 3), -- DOM
-- (2, 4), -- Arrays
-- (2, 6), -- Algoritmos
-- (2, 10), -- Estrutura de Dados
-- (3, 7), -- Banco de Dados
-- (3, 8), -- CRUD
-- (4, 5), -- Manipulação de Strings
-- (4, 6); -- Algoritmos

-- -- Seed Exercise Stacks
-- INSERT INTO exercise_stacks (exercise_id, stack_id) VALUES
-- (1, 1), -- HTML
-- (1, 2), -- CSS
-- (1, 3), -- JS
-- (1, 4), -- Node.js
-- (2, 3), -- JS
-- (3, 5), -- SQL
-- (4, 9); -- C++
