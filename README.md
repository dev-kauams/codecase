> Esse README foi montado com ajuda de IA pra já deixar o repo com uma documentação mínima. Em breve pretendo reescrever com calma, com mais contexto e do meu jeito.
>
> Projeto também ainda tá em andamento: parte do design e algumas funções estão incompletas. A ideia é finalizar isso em algumas semanas.

# CodeCase

CodeCase é uma plataforma pra centralizar exercícios de programação: um lugar único onde dá pra navegar, filtrar e resolver desafios técnicos organizados por dificuldade, stack e tags. Tem também um painel de admin pra cadastrar e gerenciar tudo isso — exercícios, tags, stacks, anexos (código-fonte, PDF, ZIP), capa, etc.

Autor: [@dev-kauams](https://github.com/dev-kauams) · Licença: MIT · Arquitetura: MVC

Sumário: [Stack](#stack) · [Estrutura](#estrutura) · [Banco de dados](#banco-de-dados) · [Rodando localmente](#rodando-localmente) · [Login de dev](#login-de-dev) · [Endpoints](#endpoints)

## Stack

No backend é Node + Express, seguindo MVC mesmo (controllers, models, routes separados). O banco é SQL (sql.js/SQLite), com prepared statements e FKs. Senha de admin passa por bcrypt, e a sessão é via cookie HTTP-only. Upload de arquivo é tratado com Multer.

No frontend não tem framework — HTML semântico, CSS puro (grid/flexbox, variáveis CSS) e JS vanilla pra filtros, AJAX e manipulação de DOM. A estética é retro/terminal de propósito: bordas duplas, fundo em grid sutil e fonte monoespaçada (JetBrains Mono / Fira Code).

## Estrutura

```
codecase/
├── config/database.js        # conexão com o banco
├── database.sql               # schema + seed
├── public/
│   ├── css/                   # arquivos snake_case (style.css, admin_dashboard.css, etc.)
│   ├── js/                    # arquivos e código camelCase (adminDashboard.js, exerciseDetail.js, etc.)
│   ├── images/                # assets em kebab-case
│   └── uploads/                # onde vão as imagens/anexos enviados
├── src/
│   ├── app.js
│   ├── controllers/           # auth, exercise, tag, stack, view (camelCase)
│   ├── database/initDb.js     # inicializa o banco
│   ├── middlewares/           # auth, upload, tratamento de erro
│   ├── models/                # adminModel, exerciseModel, tagModel, stackModel, attachmentModel
│   ├── routes/                # api, auth, view
│   └── views/pages/           # home, exercise, login, admin_*
├── .env.example
└── package.json
```

## Banco de dados

Tabelas principais: `administrators` (senha em hash), `exercises` (título, slug, resumo, enunciado, dificuldade, capa), `tags`/`exercise_tags` e `stacks`/`exercise_stacks` (relações N:N) e `attachments` (arquivos ligados a cada exercício). Schema completo em `database.sql`.

## Rodando localmente

Precisa de Node 18+.

```bash
git clone https://github.com/dev-kauams/codecase.git
cd codecase
npm install
cp .env.example .env
```

Preencha o `.env` (porta, `JWT_SECRET`, `COOKIE_SECRET`, usuário/senha de admin — troque os secrets se for além de local). Depois:

```bash
npm run init-db   # cria as tabelas e roda o seed
npm run dev        # ou npm start, em produção
```

Abre em `http://localhost:6700`.

## Login de dev

Usuário `admin`, senha `admin123` (só o seed local, óbvio — não usar isso fora do ambiente de dev).

## Endpoints

Público:
- `GET /api/exercises` — lista exercícios (aceita `difficulty`, `stack`, `tag`, `search`)
- `GET /api/exercises/:id` — detalhe por id ou slug
- `GET /api/tags` / `GET /api/stacks`

Admin (autenticado):
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/admin/stats`
- `POST /api/exercises`, `PUT /api/exercises/:id`, `DELETE /api/exercises/:id`
- `POST /api/tags`, `POST /api/stacks`
