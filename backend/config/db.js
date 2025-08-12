import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'lead_crm'
});

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

    await connection.end();
    console.log('✅ Base de datos lista');
  } catch (error) {
    console.error('Error inicializando DB:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}
