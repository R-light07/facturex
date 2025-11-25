const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/invoiceflow.db');
const db = new sqlite3.Database(dbPath);

class Cliente {
  // Criar cliente
  static criar(cliente, callback) {
    const { nome, email, telefone, nif, morada } = cliente;
    const sql = `INSERT INTO clientes (nome, email, telefone, nif, morada) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [nome, email, telefone, nif, morada], function(err) {
      callback(err, { id: this.lastID, ...cliente });
    });
  }

  // Listar todos os clientes
  static listar(callback) {
    const sql = `SELECT * FROM clientes ORDER BY created_at DESC`;
    db.all(sql, [], callback);
  }

  // Obter cliente por ID
  static obterPorId(id, callback) {
    const sql = `SELECT * FROM clientes WHERE id = ?`;
    db.get(sql, [id], callback);
  }

  // Atualizar cliente
  static atualizar(id, cliente, callback) {
    const { nome, email, telefone, nif, morada } = cliente;
    const sql = `UPDATE clientes 
                 SET nome = ?, email = ?, telefone = ?, nif = ?, morada = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.run(sql, [nome, email, telefone, nif, morada, id], function(err) {
      callback(err, { id, ...cliente });
    });
  }

  // Excluir cliente
  static excluir(id, callback) {
    const sql = `DELETE FROM clientes WHERE id = ?`;
    db.run(sql, [id], callback);
  }

  // Pesquisar clientes
  static pesquisar(termo, callback) {
    const sql = `SELECT * FROM clientes 
                 WHERE nome LIKE ? OR nif LIKE ? OR email LIKE ?
                 ORDER BY nome`;
    const likeTermo = `%${termo}%`;
    db.all(sql, [likeTermo, likeTermo, likeTermo], callback);
  }
}

module.exports = Cliente;