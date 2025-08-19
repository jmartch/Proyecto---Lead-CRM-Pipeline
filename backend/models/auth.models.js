import { poolusers } from '../config/db.js';

export const authModel = {
  // Obtener usuarios con filtros + paginación
  async getAllWithFilters(filters) {
    try {
      const {
        nombre,
        email,
        rol,
        page = 1,
        limit = 10,
        sort_by = 'creado',
        sort_order = 'DESC'
      } = filters;

      const camposOrdenValidos = ['nombre', 'email', 'rol', 'creado'];
      const campoOrden = camposOrdenValidos.includes(sort_by) ? sort_by : 'creado';
      const orden = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // OFFSET Y LIMIT
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Filtros dinámicos
      let whereClauses = [];
      let params = [];
      if (nombre) {
        whereClauses.push('nombre LIKE ?');
        params.push(`%${nombre}%`);
      }
      if (email) {
        whereClauses.push('email LIKE ?');
        params.push(`%${email}%`);
      }
      if (rol) {
        whereClauses.push('rol = ?');
        params.push(rol);
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Query principal con paginación y ordenamiento
      const query = `
        SELECT * FROM usuarios
        ${whereSQL}
        ORDER BY ${campoOrden} ${orden}
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), offset);

      const [rows] = await poolusers.query(query, params);

      // Total para paginación
      const countQuery = `SELECT COUNT(*) AS total FROM usuarios ${whereSQL}`;
      const [countResult] = await poolusers.query(countQuery, whereClauses.length > 0 ? params.slice(0, -2) : []);
      const total = countResult[0].total;

      return {
        usuarios: rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };

    } catch (error) {
      console.error('Error en getAllWithFilters:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios
  async getAll() {
    try {
      const [rows] = await poolusers.query('SELECT * FROM usuarios ORDER BY creado DESC');
      return rows;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  async getById(id) {
    try {
      const [rows] = await poolusers.query('SELECT * FROM usuarios WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear usuario
  async create(usuarioData) {
    try {
      const { nombre, email, password, rol } = usuarioData;

      // Validar si ya existe el email
      const [existing] = await poolusers.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
      if (existing.length > 0) {
        throw new Error('EMAIL_YA_EXISTE');
      }

      const [result] = await poolusers.query(
        `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
        [nombre.trim(), email.toLowerCase(), password, rol || 'ejecutivo']
      );

      return { id: result.insertId, ...usuarioData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async update(id, usuarioData) {
    try {
      const { nombre, email, password, rol } = usuarioData;

      const [result] = await poolusers.query(
        `UPDATE usuarios SET 
          nombre = ?, 
          email = ?, 
          password = ?, 
          rol = ?
         WHERE id = ?`,
        [nombre, email, password, rol, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async delete(id) {
    try {
      const [result] = await poolusers.query('DELETE FROM usuarios WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Cambiar rol de un usuario
  async changeRole(id, nuevoRol) {
    try {
      const [result] = await poolusers.query(
        `UPDATE usuarios SET rol = ? WHERE id = ?`,
        [nuevoRol, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en changeRole:', error);
      throw error;
    }
  }

};
