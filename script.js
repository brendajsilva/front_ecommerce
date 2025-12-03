// script.js - lógica da aplicação (carrinho, login, cadastro, checkout, endereços)
// Requer que window.API_BASE_URL e fetchProductsAPI() existam (definidos em init.js)

// --- Configurações iniciais e estados ---
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let userLogado = JSON.parse(localStorage.getItem('userLogado')) || null;

// Produto cache local (apenas fallback caso a API não responda)
const produtosFallback = [
  {
    id: 1,
    nome: 'BMW S1000RR',
    preco: 82000.0,
    imagem: '/images/bmws1000rr.png',
    descricao: 'Superbike alemã com motor 4 cilindros...',
    categoria: 'Esportiva',
    potencia: 207,
    disponivel: true
  },
  {
    id: 2,
    nome: 'Ducati Diavel V4',
    preco: 95000.0,
    imagem: '/images/DucatiDiavel.png',
    descricao: 'Power cruiser italiana...',
    categoria: 'Custom',
    potencia: 168,
    disponivel: true
  },
  {
    id: 3,
    nome: 'Ducati Panigale V4S',
    preco: 125000.0,
    imagem: '/images/ducativ4s.png',
    descricao: 'Superbike italiana...',
    categoria: 'Esportiva',
    potencia: 214,
    disponivel: true
  },
  {
    id: 4,
    nome: 'Kawasaki Ninja H2R',
    preco: 135000.0,
    imagem: '/images/h2r.png',
    descricao: 'Hyperbike japonesa...',
    categoria: 'Esportiva',
    potencia: 310,
    disponivel: true
  },
  {
    id: 5,
    nome: 'Kawasaki Z1000',
    preco: 78000.0,
    imagem: '/images/z1000.png',
    descricao: 'Naked sport japonesa...',
    categoria: 'Naked',
    potencia: 142,
    disponivel: true
  }
];

// --- Utilitários ---
function mostrarMensagem(mensagem, tipo = 'success', duracao = 3000) {
  // tipo: 'success' | 'error' | 'info'
  const prev = document.getElementById("mensagem-global");
  if (prev) prev.remove();

  const el = document.createElement("div");
  el.id = "mensagem-global";
  el.className = `toast ${tipo}`;
  el.textContent = mensagem;
  Object.assign(el.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 16px",
    borderRadius: "8px",
    color: "#fff",
    zIndex: 9999,
    fontWeight: 600,
    background: tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#007bff',
  });

  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, duracao);
}

function formatoPrecoBR(valor) {
  return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Atualiza contador de carrinho (pega do localStorage)
function atualizarContadorCarrinho() {
  carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = carrinho.length;
}

// Busca produto por id nos produtos obtidos da API ou fallback
async function buscarProdutoPorId(id) {
  try {
    // Tenta usar fetchProductsAPI() se existir (de init.js)
    if (typeof fetchProductsAPI === 'function') {
      const produtos = await fetchProductsAPI();
      const p = produtos.find(x => Number(x.id) === Number(id));
      if (p) return p;
    }
  } catch (e) {
    console.warn('Erro ao buscar via fetchProductsAPI:', e && e.message);
  }

  // fallback local
  return produtosFallback.find(x => Number(x.id) === Number(id)) || null;
}

// --- Funções do carrinho ---
function salvarCarrinhoLocal() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarContadorCarrinho();
}

function adicionarAoCarrinho(produtoId) {
  // produtoId pode ser inteiro ou objeto
  (async () => {
    try {
      let produtoObj = null;

      if (typeof produtoId === 'object' && produtoId !== null) {
        // já é um objeto produto
        produtoObj = produtoId;
      } else {
        produtoObj = await buscarProdutoPorId(produtoId);
      }

      if (!produtoObj) {
        mostrarMensagem('Produto não encontrado', 'error');
        return;
      }

      // Adiciona cópia do produto (para manter dados estáticos no carrinho)
      carrinho.push({
        id: produtoObj.id,
        nome: produtoObj.nome,
        preco: Number(produtoObj.preco || 0),
        imagem: produtoObj.imagem || '/images/placeholder-moto.svg'
      });

      salvarCarrinhoLocal();
      mostrarMensagem(`${produtoObj.nome} adicionado ao carrinho! 🛒`);
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      mostrarMensagem('Erro ao adicionar ao carrinho', 'error');
    }
  })();
}

function removerItemPorId(itemId) {
  const itemName = (carrinho.find(it => it.id === itemId) || {}).nome || 'Item';
  carrinho = carrinho.filter(item => item.id !== itemId);
  salvarCarrinhoLocal();
  mostrarMensagem(`${itemName} removido do carrinho`);
  // se estiver na página do carrinho, recarrega a lista
  if (window.location.href.includes('carrinho.html')) carregarCarrinho();
}

function alterarQuantidade(itemId, delta) {
  // Contagem baseada em ocorrências do item
  const currentQty = carrinho.filter(i => i.id === itemId).length;
  const newQty = Math.max(1, currentQty + delta);

  if (newQty > currentQty) {
    // adiciona cópias do produto
    (async () => {
      const produtoTemplate = await buscarProdutoPorId(itemId);
      if (!produtoTemplate) {
        mostrarMensagem('Produto não encontrado', 'error');
        return;
      }
      for (let i = currentQty; i < newQty; i++) {
        carrinho.push({
          id: produtoTemplate.id,
          nome: produtoTemplate.nome,
          preco: Number(produtoTemplate.preco || 0),
          imagem: produtoTemplate.imagem || '/images/placeholder-moto.svg'
        });
      }
      salvarCarrinhoLocal();
      carregarCarrinho();
      mostrarMensagem(`Quantidade atualizada para ${newQty}`);
    })();
  } else if (newQty < currentQty) {
    // remove itens excedentes
    let removeCount = currentQty - newQty;
    const novo = [];
    for (const item of carrinho) {
      if (item.id === itemId && removeCount > 0) {
        removeCount--;
        continue;
      }
      novo.push(item);
    }
    carrinho = novo;
    salvarCarrinhoLocal();
    carregarCarrinho();
    mostrarMensagem(`Quantidade atualizada para ${newQty}`);
  } else {
    // sem alteração
    mostrarMensagem(`Quantidade permanece ${newQty}`, 'info');
  }
}

function definirQuantidade(itemId, quantidade) {
  const qty = parseInt(quantidade);
  if (isNaN(qty) || qty < 1) return;
  (async () => {
    const produtoTemplate = await buscarProdutoPorId(itemId);
    if (!produtoTemplate) {
      mostrarMensagem('Produto não encontrado', 'error');
      return;
    }
    // remove todos e adiciona novamente
    carrinho = carrinho.filter(item => item.id !== itemId);
    for (let i = 0; i < qty; i++) {
      carrinho.push({
        id: produtoTemplate.id,
        nome: produtoTemplate.nome,
        preco: Number(produtoTemplate.preco || 0),
        imagem: produtoTemplate.imagem || '/images/placeholder-moto.svg'
      });
    }
    salvarCarrinhoLocal();
    carregarCarrinho();
    mostrarMensagem(`Quantidade definida para ${qty}`);
  })();
}

// --- Função para renderizar carrinho (carrinho.html) ---
function carregarCarrinho() {
  console.log('Carregando carrinho...');
  carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  const lista = document.getElementById("lista-carrinho");
  const emptyCart = document.getElementById("empty-cart");
  const cartContainer = document.getElementById("cart-items-container");
  const itemsCount = document.getElementById("items-count");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total-carrinho");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!lista) {
    console.log('Elemento lista-carrinho não encontrado');
    return;
  }

  // Agrupa por id para somar quantidades
  const grouped = {};
  carrinho.forEach(item => {
    if (grouped[item.id]) grouped[item.id].quantity++;
    else grouped[item.id] = { ...item, quantity: 1 };
  });

  const items = Object.values(grouped);
  const totalItems = items.reduce((s, it) => s + it.quantity, 0);

  if (items.length === 0) {
    if (emptyCart) emptyCart.style.display = "block";
    if (cartContainer) cartContainer.style.display = "none";
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (itemsCount) itemsCount.textContent = '0 items';
    if (subtotalEl) subtotalEl.textContent = 'R$ 0,00';
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    atualizarContadorCarrinho();
    return;
  }

  if (emptyCart) emptyCart.style.display = "none";
  if (cartContainer) cartContainer.style.display = "block";
  if (checkoutBtn) checkoutBtn.disabled = false;
  if (itemsCount) itemsCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

  lista.innerHTML = '';

  let subtotal = 0;

  items.forEach(item => {
    const itemTotal = item.preco * item.quantity;
    subtotal += itemTotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'carrinho-item';

    itemDiv.innerHTML = `
      <img src="${item.imagem || '/images/placeholder-moto.svg'}" alt="${item.nome}" class="item-image" onerror="this.src='/images/placeholder-moto.svg'">
      <div class="item-details">
        <span class="item-name">${item.nome}</span>
        <span class="item-price">${formatoPrecoBR(item.preco)}</span>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, -1)">−</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="definirQuantidade(${item.id}, this.value)">
          <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="item-remove" onclick="removerItemPorId(${item.id})">Remover</button>
    `;

    lista.appendChild(itemDiv);
  });

  const frete = subtotal >= 50000 ? 0 : 150;
  if (subtotalEl) subtotalEl.textContent = formatoPrecoBR(subtotal);
  if (totalEl) totalEl.textContent = formatoPrecoBR(subtotal + frete);

  atualizarContadorCarrinho();
}

// --- Autenticação (login/cadastro/logout) ---
async function login(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  const usuarioInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');

  if (!usuarioInput || !senhaInput) {
    mostrarMensagem('Formulário de login não encontrado', 'error');
    return;
  }

  const usuario = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!usuario || !senha) {
    mostrarMensagem('Preencha todos os campos', 'error');
    return;
  }

  // Envia para API
  try {
    const base = window.API_BASE_URL;
    const res = await fetch(base + '/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error || data.message || 'Erro no login';
      throw new Error(msg);
    }

    // Espera que a API retorne { usuario: {...}, token: '...' }
    userLogado = data.usuario || data.user || { username: usuario };
    const token = data.token || data.accessToken || null;

    localStorage.setItem('userLogado', JSON.stringify(userLogado));
    if (token) localStorage.setItem('token', token);

    mostrarMensagem(`Bem vindo, ${userLogado.username || userLogado.nome || usuario}!`, 'success');

    // redireciona (API pode retornar tipo)
    const redirectUrl = (data.usuario && data.usuario.tipo === 'ADMIN') ? './admin.html' : './inicio.html';
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 800);

  } catch (error) {
    console.error('Erro no login:', error);
    mostrarMensagem(error.message || 'Erro ao fazer login', 'error');
  }
}

async function cadastrarAPI(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  // coleta campos do form (assumindo IDs do formulário de cadastro)
  const username = document.getElementById('novoUsername')?.value?.trim();
  const nomeCompleto = document.getElementById('novoNomeCompleto')?.value?.trim();
  const email = document.getElementById('novoEmail')?.value?.trim();
  const telefone = document.getElementById('novoTelefone')?.value?.trim();
  const cpf = document.getElementById('novoCPF')?.value?.trim();
  const senha = document.getElementById('novaSenha')?.value?.trim();

  if (!username || !nomeCompleto || !email || !cpf || !senha) {
    mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
    return;
  }

  // Validação simples de CPF se desejar manter (não substitui validação no backend)
  // Envia para API
  try {
    const base = window.API_BASE_URL;
    const res = await fetch(base + '/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        nome: nomeCompleto,
        email,
        senha,
        telefone,
        cpf
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error || data.message || 'Erro no cadastro';
      throw new Error(msg);
    }

    userLogado = data.usuario || data.user || { username };
    const token = data.token || data.accessToken || null;

    localStorage.setItem('userLogado', JSON.stringify(userLogado));
    if (token) localStorage.setItem('token', token);

    mostrarMensagem('Cadastro realizado com sucesso! Bem vindo.', 'success');
    setTimeout(() => window.location.href = './inicio.html', 900);
  } catch (error) {
    console.error('Erro no cadastro:', error);
    mostrarMensagem(error.message || 'Erro ao cadastrar', 'error');
  }
}

function logout() {
  localStorage.removeItem('userLogado');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  userLogado = null;
  mostrarMensagem('Desconectado', 'info');
  setTimeout(() => window.location.href = '/', 400);
}

// --- Checkout / Pedidos ---
function verificarAutenticacao() {
  userLogado = JSON.parse(localStorage.getItem('userLogado')) || null;
  if (!userLogado && !window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
    window.location.href = './login.html';
    return false;
  }
  return true;
}

function finalizarCompra() {
  if (!verificarAutenticacao()) return;

  if (!carrinho || carrinho.length === 0) {
    mostrarMensagem('Seu carrinho está vazio', 'error');
    return;
  }

  // Verifica endereço selecionado
  const enderecoSelecionado = localStorage.getItem('enderecoSelecionado');
  if (!enderecoSelecionado) {
    mostrarMensagem('Selecione um endereço de entrega', 'error');
    abrirModalEnderecos();
    return;
  }

  abrirModalPagamento();
}

function abrirModalPagamento() {
  const modal = document.getElementById('modal-pagamento');
  if (modal) modal.style.display = 'block';
}

function fecharModalPagamento() {
  const modal = document.getElementById('modal-pagamento');
  if (modal) modal.style.display = 'none';
}

async function confirmarMetodoPagamento() {
  const metodoSelecionado = document.querySelector('input[name="metodo-pagamento-modal"]:checked');
  if (!metodoSelecionado) {
    mostrarMensagem('Selecione um método de pagamento', 'error');
    return;
  }

  const metodo = metodoSelecionado.value;
  const enderecoSelecionado = localStorage.getItem('enderecoSelecionado');
  if (!enderecoSelecionado) {
    mostrarMensagem('Selecione um endereço de entrega', 'error');
    return;
  }
  const endereco = JSON.parse(enderecoSelecionado);

  // Agrupar itens
  const grouped = {};
  carrinho.forEach(i => {
    if (grouped[i.id]) grouped[i.id].quantidade++;
    else grouped[i.id] = { idProduto: i.id, quantidade: 1 };
  });

  const itens = Object.values(grouped).map(it => ({ idProduto: it.idProduto, quantidade: it.quantidade }));

  const orderData = {
    itens,
    idEndereco: endereco.id,
    metodoPagamento: metodo
  };

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(orderData)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error || data.message || 'Erro ao criar pedido';
      throw new Error(msg);
    }

    mostrarMensagem('Compra finalizada com sucesso! 🎉', 'success');
    // limpa carrinho
    carrinho = [];
    salvarCarrinhoLocal();
    localStorage.removeItem('enderecoSelecionado');
    fecharModalPagamento();
    setTimeout(() => window.location.href = './perfil.html', 900);

  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    mostrarMensagem(err.message || 'Erro ao finalizar compra', 'error');
  }
}

// --- Modal Endereços e CRUD de endereços ---
function abrirModalEnderecos() {
  const modal = document.getElementById('modal-enderecos');
  if (modal) {
    modal.style.display = 'block';
    carregarEnderecos();
  }
}

function fecharModalEnderecos() {
  const modal = document.getElementById('modal-enderecos');
  if (modal) modal.style.display = 'none';
}

function abrirModalNovoEndereco() {
  fecharModalEnderecos();
  const modal = document.getElementById('modal-novo-endereco');
  if (modal) modal.style.display = 'block';
}

function fecharModalNovoEndereco() {
  const modal = document.getElementById('modal-novo-endereco');
  if (modal) modal.style.display = 'none';
}

async function carregarEnderecos() {
  const listaEnderecos = document.getElementById('lista-enderecos');
  if (!listaEnderecos) return;

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/enderecos', {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    });
    if (!res.ok) {
      // mostra erro simples
      listaEnderecos.innerHTML = '<p>Erro ao carregar endereços.</p>';
      return;
    }
    const enderecos = await res.json();
    listaEnderecos.innerHTML = '';
    if (!Array.isArray(enderecos) || enderecos.length === 0) {
      listaEnderecos.innerHTML = '<p>Nenhum endereço cadastrado.</p>';
      return;
    }

    enderecos.forEach(endereco => {
      const enderecoDiv = document.createElement('div');
      enderecoDiv.className = 'endereco-item';
      enderecoDiv.innerHTML = `
        <div class="endereco-info">
          <strong>${endereco.apelido || 'Endereço'}</strong><br>
          ${endereco.logradouro}, ${endereco.numero || ''}<br>
          ${endereco.bairro || ''} - ${endereco.localidade || ''}/${endereco.uf || ''}<br>
          CEP: ${endereco.cep || ''}
        </div>
        <button class="btn-secondary" onclick="selecionarEndereco(${endereco.codEndereco || endereco.id}, '${(endereco.apelido || 'Endereço').replace(/'/g,"\\'")}', '${(endereco.logradouro || '') + (endereco.numero ? ', ' + endereco.numero : '')}')">Selecionar</button>
      `;
      listaEnderecos.appendChild(enderecoDiv);
    });

  } catch (err) {
    console.error('Erro ao carregar endereços:', err);
    listaEnderecos.innerHTML = '<p>Erro ao carregar endereços.</p>';
  }
}

function selecionarEndereco(id, apelido, enderecoTexto) {
  const enderecoSelecionadoEl = document.getElementById('endereco-selecionado');
  if (enderecoSelecionadoEl) {
    enderecoSelecionadoEl.innerHTML = `
      <div class="endereco-selecionado-info">
        <strong>📍 ${apelido}</strong><br>
        <span>${enderecoTexto}</span><br>
        <button class="btn-link" onclick="abrirModalEnderecos()">Alterar</button>
      </div>
    `;
  }

  localStorage.setItem('enderecoSelecionado', JSON.stringify({ id, apelido, endereco: enderecoTexto }));
  fecharModalEnderecos();
  mostrarMensagem('Endereço selecionado com sucesso!');
}

// Busca CEP via ViaCEP
async function buscarCEP() {
  const cepInput = document.getElementById('cep');
  if (!cepInput) return;
  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length !== 8) {
    mostrarMensagem('CEP deve ter 8 dígitos', 'error');
    return;
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) {
      mostrarMensagem('CEP não encontrado', 'error');
      return;
    }
    document.getElementById('logradouro').value = data.logradouro || '';
    document.getElementById('bairro').value = data.bairro || '';
    document.getElementById('localidade').value = data.localidade || '';
    document.getElementById('uf').value = data.uf || '';
    mostrarMensagem('CEP encontrado e campos preenchidos!');
  } catch (err) {
    console.error('Erro ao buscar CEP:', err);
    mostrarMensagem('Erro ao buscar CEP', 'error');
  }
}

// Submissão do formulário de novo endereço
document.getElementById('form-novo-endereco')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = this;
  const formData = new FormData(form);
  const enderecoData = {
    cep: formData.get('cep'),
    logradouro: formData.get('logradouro'),
    numero: formData.get('numero'),
    complemento: formData.get('complemento'),
    bairro: formData.get('bairro'),
    localidade: formData.get('localidade'),
    uf: formData.get('uf'),
    apelido: formData.get('apelido'),
    is_principal: formData.get('is_principal') === 'on'
  };

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(window.API_BASE_URL + '/enderecos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(enderecoData)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || data.message || 'Erro ao cadastrar endereço';
      throw new Error(msg);
    }

    mostrarMensagem('Endereço cadastrado com sucesso!');
    fecharModalNovoEndereco();
    setTimeout(() => abrirModalEnderecos(), 400);
  } catch (err) {
    console.error('Erro ao cadastrar endereço:', err);
    mostrarMensagem(err.message || 'Erro ao cadastrar endereço', 'error');
  }
});

// --- DOMContentLoaded: inicializações ---
document.addEventListener('DOMContentLoaded', async () => {
  atualizarContadorCarrinho();

  // Se houver formulários de login/cadastro, ligar os handlers
  if (window.location.href.includes('login.html')) {
    const form = document.getElementById('login-form');
    if (form) form.addEventListener('submit', login);
  }

  if (window.location.href.includes('cadastro.html')) {
    const form = document.getElementById('cadastro-form');
    if (form) form.addEventListener('submit', cadastrarAPI);
  }

  if (window.location.href.includes('carrinho.html')) {
    carregarCarrinho();
  }

  // Se houver página de produtos (legacy), tenta carregar do servidor
  if (window.location.href.includes('produtos.html')) {
    // Tenta utilizar carregarProdutos from init.js (se disponível) - caso exista, chama
    if (typeof carregarProdutos === 'function') {
      try {
        carregarProdutos();
      } catch (e) {
        console.warn('carregarProdutos indisponível ou falhou:', e);
      }
    } else {
      // fallback simples: pega produtos da API e renderiza com inserir manual
      try {
        const produtos = (typeof fetchProductsAPI === 'function') ? await fetchProductsAPI() : produtosFallback;
        const container = document.getElementById('produtos-lista') || document.getElementById('produtos-destaque');
        if (container) {
          container.innerHTML = '';
          produtos.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'produto flip-card';
            card.innerHTML = `
              <div class="flip-card-inner">
                <div class="flip-card-front">
                  <img src="${prod.imagem || '/images/placeholder-moto.svg'}" alt="${prod.nome}" onerror="this.src='/images/placeholder-moto.svg'"/>
                  <h3>${prod.nome}</h3>
                  <span class="price-tag">${formatoPrecoBR(prod.preco)}</span>
                </div>
                <div class="flip-card-back">
                  <p>${prod.descricao}</p>
                  <button onclick="adicionarAoCarrinho(${prod.id})">Adicionar ao Carrinho</button>
                </div>
              </div>
            `;
            container.appendChild(card);
          });
          // event listeners para flip cards em mobile
          document.querySelectorAll('.produto.flip-card').forEach(card => {
            card.addEventListener('click', () => card.classList.toggle('flipped'));
          });
        }
      } catch (e) {
        console.error('Erro ao renderizar produtos na página:', e);
      }
    }
  }
});

// --- Funções utilitárias expostas para o frontend (HTML) ---
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.alterarQuantidade = alterarQuantidade;
window.definirQuantidade = definirQuantidade;
window.removerItemPorId = removerItemPorId;
window.carregarCarrinho = carregarCarrinho;
window.login = login;
window.cadastrarAPI = cadastrarAPI;
window.logout = logout;
window.finalizarCompra = finalizarCompra;
window.abrirModalPagamento = abrirModalPagamento;
window.fecharModalPagamento = fecharModalPagamento;
window.confirmarMetodoPagamento = confirmarMetodoPagamento;
window.abrirModalEnderecos = abrirModalEnderecos;
window.fecharModalEnderecos = fecharModalEnderecos;
window.abrirModalNovoEndereco = abrirModalNovoEndereco;
window.fecharModalNovoEndereco = fecharModalNovoEndereco;
window.buscarCEP = buscarCEP;
window.selecionarEndereco = selecionarEndereco;

// Password toggle helper (se o HTML usar)
window.toggleSenha = function (inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const toggleBtn = input.nextElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    if (toggleBtn) toggleBtn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (toggleBtn) toggleBtn.textContent = '👁';
  }
};

// Manter compatibilidade: atualizar contador no load
setTimeout(atualizarContadorCarrinho, 200);
