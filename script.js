const localProducts = [
    {
        id: 1,
        nome: 'BMW S1000RR',
        preco: 82000.0,
        imagem: '/images/bmws1000rr.png',
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
        imagem: '/images/DucatiDiavel.png',
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
        imagem: '/images/ducativ4s.png',
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
        imagem: '/images/h2r.png',
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
        imagem: '/images/z1000.png',
        destaque: true,
        descricao: 'Naked sport japonesa com motor 4 cilindros em linha de 1043cc, 142 HP e 111 Nm de torque. Equipada com ABS, controle de tração e quickshifter. Peso: 221kg.',
        categoria: 'Naked',
        potencia: 142,
        disponivel: true
    }
];

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let userLogado = JSON.parse(localStorage.getItem('userLogado')) || null;

// Função para formatar CPF
function formatarCPF(input) {
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    input.value = value;
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove não-dígitos

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Calcula primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf[i]) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    // Calcula segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf[i]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
}

// Função para validar RG (identidade) - validação básica
function validarRG(rg) {
    rg = rg.replace(/\D/g, ''); // Remove não-dígitos
    // RG deve ter pelo menos 7 dígitos (pode variar por estado)
    return rg.length >= 7 && rg.length <= 12 && !/^(\d)\1+$/.test(rg);
}

function atualizarCarrinho() {
    const count = document.getElementById("cart-count");
    if (count) {
        count.textContent = carrinho.length;
    }
}

function mostrarMensagem(mensagem, tipo='success') {
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
    setTimeout(() => { if (el.parentNode) el.remove(); }, 3000);
}

function adicionarAoCarrinho(produtoId) {
    if (!verificarAutenticacao()) return;

    const produto = localProducts.find(p => p.id === produtoId);
    if (!produto) {
        mostrarMensagem("Produto não encontrado", "error");
        return;
    }

    carrinho.push(produto);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarCarrinho();
    mostrarMensagem(`${produto.nome} adicionado ao carrinho! 🛒`);
}

function verificarAutenticacao() {
    if (!userLogado && !window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

function carregarProdutos() {
    const container = document.getElementById('produtos-lista') || document.getElementById('produtos-destaque');
    if (!container) return;

    container.innerHTML = '';
    localProducts.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'produto flip-card';
        card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="${prod.imagem}" alt="${prod.nome}" onerror="this.src='/images/placeholder-moto.svg'"/>
            <h3>${prod.nome}</h3>
            <span class="price-tag">R$ ${prod.preco.toFixed(2)}</span>
          </div>
          <div class="flip-card-back">
            <p>${prod.descricao}</p>
            <button onclick="adicionarAoCarrinho(${prod.id})">Adicionar ao Carrinho</button>
          </div>
        </div>
        `;
        container.appendChild(card);
    });

    // Attach mobile tap event for flip cards
    document.querySelectorAll('.produto.flip-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

function carregarCarrinho() {
    console.log('Carregando carrinho...');
    if (!verificarAutenticacao()) return;

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

    // Calculate totals
    let subtotal = 0;
    let frete = 0;

    // Group items by ID to handle quantities
    const groupedItems = {};
    carrinho.forEach(item => {
        if (groupedItems[item.id]) {
            groupedItems[item.id].quantity += 1;
        } else {
            groupedItems[item.id] = {
                ...item,
                quantity: 1
            };
        }
    });

    const items = Object.values(groupedItems);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (items.length === 0) {
        emptyCart.style.display = "block";
        cartContainer.style.display = "none";
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    emptyCart.style.display = "none";
    cartContainer.style.display = "block";
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Update items count
    if (itemsCount) itemsCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    lista.innerHTML = "";

    items.forEach((item) => {
        const itemTotal = item.preco * item.quantity;
        subtotal += itemTotal;

        const itemDiv = document.createElement("div");
        itemDiv.className = "carrinho-item";

        itemDiv.innerHTML = `
            <img src="${item.imagem || '/images/placeholder-moto.svg'}" alt="${item.nome}" class="item-image" onerror="this.src='/images/placeholder-moto.svg'">
            <div class="item-details">
                <span class="item-name">${item.nome}</span>
                <span class="item-price">R$ ${item.preco.toFixed(2)}</span>
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

    // Calculate shipping (free over R$ 50,000)
    frete = subtotal >= 50000 ? 0 : 150;

    // Update summary
    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;

    atualizarCarrinho();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
    mostrarMensagem('Item removido do carrinho');
}

function alterarQuantidade(itemId, delta) {
    console.log('Alterando quantidade:', itemId, delta);

    const currentQuantity = carrinho.filter(item => item.id === itemId).length;
    const newQuantity = Math.max(1, currentQuantity + delta);

    console.log('Quantidade atual:', currentQuantity, 'Nova quantidade:', newQuantity);

    if (newQuantity > currentQuantity) {
        // Add items
        const itemTemplate = localProducts.find(p => p.id === itemId);
        if (itemTemplate) {
            for (let i = currentQuantity; i < newQuantity; i++) {
                carrinho.push({...itemTemplate});
            }
        }
    } else if (newQuantity < currentQuantity) {
        // Remove items
        let removed = 0;
        carrinho = carrinho.filter(item => {
            if (item.id === itemId && removed < (currentQuantity - newQuantity)) {
                removed++;
                return false;
            }
            return true;
        });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
    mostrarMensagem(`Quantidade atualizada para ${newQuantity}`);
}

function definirQuantidade(itemId, quantidade) {
    const qty = parseInt(quantidade);
    if (isNaN(qty) || qty < 1) return;

    console.log('Definindo quantidade:', itemId, qty);

    // Remove all items with this ID
    carrinho = carrinho.filter(item => item.id !== itemId);

    // Find the item template
    const itemTemplate = localProducts.find(p => p.id === itemId);
    if (!itemTemplate) {
        console.error('Item template not found:', itemId);
        return;
    }

    // Add the new quantity
    for (let i = 0; i < qty; i++) {
        carrinho.push({...itemTemplate});
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
    mostrarMensagem(`Quantidade definida para ${qty}`);
}

function removerItemPorId(itemId) {
    console.log('Removendo item:', itemId);
    const itemName = localProducts.find(p => p.id === itemId)?.nome || 'Item';
    carrinho = carrinho.filter(item => item.id !== itemId);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
    mostrarMensagem(`${itemName} removido do carrinho`);
}

function carregarLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const username = form.querySelector('#usuario').value.trim();
        const password = form.querySelector('#senha').value.trim();
        if (!username || !password) {
            mostrarMensagem("Preencha todos os campos", "error");
            return;
        }
        // Fake authentication: store user in localStorage
        userLogado = { username };
        localStorage.setItem('userLogado', JSON.stringify(userLogado));
        mostrarMensagem(`Bem vindo, ${username}!`);
        // Redirect to home after login
        setTimeout(() => window.location.href = 'index.html', 1000);
    });
}

function carregarCadastroForm() {
    const form = document.getElementById('cadastro-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const username = form.querySelector('#novoUsername').value.trim();
        const senha = form.querySelector('#novaSenha').value.trim();
        if (!username || !senha) {
            mostrarMensagem("Preencha todos os campos", "error");
            return;
        }
        // Fake registration: store user in localStorage
        userLogado = { username };
        localStorage.setItem('userLogado', JSON.stringify(userLogado));
        mostrarMensagem(`Cadastro realizado com sucesso. Bem vindo, ${username}!`);
        setTimeout(() => window.location.href = 'index.html', 1500);
    });
}

async function login(event) {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    if (!usuario || !senha) {
        mostrarMensagem("Preencha todos os campos", "error");
        return;
    }

    // Validar CPF se for formato de CPF (11 dígitos)
    const cpfLimpo = usuario.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
        if (!validarCPF(usuario)) {
            mostrarMensagem("CPF inválido", "error");
            return;
        }
    } else if (cpfLimpo.length >= 7 && cpfLimpo.length <= 12) {
        // Para RG, validação básica
        if (!validarRG(usuario)) {
            mostrarMensagem("RG inválido", "error");
            return;
        }
    }
    // Para outros formatos (email, username), não validar formato

    try {
        const base = window.API_BASE_URL || (window.location.origin + '/api');
        const response = await fetch(base + '/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro no login');
        }

        // Store user and token
        userLogado = data.usuario;
        localStorage.setItem('userLogado', JSON.stringify(userLogado));
        localStorage.setItem('user', JSON.stringify(userLogado));
        localStorage.setItem('token', data.token);
        mostrarMensagem(`Bem vindo, ${usuario}!`);

        // Check if user is admin and redirect accordingly
        const redirectUrl = data.usuario.tipo === 'ADMIN' ? './admin.html' : './inicio.html';
        console.log('Login successful, redirecting to:', redirectUrl);
        setTimeout(() => {
            console.log('Executing redirect...');
            window.location.href = redirectUrl;
        }, 1000);
    } catch (error) {
        console.error('Erro no login:', error);
        mostrarMensagem(error.message || 'Erro ao fazer login', 'error');
    }
}

async function cadastrarAPI(event) {
    event.preventDefault();
    const username = document.getElementById('novoUsername').value.trim();
    const nomeCompleto = document.getElementById('novoNomeCompleto').value.trim();
    const email = document.getElementById('novoEmail').value.trim();
    const telefone = document.getElementById('novoTelefone').value.trim();
    const cpf = document.getElementById('novoCPF').value.trim();
    const senha = document.getElementById('novaSenha').value.trim();
    if (!username || !nomeCompleto || !email || !senha || !cpf) {
        mostrarMensagem("Preencha todos os campos obrigatórios", "error");
        return;
    }

    // Validar CPF
    if (!validarCPF(cpf)) {
        mostrarMensagem("CPF inválido", "error");
        return;
    }

    try {
        const base = window.API_BASE_URL || (window.location.origin + '/api');
        const response = await fetch(base + '/usuarios/registro', {
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

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro no cadastro');
        }

        // Store user and token
        userLogado = data.usuario;
        localStorage.setItem('userLogado', JSON.stringify(userLogado));
        localStorage.setItem('user', JSON.stringify(userLogado));
        localStorage.setItem('token', data.token);
        mostrarMensagem(`Cadastro realizado com sucesso. Bem vindo, ${username}!`);
        setTimeout(() => window.location.href = './inicio.html', 1500);
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
    window.location.href = '/';  
}

function finalizarCompra() {
    console.log('Iniciando checkout...');

    if (carrinho.length === 0) {
        mostrarMensagem('Seu carrinho está vazio', 'error');
        return;
    }

    // Check if address is selected
    const enderecoSelecionado = document.getElementById('endereco-selecionado');
    if (!enderecoSelecionado || enderecoSelecionado.querySelector('.no-address')) {
        mostrarMensagem('Selecione um endereço de entrega', 'error');
        abrirModalEnderecos();
        return;
    }

    // Open payment modal
    abrirModalPagamento();
}

function abrirModalPagamento() {
    const modal = document.getElementById('modal-pagamento');
    if (modal) {
        modal.style.display = 'block';
    }
}

function fecharModalPagamento() {
    const modal = document.getElementById('modal-pagamento');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function confirmarMetodoPagamento() {
    const metodoSelecionado = document.querySelector('input[name="metodo-pagamento-modal"]:checked');
    if (!metodoSelecionado) {
        mostrarMensagem('Selecione um método de pagamento', 'error');
        return;
    }

    const metodo = metodoSelecionado.value;
    console.log('Método de pagamento selecionado:', metodo);

    // Get selected address
    const enderecoSelecionado = localStorage.getItem('enderecoSelecionado');
    if (!enderecoSelecionado) {
        mostrarMensagem('Selecione um endereço de entrega', 'error');
        return;
    }

    const endereco = JSON.parse(enderecoSelecionado);

    // Prepare order data
    const itens = [];
    const groupedItems = {};

    // Group cart items
    carrinho.forEach(item => {
        if (groupedItems[item.id]) {
            groupedItems[item.id].quantity += 1;
        } else {
            groupedItems[item.id] = {
                idProduto: item.id,
                quantidade: 1
            };
        }
    });

    // Convert to API format
    Object.values(groupedItems).forEach(item => {
        itens.push({
            idProduto: item.idProduto,
            quantidade: item.quantidade
        });
    });

    const orderData = {
        itens: itens,
        idEndereco: endereco.id,
        metodoPagamento: metodo
    };

    console.log('Enviando pedido:', orderData);

    try {
        const response = await fetch(window.API_BASE_URL + '/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Pedido criado:', result);

            mostrarMensagem('Compra finalizada com sucesso! 🎉', 'success');

            // Clear cart
            carrinho = [];
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            localStorage.removeItem('enderecoSelecionado');
        
            // Close modal and redirect to profile
            fecharModalPagamento();
            setTimeout(() => {
                window.location.href = './perfil.html';
            }, 2000);
        } else {
            const error = await response.json();
            console.error('Erro ao criar pedido:', error);
            mostrarMensagem(error.error || 'Erro ao finalizar compra', 'error');
        }
    } catch (error) {
        console.error('Erro de rede ao criar pedido:', error);
        mostrarMensagem('Erro de conexão. Tente novamente.', 'error');
    }
}

// Address modal functions
function abrirModalEnderecos() {
    console.log('Abrindo modal de endereços');
    const modal = document.getElementById('modal-enderecos');
    if (modal) {
        modal.style.display = 'block';
        carregarEnderecos();
    }
}

function fecharModalEnderecos() {
    const modal = document.getElementById('modal-enderecos');
    if (modal) {
        modal.style.display = 'none';
    }
}

function abrirModalNovoEndereco() {
    console.log('Abrindo modal de novo endereço');
    fecharModalEnderecos();
    const modal = document.getElementById('modal-novo-endereco');
    if (modal) {
        modal.style.display = 'block';
    }
}

function fecharModalNovoEndereco() {
    const modal = document.getElementById('modal-novo-endereco');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function carregarEnderecos() {
    console.log('Carregando endereços...');
    const listaEnderecos = document.getElementById('lista-enderecos');
    if (!listaEnderecos) return;

    try {
        const response = await fetch(window.API_BASE_URL + '/enderecos', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const enderecos = await response.json();
            listaEnderecos.innerHTML = '';

            if (enderecos.length === 0) {
                listaEnderecos.innerHTML = '<p>Nenhum endereço cadastrado.</p>';
            } else {
                enderecos.forEach(endereco => {
                    const enderecoDiv = document.createElement('div');
                    enderecoDiv.className = 'endereco-item';
                    enderecoDiv.innerHTML = `
                        <div class="endereco-info">
                            <strong>${endereco.apelido || 'Endereço'}</strong><br>
                            ${endereco.logradouro}, ${endereco.numero}<br>
                            ${endereco.bairro} - ${endereco.localidade}/${endereco.uf}<br>
                            CEP: ${endereco.cep}
                        </div>
                        <button class="btn-secondary" onclick="selecionarEndereco(${endereco.codEndereco}, '${endereco.apelido || 'Endereço'}', '${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}')">Selecionar</button>
                    `;
                    listaEnderecos.appendChild(enderecoDiv);
                });
            }
        } else {
            listaEnderecos.innerHTML = '<p>Erro ao carregar endereços.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        listaEnderecos.innerHTML = '<p>Erro ao carregar endereços.</p>';
    }
}

function selecionarEndereco(id, apelido, endereco) {
    console.log('Selecionando endereço:', id, apelido);

    const enderecoSelecionado = document.getElementById('endereco-selecionado');
    if (enderecoSelecionado) {
        enderecoSelecionado.innerHTML = `
            <div class="endereco-selecionado-info">
                <strong>📍 ${apelido}</strong><br>
                <span>${endereco}</span><br>
                <button class="btn-link" onclick="abrirModalEnderecos()">Alterar</button>
            </div>
        `;
    }

    // Store selected address
    localStorage.setItem('enderecoSelecionado', JSON.stringify({ id, apelido, endereco }));

    fecharModalEnderecos();
    mostrarMensagem('Endereço selecionado com sucesso!');
}

async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        mostrarMensagem('CEP deve ter 8 dígitos', 'error');
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            mostrarMensagem('CEP não encontrado', 'error');
            return;
        }

        // Preencher campos
        document.getElementById('logradouro').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('localidade').value = data.localidade || '';
        document.getElementById('uf').value = data.uf || '';

        mostrarMensagem('CEP encontrado e campos preenchidos!');
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        mostrarMensagem('Erro ao buscar CEP', 'error');
    }
}

document.getElementById('form-novo-endereco')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
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

    console.log('Enviando dados do endereço:', enderecoData);
    console.log('Token:', localStorage.getItem('token'));
    console.log('API URL:', window.API_BASE_URL + '/enderecos');

    try {
        const response = await fetch(window.API_BASE_URL + '/enderecos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(enderecoData)
        });

        console.log('Resposta do servidor:', response.status, response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('Endereço criado:', result);
            mostrarMensagem('Endereço cadastrado com sucesso!');
            fecharModalNovoEndereco();
            // Reload addresses
            setTimeout(() => abrirModalEnderecos(), 500);
        } else {
            const error = await response.json();
            console.error('Erro do servidor:', error);
            mostrarMensagem(error.error || 'Erro ao cadastrar endereço', 'error');
        }
    } catch (error) {
        console.error('Erro de rede ao cadastrar endereço:', error);
        mostrarMensagem('Erro de conexão. Verifique se o servidor está rodando.', 'error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();

    if (window.location.href.includes('produtos.html')) {
        carregarProdutos();
    }
    else if (window.location.href.includes('carrinho.html')) {
        carregarCarrinho();
    }
    else if (window.location.href.includes('login.html')) {
        carregarLoginForm();
    }
    else if (window.location.href.includes('cadastro.html')) {
        carregarCadastroForm();
    }
});

// Make cart functions globally available
window.alterarQuantidade = alterarQuantidade;
window.definirQuantidade = definirQuantidade;
window.removerItemPorId = removerItemPorId;
window.finalizarCompra = finalizarCompra;
window.abrirModalPagamento = abrirModalPagamento;
window.fecharModalPagamento = fecharModalPagamento;
window.confirmarMetodoPagamento = confirmarMetodoPagamento;

// Password toggle function
function toggleSenha(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈'; // Closed eye when visible
    } else {
        input.type = 'password';
        toggleBtn.textContent = '👁'; // Open eye when hidden
    }
}

// Make functions globally available
window.toggleSenha = toggleSenha;
window.abrirModalEnderecos = abrirModalEnderecos;
window.fecharModalEnderecos = fecharModalEnderecos;
window.abrirModalNovoEndereco = abrirModalNovoEndereco;
window.fecharModalNovoEndereco = fecharModalNovoEndereco;
window.buscarCEP = buscarCEP;
window.selecionarEndereco = selecionarEndereco;
