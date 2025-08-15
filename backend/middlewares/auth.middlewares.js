import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// Middleware para verificar token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Agregar usuario al objeto req para usarlo en siguientes middlewares
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar que sea admin
export const requireAdmin = async (req, res, next) => {
  // req.user ya está disponible gracias a verifyToken
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo admin puede crear usuarios' });
  }
  next();
};