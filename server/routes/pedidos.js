const express = require('express');
const { db, formatarDataBR } = require('../db');
const { exigirAdmin } = require('../middleware/auth');

const router = express.Router();

const STATUS_VALIDOS = ['Pendente', 'Em andamento', 'Concluído'];

router.post('/', (req, res) => {
  const { nome, telefone, tipoAmbiente, metragem, tipoPiso, descricao } = req.body || {};

  if (!nome || !telefone || !tipoAmbiente || !metragem || !tipoPiso) {
    return res.status(400).json({ erro: 'Preencha nome, telefone, tipo de ambiente, metragem e tipo de piso.' });
  }
  const metragemNum = Number(metragem);
  if (!Number.isFinite(metragemNum) || metragemNum <= 0) {
    return res.status(400).json({ erro: 'Metragem inválida.' });
  }

  const usuarioId = req.usuario ? req.usuario.id : null;
  const servico = 'Orçamento — ' + tipoAmbiente;
  const dataFmt = formatarDataBR(new Date());

  const info = db.prepare(`
    INSERT INTO pedidos (usuario_id, nome, telefone, tipo_ambiente, metragem, tipo_piso, descricao, servico, status, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendente', ?)
  `).run(usuarioId, nome.trim(), telefone.trim(), tipoAmbiente, metragemNum, tipoPiso, (descricao || '').trim(), servico, dataFmt);

  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ pedido });
});

router.get('/', exigirAdmin, (req, res) => {
  const { status } = req.query;
  let pedidos;
  if (status && status !== 'Todos') {
    pedidos = db.prepare('SELECT * FROM pedidos WHERE status = ? ORDER BY id DESC').all(status);
  } else {
    pedidos = db.prepare('SELECT * FROM pedidos ORDER BY id DESC').all();
  }
  res.json({ pedidos });
});

router.get('/:id', exigirAdmin, (req, res) => {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });
  res.json({ pedido });
});

router.patch('/:id', exigirAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  db.prepare('UPDATE pedidos SET status = ? WHERE id = ?').run(status, req.params.id);
  const atualizado = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  res.json({ pedido: atualizado });
});

module.exports = router;
