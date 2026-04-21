const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partes (
      id          SERIAL PRIMARY KEY,
      numero      TEXT NOT NULL,
      tipo        TEXT NOT NULL CHECK (tipo IN ('fontaneria','calefaccion','clima')),
      cliente     TEXT NOT NULL,
      direccion   TEXT,
      descripcion TEXT NOT NULL,
      hora_inicio TEXT,
      hora_fin    TEXT,
      fecha       DATE,
      materiales  JSONB DEFAULT '[]',
      observaciones TEXT,
      operario    TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✓ Base de datos lista');
}

module.exports = { pool, initDB };
