const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/invoiceflow.db');
const db = new sqlite3.Database(dbPath);

class Empresa {
  // Obter dados da empresa
  static obter(callback) {
    const sql = `SELECT * FROM empresas LIMIT 1`;
    db.get(sql, [], callback);
  }

  // Atualizar dados da empresa
  static atualizar(empresa, callback) {
    const { nome, nif, email, telefone, morada, website, logo_url } = empresa;
    const sql = `UPDATE empresas 
                 SET nome = ?, nif = ?, email = ?, telefone = ?, morada = ?, website = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.run(sql, [nome, nif, email, telefone, morada, website, logo_url, empresa.id], function(err) {
      callback(err, empresa);
    });
  }
}

module.exports = Empresa;