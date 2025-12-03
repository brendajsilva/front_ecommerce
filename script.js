// script.js - Lógica do carrinho e utilidades

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

const produtosFallback = [
  {
    id: 1,
    nome: 'BMW S1000RR',
    preco: 82000.0,
    imagem: '/images/bmws1000rr.png',
    descricao: 'Superbike alemã...',
    categoria: 'Esportiva',
    potencia: 207,
    disponivel: true
  },
  {
    id: 2,
    nome: 'Ducati Diavel V4',
    preco: 95000.0,
    imagem: '/images/DucatiDiavel.png',
    descricao: 'Power Cruiser italiana...',
    categoria: 'Custom',
    potencia: 168,
    disponivel: true
  },
  {
    id: 3,
    nome: 'Ducati Panigale V4S',
    preco: 125000.0,
    imagem: '/images/ducativ4s.png',
    descricao: 'Superbike V4...',
    categoria: 'Esportiva',
    potencia: 214,
    disponivel: true
  },
  {
    id: 4,
    nome: 'Kawasaki H2R',
    preco: 135000.0,
    imagem: '/images/h2r.png',
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
    descricao: 'Naked japonesa...',
    categoria: 'Naked',
    potencia: 142,
    disponivel: true
  }
];

function formatoPrecoBR(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarContadorCarrinho() {
  const el = document.getElementById('cart-count');
  if (el) el.textContent = carrinho.length;
}

async function buscarProdutoPorId(id) {
  try {
    if (typeof fetchProductsAPI === 'function') {
      const produtos = await fetchProductsAPI();
      const p = produtos.find(x => x.id == id);
      if (p) return p;
    }
  } catch {}

  return produtosFallback.find(p => p.id == id);
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarContadorCarrinho();
}

function adicionarAoCarrinho(id) {
  (async () => {
    const produto = await buscarProdutoPorId(id);
    if (!produto) return;

    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem || '/images/placeholder-moto.svg'
    });

    salvarCarrinho();
    alert(produto.nome + " adicionado ao carrinho!");
  })();
}

window.adicionarAoCarrinho = adicionarAoCarrinho;

document.addEventListener('DOMContentLoaded', atualizarContadorCarrinho);
