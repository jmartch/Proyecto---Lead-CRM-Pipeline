import nodemailer from 'nodemailer';
import axios from 'axios';
import db from '../config/db.js';

export class NotificacionesModel {
    static transporter = null;

        static async obtenerConfiguracionEmail() {
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                const data = fs.readFileSync(CONFIG_PATH, 'utf8');
                return JSON.parse(data);
            }
            // Config default
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
            const config = await db.obtenerConfiguracionEmail();
            
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

    // Enviar email de asignación
    static async enviarEmailAsignacion(leadId, responsable) {
        try {
            if (!NotificacionesModel.transporter) {
                await NotificacionesModel.inicializarSMTP();
                if (!NotificacionesModel.transporter) {
                    console.log('SMTP no configurado, saltando email');
                    return false;
                }
            }
            
            const leadData = await db.obtenerLeadPorId(leadId);
            if (!leadData) return false;

            // Usar responsable directamente si parece email, si no, adjuntar dominio
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

    // Enviar webhook
    static async enviarWebhook(leadId, evento, datos = {}) {
        try {
            const config = await db.obtenerConfiguracionWebhooks();
            
            if (!config.activo || !config.url_base) {
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
                config.url_base, 
                payload, 
                config.reintentos || 3
            );
            
        } catch (error) {
            console.error('❌ Error enviando webhook:', error);
            return false;
        }
    }

    // Enviar webhook con reintentos
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
        
        await db.crearLogWebhook(
            leadId, 
            url, 
            payload, 
            ultimaRespuesta, 
            ultimoStatusCode, 
            intentos, 
            exitoso
        );
        
        return exitoso;
    }
}
