import { pool } from '../config/db.js';

export const LeadModel = {
  getAll: (filters, pagination, sorting) => {
    // Aquí iría la query con filtros, paginación y ordenamiento
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async (lead) => {
    const [result] = await pool.query(
      'INSERT INTO leads (nombre, email, telefono, origen, campaña) VALUES (?,?,?,?,?)',
      [lead.nombre, lead.email, lead.telefono, lead.origen, lead.campaña]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const [result] = await pool.query(
      `UPDATE leads SET nombre=?, email=?, telefono=?, origen=?, campaña=?, estado=? WHERE id=?`,
      [data.nombre, data.email, data.telefono, data.origen, data.campaña, data.estado, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);
    return result.affectedRows;
  }
};
