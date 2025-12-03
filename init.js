// Inicialização do frontend: contador do carrinho e produtos em destaque

// Configurar URL da API
window.API_BASE_URL = 'https://backendecommerce-production-ce37.up.railway.app';

function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = carrinho.length;
}

// Produtos fallback (caso a API falhe)
const produtosDestaque = [
  {
    id: 1,
    nome: 'BMW S1000RR',
    preco: 82000.0,
    imagem: '/images/bmws1000rr.png',
    destaque: true,
    descricao: 'Superbike alemã com motor 4 cilindros em linha de 999cc...',
    categoria: 'Esportiva',
    potencia: 207,
    disponivel: true
  },
  {
    id: 2,
    nome: 'Ducati Diavel V4',
    preco: 95000.0,
    imagem: '/images/DucatiDiavel.png',
    destaque: true,
    descricao: 'Power cruiser italiana com motor V4 Granturismo...',
    categoria: 'Custom',
    potencia: 168,
    disponivel: true
  },
  {
    id: 3,
    nome: 'Ducati Panigale V4S',
    preco: 125000.0,
    imagem: '/images/ducativ4s.png',
    destaque: true,
    descricao: 'Superbike italiana com motor V4 de 1103cc...',
    categoria: 'Esportiva',
    potencia: 214,
    disponivel: true
  },
  {
    id: 4,
    nome: 'Kawasaki Ninja H2R',
    preco: 135000.0,
    imagem: '/images/h2r.png',
    destaque: true,
    descricao: 'Hyperbike japonesa com motor supercharged...',
    categoria: 'Esportiva',
    potencia: 310,
    disponivel: true
  },
  {
    id: 5,
    nome: 'Kawasaki Z1000',
    preco: 78000.0,
    imagem: '/images/z1000.png',
    destaque: true,
    descricao: 'Naked sport japonesa com motor 4 cilindros...',
    categoria: 'Naked',
    potencia: 142,
    disponivel: true
  }
];

function formatoPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ==============================
// BUSCAR PRODUTOS DA API
// ==============================
async function fetchProductsAPI() {
  const base = window.API_BASE_URL;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // CORRIGIDO: rota certa → /produtos
    const res = await fetch(base + '/produtos', { signal: controller.signal });

    clearTimeout(timeout);
    if (!res.ok) throw new Error('Erro ao buscar API');

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Resposta inválida');

    return data.map(p => ({
      id: p.codProduto || p.id || 0,
      nome: p.nome || 'Produto',
      preco: parseFloat(p.preco || 0),
      imagem: (p.imagem_url || '/images/placeholder-moto.svg'),
      descricao: p.descricao || '',
      categoria: p.categoria || 'Esportiva',
      potencia: p.potencia || null,
      disponivel: p.disponivel !== false,
      destaque: true
    }));

  } catch (err) {
    console.warn('Erro na API, usando fallback local:', err.message);
    return produtosDestaque;
  }
}

// Placeholder de imagem
function handleImageError(imgEl) {
  try {
    imgEl.src = '/images/placeholder-moto.svg';
  } catch (e) {}
}

// Renderização dos produtos em destaque
async function renderizarProdutosDestaque() {
  const lista = await fetchProductsAPI();

  const containers = [
    document.getElementById('produtos-destaque'),
    document.getElementById('lista-produtos')
  ].filter(Boolean);

  containers.forEach(container => {
    container.innerHTML = '';

    lista.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'produto flip-card';

      const inner = document.createElement('div');
      inner.className = 'flip-card-inner';

      // Frente
      const front = document.createElement('div');
      front.className = 'flip-card-front';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'card-image';

      const priceTag = document.createElement('div');
      priceTag.className = 'price-tag';
      priceTag.textContent = formatoPreco(prod.preco);
      imgWrap.appendChild(priceTag);

      const imgEl = document.createElement('img');
      imgEl.alt = prod.nome;
      imgEl.src = prod.imagem || '/images/placeholder-moto.svg';
      imgEl.onerror = () => handleImageError(imgEl);
      imgWrap.appendChild(imgEl);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `<h3>${prod.nome}</h3><p class="descricao">${prod.descricao}</p>`;

      front.appendChild(imgWrap);
      front.appendChild(body);

      // Verso
      const back = document.createElement('div');
      back.className = 'flip-card-back';
      back.innerHTML = `
          <div class="back-content">
            <h3>${prod.nome}</h3>
            <p class="descricao">${prod.descricao}</p>
            <ul class="specs">
              <li>Categoria: ${prod.categoria}</li>
              <li>Disponibilidade: ${prod.disponivel ? 'Em estoque' : 'Sob encomenda'}</li>
            </ul>
            <div class="back-footer">
              <span class="preco">${formatoPreco(prod.preco)}</span>
              <button class="add-cart" onclick="adicionarAoCarrinho(${prod.id})">Adicionar ao Carrinho</button>
            </div>
          </div>
        `;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      card.addEventListener('click', function () {
        if (window.matchMedia('(hover: none)').matches) {
          this.classList.toggle('is-flipped');
        }
      });

      container.appendChild(card);
    });
  });
}

function renderizarProdutosIndex() {
  fetchProductsAPI().then(produtos => {
    const container = document.getElementById('index-produtos');
    if (!container) return;

    container.innerHTML = '';

    produtos.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'produto';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'card-image';

      const priceTag = document.createElement('div');
      priceTag.className = 'price-tag';
      priceTag.textContent = formatoPreco(prod.preco);
      imgWrap.appendChild(priceTag);

      const imgEl = document.createElement('img');
      imgEl.alt = prod.nome;
      imgEl.src = prod.imagem;
      imgEl.onerror = () => handleImageError(imgEl);
      imgWrap.appendChild(imgEl);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `<h3>${prod.nome}</h3><p class="descricao">${prod.descricao}</p>`;

      const footer = document.createElement('div');
      footer.className = 'card-footer';
      footer.innerHTML = `<span class="preco">${formatoPreco(prod.preco)}</span>`;
      const btn = document.createElement('button');
      btn.textContent = 'Adicionar ao Carrinho';
      btn.onclick = () => adicionarAoCarrinho(prod.id);
      footer.appendChild(btn);

      div.appendChild(imgWrap);
      div.appendChild(body);
      div.appendChild(footer);

      container.appendChild(div);
    });
  });
}

async function carregarProdutosPagina() {
  const listaContainer = document.getElementById('lista-produtos');
  const loadingSpinner = document.getElementById('loading-spinner');
  const noProductsMsg = document.getElementById('no-products');

  if (!listaContainer) return;

  loadingSpinner.style.display = 'block';
  listaContainer.innerHTML = '';
  noProductsMsg.style.display = 'none';

  try {
    const produtos = await fetchProductsAPI();
    loadingSpinner.style.display = 'none';

    if (produtos.length === 0) {
      noProductsMsg.style.display = 'block';
      return;
    }

    window.todosProdutos = [...produtos];
    window.produtosFiltrados = [...produtos];

    renderizarProdutosFiltrados();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    loadingSpinner.style.display = 'none';
    noProductsMsg.style.display = 'block';
  }
}

let todosProdutos = [];
let produtosFiltrados = [];

function filtrarProdutos() {
  const categoriaSelect = document.getElementById('filter-category');
  const ordenacaoSelect = document.getElementById('sort-by');
  const searchInput = document.querySelector('.search-input');

  if (!categoriaSelect || !ordenacaoSelect || !searchInput) return;

  const categoria = categoriaSelect.value;
  const ordenacao = ordenacaoSelect.value;
  const termoBusca = searchInput.value.toLowerCase().trim();

  produtosFiltrados = todosProdutos.filter(produto => {
    const matchCategoria = categoria === 'all' || produto.categoria === categoria;
    const matchBusca =
      produto.nome.toLowerCase().includes(termoBusca) ||
      produto.descricao.toLowerCase().includes(termoBusca) ||
      (produto.categoria || '').toLowerCase().includes(termoBusca);

    return matchCategoria && matchBusca;
  });

  produtosFiltrados.sort((a, b) => {
    switch (ordenacao) {
      case 'price-asc': return a.preco - b.preco;
      case 'price-desc': return b.preco - a.preco;
      default: return 0;
    }
  });

  renderizarProdutosFiltrados();
}

function renderizarProdutosFiltrados() {
  const container = document.getElementById('lista-produtos');
  const noProductsMsg = document.getElementById('no-products');

  if (!container) return;

  container.innerHTML = '';

  if (produtosFiltrados.length === 0) {
    noProductsMsg.style.display = 'block';
    return;
  }

  noProductsMsg.style.display = 'none';

  produtosFiltrados.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card flip-card';

    const inner = document.createElement('div');
    inner.className = 'flip-card-inner';

    const front = document.createElement('div');
    front.className = 'flip-card-front';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'card-image';

    const priceTag = document.createElement('div');
    priceTag.className = 'price-tag';
    priceTag.textContent = formatoPreco(prod.preco);
    imgWrap.appendChild(priceTag);

    const imgEl = document.createElement('img');
    imgEl.alt = prod.nome;
    imgEl.src = prod.imagem;
    imgEl.onerror = () => handleImageError(imgEl);
    imgWrap.appendChild(imgEl);

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `<h3>${prod.nome}</h3><p class="categoria">${prod.categoria}</p>`;

    front.appendChild(imgWrap);
    front.appendChild(body);

    const back = document.createElement('div');
    back.className = 'flip-card-back';
    back.innerHTML = `
      <div class="back-content">
        <h3>${prod.nome}</h3>
        <p class="descricao">${prod.descricao}</p>
        <ul class="specs">
          <li><strong>Potência:</strong> ${prod.potencia || 'N/A'} HP</li>
          <li><strong>Categoria:</strong> ${prod.categoria}</li>
          <li><strong>Disponibilidade:</strong> ${prod.disponivel ? 'Em estoque' : 'Sob encomenda'}</li>
        </ul>
        <div class="back-footer">
          <span class="preco">${formatoPreco(prod.preco)}</span>
          <button class="add-cart" onclick="adicionarAoCarrinho(${prod.id})">Adicionar ao Carrinho</button>
        </div>
      </div>
    `;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', function () {
      if (window.matchMedia('(hover: none)').matches) {
        this.classList.toggle('is-flipped');
      }
    });

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarContadorCarrinho();
  renderizarProdutosDestaque();

  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    renderizarProdutosIndex();
  }

  if (window.location.pathname.includes('produtos.html')) {
    carregarProdutosPagina();
    const categoriaSelect = document.getElementById('filter-category');
    const ordenacaoSelect = document.getElementById('sort-by');
    const searchInput = document.querySelector('.search-input');

    if (categoriaSelect) categoriaSelect.addEventListener('change', filtrarProdutos);
    if (ordenacaoSelect) ordenacaoSelect.addEventListener('change', filtrarProdutos);
    if (searchInput) searchInput.addEventListener('input', filtrarProdutos);
  }
});
