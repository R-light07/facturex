const express = require('express');
const router = express.Router();
const Fatura = require('../models/Fatura');
const FaturaItem = require('../models/FaturaItem');

// Obter todas as faturas
router.get('/', (req, res) => {
  Fatura.listar((err, faturas) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(faturas);
    }
  });
});

// Obter uma fatura por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  Fatura.obterPorId(id, (err, fatura) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!fatura) {
      res.status(404).json({ error: 'Fatura não encontrada' });
    } else {
      res.json(fatura);
    }
  });
});

// Criar uma nova fatura
router.post('/', (req, res) => {
  const fatura = req.body;
  // Inserir a fatura
  Fatura.criar(fatura, (err, novaFatura) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Inserir os itens da fatura
      FaturaItem.criar(fatura.itens, novaFatura.id, (err) => {
        if (err) {
          // Se der erro ao inserir itens, excluir a fatura criada?
          // Por simplicidade, vamos retornar erro e deixar que o usuário tente novamente.
          res.status(500).json({ error: 'Erro ao inserir itens da fatura: ' + err.message });
        } else {
          res.status(201).json(novaFatura);
        }
      });
    }
  });
});

// Excluir uma fatura
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  Fatura.excluir(id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Fatura excluída com sucesso' });
    }
  });
});

module.exports = router;