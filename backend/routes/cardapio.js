const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const cardapioPath = path.join(__dirname, '..', 'data', 'cardapio.json');

router.get('/', (req, res) => {
  try {
    const cardapio = fs.readFileSync(cardapioPath, 'utf-8');
    res.json(JSON.parse(cardapio));
  } catch (error) {
    res.status(500).json({ erro: 'Nao foi possivel carregar o cardapio.' });
  }
});

module.exports = router;
