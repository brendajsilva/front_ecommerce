// Inicialização do frontend: contador do carrinho e produtos em destaque

window.API_BASE_URL = 'https://backendecommerce-production-ce37.up.railway.app';

// Atualiza contador do carrinho
function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = carrinho.length;
}

// Produtos locais (fallback caso API falhe)
const produtosDestaque = [
  {
    id: 1,
    nome: 'BMW S1000RR',
    preco: 82000.0,
    imagem: '/images/bmws1000rr.png',
    destaque: true,
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
    destaque: true,
    descricao: 'Power cruiser italiana V4...',
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
    descricao: 'Superbike italiana V4...',
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
    descricao: 'Hyperbike supercharged...',
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
    descricao: 'Naked sport japonesa...',
    categoria: 'Naked',
    potencia: 142,
    disponivel: true
  }
];

function formatoPreco(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// BUSCA API
async function fetchProductsAPI() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(window.API_BASE_URL + '/produtos', {
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error("Falha API");

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Formato inválido");

    return data.map(p => ({
      id: p.codProduto || p.id,
      nome: p.nome || 'Produto',
      preco: Number(p.preco || 0),
      imagem: p.imagem_url || '/images/placeholder-moto.svg',
      descricao: p.descricao || '',
      categoria: p.categoria || 'Esportiva',
      potencia: p.potencia || null,
      disponivel: p.disponivel !== false,
      destaque: true
    }));

  } catch (err) {
    console.warn("Erro API, usando fallback:", err.message);
    return produtosDestaque;
  }
}

// Placeholder
function handleImageError(el) {
  el.src = '/images/placeholder-moto.svg';
}

// Renderizar destaques
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

      const front = document.createElement('div');
      front.className = 'flip-card-front';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'card-image';

      const priceTag = document.createElement('div');
      priceTag.className = 'price-tag';
      priceTag.textContent = formatoPreco(prod.preco);
      imgWrap.appendChild(priceTag);

      const imgEl = document.createElement('img');
      imgEl.src = prod.imagem;
      imgEl.alt = prod.nome;
      imgEl.onerror = () => handleImageError(imgEl);
      imgWrap.appendChild(imgEl);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `<h3>${prod.nome}</h3><p>${prod.descricao}</p>`;

      front.appendChild(imgWrap);
      front.appendChild(body);

      const back = document.createElement('div');
      back.className = 'flip-card-back';
      back.innerHTML = `
        <h3>${prod.nome}</h3>
        <p>${prod.descricao}</p>
        <ul>
          <li>Categoria: ${prod.categoria}</li>
          <li>Potência: ${prod.potencia || 'N/A'} HP</li>
        </ul>
        <button onclick="adicionarAoCarrinho(${prod.id})">Comprar</button>
      `;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      container.appendChild(card);
    });
  });
}

// Carregar página produtos.html
async function carregarProdutosPagina() {
  const listaContainer = document.getElementById('lista-produtos');
  const loading = document.getElementById('loading-spinner');
  const empty = document.getElementById('no-products');

  if (!listaContainer) return;

  loading.style.display = "block";
  empty.style.display = "none";

  try {
    const produtos = await fetchProductsAPI();
    loading.style.display = "none";

    if (!produtos.length) {
      empty.style.display = "block";
      return;
    }

    window.todosProdutos = [...produtos];
    window.produtosFiltrados = [...produtos];

    renderizarProdutosFiltrados();

  } catch (err) {
    loading.style.display = "none";
    empty.style.display = "block";
  }
}

// Filtro
function filtrarProdutos() {
  const categoria = document.getElementById('filter-category')?.value;
  const ordenacao = document.getElementById('sort-by')?.value;
  const termo = document.querySelector('.search-input')?.value.toLowerCase() || "";

  produtosFiltrados = todosProdutos.filter(p =>
    (categoria === 'all' || p.categoria.toLowerCase() === categoria.toLowerCase()) &&
    (p.nome.toLowerCase().includes(termo) ||
     p.descricao.toLowerCase().includes(termo))
  );

  if (ordenacao === 'price-asc') produtosFiltrados.sort((a, b) => a.preco - b.preco);
  if (ordenacao === 'price-desc') produtosFiltrados.sort((a, b) => b.preco - a.preco);

  renderizarProdutosFiltrados();
}

// Renderizar filtrados
function renderizarProdutosFiltrados() {
  const container = document.getElementById('lista-produtos');
  const empty = document.getElementById('no-products');

  container.innerHTML = '';

  if (!produtosFiltrados.length) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  produtosFiltrados.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card flip-card';

    const inner = document.createElement('div');
    inner.className = 'flip-card-inner';

    const front = document.createElement('div');
    front.className = 'flip-card-front';

    const img = document.createElement('img');
    img.src = prod.imagem;
    img.alt = prod.nome;
    img.onerror = () => handleImageError(img);

    front.appendChild(img);
    front.innerHTML += `<h3>${prod.nome}</h3><p>${prod.categoria}</p>`;

    const back = document.createElement('div');
    back.className = 'flip-card-back';
    back.innerHTML = `
      <h3>${prod.nome}</h3>
      <p>${prod.descricao}</p>
      <button onclick="adicionarAoCarrinho(${prod.id})">Adicionar ao Carrinho</button>
    `;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    container.appendChild(card);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  atualizarContadorCarrinho();
  renderizarProdutosDestaque();

  if (location.pathname.includes('produtos.html')) {
    carregarProdutosPagina();
    document.getElementById('filter-category')?.addEventListener('change', filtrarProdutos);
    document.getElementById('sort-by')?.addEventListener('change', filtrarProdutos);
    document.querySelector('.search-input')?.addEventListener('input', filtrarProdutos);
  }
});
