const express = require('express');
const path = require('path');
const fs = require('fs');
const { gerarArte } = require('./gerador');

const router = express.Router();

const CARDAPIO_JSON_PATH = path.join(__dirname, 'cardapio_atual.json');

const CARDAPIO_PADRAO = {
  itens: [
    'Arroz ou Galinhada',
    'Feijão',
    'Bife Acebolado',
    'Filé de Frango a Milanesa',
    'Macarrão',
    'Refogado de Repolho',
    'Bolinho de Arroz',
    'Farofa'
  ],
  updatedAt: new Date().toISOString()
};

function lerCardapioAtual() {
  try {
    if (fs.existsSync(CARDAPIO_JSON_PATH)) {
      const data = fs.readFileSync(CARDAPIO_JSON_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Cardapio] Erro ao ler JSON:', err.message);
  }
  return { ...CARDAPIO_PADRAO };
}

function salvarCardapio(itens) {
  const data = {
    itens,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(CARDAPIO_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

// GET / — Serve the admin HTML panel
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cardapio-admin.html'));
});

// GET /dados — Returns current menu data
router.get('/dados', (req, res) => {
  try {
    const cardapio = lerCardapioAtual();
    res.json(cardapio);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /gerar — Generate menu art
router.post('/gerar', async (req, res) => {
  try {
    const { itens } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Lista de itens é obrigatória e não pode estar vazia' });
    }

    salvarCardapio(itens);

    const buffer = await gerarArte(itens);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="cardapio_hoje.png"'
    });
    res.send(buffer);
  } catch (err) {
    console.error('[Cardapio] Erro ao gerar arte:', err);
    res.status(500).json({ erro: err.message });
  }
});

// GET /preview — Serve the last generated image
router.get('/preview', (req, res) => {
  const previewPath = path.join(__dirname, '..', 'public', 'cardapio_gerado.png');
  if (fs.existsSync(previewPath)) {
    res.sendFile(previewPath);
  } else {
    res.status(404).json({ erro: 'Nenhuma arte gerada ainda' });
  }
});

module.exports = router;
