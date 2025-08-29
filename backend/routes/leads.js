import { Router } from 'express';
import { LeadController } from '../controllers/leads.controllers.js';
import { upload } from '../middlewares/import.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Endpoints de gestión de leads (CRM)
 */

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Obtener todos los leads con filtros, paginación y ordenamiento
 *     tags: [Leads]
 *     parameters:
 *       - name: estado
 *         in: query
 *         schema: { type: string, enum: [nuevo, contactado, en_negociacion, cerrado_ganado, cerrado_perdido] }
 *       - name: origen
 *         in: query
 *         schema: { type: string }
 *       - name: fecha_desde
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: fecha_hasta
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: responsable
 *         in: query
 *         schema: { type: string }
 *       - name: ciudad
 *         in: query
 *         schema: { type: string }
 *       - name: fuente_detallada
 *         in: query
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10 }
 *       - name: sort_by
 *         in: query
 *         schema: { type: string, enum: [fecha, nombre, email, estado, ciudad, responsable, fecha_actualizacion] }
 *       - name: sort_order
 *         in: query
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *     responses:
 *       200:
 *         description: Lista de leads con metadatos de paginación
 */
router.get('/', LeadController.getAll);

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Obtener un lead por ID
 *     tags: [Leads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead encontrado
 *       404:
 *         description: Lead no encontrado
 */
router.get('/:id', LeadController.getById);

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Crear un nuevo lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email]
 *             properties:
 *               nombre: { type: string }
 *               email: { type: string }
 *               telefono: { type: string }
 *               origen: { type: string }
 *               campaña: { type: string }
 *               ciudad: { type: string }
 *               fuente_detallada: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               responsable: { type: string }
 *               estado:
 *                 type: string
 *                 enum: [nuevo, contactado, en_negociacion, cerrado_ganado, cerrado_perdido]
 *     responses:
 *       201:
 *         description: Lead creado exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Ya existe un lead con este email
 */
router.post('/', LeadController.create);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Actualizar un lead
 *     tags: [Leads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Lead actualizado correctamente
 *       404:
 *         description: Lead no encontrado
 */
router.put('/:id', LeadController.update);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Eliminar un lead
 *     tags: [Leads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead eliminado correctamente
 *       404:
 *         description: Lead no encontrado
 */
router.delete('/:id', LeadController.delete);

/**
 * @swagger
 * /api/leads/{id}/responsable:
 *   put:
 *     summary: Asignar responsable a un lead
 *     tags: [Leads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responsable: { type: string }
 *     responses:
 *       200: { description: Responsable asignado }
 *       404: { description: Lead no encontrado }
 */
router.put('/:id/responsable', LeadController.assignResponsable);

/**
 * @swagger
 * /api/leads/{id}/responsable/state:
 *   put:
 *     summary: Actualizar estado de un lead
 *     tags: [Leads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [nuevo, contactado, en_negociacion, cerrado_ganado, cerrado_perdido]
 *     responses:
 *       200: { description: Estado actualizado }
 *       400: { description: Estado inválido }
 *       404: { description: Lead no encontrado }
 */
router.put('/:id/responsable/state', LeadController.updateState);

/**
 * @swagger
 * /api/leads/options:
 *   get:
 *     summary: Obtener opciones únicas para filtros (estados, ciudades, responsables, etc.)
 *     tags: [Leads]
 *     responses:
 *       200: { description: Opciones disponibles }
 */
router.get('/options', LeadController.getFilterOptions);

/**
 * @swagger
 * /api/leads/importcsv:
 *   post:
 *     summary: Importar leads desde un archivo CSV
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Leads importados exitosamente }
 *       400: { description: Archivo inválido }
 */
router.post('/importcsv', upload.single('file'), LeadController.importcsv);

/**
 * @swagger
 * /api/leads/exportcsv:
 *   get:
 *     summary: Exportar leads a CSV
 *     tags: [Leads]
 *     responses:
 *       200: { description: Archivo CSV generado }
 */
router.get('/exportcsv', LeadController.exportcsv);

/**
 * @swagger
 * /api/leads/leads-by-compaign:
 *   get:
 *     summary: Obtener cantidad de leads agrupados por campaña
 *     tags: [Leads]
 *     parameters:
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Estadísticas por campaña }
 */
router.get('/leads-by-compaign', LeadController.getLeadsByCampaign);

/**
 * @swagger
 * /api/leads/funnel:
 *   get:
 *     summary: Obtener datos del embudo de ventas (leads por estado)
 *     tags: [Leads]
 *     parameters:
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Datos del funnel }
 */
router.get('/funnel', LeadController.getFunnelData);

/**
 * @swagger
 * /api/leads/avg-response-time:
 *   get:
 *     summary: Obtener el tiempo promedio de respuesta de leads
 *     tags: [Leads]
 *     parameters:
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Promedio de horas de respuesta }
 */
router.get('/avg-response-time', LeadController.getAvgResponseTime);

export default router;
