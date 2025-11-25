const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'invoiceflow.db');
const db = new sqlite3.Database(dbPath);

// Inicializar o banco de dados
db.serialize(() => {
  // Tabela de empresas
  db.run(`CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    nif TEXT UNIQUE NOT NULL,
    email TEXT,
    telefone TEXT,
    morada TEXT,
    website TEXT,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de clientes
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    nif TEXT UNIQUE NOT NULL,
    morada TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de faturas
  db.run(`CREATE TABLE IF NOT EXISTS faturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT UNIQUE NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    cliente_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    iva_percentagem REAL NOT NULL,
    valor_iva REAL NOT NULL,
    total REAL NOT NULL,
    estado TEXT DEFAULT 'pendente',
    metodo_pagamento TEXT DEFAULT 'transferencia',
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (empresa_id) REFERENCES empresas (id)
  )`);

  // Tabela de itens da fatura
  db.run(`CREATE TABLE IF NOT EXISTS fatura_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fatura_id INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fatura_id) REFERENCES faturas (id) ON DELETE CASCADE
  )`);

  // Inserir empresa padrão
  db.get(`SELECT COUNT(*) as count FROM empresas`, (err, row) => {
    if (err) {
      console.error('Erro ao verificar empresas:', err);
      return;
    }
    
    if (row.count === 0) {
      db.run(`INSERT INTO empresas (nome, nif, email, telefone, morada, website) 
              VALUES (?, ?, ?, ?, ?, ?)`, [
        'Minha Empresa Lda',
        '123456789',
        'empresa@email.com',
        '+351 123 456 789',
        'Rua da Empresa, 123 - Lisboa',
        'www.minhaempresa.com'
      ], function(err) {
        if (err) {
          console.error('Erro ao inserir empresa padrão:', err);
        } else {
          console.log('✅ Empresa padrão criada com ID:', this.lastID);
        }
      });
    }
  });

  console.log('✅ Base de dados inicializada com sucesso!');
});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar a base de dados:', err);
  } else {
    console.log('🔒 Conexão com a base de dados fechada.');
  }
});