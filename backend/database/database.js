const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'invoiceflow.db');
const db = new sqlite3.Database(dbPath);

function inicializarDatabase() {
  return new Promise((resolve, reject) => {
    // Tabela de clientes
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        nif TEXT NOT NULL UNIQUE,
        morada TEXT,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela clientes:', err);
        reject(err);
      } else {
        console.log('Tabela clientes criada ou já existe.');
      }
    });

    // Tabela de faturas
    db.run(`
      CREATE TABLE IF NOT EXISTS faturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT NOT NULL UNIQUE,
        data_emissao DATE NOT NULL,
        data_vencimento DATE,
        cliente_id INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        iva_percentagem REAL NOT NULL,
        valor_iva REAL NOT NULL,
        total REAL NOT NULL,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela faturas:', err);
        reject(err);
      } else {
        console.log('Tabela faturas criada ou já existe.');
      }
    });

    // Tabela de itens da fatura
    db.run(`
      CREATE TABLE IF NOT EXISTS fatura_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fatura_id INTEGER NOT NULL,
        descricao TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (fatura_id) REFERENCES faturas (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela fatura_itens:', err);
        reject(err);
      } else {
        console.log('Tabela fatura_itens criada ou já existe.');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  inicializarDatabase
};