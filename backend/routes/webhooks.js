import { Router } from 'express';
import { webhooksController } from '../controllers/webhooks.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Gestión de webhooks y sus logs
 */

/**
 * @swagger
 * /api/webhooks/logs:
 *   get:
 *     summary: Obtener logs de webhooks
 *     tags: [Webhooks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página de resultados
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de registros por página
 *     responses:
 *       200:
 *         description: Lista de logs de webhooks
 *       500:
 *         description: Error interno del servidor
 */
router.get('/webhooks/logs', requireAuth, requireAdmin, webhooksController.obtenerLogs);

/**
 * @swagger
 * /api/webhooks/config:
 *   get:
 *     summary: Obtener configuración de webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Configuración actual de webhooks
 *       500:
 *         description: Error interno del servidor
 */
router.get('/webhooks/config', requireAuth, requireAdmin, webhooksController.obtenerConfiguracion);

/**
 * @swagger
 * /api/webhooks/config:
 *   put:
 *     summary: Actualizar configuración de webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activo:
 *                 type: boolean
 *               url_base:
 *                 type: string
 *               reintentos:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Configuración actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/webhooks/config', requireAuth, requireAdmin, webhooksController.actualizarConfiguracion);

/**
 * @swagger
 * /api/webhooks/test:
 *   post:
 *     summary: Enviar webhook de prueba
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lead_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Webhook de prueba enviado
 *       400:
 *         description: Petición inválida (faltan datos)
 *       404:
 *         description: Lead no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/webhooks/test', requireAuth, requireAdmin, webhooksController.probarWebhook);

export default router;
