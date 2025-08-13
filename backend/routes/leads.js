import { Router } from 'express';
import { LeadController } from '../controllers/leads.controllers.js';

const router = Router();

// GET /api/leads/options - Obtener opciones para filtros (debe ir ANTES de /:id)
router.get('/options', LeadController.getFilterOptions);

// GET /api/leads - Obtener leads con filtros opcionales
// Parámetros de query soportados:
// - estado: nuevo, contactado, en_negociacion, cerrado_ganado, cerrado_perdido
// - origen: filtro por origen (LIKE)
// - fecha_desde: YYYY-MM-DD
// - fecha_hasta: YYYY-MM-DD
// - responsable: nombre del responsable
// - ciudad: filtro por ciudad (LIKE)
// - fuente_detallada: filtro por fuente detallada (LIKE)
// - page: número de página (default: 1)
// - limit: registros por página (default: 10)
// - sort_by: campo de ordenamiento (fecha, nombre, email, estado, ciudad, responsable, fecha_actualizacion)
// - sort_order: ASC o DESC (default: DESC)
router.get('/', LeadController.getAll);

// GET /api/leads/:id - Obtener lead específico
router.get('/:id', LeadController.getById);

// POST /api/leads - Crear nuevo lead
// Body: { nombre, email, telefono?, origen?, campaña?, ciudad?, fuente_detallada?, tags?, responsable?, estado? }
router.post('/', LeadController.create);

// PUT /api/leads/:id - Actualizar lead existente
// Body: cualquier campo de lead para actualizar
router.put('/:id', LeadController.update);

// DELETE /api/leads/:id - Eliminar lead
router.delete('/:id', LeadController.delete);

export default router;