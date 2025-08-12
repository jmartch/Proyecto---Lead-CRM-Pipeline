import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Función para inicializar la base de datos
async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔄 Conectando a MySQL...');
    
    // Conectar sin especificar base de datos para crearla si no existe
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    
    console.log('✅ Conectado a MySQL');
    
    // Crear base de datos si no existe
    await connection.query('CREATE DATABASE IF NOT EXISTS lead_crm');
    console.log('✅ Base de datos "lead_crm" verificada/creada');
    
    // Seleccionar la base de datos
    await connection.query('USE lead_crm');
    
    // Crear tabla si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50),
        origen VARCHAR(100),
        campaña VARCHAR(100),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "leads" verificada/creada');
    
    // Verificar si hay datos en la tabla
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM leads');
    console.log(`📊 La tabla "leads" tiene ${rows[0].count} registros`);
    
    await connection.end();
    console.log('✅ Inicialización de base de datos completada');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Crear pool de conexiones después de inicializar
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'lead_crm'
});

// Obtener todos los leads
app.get('/api/leads', async (req, res) => {
  try {
    console.log('📥 Solicitud GET /api/leads');
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY fecha DESC');
    console.log(`📤 Enviando ${rows.length} leads`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo leads:', error);
    res.status(500).json({ status: 'error', message: 'Error obteniendo leads' });
  }
});

// Función de validación de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función de validación de teléfono
const isValidPhone = (phone) => {
  if (!phone) return true; // Teléfono es opcional
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 7;
};

// Crear nuevo lead
app.post('/api/leads', async (req, res) => {
  try {
    console.log('📥 Solicitud POST /api/leads:', req.body);
    const { nombre, email, telefono, origen, campaña } = req.body;
    
    // Validaciones detalladas
    const errors = [];
    
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      errors.push('El nombre es requerido y debe ser texto válido');
    } else if (nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (nombre.trim().length > 255) {
      errors.push('El nombre no puede exceder 255 caracteres');
    }
    
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push('El email es requerido');
    } else if (!isValidEmail(email.trim())) {
      errors.push('El formato del email no es válido');
    } else if (email.trim().length > 255) {
      errors.push('El email no puede exceder 255 caracteres');
    }
    
    if (telefono && !isValidPhone(telefono)) {
      errors.push('El formato del teléfono no es válido');
    }
    
    if (origen && origen.length > 100) {
      errors.push('El origen no puede exceder 100 caracteres');
    }
    
    if (campaña && campaña.length > 100) {
      errors.push('La campaña no puede exceder 100 caracteres');
    }

    if (errors.length > 0) {
      console.log('❌ Errores de validación:', errors);
      return res.status(400).json({
        status: 'error',
        message: errors.join('. ')
      });
    }

    // Verificar si el email ya existe
    const [existingLead] = await pool.query(
      'SELECT id FROM leads WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (existingLead.length > 0) {
      console.log('❌ Email duplicado:', email);
      return res.status(409).json({
        status: 'error',
        message: 'Ya existe un lead con este email'
      });
    }

    // Limpiar y preparar datos
    const cleanData = {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono ? telefono.trim() : null,
      origen: origen ? origen.trim() : null,
      campaña: campaña ? campaña.trim() : null
    };

    const [result] = await pool.query(
      'INSERT INTO leads (nombre, email, telefono, origen, campaña) VALUES (?,?,?,?,?)',
      [cleanData.nombre, cleanData.email, cleanData.telefono, cleanData.origen, cleanData.campaña]
    );

    console.log(`✅ Lead creado con ID: ${result.insertId}`);

    const [lead] = await pool.query(
      'SELECT * FROM leads WHERE id = ?',
      [result.insertId]
    );

    console.log('📤 Enviando lead creado:', lead[0]);
    res.status(201).json({ 
      status: 'ok', 
      message: 'Lead creado exitosamente',
      lead: lead[0] 
    });
  } catch (error) {
    console.error('❌ Error creando lead:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        status: 'error', 
        message: 'Ya existe un lead con este email' 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      message: 'Error interno del servidor al crear lead' 
    });
  }
});

// Inicializar base de datos y luego iniciar servidor
async function startServer() {
  await initializeDatabase();
  
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 API escuchando en puerto ${PORT}`);
    console.log(`🌐 Endpoints disponibles:`);
    console.log(`   GET  http://localhost:${PORT}/api/leads`);
    console.log(`   POST http://localhost:${PORT}/api/leads`);
  });
}

startServer();