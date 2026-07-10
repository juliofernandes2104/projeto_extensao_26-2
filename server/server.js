require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { identificarUsuario } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');

if (!process.env.JWT_SECRET) {
  console.error('Erro: defina JWT_SECRET no arquivo .env antes de iniciar o servidor.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());
app.use(identificarUsuario);

// arquivos estáticos (apenas as pastas públicas — nada de server/, .env ou node_modules)
app.use('/css', express.static(path.join(ROOT, 'css')));
app.use('/js', express.static(path.join(ROOT, 'js')));
app.use('/assets', express.static(path.join(ROOT, 'assets')));

// API
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidosRoutes);

// páginas
const PAGINAS = ['index', 'login', 'orcamento', 'servicos', 'admin'];
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
PAGINAS.forEach((nome) => {
  app.get(`/${nome}.html`, (req, res) => res.sendFile(path.join(ROOT, `${nome}.html`)));
});

app.use((req, res) => res.status(404).send('Página não encontrada.'));

// tratador de erros central
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JI Pisos Laminados rodando em http://localhost:${PORT}`);
});
