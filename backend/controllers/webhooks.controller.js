import { webhooksModel } from '../models/webhooks.models.js';
import { NotificacionesModel } from '../models/notification.models.js'; 
export const webhooksController = {
  // GET /api/webhooks/logs
  async obtenerLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const logs = await webhooksModel.obtenerLogsWebhooks(Number(page), Number(limit));
      res.json({
        success: true,
        data: logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: logs.length,
        },
      });
    } catch (error) {
      console.error('Error obteniendo logs de webhooks:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/webhooks/config
  async obtenerConfiguracion(req, res) {
    try {
      const configuracion = await webhooksModel.obtenerConfiguracionWebhooks();
      res.json({ success: true, data: configuracion });
    } catch (error) {
      console.error('Error obteniendo configuración de webhooks:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /api/webhooks/config
  async actualizarConfiguracion(req, res) {
    try {
      const { activo, url_base, reintentos } = req.body;

      // Validaciones básicas
      if (typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, error: 'El campo activo debe ser boolean' });
      }
      if (activo && (!url_base || typeof url_base !== 'string')) {
        return res.status(400).json({ success: false, error: 'URL base requerida cuando webhooks está activo' });
      }
      if (reintentos && (typeof reintentos !== 'number' || reintentos < 1 || reintentos > 10)) {
        return res.status(400).json({ success: false, error: 'Reintentos debe ser un número entre 1 y 10' });
      }

      const configuracion = { activo, url_base: url_base || '', reintentos: reintentos || 3 };
      await webhooksModel.actualizarConfiguracionWebhooks(configuracion);

      res.json({
        success: true,
        data: configuracion,
        mensaje: 'Configuración de webhooks actualizada exitosamente',
      });
    } catch (error) {
      console.error('Error actualizando configuración de webhooks:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/webhooks/test
  async probarWebhook(req, res) {
    try {
      const { lead_id } = req.body;
      if (!lead_id) {
        return res.status(400).json({ success: false, error: 'lead_id es requerido' });
      }

      const lead = await webhooksModel.obtenerLeadPorId(lead_id);
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead no encontrado' });
      }

      const ok = await NotificacionesModel.enviarWebhook(
        lead_id,
        'test_webhook',
        { mensaje: 'Webhook de prueba desde admin' }
      );

      res.json({
        success: true,
        data: { webhook_enviado: ok },
        mensaje: ok ? 'Webhook de prueba enviado exitosamente' : 'Error enviando webhook de prueba',
      });
    } catch (error) {
      console.error('Error probando webhook:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
