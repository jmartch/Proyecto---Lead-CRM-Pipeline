import { Router } from 'express'; 
import assignmentController from '../controllers/assignment.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Asignación
 *   description: Gestión de reglas de asignación automática de leads
 */

/**
 * @swagger
 * /api/asignacion/reglas:
 *   get:
 *     summary: Obtener todas las reglas de asignación activas
 *     tags: [Asignación]
 *     responses:
 *       200:
 *         description: Lista de reglas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       origen:
 *                         type: string
 *                       campaña:
 *                         type: string
 *                       grupo_responsables:
 *                         type: array
 *                         items:
 *                           type: string
 *                       activa:
 *                         type: boolean
 *                       creado:
 *                         type: string
 *                         format: date-time
 *                       actualizado:
 *                         type: string
 *                         format: date-time
 */
router.get('/asignacion/reglas', assignmentController.obtenerReglas );

/**
 * @swagger
 * /api/asignacion/reglas:
 *   post:
 *     summary: Crear una nueva regla de asignación
 *     tags: [Asignación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origen
 *               - responsables
 *             properties:
 *               origen:
 *                 type: string
 *               campaña:
 *                 type: string
 *               responsables:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Regla creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/asignacion/reglas', assignmentController.crearRegla);

/**
 * @swagger
 * /api/asignacion/reglas/{id}:
 *   put:
 *     summary: Actualizar una regla de asignación existente
 *     tags: [Asignación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la regla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origen:
 *                 type: string
 *               campaña:
 *                 type: string
 *               responsables:
 *                 type: array
 *                 items:
 *                   type: string
 *               activa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Regla actualizada correctamente
 *       404:
 *         description: Regla no encontrada
 */
router.put('/asignacion/reglas/:id', assignmentController.actualizarRegla);

/**
 * @swagger
 * /api/asignacion/reglas/{id}:
 *   delete:
 *     summary: Eliminar una regla de asignación
 *     tags: [Asignación]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la regla
 *     responses:
 *       200:
 *         description: Regla eliminada exitosamente
 *       404:
 *         description: Regla no encontrada
 */
router.delete('/asignacion/reglas/:id', assignmentController.eliminarRegla);

export default router;
