import { pool } from '../config/db.js';

export const LeadModel = {
  async getAllaWithFilters(filters) {
    try {
      const {
        estado,
        origen,
        fecha_desde,
        fecha_hasta,
        responsable,
        ciudad,
        fuente_detallada,
        page = 1,
        limit = 10,
        sort_by = 'fecha',
        sort_order = 'DESC'
      } = filters;

      const camposOrdenValidos = ['fecha', 'nombre', 'email', 'estado', 'ciudad', 'responsable', 'fecha_actualizacion'];
      const orden = sort_by.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const camposValidos = camposOrdenValidos.includes(sort_by) ? sort_by : 'fecha';

      //OFFSET Y LIMIT
      const offset = (parseInt(page) - 1) * parseInt(limit);

      //Filtros

      let whereClauses = [];
      let params = [];
      if (estado) {
        whereClauses.push('estado = ?');
        params.push(estado);
      }
      if (origen) {
        whereClauses.push('origen LIKE ?');
        params.push(`%${origen}%`);
      }
      if (fecha_desde) {
        whereClauses.push('fecha >= ?');
        params.push(fecha_desde);
      }
      if (fecha_hasta) {
        whereClauses.push('fecha <= ?');
        params.push(fecha_hasta + ' 23:59:59');
      }
      if (responsable) {
        whereClauses.push('responsable = ?');
        params.push(responsable);
      }
      if (ciudad) {
        whereClauses.push('ciudad LIKE ?');
        params.push(`%${ciudad}%`);
      }
      if (fuente_detallada) {
        whereClauses.push('fuente_detallada LIKE ?');
        params.push(`%${fuente_detallada}%`);
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      //Query principal con paginacion y ordenamiento  

      const query = `
        SELECT * FROM leads
        ${whereSQL}
        ORDER BY ${camposValidos} ${orden}
        LIMIT ? OFFSET ?
      `;

      //Parametros de consulta
      params.push(parseInt(limit), offset);

      //Ejecutar la consulta
      const [rows] = await pool.query(query, params);

      //Obtener total de registros para paginacion 
      const countQuery = `SELECT COUNT(*) AS total FROM leads ${whereSQL}`;
      const [countResult] = await pool.query(countQuery, whereClauses.length > 0 ? params.slice(0, -2) : []);
      const total = countResult[0].total;

      return {
        leads: rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }

    } catch (error) {
      console.error('Error en getAll con filtros:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM leads ORDER BY fecha DESC');
      return rows;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const [existingLead] = await pool.query('SELECT * FROM leads WHERE id = ?', [leadData.email.toLowerCase()]);

      if (existingLead.length > 0) {
        throw new Error('EMAIL YA EXISTE');
      }
      // Procesar tags si vienen como string
      let tags = leadData.tags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch {
          tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }

      const [result] = await pool.query(
        `INSERT INTO leads 
         (nombre, email, telefono, origen, campaña, ciudad, fuente_detallada, tags, responsable, estado) 
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          leadData.nombre.trim(),
          leadData.email.toLowerCase(),
          leadData.telefono || null,
          leadData.origen || null,
          leadData.campaña || null,
          leadData.ciudad || null,
          leadData.fuente_detallada || null,
          tags ? JSON.stringify(tags) : null,
          leadData.responsable || null,
          leadData.estado || 'nuevo'
        ]
      );

    } catch (error) {
      console.error('Error en create: ', error);
      throw error;
    }
  },
  async update(id, leadData) {
    try {
      const {
        nombre, email, telefono, origen, campaña, ciudad,
        fuente_detallada, tags, responsable, estado
      } = leadData;

      const estadosValidos = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];

      if (estado && !estadosValidos.includes(estado)) {
        throw new Error('INVALID_STATE');
      }

      // Procesar tags si vienen como string
      let processedTags = tags;
      if (typeof tags === 'string' && tags.length > 0) {
        try {
          processedTags = JSON.parse(tags);
        } catch {
          processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }

      const [result] = await pool.query(
        `UPDATE leads SET 
         nombre=?, email=?, telefono=?, origen=?, campaña=?, 
         ciudad=?, fuente_detallada=?, tags=?, responsable=?, estado=?
         WHERE id=?`,
        [
          nombre, email, telefono, origen, campaña,
          ciudad, fuente_detallada,
          processedTags ? JSON.stringify(processedTags) : null,
          responsable, estado || 'nuevo', id
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en LeadModel.update:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en LeadModel.delete:', error);
      throw error;
    }
  },

  // Métodos auxiliares para obtener opciones únicas
  async getUniqueValues(field) {
    try {
      const validFields = ['estado', 'origen', 'ciudad', 'responsable', 'fuente_detallada'];
      if (!validFields.includes(field)) {
        throw new Error('Campo no válido');
      }

      const [rows] = await pool.query(
        `SELECT DISTINCT ${field} as value FROM leads WHERE ${field} IS NOT NULL AND ${field} != '' ORDER BY ${field}`
      );
      return rows.map(row => row.value);
    } catch (error) {
      console.error(`Error obteniendo valores únicos para ${field}:`, error);
      throw error;
    }
  }
};