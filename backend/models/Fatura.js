const express = require('express');
const router = express.Router();
const Fatura = require('../models/Fatura');

// GET /api/faturas - Listar todas as faturas
router.get('/', (req, res) => {
  Fatura.listar((err, faturas) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(faturas);
    }
  });
});

// GET /api/faturas/:id - Obter fatura por ID
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

// POST /api/faturas - Criar nova fatura
router.post('/', (req, res) => {
  const fatura = req.body;

  // Validações básicas
  if (!fatura.cliente_id || !fatura.itens || fatura.itens.length === 0) {
    return res.status(400).json({ error: 'Cliente e itens são obrigatórios' });
  }

  // Gerar número da fatura e criar
  Fatura.gerarProximoNumero((err, numero) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const novaFatura = {
      ...fatura,
      numero: numero
    };

    Fatura.criar(novaFatura, (err, faturaCriada) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Adicionar itens da fatura
        Fatura.adicionarItens(faturaCriada.id, fatura.itens, (err) => {
          if (err) {
            // Se der erro ao adicionar itens, excluir a fatura criada
            Fatura.excluir(faturaCriada.id, () => {});
            res.status(500).json({ error: 'Erro ao adicionar itens da fatura' });
          } else {
            // Retornar fatura completa
            Fatura.obterPorId(faturaCriada.id, (err, faturaCompleta) => {
              if (err) {
                res.status(500).json({ error: err.message });
              } else {
                res.status(201).json(faturaCompleta);
              }
            });
          }
        });
      }
    });
  });
});

// GET /api/faturas/cliente/:clienteId - Obter faturas por cliente
router.get('/cliente/:clienteId', (req, res) => {
  const clienteId = req.params.clienteId;
  Fatura.obterPorCliente(clienteId, (err, faturas) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(faturas);
    }
  });
});

// DELETE /api/faturas/:id - Excluir fatura
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