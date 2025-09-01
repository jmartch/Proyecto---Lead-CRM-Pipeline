import nodemailer from 'nodemailer';
import axios from 'axios';
import fs from 'fs';
import { pool, poolhistorial } from '../config/db.js';

const CONFIG_PATH = './config/email.json';

export class NotificacionesModel {
    static transporter = null;

    // ==============================
    // Configuración de EMAIL
    // ==============================
    static async obtenerConfiguracionEmail() {
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                const data = fs.readFileSync(CONFIG_PATH, 'utf8');
                return JSON.parse(data);
            }
            return { activo: false, smtp: { host: '', port: 587, user: '', pass: '' } };
        } catch (error) {
            console.error('Error leyendo configuración de email:', error);
            return { activo: false, smtp: {} };
        }
    }

    static async actualizarConfiguracionEmail(config) {
        try {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error guardando configuración de email:', error);
            return false;
        }
    }

    // Inicializar transporte SMTP
    static async inicializarSMTP() {
        try {
            const config = await NotificacionesModel.obtenerConfiguracionEmail();

            if (config.activo && config.smtp?.host) {
                NotificacionesModel.transporter = nodemailer.createTransport({
                    host: config.smtp.host,
                    port: config.smtp.port,
                    secure: config.smtp.port === 465,
                    auth: {
                        user: config.smtp.user,
                        pass: config.smtp.pass
                    }
                });
            }
        } catch (error) {
            console.error('Error inicializando SMTP:', error);
        }
    }

    // ==============================
    // EMAIL: Notificación asignación
    // ==============================
    static async enviarEmailAsignacion(leadId, responsable) {
        try {
            if (!NotificacionesModel.transporter) {
                await NotificacionesModel.inicializarSMTP();
                if (!NotificacionesModel.transporter) {
                    console.log('SMTP no configurado, saltando email');
                    return false;
                }
            }

            // Obtener lead desde BD
            const [rows] = await pool.query(
                'SELECT id, nombre, email, telefono FROM leads WHERE id = ?',
                [leadId]
            );
            if (rows.length === 0) return false;
            const leadData = rows[0];

            const destinatario = responsable.includes('@')
                ? responsable
                : `${responsable}@empresa.com`;

            const mailOptions = {
                from: process.env.FROM_EMAIL || 'crm@empresa.com',
                to: destinatario,
                subject: `🎯 Nuevo lead asignado: ${leadData.nombre}`,
                html: `<h2>Nuevo lead asignado</h2>
                       <p><b>Nombre:</b> ${leadData.nombre}</p>
                       <p><b>Email:</b> ${leadData.email}</p>
                       <p><b>Teléfono:</b> ${leadData.telefono || 'No proporcionado'}</p>`
            };

            await NotificacionesModel.transporter.sendMail(mailOptions);
            console.log(`✅ Email de asignación enviado a ${destinatario}`);
            return true;

        } catch (error) {
            console.error('❌ Error enviando email:', error);
            return false;
        }
    }

    // ==============================
    // WEBHOOKS
    // ==============================
    static async enviarWebhook(leadId, evento, datos = {}) {
        try {
            // Configuración básica desde variables de entorno
            const url_base = process.env.WEBHOOK_URL || '';
            const activo = process.env.WEBHOOK_ACTIVO === 'true';
            const reintentos = parseInt(process.env.WEBHOOK_REINTENTOS || '3');

            if (!activo || !url_base) {
                console.log('Webhooks desactivados o sin URL configurada');
                return false;
            }

            const payload = {
                evento,
                lead_id: leadId,
                timestamp: new Date().toISOString(),
                datos
            };

            return await NotificacionesModel.enviarWebhookConReintentos(
                leadId,
                url_base,
                payload,
                reintentos
            );

        } catch (error) {
            console.error('❌ Error enviando webhook:', error);
            return false;
        }
    }

    static async enviarWebhookConReintentos(leadId, url, payload, maxIntentos) {
        let intentos = 0;
        let exitoso = false;
        let ultimaRespuesta = null;
        let ultimoStatusCode = 0;

        while (intentos < maxIntentos && !exitoso) {
            intentos++;
            try {
                console.log(`📡 Enviando webhook (intento ${intentos}/${maxIntentos}) para lead ${leadId}`);

                const respuesta = await axios.post(url, payload, {
                    timeout: 10000,
                    headers: { 'Content-Type': 'application/json' }
                });

                ultimaRespuesta = respuesta.data;
                ultimoStatusCode = respuesta.status;
                exitoso = respuesta.status >= 200 && respuesta.status < 300;

                if (exitoso) {
                    console.log(`✅ Webhook enviado exitosamente para lead ${leadId}`);
                }

            } catch (error) {
                console.error(`❌ Intento ${intentos} fallido para webhook lead ${leadId}:`, error.message);
                ultimaRespuesta = error.message;
                ultimoStatusCode = error.response?.status || 0;

                if (intentos < maxIntentos) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, intentos) * 1000));
                }
            }
        }

        // Guardar log en tabla historial
        try {
            await poolhistorial.query(
                `INSERT INTO webhooks_log 
                (lead_id, url, payload, respuesta, status_code, intentos, exitoso, fecha) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    leadId,
                    url,
                    JSON.stringify(payload),
                    JSON.stringify(ultimaRespuesta),
                    ultimoStatusCode,
                    intentos,
                    exitoso ? 1 : 0
                ]
            );
        } catch (err) {
            console.error('❌ Error guardando log de webhook:', err.message);
        }

        return exitoso;
    }
}
