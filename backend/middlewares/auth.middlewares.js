import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// Middleware para verificar token
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Opcional: Verificar que el usuario aún existe en la base de datos
        const [rows] = await pool.query('SELECT id, email, nombre, role FROM users WHERE id = ?', [decoded.id]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        req.user = rows[0]; // Agregar info del usuario al request
        next();
        
    } catch (error) {
        console.error('Error en verificación de token:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Middleware para verificar si es admin
export const verifyAdmin = async (req, res, next) => {
    try {
        // Primero verifica el token
        await verifyToken(req, res, () => {
            // Luego verifica si es admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
            }
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error en verificación de permisos' });
    }
};