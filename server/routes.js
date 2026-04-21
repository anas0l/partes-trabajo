const express = require('express');
const router = express.Router();
const { pool } = require('./db');

// GET /api/partes — lista con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { tipo, search, fecha_desde, fecha_hasta } = req.query;
    const conditions = [];
    const values = [];

    if (tipo) {
      values.push(tipo);
      conditions.push(`tipo = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(cliente ILIKE $${values.length} OR operario ILIKE $${values.length} OR descripcion ILIKE $${values.length})`);
    }
    if (fecha_desde) {
      values.push(fecha_desde);
      conditions.push(`fecha >= $${values.length}`);
    }
    if (fecha_hasta) {
      values.push(fecha_hasta);
      conditions.push(`fecha <= $${values.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const { rows } = await pool.query(
      `SELECT * FROM partes ${where} ORDER BY created_at DESC`,
      values
    );
    res.json(rows.map(dbToClient));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener partes' });
  }
});

// GET /api/partes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM partes WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Parte no encontrado' });
    res.json(dbToClient(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el parte' });
  }
});

// POST /api/partes — crear nuevo parte
router.post('/', async (req, res) => {
  try {
    const { numero, tipo, cliente, direccion, descripcion, horaInicio, horaFin, fecha, materiales, observaciones, operario } = req.body;

    if (!cliente || !descripcion || !tipo) {
      return res.status(400).json({ error: 'cliente, descripcion y tipo son obligatorios' });
    }

    const { rows } = await pool.query(
      `INSERT INTO partes (numero, tipo, cliente, direccion, descripcion, hora_inicio, hora_fin, fecha, materiales, observaciones, operario)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [numero, tipo, cliente, direccion || null, descripcion,
       horaInicio || null, horaFin || null, fecha || null,
       JSON.stringify(materiales || []), observaciones || null, operario || null]
    );
    res.status(201).json(dbToClient(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el parte' });
  }
});

// PUT /api/partes/:id — actualizar parte
router.put('/:id', async (req, res) => {
  try {
    const { tipo, cliente, direccion, descripcion, horaInicio, horaFin, fecha, materiales, observaciones, operario } = req.body;
    const { rows } = await pool.query(
      `UPDATE partes SET
        tipo=$1, cliente=$2, direccion=$3, descripcion=$4,
        hora_inicio=$5, hora_fin=$6, fecha=$7,
        materiales=$8, observaciones=$9, operario=$10
       WHERE id=$11 RETURNING *`,
      [tipo, cliente, direccion || null, descripcion,
       horaInicio || null, horaFin || null, fecha || null,
       JSON.stringify(materiales || []), observaciones || null, operario || null,
       req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Parte no encontrado' });
    res.json(dbToClient(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el parte' });
  }
});

// DELETE /api/partes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM partes WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Parte no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el parte' });
  }
});

// GET /api/partes/stats/resumen — estadísticas globales
router.get('/stats/resumen', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE hora_fin IS NOT NULL)::int AS finalizados,
        SUM(jsonb_array_length(materiales))::int AS total_materiales,
        tipo,
        COUNT(*) FILTER (WHERE tipo='fontaneria')::int AS fontaneria,
        COUNT(*) FILTER (WHERE tipo='calefaccion')::int AS calefaccion,
        COUNT(*) FILTER (WHERE tipo='clima')::int AS clima
      FROM partes
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
});

// Convierte snake_case de DB a camelCase para el cliente
function dbToClient(row) {
  return {
    id: row.id,
    numero: row.numero,
    tipo: row.tipo,
    cliente: row.cliente,
    direccion: row.direccion,
    descripcion: row.descripcion,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    fecha: row.fecha ? row.fecha.toISOString().split('T')[0] : null,
    materiales: row.materiales || [],
    observaciones: row.observaciones,
    operario: row.operario,
    createdAt: row.created_at,
  };
}

module.exports = router;
