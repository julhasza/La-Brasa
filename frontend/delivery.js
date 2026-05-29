const DELIVERY_API_BASE_URL = 'http://localhost:3001/api';

document.addEventListener('DOMContentLoaded', () => {
    let carrinho = [];

    const carrinhoLista = document.getElementById('carrinho-lista');
    const totalValorEl = document.getElementById('total-valor');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const modal = document.getElementById('modal');
    const modalTexto = document.getElementById('modal-texto');
    const btnModalOk = document.getElementById('btn-modal-ok');
    const toastEl = document.getElementById('toast');
    const selectPagamento = document.getElementById('pagamento');
    const campoTroco = document.getElementById('campo-troco');
    const inputWhatsapp = document.getElementById('whatsapp');
    const inputCep = document.getElementById('cep');
    const inputRua = document.getElementById('rua');
    const inputNumero = document.getElementById('numero');
    const inputBairro = document.getElementById('bairro');
    const inputCidade = document.getElementById('cidade');
    const inputUf = document.getElementById('uf');

    let toastTimer;

    function mostrarToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
    }

    function renderCarrinho() {
        carrinhoLista.innerHTML = '';

        if (carrinho.length === 0) {
            localStorage.removeItem('labrasa_pedido');
            const li = document.createElement('li');
            li.className = 'carrinho-vazio';
            li.textContent = 'Seu carrinho está vazio.';
            carrinhoLista.appendChild(li);
            totalValorEl.textContent = 'R$ 0,00';
            return;
        }

        carrinho.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'carrinho-item';
            li.innerHTML = `
                <div class="ci-info">
                    <p>${item.nome}</p>
                    <span>R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="ci-qtd">
                    <button class="btn-qtd" data-idx="${idx}" data-acao="diminuir">-</button>
                    <span class="ci-qtd-num">${item.qtd}</span>
                    <button class="btn-qtd" data-idx="${idx}" data-acao="aumentar">+</button>
                </div>
                <span class="ci-subtotal">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
            `;
            carrinhoLista.appendChild(li);
        });

        carrinhoLista.querySelectorAll('.btn-qtd').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const acao = btn.getAttribute('data-acao');
                if (acao === 'aumentar') {
                    carrinho[idx].qtd++;
                } else {
                    carrinho[idx].qtd--;
                    if (carrinho[idx].qtd <= 0) {
                        carrinho.splice(idx, 1);
                    }
                }
                renderCarrinho();
            });
        });

        const total = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
        totalValorEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        localStorage.setItem('labrasa_pedido', JSON.stringify(carrinho));
    }

    const pedidoSalvo = localStorage.getItem('labrasa_pedido');
    if (pedidoSalvo) {
        try {
            const itensSalvos = JSON.parse(pedidoSalvo);
            itensSalvos.forEach((item) => {
                carrinho.push({ nome: item.nome, preco: Number(item.preco), qtd: Number(item.qtd) });
            });
        } catch (error) {
            console.error('Erro ao ler pedido salvo:', error);
        }
    }

    renderCarrinho();

    if (carrinho.length > 0) {
        mostrarToast('Seu pedido foi carregado!');
    }

    document.querySelectorAll('.btn-incluir').forEach((btn) => {
        btn.addEventListener('click', () => {
            const nome = btn.getAttribute('data-nome');
            const preco = parseFloat(btn.getAttribute('data-preco'));
            const existente = carrinho.find((item) => item.nome === nome);

            if (existente) {
                existente.qtd++;
            } else {
                carrinho.push({ nome, preco, qtd: 1 });
            }

            renderCarrinho();
            mostrarToast(`${nome} adicionado!`);
        });
    });

    inputWhatsapp.addEventListener('input', () => {
        let v = inputWhatsapp.value.replace(/\D/g, '').substring(0, 11);
        if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        else if (v.length > 0) v = `(${v}`;
        inputWhatsapp.value = v;
    });

    function limparEndereco() {
        inputRua.value = '';
        inputBairro.value = '';
        inputCidade.value = '';
        inputUf.value = '';
    }

    async function buscarCep() {
        const cep = inputCep.value.replace(/\D/g, '');

        if (!cep) {
            limparEndereco();
            return;
        }

        if (cep.length !== 8) {
            mostrarToast('Digite um CEP com 8 números.');
            return;
        }

        try {
            inputRua.value = 'Carregando...';
            inputBairro.value = 'Carregando...';
            inputCidade.value = 'Carregando...';
            inputUf.value = '...';

            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await response.json();

            if (!response.ok || dados.erro) {
                limparEndereco();
                mostrarToast('CEP não encontrado.');
                return;
            }

            inputRua.value = dados.logradouro || '';
            inputBairro.value = dados.bairro || '';
            inputCidade.value = dados.localidade || '';
            inputUf.value = dados.uf || '';
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            limparEndereco();
            mostrarToast('Não foi possível buscar o CEP.');
        }
    }

    inputCep.addEventListener('input', () => {
        let v = inputCep.value.replace(/\D/g, '').substring(0, 8);
        if (v.length > 5) {
            v = `${v.slice(0, 5)}-${v.slice(5)}`;
        }
        inputCep.value = v;
    });

    inputCep.addEventListener('blur', buscarCep);

    selectPagamento.addEventListener('change', () => {
        campoTroco.style.display = selectPagamento.value === 'dinheiro' ? 'block' : 'none';
    });

    btnFinalizar.addEventListener('click', async () => {
        const nome = document.getElementById('nome').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const rua = inputRua.value.trim();
        const numero = inputNumero.value.trim();
        const bairro = inputBairro.value.trim();
        const cidade = inputCidade.value.trim();
        const uf = inputUf.value.trim();
        const cep = inputCep.value.trim();
        const pagamento = selectPagamento.value;

        if (!nome) return mostrarToast('Informe seu nome.');
        if (!whatsapp || whatsapp.replace(/\D/g, '').length < 10) return mostrarToast('Informe um WhatsApp válido.');
        if (!cep) return mostrarToast('Informe seu CEP.');
        if (!rua) return mostrarToast('Informe sua rua.');
        if (!numero) return mostrarToast('Informe o número.');
        if (!bairro) return mostrarToast('Informe o bairro.');
        if (!cidade) return mostrarToast('Informe a cidade.');
        if (!uf) return mostrarToast('Informe a UF.');
        if (!pagamento) return mostrarToast('Escolha o método de pagamento.');
        if (carrinho.length === 0) return mostrarToast('Adicione pelo menos um item.');

        const temPizza = carrinho.some((item) => item.nome.toLowerCase().includes('pizza'));
        if (!temPizza) return mostrarToast('Você precisa incluir pelo menos uma pizza no pedido.');

        let linhaTroco = '';
        let valorTroco = null;

        if (pagamento === 'dinheiro') {
            valorTroco = parseFloat(document.getElementById('troco').value);
            const totalPedido = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);

            if (valorTroco && valorTroco < totalPedido) {
                return mostrarToast('Troco menor que o total.');
            }

            if (valorTroco) {
                linhaTroco = `<br>Troco para: R$ ${valorTroco.toFixed(2).replace('.', ',')}`;
            }
        }

        const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade} - ${uf}, CEP ${cep}`;
        const total = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
        const pagLabels = {
            pix: 'PIX',
            credito: 'Cartão de Crédito',
            debito: 'Cartão de Débito',
            dinheiro: 'Dinheiro'
        };

        const payload = {
            cliente: {
                nome,
                whatsapp,
                endereco: enderecoCompleto
            },
            pagamento: {
                metodo: pagamento,
                troco: valorTroco
            },
            itens: carrinho
        };

        try {
            const response = await fetch(`${DELIVERY_API_BASE_URL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const resultado = await response.json();
            if (!response.ok) {
                throw new Error(resultado.erro || 'Não foi possível enviar o pedido.');
            }
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            return mostrarToast('Não foi possível enviar o pedido.');
        }

        modalTexto.innerHTML =
            `<strong>${nome}</strong><br>` +
            `${enderecoCompleto}<br>` +
            `${whatsapp}<br><br>` +
            carrinho.map((item) =>
                `${item.qtd}x ${item.nome} - R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}`
            ).join('<br>') +
            `<br><br><strong>Total: R$ ${total.toFixed(2).replace('.', ',')}</strong>` +
            `<br>Pagamento: ${pagLabels[pagamento] || pagamento}` +
            linhaTroco;

        modal.style.display = 'flex';
    });

    btnModalOk.addEventListener('click', resetarTudo);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) resetarTudo();
    });

    function resetarTudo() {
        modal.style.display = 'none';
        carrinho = [];
        localStorage.removeItem('labrasa_pedido');
        renderCarrinho();
        ['nome', 'whatsapp', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'uf', 'troco'].forEach((id) => {
            document.getElementById(id).value = '';
        });
        selectPagamento.value = '';
        campoTroco.style.display = 'none';
    }
});
