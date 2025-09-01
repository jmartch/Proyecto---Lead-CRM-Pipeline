import { NotificacionesModel } from '../models/notificaciones.model.js';

export const notificacionesController = {
    
    // GET /api/notificaciones/config
    obtenerConfiguracionEmail: async (req, res) => {
        try {
            const configuracion = await NotificacionesModel.obtenerConfiguracionEmail();
            
            // No enviar contraseña en la respuesta
            if (configuracion?.smtp?.pass) {
                configuracion.smtp.pass = '***';
            }
            
            res.json({ 
                success: true, 
                data: configuracion 
            });
        } catch (error) {
            console.error('Error obteniendo configuración de email:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },
    
    // PUT /api/notificaciones/config
    actualizarConfiguracionEmail: async (req, res) => {
        try {
            const { activo, smtp } = req.body;
            
            // Validaciones
            if (typeof activo !== 'boolean') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'El campo activo debe ser boolean' 
                });
            }
            
            if (activo) {
                if (!smtp?.host || !smtp?.user) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Configuración SMTP requerida cuando email está activo' 
                    });
                }
                
                if (!smtp.port || typeof smtp.port !== 'number') {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Puerto SMTP debe ser un número válido' 
                    });
                }
            }
            
            const configuracion = { activo, smtp };
            await NotificacionesModel.actualizarConfiguracionEmail(configuracion);
            
            // Reinicializar el transporter SMTP
            await NotificacionesModel.inicializarSMTP();
            
            res.json({ 
                success: true, 
                data: { activo, smtp: { ...smtp, pass: '***' } },
                mensaje: 'Configuración de email actualizada exitosamente' 
            });
        } catch (error) {
            console.error('Error actualizando configuración de email:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },
    
    // POST /api/notificaciones/test
    probarEmail: async (req, res) => {
        try {
            const { lead_id, email_destino } = req.body;
            
            if (!lead_id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'lead_id es requerido' 
                });
            }
            
            const exitoso = await NotificacionesModel.enviarEmailAsignacion(lead_id, email_destino);
            
            res.json({ 
                success: true, 
                data: { email_enviado: exitoso },
                mensaje: exitoso ? 'Email de prueba enviado exitosamente' : 'Error enviando email de prueba'
            });
        } catch (error) {
            console.error('Error probando email:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
};
