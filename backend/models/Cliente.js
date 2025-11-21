const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// GET /api/clientes - Listar todos os clientes
router.get('/', (req, res) => {
  Cliente.listar((err, clientes) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(clientes);
    }
  });
});

// GET /api/clientes/:id - Obter cliente por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  Cliente.obterPorId(id, (err, cliente) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!cliente) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    } else {
      res.json(cliente);
    }
  });
});

// POST /api/clientes - Criar novo cliente
router.post('/', (req, res) => {
  const cliente = req.body;
  
  // Validações básicas
  if (!cliente.nome || !cliente.nif) {
    return res.status(400).json({ error: 'Nome e NUIT são obrigatórios' });
  }

  Cliente.criar(cliente, (err, novoCliente) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Já existe um cliente com este NUIT' });
      } else {
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(201).json(novoCliente);
    }
  });
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const cliente = req.body;

  if (!cliente.nome || !cliente.nif) {
    return res.status(400).json({ error: 'Nome e NUIT são obrigatórios' });
  }

  Cliente.atualizar(id, cliente, (err, clienteAtualizado) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Já existe um cliente com este NUIT' });
      } else {
        res.status(500).json({ error: err.message });
      }
    } else {
      res.json(clienteAtualizado);
    }
  });
});

// DELETE /api/clientes/:id - Excluir cliente
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  Cliente.excluir(id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Cliente excluído com sucesso' });
    }
  });
});

// GET /api/clientes/search/:termo - Pesquisar clientes
router.get('/search/:termo', (req, res) => {
  const termo = req.params.termo;
  Cliente.pesquisar(termo, (err, clientes) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(clientes);
    }
  });
});

module.exports = router;