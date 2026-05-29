const PEDIDOS_API_BASE_URL = 'https://la-brasa.onrender.com/api';
document.addEventListener('DOMContentLoaded', () => {
    const listaPedidos = document.getElementById('lista-pedidos');
    const btnAtualizar = document.getElementById('btn-atualizar');
    const totalPedidosEl = document.getElementById('total-pedidos');
    const pedidosAbertosEl = document.getElementById('pedidos-abertos');
    const pedidosEntreguesEl = document.getElementById('pedidos-entregues');
    const toastEl = document.getElementById('toast');
    let toastTimer;

    const statusOptions = ['novo', 'em preparo', 'saiu para entrega', 'entregue'];
    const statusLabels = {
        novo: 'Novo',
        'em preparo': 'Em preparo',
        'saiu para entrega': 'Saiu para entrega',
        entregue: 'Entregue'
    };

    function formatarPreco(valor) {
        return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
    }

    function formatarData(dataIso) {
        return new Date(dataIso).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function mostrarToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    function atualizarResumo(pedidos) {
        totalPedidosEl.textContent = pedidos.length;
        pedidosEntreguesEl.textContent = pedidos.filter((pedido) => pedido.status === 'entregue').length;
        pedidosAbertosEl.textContent = pedidos.filter((pedido) => pedido.status !== 'entregue').length;
    }

    function criarPedidoCard(pedido) {
        const itens = pedido.itens.map((item) =>
            `<li>${item.qtd}x ${item.nome} <span>${formatarPreco(item.preco * item.qtd)}</span></li>`
        ).join('');

        const opcoes = statusOptions.map((status) => `
            <option value="${status}" ${pedido.status === status ? 'selected' : ''}>${statusLabels[status]}</option>
        `).join('');

        return `
            <article class="pedido-card">
                <div class="pedido-topo">
                    <div>
                        <span class="pedido-id">Pedido #${pedido.id}</span>
                        <h2>${pedido.cliente.nome}</h2>
                        <p>${pedido.cliente.whatsapp}</p>
                    </div>
                    <span class="status-pill">${statusLabels[pedido.status] || pedido.status}</span>
                </div>

                <div class="pedido-detalhes">
                    <p><strong>Endereço:</strong> ${pedido.cliente.endereco}</p>
                    <p><strong>Pagamento:</strong> ${pedido.pagamento.metodo}</p>
                    <p><strong>Recebido em:</strong> ${formatarData(pedido.criadoEm)}</p>
                </div>

                <ul class="pedido-itens">${itens}</ul>

                <div class="pedido-rodape">
                    <strong>${formatarPreco(pedido.total)}</strong>
                    <label>
                        Status
                        <select class="status-select" data-id="${pedido.id}">
                            ${opcoes}
                        </select>
                    </label>
                </div>
            </article>
        `;
    }

    async function alterarStatus(id, status) {
        const response = await fetch(`${PEDIDOS_API_BASE_URL}/pedidos/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const resultado = await response.json();
        if (!response.ok) {
            throw new Error(resultado.erro || 'Não foi possível atualizar o status.');
        }
    }

    function bindStatusSelects() {
        listaPedidos.querySelectorAll('.status-select').forEach((select) => {
            select.addEventListener('change', async () => {
                try {
                    await alterarStatus(select.dataset.id, select.value);
                    mostrarToast('Status atualizado com sucesso.');
                    carregarPedidos();
                } catch (error) {
                    console.error('Erro ao atualizar status:', error);
                    mostrarToast('Não foi possível atualizar o status.');
                }
            });
        });
    }

    async function carregarPedidos() {
        listaPedidos.innerHTML = '<p class="estado-vazio">Carregando pedidos...</p>';

        try {
            const response = await fetch(`${PEDIDOS_API_BASE_URL}/pedidos`);
            if (!response.ok) throw new Error('Falha ao carregar pedidos.');

            const pedidos = await response.json();
            const pedidosOrdenados = pedidos.sort((a, b) => b.id - a.id);
            atualizarResumo(pedidosOrdenados);

            if (pedidosOrdenados.length === 0) {
                listaPedidos.innerHTML = '<p class="estado-vazio">Nenhum pedido enviado ainda.</p>';
                return;
            }

            listaPedidos.innerHTML = pedidosOrdenados.map(criarPedidoCard).join('');
            bindStatusSelects();
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            listaPedidos.innerHTML = '<p class="estado-vazio">Não foi possível carregar os pedidos. Verifique se o backend está rodando.</p>';
            atualizarResumo([]);
        }
    }

    btnAtualizar.addEventListener('click', carregarPedidos);
    carregarPedidos();
});
