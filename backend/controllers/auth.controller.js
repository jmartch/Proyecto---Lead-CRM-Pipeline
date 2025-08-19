import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { authModel } from '../models/auth.models.js';

// REGISTRO
export async function registerUser(req, res) {
    try {
        const { email, nombre, password } = req.body;
        if (!email || !nombre || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Verificar si el usuario ya existe
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insertar en la base de datos
        await pool.query(
            'INSERT INTO users (nombre, email, password) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, 'admin']
        );

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// LOGIN
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Faltan campos' });
        }

        // Verificar si el usuario existe
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ message: 'Login exitoso', token });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// Respuesta API
export const authController = {

getAllUsers: async (req, res) => {
    try {
        const filters = req.query;
        const result = await authModel.getAllWithFilters(filters);
        res.json(result);
    } catch (error) {
        console.error('Error en getAllUsers:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
},


getUserById: async (req, res) => {
    try {
        const { id } = req.params;
        const user = await authModel.getById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error en getUserById:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
},

updateUser: async (req, res) =>{
    try {
        const { id } = req.params;
        const { nombre, email, password, rol } = req.body;

        let hashedPassword = password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 12);
        }

        const updated = await authModel.update(id, {
            nombre,
            email,
            password: hashedPassword,
            rol,
        });

        if (!updated) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error en updateUser:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
},

deleteUser: async(req, res) => {
    try {
        const { id } = req.params;
        const deleted = await authModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error en deleteUser:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
},

changeUserRole: async  (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        if (!rol) {
            return res.status(400).json({ message: 'Debe especificar un rol' });
        }

        const updated = await authModel.changeRole(id, rol);

        if (!updated) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error('Error en changeUserRole:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
}