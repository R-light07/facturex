const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/invoiceflow.db');
const db = new sqlite3.Database(dbPath);

class Fatura {
  // Criar fatura
  static criar(fatura, callback) {
    const {
      numero,
      data_emissao,
      data_vencimento,
      cliente_id,
      empresa_id,
      subtotal,
      iva_percentagem,
      valor_iva,
      total,
      estado,
      metodo_pagamento,
      observacoes
    } = fatura;

    const sql = `INSERT INTO faturas 
                 (numero, data_emissao, data_vencimento, cliente_id, empresa_id, 
                  subtotal, iva_percentagem, valor_iva, total, estado, metodo_pagamento, observacoes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      numero, data_emissao, data_vencimento, cliente_id, empresa_id,
      subtotal, iva_percentagem, valor_iva, total, estado, metodo_pagamento, observacoes
    ], function(err) {
      callback(err, { id: this.lastID, ...fatura });
    });
  }

  // Adicionar itens da fatura
  static adicionarItens(faturaId, itens, callback) {
    const sql = `INSERT INTO fatura_itens (fatura_id, descricao, quantidade, preco_unitario, total) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    let completed = 0;
    let hasError = null;

    itens.forEach(item => {
      const { descricao, quantidade, preco_unitario, total } = item;
      db.run(sql, [faturaId, descricao, quantidade, preco_unitario, total], function(err) {
        if (err) {
          hasError = err;
        }
        completed++;
        if (completed === itens.length) {
          callback(hasError);
        }
      });
    });
  }

  // Listar todas as faturas com informações do cliente
  static listar(callback) {
    const sql = `
      SELECT f.*, c.nome as cliente_nome, c.nif as cliente_nif 
      FROM faturas f 
      LEFT JOIN clientes c ON f.cliente_id = c.id 
      ORDER BY f.created_at DESC
    `;
    db.all(sql, [], callback);
  }

  // Obter fatura por ID com detalhes completos
  static obterPorId(id, callback) {
    // Obter dados da fatura
    const sqlFatura = `
      SELECT f.*, c.nome as cliente_nome, c.nif as cliente_nif, 
             c.email as cliente_email, c.telefone as cliente_telefone, c.morada as cliente_morada,
             e.nome as empresa_nome, e.nif as empresa_nif, e.email as empresa_email,
             e.telefone as empresa_telefone, e.morada as empresa_morada, e.website as empresa_website
      FROM faturas f 
      LEFT JOIN clientes c ON f.cliente_id = c.id 
      LEFT JOIN empresas e ON f.empresa_id = e.id
      WHERE f.id = ?
    `;

    db.get(sqlFatura, [id], (err, fatura) => {
      if (err) {
        callback(err);
      } else if (!fatura) {
        callback(null, null);
      } else {
        // Obter itens da fatura
        const sqlItens = `SELECT * FROM fatura_itens WHERE fatura_id = ?`;
        db.all(sqlItens, [id], (err, itens) => {
          if (err) {
            callback(err);
          } else {
            fatura.itens = itens;
            callback(null, fatura);
          }
        });
      }
    });
  }

  // Obter faturas por cliente
  static obterPorCliente(clienteId, callback) {
    const sql = `
      SELECT f.*, c.nome as cliente_nome 
      FROM faturas f 
      LEFT JOIN clientes c ON f.cliente_id = c.id 
      WHERE f.cliente_id = ?
      ORDER BY f.created_at DESC
    `;
    db.all(sql, [clienteId], callback);
  }

  // Excluir fatura
  static excluir(id, callback) {
    const sql = `DELETE FROM faturas WHERE id = ?`;
    db.run(sql, [id], callback);
  }

  // Gerar próximo número de fatura
  static gerarProximoNumero(callback) {
    const sql = `SELECT numero FROM faturas ORDER BY created_at DESC LIMIT 1`;
    db.get(sql, [], (err, row) => {
      if (err) {
        callback(err);
      } else if (!row) {
        callback(null, 'FAT001');
      } else {
        const lastNumber = row.numero;
        const match = lastNumber.match(/\d+/);
        if (match) {
          const nextNum = parseInt(match[0]) + 1;
          callback(null, `FAT${nextNum.toString().padStart(3, '0')}`);
        } else {
          callback(null, 'FAT001');
        }
      }
    });
  }
}

module.exports = Fatura;