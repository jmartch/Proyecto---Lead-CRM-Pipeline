import { pool, poolConfig, poolWebhooks } from '../config/db.js';

export const webhooksModel = {
  // ---------- CONFIG (config_crm.configuraciones) ----------
  async obtenerConfiguracionWebhooks() {
    try {
      const [rows] = await poolConfig.execute(
        `SELECT valor FROM configuraciones WHERE clave = 'webhooks'`
      );
      if (rows.length > 0) return JSON.parse(rows[0].valor);
      return { activo: false, url_base: '', reintentos: 3 };
    } catch (error) {
      throw new Error(`Error obteniendo configuración de webhooks: ${error.message}`);
    }
  },

  async actualizarConfiguracionWebhooks(configuracion) {
    try {
      const [result] = await poolConfig.execute(
        `
        INSERT INTO configuraciones (clave, valor, descripcion, actualizado)
        VALUES ('webhooks', ?, 'Configuración para webhooks salientes', NOW())
        ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado = VALUES(actualizado)
        `,
        [JSON.stringify(configuracion)]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error actualizando configuración de webhooks: ${error.message}`);
    }
  },

  // ---------- LOGS (webhook_logs_crm.webhook_logs) ----------
  async crearLogWebhook(leadId, url, payload, respuesta, statusCode, intentos, exitoso) {
    try {
      const [result] = await poolWebhooks.execute(
        `
        INSERT INTO webhook_logs (lead_id, url, payload, respuesta, status_code, intentos, exitoso, creado)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          leadId,
          url,
          JSON.stringify(payload),
          respuesta != null ? JSON.stringify(respuesta) : null,
          statusCode ?? null,
          intentos ?? 1,
          !!exitoso,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creando log de webhook: ${error.message}`);
    }
  },

  async obtenerLogsWebhooks(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;

      // Nota: poolWebhooks apunta a webhook_logs_crm,
      // para unir con leads hay que calificar con el esquema lead_crm.leads
      const [rows] = await poolWebhooks.execute(
        `
        SELECT w.*,
               l.nombre  AS lead_nombre,
               l.email   AS lead_email
        FROM webhook_logs w
        LEFT JOIN lead_crm.leads l ON l.id = w.lead_id
        ORDER BY w.creado DESC
        LIMIT ? OFFSET ?
        `,
        [Number(limit), Number(offset)]
      );

      return rows.map(r => ({
        ...r,
        payload: r.payload ? JSON.parse(r.payload) : null,
        respuesta: r.respuesta ? JSON.parse(r.respuesta) : null,
      }));
    } catch (error) {
      throw new Error(`Error obteniendo logs de webhooks: ${error.message}`);
    }
  },

  // ---------- UTIL: lead (lead_crm.leads) ----------
  async obtenerLeadPorId(leadId) {
    try {
      const [rows] = await pool.execute(`SELECT * FROM leads WHERE id = ?`, [leadId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error obteniendo lead: ${error.message}`);
    }
  },
};
