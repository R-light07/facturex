const { db } = require('../database/database');

class FaturaItem {
  static criar(itens, fatura_id, callback) {
    const sql = `INSERT INTO fatura_itens (fatura_id, descricao, quantidade, preco_unitario, total) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    let completed = 0;
    let hasError = null;

    itens.forEach(item => {
      const { descricao, quantidade, preco_unitario, total } = item;
      db.run(sql, [fatura_id, descricao, quantidade, preco_unitario, total], function(err) {
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
}

module.exports = FaturaItem;