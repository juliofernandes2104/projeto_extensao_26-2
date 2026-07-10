const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'ji.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT,
    senha_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cliente',
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    telefone TEXT,
    tipo_ambiente TEXT,
    metragem REAL,
    tipo_piso TEXT,
    descricao TEXT,
    servico TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    data TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function formatarDataBR(d) {
  return String(d.getDate()).padStart(2, '0') + '/' +
         String(d.getMonth() + 1).padStart(2, '0') + '/' +
         d.getFullYear();
}

function seed() {
  const totalUsuarios = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
  if (totalUsuarios === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jipisos.com.br';
    const adminSenha = process.env.ADMIN_SENHA || 'admin123';
    const hash = bcrypt.hashSync(adminSenha, 10);
    db.prepare(`
      INSERT INTO usuarios (nome, email, telefone, senha_hash, role)
      VALUES (?, ?, ?, ?, 'admin')
    `).run('Administrador JI', adminEmail, '(21) 96970-8523', hash);
    console.log(`[seed] usuário admin criado: ${adminEmail} / senha inicial: ${adminSenha}`);
  }

  const totalPedidos = db.prepare('SELECT COUNT(*) AS n FROM pedidos').get().n;
  if (totalPedidos === 0) {
    const inserir = db.prepare(`
      INSERT INTO pedidos (nome, telefone, tipo_ambiente, metragem, tipo_piso, descricao, servico, status, data)
      VALUES (@nome, @telefone, @tipo_ambiente, @metragem, @tipo_piso, @descricao, @servico, @status, @data)
    `);
    inserir.run({ nome: 'Maria', telefone: '(21) 99999-0001', tipo_ambiente: 'Sala', metragem: 28, tipo_piso: 'Laminado', descricao: 'Instalação em sala de estar.', servico: 'Instalação de Piso Laminado', status: 'Pendente', data: '24/04/2026' });
    inserir.run({ nome: 'João', telefone: '(21) 99999-0002', tipo_ambiente: 'Quarto', metragem: 15, tipo_piso: 'Laminado', descricao: 'Reparo de réguas soltas.', servico: 'Manutenção de Piso', status: 'Concluído', data: '22/04/2026' });
    inserir.run({ nome: 'Carlos', telefone: '(21) 99999-0003', tipo_ambiente: 'Loja', metragem: 60, tipo_piso: 'Vinílico', descricao: 'Nivelamento antes da instalação.', servico: 'Nivelamento de Piso', status: 'Em andamento', data: '21/04/2026' });
  }
}

seed();

module.exports = { db, formatarDataBR };
