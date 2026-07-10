/* ===== JI Pisos Laminados — front-end (consome a API real do servidor Node/Express) ===== */

async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let body = null;
  try { body = await res.json(); } catch (e) { /* resposta sem corpo */ }
  return { ok: res.ok, status: res.status, body };
}

async function getUsuarioAtual() {
  const { ok, body } = await api('/auth/me');
  return ok ? body.usuario : null;
}

/* ---------- header: menu mobile + destaque do link ativo + chip do usuário ---------- */
async function initHeader() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  const current = document.body.dataset.page;
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === current) a.classList.add('active');
  });

  const actionsSlot = document.querySelector('[data-nav-actions]');
  if (!actionsSlot) return;

  const usuario = await getUsuarioAtual();
  if (usuario) {
    actionsSlot.innerHTML = `
      <span class="user-chip">👤 ${usuario.nome}${usuario.role === 'admin' ? ' (admin)' : ''}</span>
      <button class="btn btn-ghost btn-sm" id="btnSair">Sair</button>
    `;
    document.getElementById('btnSair').addEventListener('click', async () => {
      await api('/auth/logout', { method: 'POST' });
      window.location.href = 'index.html';
    });
  } else {
    actionsSlot.innerHTML = `<a href="login.html" class="btn btn-primary btn-sm">Entrar</a>`;
  }
}

/* ---------- página de login / cadastro ---------- */
function initAuthPage() {
  const tabLogin = document.getElementById('tabLogin');
  const tabCadastro = document.getElementById('tabCadastro');
  const formLogin = document.getElementById('formLogin');
  const formCadastro = document.getElementById('formCadastro');
  if (!formLogin && !formCadastro) return;

  function showLogin() {
    tabLogin.classList.add('active');
    tabCadastro.classList.remove('active');
    formLogin.style.display = 'block';
    formCadastro.style.display = 'none';
  }
  function showCadastro() {
    tabCadastro.classList.add('active');
    tabLogin.classList.remove('active');
    formCadastro.style.display = 'block';
    formLogin.style.display = 'none';
  }
  if (tabLogin) tabLogin.addEventListener('click', showLogin);
  if (tabCadastro) tabCadastro.addEventListener('click', showCadastro);

  document.querySelectorAll('.toggle-to-cadastro').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); showCadastro(); }));
  document.querySelectorAll('.toggle-to-login').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); showLogin(); }));

  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });

  function setBusy(form, busy) {
    const btn = form.querySelector('button[type=submit]');
    if (btn) btn.disabled = busy;
  }

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('loginMsg');
      const email = document.getElementById('loginEmail').value.trim();
      const senha = document.getElementById('loginSenha').value;

      setBusy(formLogin, true);
      const { ok, body } = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      setBusy(formLogin, false);

      if (!ok) {
        msg.textContent = (body && body.erro) || 'Não foi possível entrar. Tente novamente.';
        msg.className = 'form-msg err show';
        return;
      }
      msg.textContent = 'Login realizado com sucesso! Redirecionando...';
      msg.className = 'form-msg ok show';
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  }

  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('cadMsg');
      const nome = document.getElementById('cadNome').value.trim();
      const email = document.getElementById('cadEmail').value.trim();
      const telefone = document.getElementById('cadTelefone').value.trim();
      const senha = document.getElementById('cadSenha').value;

      setBusy(formCadastro, true);
      const { ok, body } = await api('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, telefone, senha })
      });
      setBusy(formCadastro, false);

      if (!ok) {
        msg.textContent = (body && body.erro) || 'Não foi possível criar a conta. Tente novamente.';
        msg.className = 'form-msg err show';
        return;
      }
      msg.textContent = 'Conta criada com sucesso! Redirecionando...';
      msg.className = 'form-msg ok show';
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  }
}

/* ---------- página de solicitação de orçamento ---------- */
function initOrcamentoPage() {
  const form = document.getElementById('formOrcamento');
  if (!form) return;
  const cardForm = document.getElementById('orcFormWrap');
  const cardSucesso = document.getElementById('orcSucesso');
  const msg = document.getElementById('orcMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;

    const payload = {
      nome: document.getElementById('orcNome').value.trim(),
      telefone: document.getElementById('orcTelefone').value.trim(),
      tipoAmbiente: document.getElementById('orcAmbiente').value,
      metragem: document.getElementById('orcMetragem').value,
      tipoPiso: document.getElementById('orcPiso').value,
      descricao: document.getElementById('orcDescricao').value.trim()
    };

    const { ok, body } = await api('/pedidos', { method: 'POST', body: JSON.stringify(payload) });
    btn.disabled = false;

    if (!ok) {
      if (msg) {
        msg.textContent = (body && body.erro) || 'Não foi possível enviar sua solicitação. Tente novamente.';
        msg.className = 'form-msg err show';
      }
      return;
    }

    cardForm.style.display = 'none';
    cardSucesso.style.display = 'block';
  });
}

/* ---------- painel administrativo ---------- */
function statusToClass(status) {
  if (status === 'Pendente') return 'badge-pendente';
  if (status === 'Em andamento') return 'badge-andamento';
  return 'badge-concluido';
}
function proximoStatus(status) {
  if (status === 'Pendente') return 'Em andamento';
  if (status === 'Em andamento') return 'Concluído';
  return 'Pendente';
}

async function initAdminPage() {
  const tbody = document.getElementById('pedidosBody');
  if (!tbody) return;

  const usuario = await getUsuarioAtual();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }
  if (usuario.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const filtro = document.getElementById('filtroStatus');
  const statsPendentes = document.getElementById('statPendentes');
  const statsAndamento = document.getElementById('statAndamento');
  const statsConcluidos = document.getElementById('statConcluidos');
  const statsTotal = document.getElementById('statTotal');
  const emptyState = document.getElementById('emptyState');

  async function carregarPedidos() {
    const filtroVal = filtro ? filtro.value : 'Todos';
    const { ok, body } = await api('/pedidos?status=' + encodeURIComponent(filtroVal));
    if (!ok) return [];
    return body.pedidos;
  }

  async function render() {
    const todos = await api('/pedidos?status=Todos');
    const pedidosTodos = todos.ok ? todos.body.pedidos : [];
    statsTotal.textContent = pedidosTodos.length;
    statsPendentes.textContent = pedidosTodos.filter(p => p.status === 'Pendente').length;
    statsAndamento.textContent = pedidosTodos.filter(p => p.status === 'Em andamento').length;
    statsConcluidos.textContent = pedidosTodos.filter(p => p.status === 'Concluído').length;

    const visiveis = await carregarPedidos();

    tbody.innerHTML = '';
    emptyState.style.display = visiveis.length ? 'none' : 'block';

    visiveis.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.servico}</td>
        <td><span class="badge ${statusToClass(p.status)}">${p.status}</span></td>
        <td>${p.data}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-ver="${p.id}">Ver Detalhes</button>
            <button class="btn btn-primary btn-sm" data-atualizar="${p.id}" data-status="${p.status}">Atualizar Status</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-atualizar]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.atualizar;
        const novoStatus = proximoStatus(btn.dataset.status);
        btn.disabled = true;
        await api('/pedidos/' + id, { method: 'PATCH', body: JSON.stringify({ status: novoStatus }) });
        await render();
      });
    });

    tbody.querySelectorAll('[data-ver]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.ver;
        const { ok, body } = await api('/pedidos/' + id);
        if (ok) abrirModal(body.pedido);
      });
    });
  }

  function abrirModal(p) {
    const overlay = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    body.innerHTML = `
      <div class="modal-row"><span>Cliente</span><span>${p.nome}</span></div>
      <div class="modal-row"><span>Telefone</span><span>${p.telefone || '—'}</span></div>
      <div class="modal-row"><span>Serviço</span><span>${p.servico}</span></div>
      <div class="modal-row"><span>Ambiente</span><span>${p.tipo_ambiente || '—'}</span></div>
      <div class="modal-row"><span>Metragem</span><span>${p.metragem ? p.metragem + ' m²' : '—'}</span></div>
      <div class="modal-row"><span>Tipo de piso</span><span>${p.tipo_piso || '—'}</span></div>
      <div class="modal-row"><span>Status</span><span>${p.status}</span></div>
      <div class="modal-row"><span>Data</span><span>${p.data}</span></div>
      <div class="modal-row" style="border-bottom:none;"><span>Descrição</span><span>${p.descricao || '—'}</span></div>
    `;
    overlay.classList.add('show');
  }

  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });

  if (filtro) filtro.addEventListener('change', render);

  const logoutBtn = document.getElementById('adminSair');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api('/auth/logout', { method: 'POST' });
      window.location.href = 'index.html';
    });
  }

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initAuthPage();
  initOrcamentoPage();
  initAdminPage();
});
