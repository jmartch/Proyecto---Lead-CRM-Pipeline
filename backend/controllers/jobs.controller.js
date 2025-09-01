import { jobsModel } from '../models/jobs.model.js';

export const jobController = {
    obtenerConfiguracion: async (req, res) => {
        try {
            const configuracion = await jobsModel.obtenerConfiguracionJobs();
            res.json({ success: true, data: configuracion });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    actualizarConfiguracion: async (req, res) => {
        try {
            const { activo, dias_nuevo, dias_contactado } = req.body;

            if (typeof activo !== 'boolean') {
                return res.status(400).json({ success: false, error: 'El campo activo debe ser boolean' });
            }

            if (dias_nuevo && (typeof dias_nuevo !== 'number' || dias_nuevo < 1)) {
                return res.status(400).json({ success: false, error: 'dias_nuevo debe ser un número mayor a 0' });
            }

            if (dias_contactado && (typeof dias_contactado !== 'number' || dias_contactado < 1)) {
                return res.status(400).json({ success: false, error: 'dias_contactado debe ser un número mayor a 0' });
            }

            const configuracion = { activo, dias_nuevo, dias_contactado };
            await jobsModel.actualizarConfiguracionJobs(configuracion);

            res.json({ success: true, data: configuracion, mensaje: 'Configuración actualizada exitosamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    ejecutarManualmente: async (req, res) => {
        try {
            const resultado = await jobsModel.ejecutarCambioDeEstados();
            res.json({ success: true, data: resultado, mensaje: 'Job ejecutado manualmente' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
