const express = require('express');
const cors = require('cors');

const cardapioRoutes = require('./routes/cardapio');
const pedidosRoutes = require('./routes/pedidos');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    nome: 'La Brasa API',
    status: 'online',
    rotas: [
      'GET /api/cardapio',
      'GET /api/pedidos',
      'POST /api/pedidos',
      'PUT /api/pedidos/:id/status'
    ]
  });
});

app.use('/api/cardapio', cardapioRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
