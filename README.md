<div align="center">

# CodeCase

### Exercícios de programação. Um lugar para praticar.

[![Live](https://img.shields.io/badge/Live-codecase--dev.vercel.app-f05f6d?style=flat-square)](https://codecase-dev.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-f05f6d?style=flat-square\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square\&logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-f05f6d?style=flat-square)](LICENSE)

<br>

</div>

---

## `> o que é?`

O **CodeCase** é um hub de exercícios de programação.

A proposta é simples: reunir desafios em um só lugar e tornar mais fácil encontrar algo interessante para resolver, seja por **dificuldade**, **stack** ou **tema**.

Cada exercício possui seu próprio conteúdo, podendo incluir descrição, tecnologias relacionadas, tags, imagens e arquivos complementares.

---

## `> dentro do CodeCase`

<table>
<tr>
<td width="50%">

### Explorar

Navegue pelos exercícios disponíveis e encontre desafios de acordo com aquilo que você quer praticar.

**Filtros por:**

`dificuldade` · `stack` · `tags`

</td>
<td width="50%">

### Exercícios

Cada desafio possui uma página própria com as informações necessárias para começar a resolver.

`fácil` · `médio` · `difícil`

</td>
</tr>

<tr>
<td width="50%">

### Materiais

Exercícios podem incluir arquivos complementares, como códigos-fonte, PDFs e outros recursos.

</td>
<td width="50%">

### Administração

Um painel administrativo permite criar, editar e organizar os conteúdos publicados na plataforma.

</td>
</tr>
</table>

---

## `> stack`

O CodeCase foi construído sem uma camada de framework no frontend. A ideia é manter a aplicação simples, entendível e próxima das tecnologias fundamentais da web.

```text
FRONTEND
HTML · CSS · JavaScript

BACKEND
Node.js · Express

DATABASE
PostgreSQL

TOOLS
Multer · bcryptjs · Slugify

DEPLOY
Vercel
```

A aplicação segue uma organização inspirada em **MVC**, separando responsabilidades entre `controllers`, `models`, `routes`, `services` e `middlewares`.

---

## `> estrutura`

```text
codecase/
│
├── public/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── uploads/
│
├── src/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── views/
│   └── app.js
│
├── config/
├── database/
│
├── database.sql
├── package.json
└── vercel.json
```

---

## `> banco de dados`

O banco organiza a plataforma em entidades independentes para manter os exercícios e seus relacionamentos.

```text
administrators

exercises
   ├── exercise_tags ─── tags
   ├── exercise_stacks ─ stacks
   └── attachments
```

Os exercícios podem se relacionar com múltiplas **tags** e **stacks**, enquanto os anexos ficam vinculados diretamente a cada exercício.

---

## `> api`

A plataforma possui uma API para seus principais recursos.

### Exercises

```http
GET    /api/exercises
GET    /api/exercises/:id

POST   /api/exercises
PUT    /api/exercises/:id
DELETE /api/exercises/:id
```

A listagem pública aceita filtros de **dificuldade**, **stack**, **tag** e **busca**.

### Tags & Stacks

```http
GET  /api/tags
GET  /api/stacks

POST /api/tags
POST /api/stacks
```

### Authentication

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

As operações administrativas são protegidas por autenticação.

---

## `> rodando localmente`

### requisitos

```text
Node.js 18+
npm
PostgreSQL
```

### setup

```bash
git clone https://github.com/dev-kauams/codecase.git
cd codecase

npm install
```

Crie seu `.env` usando `.env.example` como referência e configure as variáveis necessárias para o seu ambiente.

Depois:

```bash
npm run init-db
npm run dev
```

A aplicação estará disponível localmente na porta configurada pela aplicação.

### scripts

```bash
npm run dev
npm start
npm run init-db
```

---

## `> contribuindo`

Encontrou um problema?

Tem uma ideia para melhorar o projeto?

Abra uma **Issue** ou envie um **Pull Request**.

Contribuições, sugestões e feedbacks são bem-vindos.

---

<div align="center">

# `CODECASE`

<br>

[Website](https://codecase-dev.vercel.app) · [Github](https://github.com/dev-kauams/codecase)

<br>

## Desenvolvido por <a href="https://github.com/dev-kauams">@dev-kauams</a>

</div>
