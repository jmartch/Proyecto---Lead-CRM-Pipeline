import { Router } from 'express';
import { historialController } from '../controllers/historial.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Historial
 *   description: Registro de interacciones y cambios de leads
 */

/**
 * @swagger
 * /api/historial/{leadId}:
 *   get:
 *     summary: Obtener historial de un lead específico
 *     tags: [Historial]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lead
 *     responses:
 *       200:
 *         description: Lista de interacciones del lead
 */
router.get('/historial/:leadId', verifyToken, historialController.obtenerPorLead);

/**
 * @swagger
 * /api/historial:
 *   post:
 *     summary: Crear un registro en historial
 *     tags: [Historial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Historial'
 *     responses:
 *       200:
 *         description: Registro creado exitosamente
 */
router.post('/historial', verifyToken, historialController.crear);

/**
 * @swagger
 * /api/historial:
 *   get:
 *     summary: Listar historial completo (admin)
 *     tags: [Historial]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad por página
 *     responses:
 *       200:
 *         description: Lista paginada del historial
 */
router.get('/historial', verifyToken, historialController.listar);

export default router;
