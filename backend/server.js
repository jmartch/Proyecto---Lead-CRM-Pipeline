// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { swaggerDocs } from './config/swagger.js'; 
import { initializeDatabase } from './config/db.js';
import leadRoutes from './routes/leads.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes);

async function start() {
  await initializeDatabase();

  const PORT = process.env.PORT || 4000;

  // Inicializamos Swagger *después* de saber el puerto
  swaggerDocs(app, PORT);

  app.listen(PORT, () => {
    console.log(`🚀 API escuchando en puerto ${PORT}`);
    console.log(`🌐 Endpoints disponibles:`);
    console.log(`   GET    http://localhost:${PORT}/api/leads`);
    console.log(`   GET    http://localhost:${PORT}/api/leads/:id`);
    console.log(`   POST   http://localhost:${PORT}/api/leads`);
    console.log(`   PUT    http://localhost:${PORT}/api/leads/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/leads/:id`);
  });
}

start();

// import express from 'express';
// import cors from 'cors';
// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Función para inicializar la base de datos
// async function initializeDatabase() {
//   let connection;

//   try {
//     console.log(' Conectando a MySQL...');

//     // Conectar sin especificar base de datos para crearla si no existe
//     connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASS,
//     });

//     console.log(' Conectado a MySQL');

//     // Crear base de datos si no existe
//     await connection.query('CREATE DATABASE IF NOT EXISTS lead_crm');
//     console.log('Base de datos "lead_crm" verificada/creada');

//     // Seleccionar la base de datos
//     await connection.query('USE lead_crm');

//     // Crear tabla si no existe
//     await connection.query(`
// CREATE TABLE IF NOT EXISTS leads (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     nombre VARCHAR(100) NOT NULL,
//     email VARCHAR(100) NOT NULL,
//     telefono VARCHAR(50),
//     origen VARCHAR(100),
//     campaña VARCHAR(100),
//     ciudad VARCHAR(50),
//     responsable VARCHAR(100),
//     estado ENUM('nuevo','contactado','en_negociacion','cerrado_ganado','cerrado_perdido') DEFAULT 'nuevo',
//     fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
//     );
//     console.log('Tabla "leads" verificada/creada');

//     // Verificar si hay datos en la tabla
//     const [rows] = await connection.query('SELECT COUNT(*) as count FROM leads');
//     console.log(` La tabla "leads" tiene ${rows[0].count} registros`);

//     await connection.end();
//     console.log(' Inicialización de base de datos completada');

//   } catch (error) {
//     console.error('Error inicializando base de datos:', error.message);
//     if (connection) await connection.end();
//     process.exit(1);
//   }
// }

// // Crear pool de conexiones después de inicializar
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: 'lead_crm'
// });

// // Obtener todos los leads
// app.get('/api/leads', async (req, res) => {
//   try {
//     console.log('Solicitud GET /api/leads');
//     const [rows] = await pool.query('SELECT * FROM leads ORDER BY fecha DESC');
//     console.log(`Enviando ${rows.length} leads`);
//     res.json(rows);
//   } catch (error) {
//     console.error('Error obteniendo leads:', error);
//     res.status(500).json({ status: 'error', message: 'Error obteniendo leads' });
//   }
// });

// // Función de validación de email
// const isValidEmail = (email) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// // Función de validación de teléfono
// const isValidPhone = (phone) => {
//   if (!phone) return true; // Teléfono es opcional
//   const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
//   return phoneRegex.test(phone) && phone.length >= 7;
// };

// // Crear nuevo lead
// app.post('/api/leads', async (req, res) => {
//   try {
//     console.log('Solicitud POST /api/leads:', req.body);
//     const { nombre, email, telefono, origen, campaña } = req.body;

//     // Validaciones detalladas
//     const errors = [];

//     if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
//       errors.push('El nombre es requerido y debe ser texto válido');
//     } else if (nombre.trim().length < 2) {
//       errors.push('El nombre debe tener al menos 2 caracteres');
//     } else if (nombre.trim().length > 255) {
//       errors.push('El nombre no puede exceder 255 caracteres');
//     }

//     if (!email || typeof email !== 'string' || email.trim().length === 0) {
//       errors.push('El email es requerido');
//     } else if (!isValidEmail(email.trim())) {
//       errors.push('El formato del email no es válido');
//     } else if (email.trim().length > 255) {
//       errors.push('El email no puede exceder 255 caracteres');
//     }

//     if (telefono && !isValidPhone(telefono)) {
//       errors.push('El formato del teléfono no es válido');
//     }

//     if (origen && origen.length > 100) {
//       errors.push('El origen no puede exceder 100 caracteres');
//     }

//     if (campaña && campaña.length > 100) {
//       errors.push('La campaña no puede exceder 100 caracteres');
//     }

//     if (errors.length > 0) {
//       console.log('Errores de validación:', errors);
//       return res.status(400).json({
//         status: 'error',
//         message: errors.join('. ')
//       });
//     }

//     // Verificar si el email ya existe
//     const [existingLead] = await pool.query(
//       'SELECT id FROM leads WHERE email = ?',
//       [email.trim().toLowerCase()]
//     );

//     if (existingLead.length > 0) {
//       console.log('Email ya existente:', email);
//       return res.status(409).json({
//         status: 'error',
//         message: 'Ya existe un lead con este email'
//       });
//     }

//     // Limpiar y preparar datos
//     const cleanData = {
//       nombre: nombre.trim(),
//       email: email.trim().toLowerCase(),
//       telefono: telefono ? telefono.trim() : null,
//       origen: origen ? origen.trim() : null,
//       campaña: campaña ? campaña.trim() : null
//     };

//     const [result] = await pool.query(
//       'INSERT INTO leads (nombre, email, telefono, origen, campaña) VALUES (?,?,?,?,?)',
//       [cleanData.nombre, cleanData.email, cleanData.telefono, cleanData.origen, cleanData.campaña]
//     );

//     console.log(`Lead creado con ID: ${result.insertId}`);

//     const [lead] = await pool.query(
//       'SELECT * FROM leads WHERE id = ?',
//       [result.insertId]
//     );

//     console.log('📤 Enviando lead creado:', lead[0]);
//     res.status(201).json({
//       status: 'ok',
//       message: 'Lead creado exitosamente',
//       lead: lead[0]
//     });
//   } catch (error) {
//     console.error('Error creando lead:', error);

//     if (error.code === 'ER_DUP_ENTRY') {
//       return res.status(409).json({
//         status: 'error',
//         message: 'Ya existe un lead con este email'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Error interno del servidor al crear lead'
//     });
//   }
// });

// //Obtener Lead por ID
// app.get('/api/leads/:id', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
//     if (rows.length === 0) {
//       return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: 'Error obteniendo lead' });
//   }
// });

// //Actualizar Lead por ID
// app.put('/api/leads/:id', async (req, res) => {
//   try {

//     const { nombre, email, telefono, origen, campaña, estado } = req.body;
//     const estadosValidos = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];

//     if (estado && !estadosValidos.includes(estado)) {
//       return res.status(400).json({ status: 'error', message: 'Estado no válido' });
//     }

//     const [result] = await pool.query(
//       `UPDATE leads SET nombre=?, email=?, telefono=?, origen=?, campaña=?, estado=? WHERE id=?`,
//       [nombre, email, telefono, origen, campaña, estado || 'nuevo', req.params.id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
//     }

//     console.log(` Notificación: Lead ${req.params.id} actualizado a estado ${estado || 'nuevo'}`);
//     res.json({ status: 'ok', message: 'Lead actualizado correctamente' });

//   } catch (err) {
//     res.status(500).json({ status: 'error', message: 'Error actualizando lead' });
//   }
// });

// //Eliminar Lead por ID
// app.delete('/api/leads/:id', async (req, res) => {
//   try {
//     const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
//     }
//     res.json({ status: 'ok', message: 'Lead eliminado correctamente' });
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: 'Error eliminando lead' });
//   }
// });

// //Paginacion y ordenamiento
// // GET con filtros, paginación y ordenamiento
// app.get('/api/leads', async (req, res) => {
//   try {
//     console.log('Solicitud GET /api/leads con filtros:', req.query);

//     const {
//       estado,
//       origen,
//       fecha_desde,
//       fecha_hasta,
//       responsable,
//       page = 1,
//       limit = 10,
//       sort_by = 'fecha',
//       sort_order = 'DESC'
//     } = req.query;

//     // Validar valores
//     const camposOrdenValidos = ['fecha', 'nombre', 'email', 'estado'];
//     const ordenValido = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
//     const campoOrden = camposOrdenValidos.includes(sort_by) ? sort_by : 'fecha';

//     // Calcular OFFSET
//     const offset = (parseInt(page) - 1) * parseInt(limit);

//     // Construir filtros dinámicos
//     let whereClauses = [];
//     let params = [];

//     if (estado) {
//       whereClauses.push('estado = ?');
//       params.push(estado);
//     }
//     if (origen) {
//       whereClauses.push('origen = ?');
//       params.push(origen);
//     }
//     if (fecha_desde) {
//       whereClauses.push('fecha >= ?');
//       params.push(fecha_desde);
//     }
//     if (fecha_hasta) {
//       whereClauses.push('fecha <= ?');
//       params.push(fecha_hasta);
//     }
//     if (responsable) {
//       whereClauses.push('responsable = ?');
//       params.push(responsable);
//     }

//     const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

//     // Query principal con paginación y ordenamiento
//     const query = `
//       SELECT * FROM leads
//       ${whereSQL}
//       ORDER BY ${campoOrden} ${ordenValido}
//       LIMIT ? OFFSET ?;
//     `;

//     // Agregar paginación a parámetros
//     params.push(parseInt(limit), offset);

//     // Ejecutar consulta
//     const [rows] = await pool.query(query, params);

//     // Obtener total de registros para saber cuántas páginas hay
//     const countQuery = `SELECT COUNT(*) AS total FROM leads ${whereSQL}`;
//     const [countResult] = await pool.query(countQuery, whereClauses.length > 0 ? params.slice(0, -2) : []);
//     const total = countResult[0].total;

//     res.json({
//       status: 'ok',
//       total,
//       page: parseInt(page),
//       total_pages: Math.ceil(total / limit),
//       leads: rows
//     });

//   } catch (error) {
//     console.error('Error obteniendo leads con filtros:', error);
//     res.status(500).json({ status: 'error', message: 'Error obteniendo leads' });
//   }
// });

// // Inicializar base de datos y luego iniciar servidor
// async function startServer() {
//   await initializeDatabase();

//   const PORT = process.env.PORT || 4000;
//   app.listen(PORT, () => {
//     console.log(`API escuchando en puerto ${PORT}`);
//     console.log(`🌐 Endpoints disponibles:`);
//     console.log(`   GET  http://localhost:${PORT}/api/leads`);
//     console.log(`   GET http://localhost:${PORT}/api/leads/:id`);
//     console.log(`   POST http://localhost:${PORT}/api/leads`);
//     console.log(`   PUT http://localhost:${PORT}/api/leads/:id`);
//     console.log(`   DELETE http://localhost:${PORT}/api/leads/:id`);
//   });
// }

// startServer();