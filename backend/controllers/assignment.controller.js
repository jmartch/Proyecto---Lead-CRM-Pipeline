import { poolConfig } from '../config/db.js';
import { assignmentModel } from '../models/assignment.models.js';

export const assignmentController = {
    procesarAsignacionAutomatica: async (leadId, origen, campaña) => {
        try {
            // Buscar regla aplicable
            const regla = await assignmentModel.buscarReglaParaAsignacion(origen, campaña);
            if (!regla) {
                return null; // No hay regla aplicable
            }

            const responsables = regla.grupo_responsables;

            // Obtener conteo de asignaciones del día
            const conteos = await assignmentModel.contarAsignacionesDelDia(responsables);

            // Seleccionar responsable con menos asignaciones
            let responsableSeleccionado = responsables[0];
            let menorConteo = conteos[responsableSeleccionado];

            for (const responsable of responsables) {
                if (conteos[responsable] < menorConteo) {
                    menorConteo = conteos[responsable];
                    responsableSeleccionado = responsable;
                }
            }

            // Asignar el lead
            await assignmentModel.asignarResponsableALead(leadId, responsableSeleccionado);

            // Registrar en historial
            await assignmentModel.crearHistorial(
                leadId,
                null,
                'asignacion',
                `Lead asignado automáticamente a ${responsableSeleccionado} usando regla ${regla.id} (${origen}/${campaña || 'general'})`
            );

            return {
                responsable: responsableSeleccionado,
                regla_id: regla.id,
                conteo_previo: menorConteo
            };

        } catch (error) {
            console.error('Error en asignación automática:', error);
            throw error;
        }
    },
    // GET /api/asignacion/reglas
    obtenerReglas: async (req, res) => {
        try {
            const reglas = await assignmentModel.obtenerReglasAsignacion();
            res.json({
                success: true,
                data: reglas,
                mensaje: `${reglas.length} reglas encontradas`
            });
        } catch (error) {
            console.error('Error obteniendo reglas:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // POST /api/asignacion/reglas
    crearRegla: async (req, res) => {
        try {
            const { origen, campaña, responsables } = req.body;

            // Validaciones
            if (!origen || !responsables || !Array.isArray(responsables) || responsables.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Origen y responsables son requeridos'
                });
            }

            // Validar que los responsables sean strings válidos
            for (const responsable of responsables) {
                if (typeof responsable !== 'string' || responsable.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        error: 'Todos los responsables deben ser strings válidos'
                    });
                }
            }

            const reglaId = await assignmentModel.crearReglaAsignacion(origen, campaña, responsables);

            res.status(201).json({
                success: true,
                data: {
                    id: reglaId,
                    origen,
                    campaña,
                    responsables
                },
                mensaje: 'Regla de asignación creada exitosamente'
            });
        } catch (error) {
            console.error('Error creando regla:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // PUT /api/asignacion/reglas/:id
    actualizarRegla: async (req, res) => {
        try {
            const { id } = req.params;
            const { origen, campaña, responsables, activa } = req.body;

            const actualizado = await assignmentModel.actualizarReglaAsignacion(id, {
                origen, campaña, responsables, activa
            });

            if (!actualizado) {
                return res.status(404).json({
                    success: false,
                    error: 'Regla no encontrada'
                });
            }

            res.json({
                success: true,
                mensaje: 'Regla actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando regla:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // DELETE /api/asignacion/reglas/:id
    eliminarRegla: async (req, res) => {
        try {
            const { id } = req.params;

            const eliminado = await assignmentModel.eliminarReglaAsignacion(id);

            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    error: 'Regla no encontrada'
                });
            }

            res.json({
                success: true,
                mensaje: 'Regla eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error borrando regla:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }

    }
}