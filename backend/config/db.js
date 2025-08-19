import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @swagger
 * components:
 *   schemas:
 *     Lead:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del lead.
 *         nombre:
 *           type: string
 *           description: Nombre completo del lead.
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del lead (único).
 *         telefono:
 *           type: string
 *           description: Teléfono de contacto del lead.
 *         origen:
 *           type: string
 *           description: Fuente del lead (ej. campaña, web, redes).
 *         campaña:
 *           type: string
 *           description: Nombre de la campaña de marketing asociada.
 *         ciudad:
 *           type: string
 *           description: Ciudad del lead.
 *         responsable:
 *           type: string
 *           description: Responsable asignado al lead.
 *         estado:
 *           type: string
 *           enum: [nuevo, contactado, en_negociacion, cerrado_ganado, cerrado_perdido]
 *           description: Estado actual del lead.
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del lead.
 *         fuente_detallada:
 *           type: string
 *           description: Fuente más detallada del lead.
 *         tags:
 *           type: object
 *           description: Etiquetas asociadas al lead (JSON).
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           description: Última actualización del lead.
 *
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario.
 *         nombre:
 *           type: string
 *           description: Nombre completo del usuario.
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único del usuario.
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña encriptada del usuario.
 *         rol:
 *           type: string
 *           enum: [admin, ejecutivo, marketing]
 *           description: Rol del usuario dentro del CRM.
 *         creado:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario.
 */


// Pools de conexión
//POOL LEADS
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'lead_crm'
});
//POOL USUARIOS 
export const poolusers = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'usuarios_crm'
});

/**
 * @function initializeDatabase
 * @description Inicializa las bases de datos `lead_crm` y `usuarios_crm`.
 *  - Crea las bases si no existen.
 *  - Genera las tablas `leads` y `usuarios` con sus restricciones.
 *  - Verifica y agrega columnas adicionales si no existen (`fuente_detallada`, `tags`, `fecha_actualizacion`).
 *  - Crea índices únicos para asegurar emails no duplicados.
 *  - Muestra conteo de registros en consola.
 */

export async function initializeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS lead_crm');
    await connection.query('USE lead_crm');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telefono VARCHAR(50),
        origen VARCHAR(100),
        campaña VARCHAR(100),
        ciudad VARCHAR(50),
        responsable VARCHAR(100),
        estado ENUM('nuevo','contactado','en_negociacion','cerrado_ganado','cerrado_perdido') DEFAULT 'nuevo',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verificación de columnas extras
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'lead_crm'
      AND TABLE_NAME = 'leads'
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    if (!existingColumns.includes('fuente_detallada')) {
      await connection.query('ALTER TABLE leads ADD COLUMN fuente_detallada VARCHAR(200)');
      console.log('Columna fuente_detallada agregada en leads');
    }

    if (!existingColumns.includes('tags')) {
      await connection.query('ALTER TABLE leads ADD COLUMN tags JSON');
      console.log('Columna tags agregada en leads');
    }

    if (!existingColumns.includes('fecha_actualizacion')) {
      await connection.query('ALTER TABLE leads ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      console.log('Columna fecha_actualizacion agregada en leads');
    }

    // Índice único en leads
    try {
      await connection.query('ALTER TABLE leads ADD UNIQUE INDEX leads_email_unique (email)');
    } catch (indexError) {
      if (indexError.code !== 'ER_DUP_KEYNAME') {
        console.log('Error creando índice único en leads:', indexError);
      }
    }

    /*DB: usuarios_crm */
    await connection.query('CREATE DATABASE IF NOT EXISTS usuarios_crm');
    await connection.query('USE usuarios_crm');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin','ejecutivo','marketing') DEFAULT 'ejecutivo',
        creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Índice único en usuarios
    try {
      await connection.query('ALTER TABLE usuarios ADD UNIQUE INDEX usuarios_email_unique (email)');
    } catch (indexError) {
      if (indexError.code !== 'ER_DUP_KEYNAME') {
        console.log('Error creando índice único en usuarios:', indexError);
      }
    }

    // Conteo de registros
    const [[{ count: leadsCount }]] = await connection.query('SELECT COUNT(*) as count FROM lead_crm.leads');
    console.log(`Número de registros en lead_crm.leads: ${leadsCount}`);

    const [[{ count: usersCount }]] = await connection.query('SELECT COUNT(*) as count FROM usuarios_crm.usuarios');
    console.log(`Número de registros en usuarios_crm.usuarios: ${usersCount}`);

    await connection.end();
    console.log('Bases de datos conectadas correctamente ✅');
  } catch (error) {
    console.error('Error inicializando DB:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}
