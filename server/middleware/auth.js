const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'ji_token';

function assinarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function definirCookieSessao(res, usuario) {
  const token = assinarToken(usuario);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function limparCookieSessao(res) {
  res.clearCookie(COOKIE_NAME);
}

function identificarUsuario(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      req.usuario = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      req.usuario = null;
    }
  } else {
    req.usuario = null;
  }
  next();
}

function exigirLogin(req, res, next) {
  if (!req.usuario) return res.status(401).json({ erro: 'É necessário estar autenticado.' });
  next();
}

function exigirAdmin(req, res, next) {
  if (!req.usuario || req.usuario.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
  }
  next();
}

module.exports = { definirCookieSessao, limparCookieSessao, identificarUsuario, exigirLogin, exigirAdmin, COOKIE_NAME };
