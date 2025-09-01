import { poolConfig } from '../config/db.js';

export const assignmentModel = {
    async crearReglaAsignacion(origen, campaña = null, responsables) {
        try {
            const query = `
                INSERT INTO asignacion_reglas (origen, campaña, grupo_responsables, activa, creado, actualizado)
                VALUES (?, ?, ?, TRUE, NOW(), NOW())
            `;
            const [result] = await poolConfig.execute(query, [origen, campaña, JSON.stringify(responsables)]);
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creando regla de asignación: ${error.message}`);
        }
    },

    async obtenerReglasAsignacion() {
        try {
            const query = `
                SELECT id, origen, campaña, grupo_responsables, activa, creado, actualizado
                FROM asignacion_reglas 
                WHERE activa = TRUE 
                ORDER BY id DESC
            `;
            const [rows] = await poolConfig.execute(query);
            return rows.map(row => ({
                ...row,
                grupo_responsables: JSON.parse(row.grupo_responsables)
            }));
        } catch (error) {
            throw new Error(`Error obteniendo reglas: ${error.message}`);
        }
    },

    async actualizarReglaAsignacion(id, datos) {
        try {
            const { origen, campaña, responsables, activa } = datos;
            const query = `
                UPDATE asignacion_reglas 
                SET origen = ?, campaña = ?, grupo_responsables = ?, activa = ?, actualizado = NOW()
                WHERE id = ?
            `;
            const [result] = await poolConfig.execute(query, [
                origen, campaña, JSON.stringify(responsables), activa, id
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error actualizando regla: ${error.message}`);
        }
    },

    async buscarReglaParaAsignacion(origen, campaña) {
        try {
            // Regla específica (origen + campaña)
            let query = `
                SELECT * FROM asignacion_reglas 
                WHERE origen = ? AND campaña = ? AND activa = TRUE 
                LIMIT 1
            `;
            let [reglas] = await poolConfig.execute(query, [origen, campaña]);

            // Si no hay, buscar solo por origen
            if (reglas.length === 0) {
                query = `
                    SELECT * FROM asignacion_reglas 
                    WHERE origen = ? AND (campaña IS NULL OR campaña = '') AND activa = TRUE 
                    LIMIT 1
                `;
                [reglas] = await poolConfig.execute(query, [origen]);
            }

            if (reglas.length > 0) {
                const regla = reglas[0];
                return {
                    ...regla,
                    grupo_responsables: JSON.parse(regla.grupo_responsables)
                };
            }
            return null;
        } catch (error) {
            throw new Error(`Error buscando regla: ${error.message}`);
        }
    },

    async contarAsignacionesDelDia(responsables) {
        try {
            const placeholders = responsables.map(() => '?').join(',');
            const query = `
                SELECT responsable, COUNT(*) as total 
                FROM lead_crm.leads 
                WHERE responsable IN (${placeholders}) 
                AND DATE(fecha) = CURDATE()
                GROUP BY responsable
            `;
            const [rows] = await poolConfig.execute(query, responsables);

            // Mapa con todos los responsables (incluye 0 asignaciones)
            const conteo = {};
            responsables.forEach(resp => conteo[resp] = 0);
            rows.forEach(row => conteo[row.responsable] = row.total);

            return conteo;
        } catch (error) {
            throw new Error(`Error contando asignaciones: ${error.message}`);
        }
    },

    async eliminarReglaAsignacion(id) {
        try {
            const query = `
                DELETE FROM asignacion_reglas 
                WHERE id = ?
            `;
            const [result] = await poolConfig.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error eliminando regla: ${error.message}`);
        }
    }
};
