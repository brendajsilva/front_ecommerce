// Inicialização do frontend: contador do carrinho e produtos em destaque

// Configurar URL da API
window.API_BASE_URL = 'http://localhost:3000/api';

function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = carrinho.length;
}

const produtosDestaque = [
  {
    id: 1,
    nome: 'BMW S1000RR',
    preco: 82000.0,
    imagem: '/frontend/images/bmws1000rr.png',
    destaque: true,
    descricao: 'Superbike alemã com motor 4 cilindros em linha de 999cc, 207 HP e 113 Nm de torque. Equipada com ABS, controle de tração, quickshifter e suspensão ajustável. Peso: 197kg.',
    categoria: 'Esportiva',
    potencia: 207,
    disponivel: true
  },
  {
    id: 2,
    nome: 'Ducati Diavel V4',
    preco: 95000.0,
    imagem: '/frontend/images/DucatiDiavel.png',
    destaque: true,
    descricao: 'Power cruiser italiana com motor V4 Granturismo de 1158cc, 168 HP e 127 Nm de torque. Design agressivo, suspensão ajustável e freios Brembo. Peso: 218kg.',
    categoria: 'Custom',
    potencia: 168,
    disponivel: true
  },
  {
    id: 3,
    nome: 'Ducati Panigale V4S',
    preco: 125000.0,
    imagem: '/frontend/images/ducativ4s.png',
    destaque: true,
    descricao: 'Superbike italiana com motor V4 de 1103cc, 214 HP e 124 Nm de torque. Equipada com winglets aerodinâmicos, Öhlins ajustável e quickshifter. Peso: 198kg.',
    categoria: 'Esportiva',
    potencia: 214,
    disponivel: true
  },
  {
    id: 4,
    nome: 'Kawasaki Ninja H2R',
    preco: 135000.0,
    imagem: '/frontend/images/h2r.png',
    destaque: true,
    descricao: 'Hyperbike japonesa com motor 4 cilindros supercharged de 998cc, 310 HP e 165 Nm de torque. Aceleração de 0-100km/h em 2.5s. Peso: 216kg.',
    categoria: 'Esportiva',
    potencia: 310,
    disponivel: true
  },
  {
    id: 5,
    nome: 'Kawasaki Z1000',
    preco: 78000.0,
    imagem: '/frontend/images/z1000.png',
    destaque: true,
    descricao: 'Naked sport japonesa com motor 4 cilindros em linha de 1043cc, 142 HP e 111 Nm de torque. Equipada com ABS, controle de tração e quickshifter. Peso: 221kg.',
    categoria: 'Naked',
    potencia: 142,
    disponivel: true
  }
];

function formatoPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function fetchProductsAPI() {
  const base = window.API_BASE_URL || (window.location.origin + '/api');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(base + '/products', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('API retornou erro');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Resposta inválida');

    // If no products from API, throw to use fallback
    if (data.length === 0) throw new Error('Nenhum produto encontrado');

    // Mapear produtos do backend para o formato usado aqui
    return data.map(p => ({
      id: p.codProduto || p.id || 0,
      nome: p.nome || 'Produto',
      preco: parseFloat(p.preco || 0),
      imagem: p.imagem_url || '/frontend/images/placeholder-moto.svg',
      descricao: p.descricao || '',
      categoria: p.categoria || 'Esportiva',
      potencia: p.potencia || null,
      disponivel: p.disponivel !== false,
      destaque: true
    }));
  } catch (err) {
    console.warn('Não foi possível buscar produtos da API, usando fallback local.', err && err.message);
    return produtosDestaque;
  }
}

// Fallback de imagem: substitui img por placeholder legível quando erro no carregamento
function handleImageError(imgEl) {
  try {
    const placeholder = document.createElement('div');
    placeholder.className = 'img-placeholder';
    const span = document.createElement('span');
    span.textContent = 'Imagem indisponível';
    placeholder.appendChild(span);
    imgEl.replaceWith(placeholder);
  } catch (e) {
  // se algo falhar, tenta trocar a src para o placeholder local
  try { imgEl.src = '/frontend/images/placeholder-moto.svg'; } catch (_) {}
  }
}

async function renderizarProdutosDestaque() {
  const lista = await fetchProductsAPI();

  // Render em containers possíveis
  const containers = [document.getElementById('produtos-destaque'), document.getElementById('lista-produtos')].filter(Boolean);
  containers.forEach(container => {
    container.innerHTML = '';
      lista.forEach(prod => {

        // Estrutura do card flip: .produto.flip-card > .flip-card-inner > .flip-card-front / .flip-card-back
        const card = document.createElement('div');
        card.className = 'produto flip-card';

        const inner = document.createElement('div');
        inner.className = 'flip-card-inner';

        // Frente
        const front = document.createElement('div');
        front.className = 'flip-card-front';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-image';

        // price tag overlay (ribbon)
        const priceTag = document.createElement('div');
        priceTag.className = 'price-tag';
        priceTag.textContent = formatoPreco(prod.preco);
        imgWrap.appendChild(priceTag);

        const imgEl = document.createElement('img');
        imgEl.alt = prod.nome || 'produto';
        try {
          const imgPath = (typeof prod.imagem === 'string') ? prod.imagem.trim() : '';
          if (!imgPath) {
            imgEl.src = window.location.origin + '/frontend/images/placeholder-moto.svg';
          } else if (/^https?:\/\//i.test(imgPath)) {
            imgEl.src = imgPath;
          } else if (imgPath.startsWith('/')) {
            imgEl.src = window.location.origin + imgPath;
          } else {
            const cleaned = imgPath.replace(/^\/+/, '');
            imgEl.src = window.location.origin + '/' + cleaned;
          }
        } catch (e) {
          console.error('Erro ao configurar imagem do produto', prod.nome, e);
          imgEl.src = window.location.origin + '/frontend/images/placeholder-moto.svg';
        }
        imgEl.onerror = function() { handleImageError(this); };
        imgWrap.appendChild(imgEl);

        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = `<h3>${prod.nome}</h3><p class="descricao">${prod.descricao}</p>`;

        front.appendChild(imgWrap);
        front.appendChild(body);

        // Verso do card
        const back = document.createElement('div');
        back.className = 'flip-card-back';
        back.innerHTML = `
          <div class="back-content">
            <h3>${prod.nome}</h3>
            <p class="descricao">${prod.descricao}</p>
            <ul class="specs">
              <li>Categoria: ${prod.categoria || '—'}</li>
              <li>Disponibilidade: ${prod.disponivel ? 'Em estoque' : 'Sob encomenda'}</li>
            </ul>
            <div class="back-footer">
              <span class="preco">${formatoPreco(prod.preco)}</span>
              <button class="add-cart">Adicionar ao Carrinho</button>
            </div>
          </div>
        `;

        // evento do botão no verso
        back.querySelector('.add-cart').onclick = function(e) { e.stopPropagation(); adicionarAoCarrinho({ id: prod.id, nome: prod.nome, preco: prod.preco }); atualizarContadorCarrinho(); };

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        // tornar acessível por toque: alterna a classe is-flipped em dispositivos sem hover
        card.addEventListener('click', function(e) {
          if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
            this.classList.toggle('is-flipped');
          }
        });

        container.appendChild(card);
      });
  });
}

// função para renderizar produtos na página index.html
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
      imgEl.alt = prod.nome || 'produto';
      imgEl.src = prod.imagem;
      imgEl.onerror = function() { handleImageError(this); };
      imgWrap.appendChild(imgEl);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `<h3>${prod.nome}</h3><p class="descricao">${prod.descricao}</p>`;

      const footer = document.createElement('div');
      footer.className = 'card-footer';
      footer.innerHTML = `<span class="preco">${formatoPreco(prod.preco)}</span>`;
      const btn = document.createElement('button');
      btn.textContent = 'Adicionar ao Carrinho';
      btn.onclick = function() { adicionarAoCarrinho({ id: prod.id, nome: prod.nome, preco: prod.preco }); atualizarContadorCarrinho(); };
      footer.appendChild(btn);

      div.appendChild(imgWrap);
      div.appendChild(body);
      div.appendChild(footer);

      container.appendChild(div);
    });
  });
}

// Function to load products for the products page
async function carregarProdutosPagina() {
  const listaContainer = document.getElementById('lista-produtos');
  const loadingSpinner = document.getElementById('loading-spinner');
  const noProductsMsg = document.getElementById('no-products');

  if (!listaContainer) return;

  // Show loading
  loadingSpinner.style.display = 'block';
  listaContainer.innerHTML = '';
  noProductsMsg.style.display = 'none';

  try {
    const produtos = await fetchProductsAPI();

    // Hide loading
    loadingSpinner.style.display = 'none';

    if (produtos.length === 0) {
      noProductsMsg.style.display = 'block';
      return;
    }

    // Store products globally for filtering
    todosProdutos = [...produtos];
    produtosFiltrados = [...produtos];

    // Render products using the filtering function
    renderizarProdutosFiltrados();

  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    loadingSpinner.style.display = 'none';
    noProductsMsg.style.display = 'block';
    noProductsMsg.innerHTML = `
      <h3>Erro ao carregar produtos</h3>
      <p>Verifique sua conexão e tente novamente.</p>
    `;
  }
}

// Global variables for products page
let todosProdutos = [];
let produtosFiltrados = [];

// Filter and search functions
function filtrarProdutos() {
  const categoriaSelect = document.getElementById('filter-category');
  const ordenacaoSelect = document.getElementById('sort-by');
  const searchInput = document.querySelector('.search-input');

  if (!categoriaSelect || !ordenacaoSelect || !searchInput) return;

  const categoria = categoriaSelect.value;
  const ordenacao = ordenacaoSelect.value;
  const termoBusca = searchInput.value.toLowerCase().trim();

  // Filter by category and search term
  produtosFiltrados = todosProdutos.filter(produto => {
    const matchCategoria = categoria === 'all' || produto.categoria === categoria;
    const matchBusca = !termoBusca ||
      produto.nome.toLowerCase().includes(termoBusca) ||
      produto.descricao.toLowerCase().includes(termoBusca) ||
      (produto.categoria && produto.categoria.toLowerCase().includes(termoBusca));

    return matchCategoria && matchBusca;
  });

  // Sort products
  produtosFiltrados.sort((a, b) => {
    switch (ordenacao) {
      case 'price-asc':
        return a.preco - b.preco;
      case 'price-desc':
        return b.preco - a.preco;
      case 'popular':
      default:
        return 0; // Keep original order for popular
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

    // Front
    const front = document.createElement('div');
    front.className = 'flip-card-front';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'card-image';

    const priceTag = document.createElement('div');
    priceTag.className = 'price-tag';
    priceTag.textContent = formatoPreco(prod.preco);
    imgWrap.appendChild(priceTag);

    const imgEl = document.createElement('img');
    imgEl.alt = prod.nome || 'Produto';
    try {
      const imgPath = (typeof prod.imagem === 'string') ? prod.imagem.trim() : '';
      if (!imgPath) {
        imgEl.src = window.location.origin + '/frontend/images/placeholder-moto.svg';
      } else if (/^https?:\/\//i.test(imgPath)) {
        imgEl.src = imgPath;
      } else if (imgPath.startsWith('/')) {
        imgEl.src = window.location.origin + imgPath;
      } else {
        const cleaned = imgPath.replace(/^\/+/, '');
        imgEl.src = window.location.origin + '/' + cleaned;
      }
    } catch (e) {
      imgEl.src = window.location.origin + '/frontend/images/placeholder-moto.svg';
    }
    imgEl.onerror = function() { handleImageError(this); };
    imgWrap.appendChild(imgEl);

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `<h3>${prod.nome}</h3><p class="categoria">${prod.categoria || 'Moto'}</p>`;

    front.appendChild(imgWrap);
    front.appendChild(body);

    // Back
    const back = document.createElement('div');
    back.className = 'flip-card-back';
    back.innerHTML = `
      <div class="back-content">
        <h3>${prod.nome}</h3>
        <p class="descricao">${prod.descricao}</p>
        <ul class="specs">
          <li><strong>Potência:</strong> ${prod.potencia || 'N/A'} HP</li>
          <li><strong>Categoria:</strong> ${prod.categoria || 'Esportiva'}</li>
          <li><strong>Disponibilidade:</strong> ${prod.disponivel !== false ? 'Em estoque' : 'Sob encomenda'}</li>
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

    // Mobile tap support
    card.addEventListener('click', function(e) {
      if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
        this.classList.toggle('is-flipped');
      }
    });

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarProdutosDestaque();
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    renderizarProdutosIndex();
  }
  if (window.location.pathname.includes('produtos.html')) {
    carregarProdutosPagina();

    // Add event listeners for filters
    const categoriaSelect = document.getElementById('filter-category');
    const ordenacaoSelect = document.getElementById('sort-by');
    const searchInput = document.querySelector('.search-input');

    if (categoriaSelect) categoriaSelect.addEventListener('change', filtrarProdutos);
    if (ordenacaoSelect) ordenacaoSelect.addEventListener('change', filtrarProdutos);
    if (searchInput) searchInput.addEventListener('input', filtrarProdutos);
  }
});
