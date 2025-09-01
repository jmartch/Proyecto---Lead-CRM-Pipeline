import { pool, poolhistorial } from '../config/db.js';

export const jobsModel = {
    async obtenerConfiguracionJobs() {
        try {
            const query = `SELECT valor FROM configuraciones WHERE clave = 'job_cambio_estado'`;
            const [rows] = await pool.execute(query);

            if (rows.length > 0) {
                return JSON.parse(rows[0].valor);
            }

            // Config por defecto
            const configDefault = { activo: true, dias_nuevo: 7, dias_contactado: 14 };
            await this.actualizarConfiguracionJobs(configDefault);
            return configDefault;
        } catch (error) {
            throw new Error(`Error obteniendo configuración de jobs: ${error.message}`);
        }
    },

    async actualizarConfiguracionJobs(configuracion) {
        try {
            const query = `
              INSERT INTO configuraciones (clave, valor, descripcion, actualizado) 
              VALUES ('job_cambio_estado', ?, 'Configuración para jobs automáticos', NOW())
              ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado = VALUES(actualizado)
            `;
            const [result] = await pool.execute(query, [JSON.stringify(configuracion)]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error actualizando configuración de jobs: ${error.message}`);
        }
    },

    async obtenerLeadsParaCambioEstado(estado, diasLimite) {
        try {
            let query, params;

            if (estado === 'nuevo') {
                query = `
                  SELECT id, nombre, responsable, origen, campaña
                  FROM leads 
                  WHERE estado = 'nuevo' 
                  AND DATEDIFF(NOW(), fecha) > ?
                `;
                params = [diasLimite];
            } else if (estado === 'contactado') {
                query = `
                  SELECT id, nombre, responsable, origen, campaña
                  FROM leads 
                  WHERE estado = 'contactado' 
                  AND DATEDIFF(NOW(), fecha_actualizacion) > ?
                `;
                params = [diasLimite];
            }

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo leads para cambio de estado: ${error.message}`);
        }
    },

    async cambiarEstadoLead(leadId, nuevoEstado) {
        try {
            const query = `
              UPDATE leads 
              SET estado = ?, fecha_actualizacion = NOW() 
              WHERE id = ?
            `;
            const [result] = await pool.execute(query, [nuevoEstado, leadId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error cambiando estado del lead: ${error.message}`);
        }
    },

    async crearHistorial(leadId, usuarioId, tipo, contenido) {
        try {
            const query = `
              INSERT INTO historial (lead_id, usuario_id, tipo, contenido, creado)
              VALUES (?, ?, ?, ?, NOW())
            `;
            await poolhistorial.execute(query, [leadId, usuarioId, tipo, contenido]);
        } catch (error) {
            throw new Error(`Error creando historial: ${error.message}`);
        }
    },

    async ejecutarCambioDeEstados() {
        const config = await this.obtenerConfiguracionJobs();
        if (!config.activo) return { mensaje: 'Jobs desactivados' };

        let leadsActualizados = 0;

        // nuevos -> no_contactado
        const leadsNuevos = await this.obtenerLeadsParaCambioEstado('nuevo', config.dias_nuevo);
        for (const lead of leadsNuevos) {
            await this.cambiarEstadoLead(lead.id, 'no_contactado');
            await this.crearHistorial(lead.id, null, 'estado', 
              `Estado cambiado automáticamente de 'nuevo' a 'no_contactado' por inactividad de ${config.dias_nuevo} días`
            );
            leadsActualizados++;
        }

        // contactados -> en_negociacion
        const leadsContactados = await this.obtenerLeadsParaCambioEstado('contactado', config.dias_contactado);
        for (const lead of leadsContactados) {
            await this.cambiarEstadoLead(lead.id, 'en_negociacion');
            await this.crearHistorial(lead.id, null, 'estado', 
              `Estado cambiado automáticamente de 'contactado' a 'en_negociacion' por tiempo transcurrido de ${config.dias_contactado} días`
            );
            leadsActualizados++;
        }

        return {
            mensaje: 'Job ejecutado exitosamente',
            leads_nuevos_procesados: leadsNuevos.length,
            leads_contactados_procesados: leadsContactados.length,
            total_actualizados: leadsActualizados
        };
    }
};
