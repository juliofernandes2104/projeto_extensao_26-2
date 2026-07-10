const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { definirCookieSessao, limparCookieSessao, exigirLogin } = require('../middleware/auth');

const router = express.Router();

function usuarioPublico(u) {
  return { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone, role: u.role };
}

router.post('/cadastro', (req, res) => {
  const { nome, email, telefone, senha } = req.body || {};

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, e-mail, telefone e senha.' });
  }
  if (String(senha).length < 4) {
    return res.status(400).json({ erro: 'A senha deve ter ao menos 4 caracteres.' });
  }

  const emailNormalizado = String(email).trim().toLowerCase();
  const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(emailNormalizado);
  if (existente) {
    return res.status(409).json({ erro: 'Já existe uma conta com este e-mail. Faça login.' });
  }

  const hash = bcrypt.hashSync(senha, 10);
  const info = db.prepare(`
    INSERT INTO usuarios (nome, email, telefone, senha_hash, role)
    VALUES (?, ?, ?, ?, 'cliente')
  `).run(nome.trim(), emailNormalizado, telefone.trim(), hash);

  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(info.lastInsertRowid);
  definirCookieSessao(res, usuario);
  res.status(201).json({ usuario: usuarioPublico(usuario) });
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  const emailNormalizado = String(email).trim().toLowerCase();
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(emailNormalizado);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  definirCookieSessao(res, usuario);
  res.json({ usuario: usuarioPublico(usuario) });
});

router.post('/logout', (req, res) => {
  limparCookieSessao(res);
  res.json({ ok: true });
});

router.get('/me', exigirLogin, (req, res) => {
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!usuario) return res.status(401).json({ erro: 'Sessão inválida.' });
  res.json({ usuario: usuarioPublico(usuario) });
});

module.exports = router;
