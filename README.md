# JI Pisos Laminados — Sistema Web

Sistema web para a empresa **JI Pisos Laminados**, desenvolvido como parte do Projeto de Extensão II (FAETERJ-Rio, ADS). Permite que clientes solicitem orçamentos de instalação, manutenção e nivelamento de pisos laminados/vinílicos pelo site, e que a equipe da empresa acompanhe e atualize esses pedidos em um painel administrativo.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como instalar e executar](#como-instalar-e-executar)
- [Como usar o sistema](#como-usar-o-sistema)
- [Rotas da API](#rotas-da-api)
- [Banco de dados](#banco-de-dados)
- [Segurança](#segurança)
- [Checklist antes de colocar em produção](#checklist-antes-de-colocar-em-produção)
- [Equipe](#equipe)

---

## Funcionalidades

### Site institucional (área do cliente)

- **Página Inicial** — apresentação da empresa, destaque dos serviços e botões de chamada para ação (Solicitar Orçamento / Ver Serviços).
- **Página de Serviços** — detalhamento dos serviços oferecidos: instalação de piso laminado, manutenção e nivelamento de piso.
- **Cadastro e Login** — criação de conta e autenticação real (senha criptografada, sessão via cookie seguro).
- **Solicitação de Orçamento** — formulário com nome, telefone, tipo de ambiente, metragem, tipo de piso e descrição da necessidade. Funciona tanto para visitantes quanto para usuários logados.

### Painel Administrativo (`/admin.html`)

- Acesso restrito a usuários com permissão de **administrador** (visitantes são redirecionados para o login; clientes comuns são redirecionados para a home).
- **Dashboard** com totais: pedidos totais, pendentes, em andamento e concluídos.
- **Lista de pedidos** recebidos pelo site, com filtro por status.
- **Ver Detalhes** de cada pedido (cliente, telefone, ambiente, metragem, tipo de piso, descrição, status e data).
- **Atualizar Status** do pedido em um clique (Pendente → Em andamento → Concluído → Pendente).

### Backend / API

- Servidor **Node.js + Express** que serve o site e expõe uma API REST.
- Banco de dados **SQLite** real (arquivo local, sem depender de serviços externos).
- Autenticação com **JWT** em cookie `httpOnly` (o token não pode ser lido via JavaScript no navegador) e senhas com **hash bcrypt** (nunca armazenadas em texto puro).
- Regras de acesso aplicadas também no servidor (não só escondendo botões na tela) — ou seja, mesmo chamando a API diretamente, um cliente comum não consegue ver ou alterar pedidos de outras pessoas.

---

## Tecnologias utilizadas

| Camada       | Tecnologia |
|--------------|------------|
| Front-end    | HTML5, CSS3, JavaScript (vanilla, sem frameworks) |
| Back-end     | Node.js, Express 5 |
| Banco de dados | SQLite (via `better-sqlite3`) |
| Autenticação | JWT (`jsonwebtoken`) + cookies (`cookie-parser`) + hash de senha (`bcryptjs`) |
| Config       | `dotenv` (variáveis de ambiente) |
| Prototipação | Figma / Canva (fase inicial do projeto) |

---

## Estrutura do projeto

```
Projeto_de_extensao_jc/
├── index.html          # Página inicial (Home)
├── login.html          # Login / Criar Conta
├── orcamento.html      # Solicitar Orçamento
├── servicos.html       # Página de Serviços
├── admin.html          # Painel Administrativo
├── css/
│   └── style.css       # Estilo visual de todo o site
├── js/
│   └── main.js         # Lógica do front-end (chama a API via fetch)
├── assets/
│   ├── logo.png         # Logo da JI Decorações
│   └── img/              # Ilustrações usadas nas páginas
├── server/
│   ├── server.js         # Ponto de entrada do servidor Express
│   ├── db.js              # Conexão SQLite, schema e dados iniciais (seed)
│   ├── middleware/
│   │   └── auth.js         # JWT, cookies de sessão e guardas de acesso
│   └── routes/
│       ├── auth.js          # /api/auth/* (cadastro, login, logout, me)
│       └── pedidos.js        # /api/pedidos/* (criar, listar, detalhar, atualizar)
├── data/
│   └── ji.sqlite          # Banco de dados (criado automaticamente ao rodar)
├── .env                 # Variáveis de ambiente (porta, segredo do JWT, admin inicial)
├── package.json
└── README.md            # Este arquivo
```

---

## Como instalar e executar

### Pré-requisitos

- [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

### Passo a passo

1. Abra um terminal na pasta do projeto:
   ```bash
   cd Projeto_de_extensao_jc
   ```

2. Instale as dependências (só precisa fazer isso uma vez, ou sempre que o `package.json` mudar):
   ```bash
   npm install
   ```

3. Confira o arquivo `.env` na raiz do projeto (já vem criado com valores padrão para desenvolvimento):
   ```env
   PORT=3000
   JWT_SECRET=ji-pisos-laminados-troque-este-segredo-em-producao
   ADMIN_EMAIL=admin@jipisos.com.br
   ADMIN_SENHA=admin123
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

   Você verá no terminal:
   ```
   [seed] usuário admin criado: admin@jipisos.com.br / senha inicial: admin123
   JI Pisos Laminados rodando em http://localhost:3000
   ```

   > A mensagem `[seed] ...` só aparece na **primeira vez** que o servidor roda, quando o banco de dados ainda está vazio e o usuário administrador é criado automaticamente.

5. Abra o navegador em **http://localhost:3000**.

Para desenvolvimento, também está disponível:
```bash
npm run dev
```
que reinicia o servidor automaticamente a cada alteração nos arquivos (usa `node --watch`).

### Login do administrador

Use as credenciais definidas no `.env` para entrar no painel administrativo:

- **E-mail:** `admin@jipisos.com.br`
- **Senha:** `admin123`

> Recomenda-se alterar `ADMIN_SENHA` no `.env` **antes** de rodar o servidor pela primeira vez, já que a senha inicial só é usada na criação do usuário administrador (alterá-la depois no `.env` não muda a senha já salva no banco).

---

## Como usar o sistema

### Como cliente (visitante do site)

1. Acesse a **Página Inicial** e navegue até **Serviços** para conhecer o que a JI Pisos Laminados oferece.
2. Clique em **Solicitar Orçamento**, preencha nome, telefone, tipo de ambiente, metragem, tipo de piso e uma descrição, e envie. Não é obrigatório estar logado para solicitar um orçamento.
3. Opcionalmente, crie uma conta em **Criar Conta** (menu de login) para ficar identificado nas próximas solicitações.

### Como administrador

1. Acesse **login.html** e entre com o e-mail/senha do administrador.
2. Clique em **Painel Admin** no menu (ou acesse `/admin.html` diretamente).
3. Acompanhe os pedidos recebidos, use o filtro de status para focar em pedidos **Pendentes**, **Em andamento** ou **Concluídos**.
4. Clique em **Ver Detalhes** para ver todas as informações enviadas pelo cliente.
5. Clique em **Atualizar Status** para avançar o pedido para a próxima etapa.

---

## Rotas da API

Todas as rotas abaixo respondem em JSON e ficam disponíveis em `http://localhost:3000/api`.

### Autenticação (`/api/auth`)

| Método | Rota                | Descrição                                   | Acesso |
|--------|---------------------|----------------------------------------------|--------|
| POST   | `/api/auth/cadastro` | Cria uma nova conta de cliente               | Público |
| POST   | `/api/auth/login`    | Autentica um usuário e cria a sessão (cookie) | Público |
| POST   | `/api/auth/logout`   | Encerra a sessão atual                       | Logado |
| GET    | `/api/auth/me`       | Retorna os dados do usuário autenticado      | Logado |

### Pedidos / Orçamentos (`/api/pedidos`)

| Método | Rota               | Descrição                                    | Acesso |
|--------|--------------------|------------------------------------------------|--------|
| POST   | `/api/pedidos`      | Cria uma nova solicitação de orçamento         | Público |
| GET    | `/api/pedidos`      | Lista todos os pedidos (aceita `?status=`)      | Admin  |
| GET    | `/api/pedidos/:id`  | Detalha um pedido específico                    | Admin  |
| PATCH  | `/api/pedidos/:id`  | Atualiza o status de um pedido                  | Admin  |

---

## Banco de dados

O banco é um arquivo SQLite (`data/ji.sqlite`), criado automaticamente na primeira execução do servidor. Duas tabelas:

- **`usuarios`** — id, nome, email, telefone, senha (hash), role (`cliente` ou `admin`), data de criação.
- **`pedidos`** — id, usuário relacionado (se logado), nome, telefone, tipo de ambiente, metragem, tipo de piso, descrição, serviço, status, data.

Na primeira execução, o sistema também popula (seed) três pedidos de exemplo (Maria, João e Carlos) para que o painel administrativo já nasça com dados para visualizar.

Para **zerar o banco** (por exemplo, para tirar prints ou reiniciar uma demonstração), pare o servidor e apague os arquivos dentro de `data/` (`ji.sqlite`, `ji.sqlite-shm`, `ji.sqlite-wal`). Na próxima vez que o servidor iniciar, o banco será recriado do zero com o usuário administrador e os pedidos de exemplo.

---

## Segurança

- Senhas nunca são armazenadas em texto puro — são protegidas com **hash bcrypt**.
- A sessão do usuário é um **JWT** guardado em cookie `httpOnly` (inacessível via JavaScript no navegador, reduzindo o risco de roubo de sessão por scripts maliciosos).
- As rotas do painel administrativo são protegidas **tanto no front-end quanto no back-end** — mesmo que alguém tente chamar a API diretamente, sem ser administrador a resposta é bloqueada (`401`/`403`).
- O arquivo `.env` (com o segredo do JWT e credenciais) está no `.gitignore` e não deve ser commitado em repositórios públicos.

---

## Checklist antes de colocar em produção

Este projeto foi construído com práticas reais de backend (hash de senha, JWT, banco de dados), mas antes de publicá-lo em um ambiente de produção real, é recomendado:

- [ ] Trocar `JWT_SECRET` e `ADMIN_SENHA` no `.env` por valores fortes e exclusivos.
- [ ] Definir `NODE_ENV=production` (ativa o cookie `secure`, exigindo HTTPS).
- [ ] Publicar o site atrás de **HTTPS** (ex.: com um proxy reverso como Nginx, ou um provedor de hospedagem com certificado SSL).
- [ ] Fazer backup periódico do arquivo `data/ji.sqlite`.
- [ ] Revisar limites de tamanho/validação dos formulários conforme a necessidade real da empresa.

---

## Equipe

- **Marcella Grangê Silva** — marcella.24204708360048@faeterj-rio.edu.br
- **Julio Cesar Valentim Pereira Fernandes** — julio.24204708360038@faeterj-rio.edu.br

Projeto de Extensão II — FAETERJ-Rio, Análise e Desenvolvimento de Sistemas (ADS).
Cliente externo: **JI Pisos Laminados** (Irio Figueiredo Junior, proprietário).
