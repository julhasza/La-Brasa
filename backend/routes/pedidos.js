const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const pedidosPath = path.join(__dirname, '..', 'data', 'pedidos.json');

function lerPedidos() {
  try {
    const conteudo = fs.readFileSync(pedidosPath, 'utf-8');
    return JSON.parse(conteudo);
  } catch (error) {
    return [];
  }
}

function salvarPedidos(pedidos) {
  fs.writeFileSync(pedidosPath, JSON.stringify(pedidos, null, 2), 'utf-8');
}

function calcularTotal(itens) {
  return itens.reduce((total, item) => total + Number(item.preco) * Number(item.qtd), 0);
}

router.get('/', (req, res) => {
  res.json(lerPedidos());
});

router.post('/', (req, res) => {
  const { cliente, pagamento, itens } = req.body;

  if (!cliente || !cliente.nome || !cliente.whatsapp || !cliente.endereco) {
    return res.status(400).json({ erro: 'Dados do cliente incompletos.' });
  }

  if (!pagamento || !pagamento.metodo) {
    return res.status(400).json({ erro: 'Metodo de pagamento obrigatorio.' });
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'O pedido precisa ter pelo menos um item.' });
  }

  const pedido = {
    id: Date.now(),
    cliente: {
      nome: cliente.nome,
      whatsapp: cliente.whatsapp,
      endereco: cliente.endereco
    },
    pagamento: {
      metodo: pagamento.metodo,
      troco: pagamento.troco ?? null
    },
    itens: itens.map((item) => ({
      nome: item.nome,
      preco: Number(item.preco),
      qtd: Number(item.qtd)
    })),
    total: calcularTotal(itens),
    status: 'novo',
    criadoEm: new Date().toISOString()
  };

  const pedidos = lerPedidos();
  pedidos.push(pedido);
  salvarPedidos(pedidos);

  return res.status(201).json({
    mensagem: 'Pedido criado com sucesso.',
    pedido
  });
});

router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const statusValidos = ['novo', 'em preparo', 'saiu para entrega', 'entregue'];

  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status invalido.' });
  }

  const pedidos = lerPedidos();
  const pedido = pedidos.find((item) => String(item.id) === String(id));

  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido nao encontrado.' });
  }

  pedido.status = status;
  salvarPedidos(pedidos);

  return res.json({
    mensagem: 'Status atualizado com sucesso.',
    pedido
  });
});

module.exports = router;
