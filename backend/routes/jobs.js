import {RouterSi } from 'express';
import { jobController } from '../controllers/job.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Endpoints para la configuración y ejecución de jobs automáticos
 */

/**
 * @swagger
 * /api/jobs/config:
 *   get:
 *     summary: Obtener configuración de jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración actual
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.get('/config', requireAuth, requireAdmin, jobController.obtenerConfiguracion);

/**
 * @swagger
 * /api/jobs/config:
 *   put:
 *     summary: Actualizar configuración de jobs
 *     tags: [Jobs]
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
 *                 example: true
 *               dias_nuevo:
 *                 type: integer
 *                 example: 7
 *               dias_contactado:
 *                 type: integer
 *                 example: 14
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.put('/config', requireAuth, requireAdmin, jobController.actualizarConfiguracion);

/**
 * @swagger
 * /api/jobs/ejecutar:
 *   post:
 *     summary: Ejecutar job manualmente
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job ejecutado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.post('/ejecutar', requireAuth, requireAdmin, jobController.ejecutarManualmente);

export default router;
