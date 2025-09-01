import { historialModels } from '../models/historial.model.js';
import { poolhistorial } from '../config/db.js';

export const historialController = {
    // GET /api/historial/:leadId → obtener historial de un lead
    obtenerPorLead: async (req, res) => {
        try {
            const { leadId } = req.params;
            const [rows] = await poolhistorial.query(
                `SELECT * FROM historial WHERE lead_id = ? ORDER BY creado DESC`,
                [leadId]
            );

            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // POST /api/historial → crear un registro
    crear: async (req, res) => {
        try {
            const { lead_id, usuario_id, tipo, contenido } = req.body;

            if (!lead_id || !tipo) {
                return res.status(400).json({
                    success: false,
                    error: 'Campos requeridos: lead_id y tipo'
                });
            }

            const id = await historialModels.crearHistorial(
                lead_id,
                usuario_id || null,
                tipo,
                contenido || ''
            );

            res.json({
                success: true,
                data: { id, lead_id, usuario_id, tipo, contenido },
                mensaje: 'Historial creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando historial:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/historial → listar todo (paginado)
    listar: async (req, res) => {
        try {
            const { page = 1, limit = 50 } = req.query;
            const offset = (page - 1) * limit;

            const [rows] = await poolhistorial.query(
                `SELECT * FROM historial ORDER BY creado DESC LIMIT ? OFFSET ?`,
                [parseInt(limit), parseInt(offset)]
            );

            res.json({
                success: true,
                data: rows,
                pagination: { page: parseInt(page), limit: parseInt(limit) }
            });
        } catch (error) {
            console.error('Error listando historial:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
