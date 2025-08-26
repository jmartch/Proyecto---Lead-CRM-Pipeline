import { Router } from 'express';
import { LeadController } from '../controllers/leads.controllers.js';
import { upload } from '../middlewares/import.middleware.js';

const router = Router();


router.get('/options', LeadController.getFilterOptions);

router.post('/importcsv', upload.single('file'), LeadController.importcsv);

router.get('/exportcsv', LeadController.exportcsv);

router.put('/:id/responsable', LeadController.assignResponsable);

router.put('/:id/responsable/state', LeadController.updateState);

router.delete('/:id', LeadController.delete);

router.get('/:id', LeadController.getById);

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Endpoints de gestión de leads
 */

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Obtener todos los leads (con filtros, paginación y ordenamiento)
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: Lista de leads
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
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lead encontrado
 *       404:
 *         description: Lead no encontrado
 */

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
 *             required:
 *               - nombre
 *               - email
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               origen:
 *                 type: string
 *               campaña:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               fuente_detallada:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsable:
 *                 type: string
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
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lead eliminado correctamente
 *       404:
 *         description: Lead no encontrado
 */


/**
 * @swagger
 * /api/leads/options:
 *   get:
 *     summary: Obtener opciones únicas para filtros (estados, ciudades, responsables, etc.)
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: Opciones disponibles
 */

//router.put('/api/leads/:id/responsable', LeadController.updateResponsable);

export default router;