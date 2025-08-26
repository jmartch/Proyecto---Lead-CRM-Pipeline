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
  async bulkCreate(leads) {
    try {
      if (!leads || leads.length === 0) {
        return [];
      }

      // Construir la consulta de inserción múltiple
      const placeholders = leads.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const values = leads.flatMap(lead => [
        lead.nombre,
        lead.email,
        lead.telefono,
        lead.origen,
        lead.campaña
      ]);

      const query = `
      INSERT INTO leads (nombre, email, telefono, origen, campaña) 
      VALUES ${placeholders}
    `;

      console.log('Ejecutando inserción masiva para', leads.length, 'registros');

      const [result] = await pool.query(query, values);

      console.log('Inserción masiva completada:', result);

      // Obtener los IDs insertados y devolver los registros completos
      if (result.insertId && result.affectedRows) {
        const insertedLeads = [];
        const startId = result.insertId;

        for (let i = 0; i < result.affectedRows; i++) {
          insertedLeads.push({
            id: startId + i,
            ...leads[i],
            fecha: new Date().toISOString().slice(0, 19).replace('T', ' ') // Formato MySQL datetime
          });
        }

        return insertedLeads;
      }

      return [];

    } catch (error) {
      console.error('Error en bulkCreate:', error);
      throw error;
    }
  },

  // También puedes agregar una versión más robusta que maneja duplicados
  async bulkCreateSafe(leads) {
    try {
      if (!leads || leads.length === 0) {
        return [];
      }

      const insertedLeads = [];
      const errors = [];

      // Insertar uno por uno para manejar mejor los errores
      for (let i = 0; i < leads.length; i++) {
        try {
          const lead = leads[i];

          // Verificar si el email ya existe
          const [existing] = await pool.query(
            'SELECT id FROM leads WHERE email = ?',
            [lead.email]
          );

          if (existing.length > 0) {
            errors.push({
              ...lead,
              error: 'Email ya existe en la base de datos'
            });
            continue;
          }

          // Insertar el nuevo lead
          const [result] = await pool.query(
            'INSERT INTO leads (nombre, email, telefono, origen, campaña) VALUES (?, ?, ?, ?, ?)',
            [lead.nombre, lead.email, lead.telefono, lead.origen, lead.campaña]
          );

          if (result.insertId) {
            insertedLeads.push({
              id: result.insertId,
              ...lead,
              fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
          }

        } catch (insertError) {
          console.error(`Error insertando lead ${i}:`, insertError);
          errors.push({
            ...leads[i],
            error: insertError.message
          });
        }
      }

      console.log(`Inserción completada: ${insertedLeads.length} exitosos, ${errors.length} errores`);

      return {
        inserted: insertedLeads,
        errors: errors
      };

    } catch (error) {
      console.error('Error en bulkCreateSafe:', error);
      throw error;
    }
  },
  create: async (leadData) => {
    const {
      nombre, email, telefono, origen, campaña,
      ciudad, fuente_detallada, tags, responsable, estado
    } = leadData;

    const [result] = await pool.query(
      `INSERT INTO leads 
      (nombre, email, telefono, origen, campaña) 
     VALUES (?, ?, ?, ?, ?)`, // ✅ Solo 5 placeholders ahora
      [
        nombre || null,
        email || null,
        telefono || null,
        origen || null,
        campaña || null,
      ]
    );

    return result.insertId;
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
  async responsable(id, responsable) {
    try {
      const [result] = await pool.query(
        `UPDATE leads SET responsable=? WHERE id=?`,
        [responsable, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en LeadModel.responsable:', error);
      throw error;
    }
  },
  async state(id, estado) {
    try {
      const estadosValidos = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];

      if (!estadosValidos.includes(estado)) {
        throw new Error('INVALID_STATE');
      }

      const [result] = await pool.query(
        `UPDATE leads SET estado=? WHERE id=?`,
        [estado, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en LeadModel.state:', error);
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
  },
  async getAllForExport(filters = {}) {
  try {
    const {
      estado,
      origen,
      fecha_desde,
      fecha_hasta,
      responsable,
      ciudad,
      fuente_detallada
    } = filters;

    // Construir filtros WHERE
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

    // Query para obtener TODOS los registros (sin LIMIT)
    const query = `
      SELECT 
        id,
        nombre,
        email,
        telefono,
        origen,
        campaña,
        ciudad,
        fuente_detallada,
        tags,
        responsable,
        estado,
        fecha,
        fecha_actualizacion
      FROM leads
      ${whereSQL}
      ORDER BY fecha DESC
    `;

    console.log('Ejecutando query de exportación:', query);
    console.log('Parámetros:', params);

    const [rows] = await pool.query(query, params);

    console.log(`Obtenidos ${rows.length} registros para exportación`);

    return rows;

  } catch (error) {
    console.error('Error en getAllForExport:', error);
    throw error;
  }
}
};