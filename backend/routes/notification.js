import { Router } from 'express';
import { notificacionesController } from '../controllers/notification.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middlewares.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Gestión de configuración de notificaciones (emails y pruebas)
 */

/**
 * @swagger
 * /api/notificaciones/config:
 *   get:
 *     summary: Obtener configuración de email
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración actual de email
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config', verifyToken, verifyAdmin, notificacionesController.obtenerConfiguracionEmail);

/**
 * @swagger
 * /api/notificaciones/config:
 *   put:
 *     summary: Actualizar configuración de email
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activo:
 *                 type: boolean
 *               smtp:
 *                 type: object
 *                 properties:
 *                   host:
 *                     type: string
 *                   port:
 *                     type: integer
 *                   user:
 *                     type: string
 *                   pass:
 *                     type: string
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/config', verifyToken, verifyAdmin, notificacionesController.actualizarConfiguracionEmail);

/**
 * @swagger
 * /api/notificaciones/test:
 *   post:
 *     summary: Probar envío de email con un lead
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lead_id:
 *                 type: integer
 *               email_destino:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado de la prueba de envío de email
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Lead no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/test', verifyToken, verifyAdmin, notificacionesController.probarEmail);

export default router;
