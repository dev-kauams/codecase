*README.md à ser alterado, mas por hora está com estrutura gerada por Inteligência Artificial - certas informações podem estar incorretas.*


# CodeCase ⚡

> Plataforma Web Full Stack Profissional para Centralização, Organização e Disponibilização de Exercícios de Programação.

**Autor:** `@dev-kauams`  
**Arquitetura:** MVC (Model-View-Controller)  
**Licença:** MIT  

---

## 📋 Visão Geral

O **CodeCase** é um hub completo para centralizar e publicar desafios técnicos e exercícios de programação. A plataforma permite que usuários naveguem, pesquisem e filtrem exercícios por nível de dificuldade, stack tecnológica ou tags de conhecimento.

Um painel administrativo protegido permite o gerenciamento completo (CRUD) de exercícios, inclusão de tags/stacks dinâmicas, upload de imagens de capa e anexos de arquivos complementares (códigos-fonte, PDFs, arquivos ZIP).

---

## 🎨 Identidade Visual & Estética

- **Retro & Técnica**: Inspirada em terminais técnicos e sistemas clássicos.
- **Double Borders**: Bordas marcantes no estilo `border: 3px double`.
- **Background Grid**: Padrão de grade sutil gerado puramente em CSS (`linear-gradient`).
- **Tipografia Técnica**: Monospaced (`JetBrains Mono`, `Fira Code`).
- **Layout Responsivo**: Adaptado para Smartphones, Tablets, Notebooks e Desktops.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js**: Ambiente de execução JavaScript servidor.
- **Express.js**: Roteamento e arquitetura HTTP MVC.
- **SQL (sql.js / SQLite)**: Banco de dados SQL relacional com prepared statements e chaves estrangeiras.
- **Bcrypt.js**: Criptografia e hashing seguro de senhas administrativas.
- **Cookie-Parser & Auth**: Sessões administrativas protegidas por cookies HTTP-Only.
- **Multer**: Gerenciamento e sanitização de upload de arquivos e imagens.

### Frontend
- **HTML5 Semântico**: Estrutura acessível com tags semânticas.
- **CSS3 Vanilla**: Estilização com variáveis CSS, CSS Grid, Flexbox e visual retro.
- **JavaScript Vanilla (ES6+)**: Manipulação de DOM, filtros assíncronos e AJAX.

---

## 🏗️ Arquitetura do Projeto (MVC)

```text
codecase/
├── config/
│   └── database.js               # Conexão e persistência do banco SQL
├── database.sql                  # Schema SQL e dados iniciais (Seed)
├── public/
│   ├── css/
│   │   ├── retro-grid.css        # Padrão de fundo em grid CSS
│   │   ├── main.css              # Variáveis, tipografia e double-borders
│   │   ├── components.css        # Cards, filtros, badges e leitor de markdown
│   │   └── admin.css             # Tabelas, métricas e formulários do admin
│   ├── js/
│   │   ├── main.js               # Notificações toast e utilitários globais
│   │   ├── filters.js            # Filtros dinâmicos e sincronização de URL
│   │   ├── exercise-detail.js    # Leitor de detalhes do exercício e anexos
│   │   ├── admin-dashboard.js   # Painel e gerenciamento de exercícios
│   │   └── admin-form.js        # Formulário multipart para criar/editar
│   ├── images/                   # Imagens e ilustrações técnicas SVG
│   └── uploads/                  # Uploads seguros (images e attachments)
├── src/
│   ├── app.js                    # Inicialização do servidor Express
│   ├── controllers/
│   │   ├── authController.js     # Controller de Autenticação
│   │   ├── exerciseController.js # Controller de Exercícios
│   │   ├── tagController.js      # Controller de Tags
│   │   ├── stackController.js    # Controller de Stacks
│   │   └── viewController.js     # Controller de Renderização de Páginas
│   ├── database/
│   │   └── initDb.js             # Script de inicialização automática do SQL
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Proteção de rotas administrativas
│   │   ├── uploadMiddleware.js   # Validação e upload de arquivos
│   │   └── errorHandlerMiddleware.js # Tratamento centralizado de erros
│   ├── models/
│   │   ├── AdminModel.js         # Model SQL do Administrador
│   │   ├── ExerciseModel.js      # Model SQL de Exercícios (JOINs & Filtros)
│   │   ├── TagModel.js           # Model SQL de Tags
│   │   ├── StackModel.js         # Model SQL de Stacks
│   │   └── AttachmentModel.js    # Model SQL de Anexos
│   ├── routes/
│   │   ├── apiRoutes.js          # Endpoints REST públicos e administrativos
│   │   ├── authRoutes.js         # Rotas de login e logout
│   │   └── viewRoutes.js         # Rotas de navegação frontend
│   └── views/
│       └── pages/
│           ├── home.html         # Homepage pública com filtros e cards
│           ├── exercise.html     # Leitor do exercício com código e anexos
│           ├── login.html        # Autenticação de administrador
│           ├── admin-dashboard.html # Painel administrativo e métricas
│           └── admin-exercise-form.html # Criar e Editar exercício
├── .env.example
├── package.json
└── README.md
```

---

## 🗄️ Esquema do Banco de Dados SQL

O projeto utiliza um banco de dados SQL normalizado (`database.sql`):

- **`administrators`**: Usuários administradores com senhas hash `bcrypt`.
- **`exercises`**: Registro principal dos exercícios (título, slug, resumo, enunciado, dificuldade, capa).
- **`tags`** & **`exercise_tags`**: Relacionamento N:N para temas e tópicos.
- **`stacks`** & **`exercise_stacks`**: Relacionamento N:N para linguagens e tecnologias.
- **`attachments`**: Registro de arquivos complementares associados a cada exercício.

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- **Node.js** v18 ou superior instalado.
- **npm** instalado.

### 1. Clonar / Acessar o Repositório
```bash
cd codecase
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Conteúdo do `.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=aether_home_super_secret_jwt_key_2026_dev_kauams
COOKIE_SECRET=aether_home_cookie_secret_key_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Inicializar o Banco de Dados SQL
Execute o script para criar a estrutura de tabelas e inserir a carga inicial (seed):
```bash
npm run init-db
```

### 5. Iniciar a Aplicação
Modo Produção:
```bash
npm start
```
Modo Desenvolvimento (Nodemon):
```bash
npm run dev
```

Acesse no navegador: **`http://localhost:3000`**

---

## 🔐 Credenciais de Desenvolvimento (Admin Seed)

| Usuário | Senha | Acesso |
| :--- | :--- | :--- |
| `admin` | `admin123` | Painel Administrativo (`/admin/login`) |

---

## 🔌 Principais Endpoints da API REST

### Públicos
- `GET /api/exercises` - Lista todos os exercícios (suporta query params: `difficulty`, `stack`, `tag`, `search`).
- `GET /api/exercises/:id` - Retorna detalhes do exercício por ID ou Slug.
- `GET /api/tags` - Lista todas as tags cadastradas.
- `GET /api/stacks` - Lista todas as stacks cadastradas.

### Administrativos (Exigem Autenticação)
- `POST /api/auth/login` - Autenticação administrativa.
- `POST /api/auth/logout` - Encerramento de sessão.
- `GET /api/auth/me` - Verifica sessão ativa.
- `GET /api/admin/stats` - Retorna contador estatístico do sistema.
- `POST /api/exercises` - Cadastra novo exercício com upload de imagem e anexos.
- `PUT /api/exercises/:id` - Atualiza exercício existente.
- `DELETE /api/exercises/:id` - Remove exercício e seus anexos do disco.
- `POST /api/tags` - Cadastra nova tag.
- `POST /api/stacks` - Cadastra nova stack.

---

## 👤 Autor

**@dev-kauams**  
*Desenvolvido com foco em arquitetura limpa, código sustentável e estética técnica retro.*
