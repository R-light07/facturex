const express = require('express');
const router = express.Router();
const Empresa = require('../models/Empresa');

// GET /api/empresa - Obter dados da empresa
router.get('/', (req, res) => {
  Empresa.obter((err, empresa) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!empresa) {
      res.status(404).json({ error: 'Dados da empresa não encontrados' });
    } else {
      res.json(empresa);
    }
  });
});

// PUT /api/empresa - Atualizar dados da empresa
router.put('/', (req, res) => {
  const empresa = req.body;
  Empresa.atualizar(empresa, (err, empresaAtualizada) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(empresaAtualizada);
    }
  });
});

module.exports = router;