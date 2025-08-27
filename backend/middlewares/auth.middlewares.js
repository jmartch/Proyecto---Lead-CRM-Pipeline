import jwt from 'jsonwebtoken';
import { poolusers } from '../config/db.js';
import crypto from 'crypto';


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
        const [rows] = await poolusers.query('SELECT id, email, nombre, rol FROM usuarios WHERE id = ?', [decoded.id]);
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
            if (req.user.rol !== 'admin') {
                return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
            }
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error en verificación de permisos' });
    }
};

//Ingest 

export const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.INGEST_API_KEY;

    if (!apiKey) {
        return res.status(401).json({
            error: 'Missing X-API-KEY header',
            message: 'API key is required for this endpoint'
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(401).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }

    next();
};
export const authenticateHMAC = (req, res, next) => {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const secret = process.env.WEBHOOK_SECRET;

    if (!signature || !timestamp) {
        return res.status(401).json({
            error: 'Missing signature or timestamp',
            message: 'X-Signature and X-Timestamp headers are required'
        });
    }

    // Verificar que el timestamp no sea muy antiguo (5 minutos)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    
    if (now - requestTime > 300) {
        return res.status(401).json({
            error: 'Request too old',
            message: 'Timestamp is too old'
        });
    }

    // Crear la signatura esperada
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(timestamp + payload)
        .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    if (!crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
    )) {
        return res.status(401).json({
            error: 'Invalid signature',
            message: 'HMAC signature verification failed'
        });
    }

    next();
};