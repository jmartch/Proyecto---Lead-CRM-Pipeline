import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middlewares.js'


const router = express.Router();

// Ruta de registro
router.post('/register', verifyToken, requireAdmin, registerUser);

// Ruta de login
router.post('/login', loginUser);

export default router;
