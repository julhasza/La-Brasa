const API_BASE_URL = 'https://la-brasa.onrender.com/api';
const slide = document.querySelector('.carrossel-slide');
if (slide) {
    const images = document.querySelectorAll('.carrossel-slide img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    let counter = 0;

    function updateCarousel() {
        slide.style.transform = `translateX(${-100 * counter}%)`;
    }

    nextBtn.addEventListener('click', () => {
        counter = counter >= images.length - 1 ? 0 : counter + 1;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        counter = counter <= 0 ? images.length - 1 : counter - 1;
        updateCarousel();
    });
}

function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    fetch('header.html')
        .then((response) => response.text())
        .then((data) => {
            headerPlaceholder.innerHTML = data;

            let currentPage = window.location.pathname.split('/').pop();
            if (currentPage === '' || currentPage === '/') {
                currentPage = 'home.html';
            }

            const navLinks = headerPlaceholder.querySelectorAll('nav ul li a');
            navLinks.forEach((link) => {
                const linkDestino = link.getAttribute('href');
                if (linkDestino === currentPage) {
                    link.style.color = '#FF4400';
                    link.style.borderBottom = '3px solid #FF4400';
                    link.style.paddingBottom = '5px';
                }
            });

            const authLink = document.getElementById('auth-link');
            const usuarioLogado = localStorage.getItem('labrasa_usuario_logado');
            if (authLink && usuarioLogado) {
                authLink.textContent = 'Sair';
                authLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    localStorage.removeItem('labrasa_usuario_logado');
                    window.location.href = 'login.html';
                });
            }

            if (typeof atualizarInterface === 'function') {
                atualizarInterface();
            }
        })
        .catch((error) => console.error('Erro ao carregar o header:', error));
}

document.addEventListener('DOMContentLoaded', loadHeader);

const cartSidebar = document.getElementById('cart-sidebar');
const closeBtn = document.getElementById('close-cart');
const cartList = document.querySelector('.cart-items');
const cartTotalValue = document.getElementById('cart-total-value');
const cardapioContainer = document.getElementById('cardapio-container');

let totalGeral = 0;
let quantidadeItens = 0;
const itensCarrinho = {};
let toastTimer;
const cartToast = document.getElementById('cart-toast');

function formatarPreco(valor) {
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function salvarCarrinho() {
    const pedido = Object.entries(itensCarrinho).map(([nome, item]) => ({
        nome,
        preco: item.preco,
        qtd: item.quantidade
    }));

    if (pedido.length > 0) {
        localStorage.setItem('labrasa_pedido', JSON.stringify(pedido));
    } else {
        localStorage.removeItem('labrasa_pedido');
    }
}

function carregarCarrinho() {
    if (!cartList) return;

    const pedidoSalvo = localStorage.getItem('labrasa_pedido');
    if (!pedidoSalvo) return;

    try {
        const itensSalvos = JSON.parse(pedidoSalvo);
        itensSalvos.forEach(({ nome, preco, qtd }) => {
            criarItemCarrinho(nome, preco);
            itensCarrinho[nome].quantidade = qtd;
            totalGeral += preco * qtd;
            quantidadeItens += qtd;
        });
        atualizarInterface();
    } catch (error) {
        console.error('Erro ao carregar carrinho salvo:', error);
    }
}

function atualizarInterface() {
    if (totalGeral < 0) totalGeral = 0;
    if (quantidadeItens < 0) quantidadeItens = 0;

    if (cartTotalValue) {
        cartTotalValue.innerText = formatarPreco(totalGeral);
    }

    const cartCountElem = document.getElementById('cart-count');
    if (cartCountElem) {
        cartCountElem.innerText = quantidadeItens;
    }

    Object.values(itensCarrinho).forEach((item) => {
        const quantidade = item.elemento.querySelector('.item-quantity');
        const preco = item.elemento.querySelector('.item-price');
        quantidade.innerText = item.quantidade;
        preco.innerText = formatarPreco(item.preco * item.quantidade);
    });

    salvarCarrinho();
}

function criarItemCarrinho(nome, preco) {
    if (!cartList) return;

    const li = document.createElement('li');
    li.classList.add('cart-item');
    li.innerHTML = `
        <div class="item-info">
            <p>${nome}</p>
            <span class="item-price">${formatarPreco(preco)}</span>
        </div>
        <div class="quantity-controls">
            <button class="quantity-btn decrease-item">-</button>
            <span class="item-quantity">1</span>
            <button class="quantity-btn increase-item">+</button>
        </div>
        <button class="remove-item">X</button>
    `;

    itensCarrinho[nome] = { preco, quantidade: 1, elemento: li };

    li.querySelector('.decrease-item').addEventListener('click', () => {
        const item = itensCarrinho[nome];
        if (item.quantidade > 1) {
            item.quantidade--;
            totalGeral -= item.preco;
            quantidadeItens--;
            atualizarInterface();
            return;
        }

        li.remove();
        totalGeral -= item.preco;
        quantidadeItens--;
        delete itensCarrinho[nome];
        atualizarInterface();
    });

    li.querySelector('.increase-item').addEventListener('click', () => {
        const item = itensCarrinho[nome];
        item.quantidade++;
        totalGeral += item.preco;
        quantidadeItens++;
        atualizarInterface();
    });

    li.querySelector('.remove-item').addEventListener('click', () => {
        const item = itensCarrinho[nome];
        li.remove();
        totalGeral -= item.preco * item.quantidade;
        quantidadeItens -= item.quantidade;
        delete itensCarrinho[nome];
        atualizarInterface();
    });

    cartList.appendChild(li);
}

function mostrarMensagemCarrinho(mensagem) {
    if (!cartToast) return;
    cartToast.textContent = mensagem;
    cartToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => cartToast.classList.remove('show'), 2200);
}

function adicionarAoCarrinho(nome, preco) {
    if (!nome || Number.isNaN(preco)) return;

    const abriuCarrinho = quantidadeItens === 0;

    if (itensCarrinho[nome]) {
        itensCarrinho[nome].quantidade++;
    } else {
        criarItemCarrinho(nome, preco);
    }

    totalGeral += preco;
    quantidadeItens++;
    atualizarInterface();

    if (abriuCarrinho && cartSidebar) {
        cartSidebar.classList.add('open');
    }

    mostrarMensagemCarrinho('Seu pedido foi adicionado com sucesso!');
}

function bindBotoesPedir() {
    const btnsPedir = document.querySelectorAll('.bt-pedir');
    btnsPedir.forEach((botao) => {
        botao.addEventListener('click', () => {
            const nome = botao.getAttribute('data-nome');
            const preco = parseFloat(botao.getAttribute('data-preco'));
            adicionarAoCarrinho(nome, preco);
        });
    });
}

function criarCardProduto(item) {
    return `
        <div class="item-cardapio">
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="info-produto">
                <h3>${item.nome}</h3>
                <p>${item.descricao}</p>
                <span class="preco-produto">${formatarPreco(item.preco)}</span>
            </div>
            <button class="bt-pedir" data-nome="${item.nome}" data-preco="${item.preco}">
                Pedir
            </button>
        </div>
    `;
}

async function carregarCardapio() {
    if (!cardapioContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        if (!response.ok) {
            throw new Error('Falha ao buscar cardápio.');
        }

        const categorias = await response.json();
        cardapioContainer.innerHTML = categorias.map((categoria) => `
            <section>
                <h2 class="sub-cardapio">${categoria.categoria.toUpperCase()}</h2>
                ${categoria.itens.map(criarCardProduto).join('')}
            </section>
        `).join('');

        bindBotoesPedir();
    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        cardapioContainer.innerHTML = '<p>Não foi possível carregar o cardápio agora. Verifique se o backend está rodando.</p>';
    }
}

carregarCarrinho();

const floatingCartBtn = document.getElementById('floating-cart-btn');
if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', () => {
        if (cartSidebar) cartSidebar.classList.add('open');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        if (cartSidebar) cartSidebar.classList.remove('open');
    });
}

const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (Object.keys(itensCarrinho).length === 0) return;

        const pedido = Object.entries(itensCarrinho).map(([nome, item]) => ({
            nome,
            preco: item.preco,
            qtd: item.quantidade
        }));

        localStorage.setItem('labrasa_pedido', JSON.stringify(pedido));
        window.location.href = 'delivery.html';
    });
}

carregarCardapio();
