import { Router } from 'express';
import { registerUser, loginUser, authController } from '../controllers/auth.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middlewares.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y gestión de usuarios
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (con filtros y paginación)
 *     tags: [Auth]
 *     parameters:
 *       - name: nombre
 *         in: query
 *         schema: { type: string }
 *       - name: email
 *         in: query
 *         schema: { type: string }
 *       - name: rol
 *         in: query
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer }
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *       - name: sort_by
 *         in: query
 *         schema: { type: string, enum: [nombre, email, rol, creado] }
 *       - name: sort_order
 *         in: query
 *         schema: { type: string, enum: [ASC, DESC] }
 */
router.get('/',verifyToken, authController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Auth]
 */
router.get('/:id', verifyToken, authController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Auth]
 */
router.put('/:id', verifyToken, authController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Auth]
 */
router.delete('/:id', verifyAdmin, authController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Cambiar el rol de un usuario
 *     tags: [Auth]
 */
router.patch('/:id/role', verifyAdmin, authController.changeUserRole);

export default router;
