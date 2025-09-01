import { poolhistorial } from '../config/db.js'

export const historialModels = {
    async crearHistorial(leadId, usuarioId = null, tipo, contenido) {
        try {
            const query = `
            INSERT INTO historial (lead_id, usuario_id, tipo, contenido, creado)
            VALUES (?, ?, ?, ?, NOW())
        `;
            const [result] = await poolhistorial.execute(query, [leadId, usuarioId, tipo, contenido]);
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creando historial: ${error.message}`);
        }
    },
}