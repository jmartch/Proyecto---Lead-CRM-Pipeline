import { LeadModel as Lead } from '../models/leads.model.js';
import { isValidEmail as validateEmail, sanitizeInput } from '../utils/validators.js';

/**
 * Mapear payload externo a formato interno
 */
const mapPayloadToLead = (payload) => {
    // Mapeo flexible de campos
    const fieldMapping = {
        // Campos estándar
        name: payload.name || payload.full_name || payload.fullName || payload.firstName + ' ' + payload.lastName || '',
        email: payload.email || payload.email_address || payload.emailAddress || '',
        phone: payload.phone || payload.phone_number || payload.phoneNumber || payload.mobile || '',
        
        // Información de origen
        source: payload.source || payload.utm_source || payload.referrer || 'external_api',
        campaign: payload.campaign || payload.utm_campaign || payload.campaign_name || null,
        
        // Metadatos adicionales
        metadata: {
            utm_medium: payload.utm_medium || null,
            utm_content: payload.utm_content || null,
            utm_term: payload.utm_term || null,
            landing_page: payload.landing_page || payload.page_url || null,
            user_agent: payload.user_agent || null,
            ip_address: payload.ip_address || null,
            form_id: payload.form_id || null,
            ...payload.metadata || {}
        }
    };

    // Limpiar campos vacíos en metadata
    Object.keys(fieldMapping.metadata).forEach(key => {
        if (!fieldMapping.metadata[key]) {
            delete fieldMapping.metadata[key];
        }
    });

    return fieldMapping;
};

/**
 * Validar payload de entrada
 */
const validatePayload = (payload) => {
    const errors = [];

    // Campos requeridos
    if (!payload.email) {
        errors.push('Email is required');
    } else if (!validateEmail(payload.email)) {
        errors.push('Invalid email format');
    }

    if (!payload.name && !payload.full_name && !payload.firstName) {
        errors.push('Name is required (name, full_name, or firstName)');
    }

    return errors;
};

/**
 * Endpoint principal de ingestión
 */
export const ingestLead = async (req, res) => {
    try {
        const payload = req.body;

        // Log para debugging
        console.log('Incoming payload:', JSON.stringify(payload, null, 2));

        // Validar payload
        const validationErrors = validatePayload(payload);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid payload data',
                details: validationErrors
            });
        }

        // Mapear payload a formato interno
        const mappedLead = mapPayloadToLead(payload);
        
        // Sanitizar inputs
        mappedLead.name = sanitizeInput(mappedLead.name);
        mappedLead.email = sanitizeInput(mappedLead.email).toLowerCase();
        mappedLead.phone = sanitizeInput(mappedLead.phone);

        // Buscar lead existente por email
        let existingLead = await Lead.findOne({ email: mappedLead.email });

        let result;
        let action;

        if (existingLead) {
            // Actualizar lead existente
            const updateData = {
                ...mappedLead,
                lastContactDate: new Date(),
                // Mantener algunos campos si ya existen
                status: existingLead.status,
                assignedTo: existingLead.assignedTo,
                // Merge metadata
                metadata: {
                    ...existingLead.metadata,
                    ...mappedLead.metadata
                }
            };

            result = await Lead.findByIdAndUpdate(
                existingLead._id,
                updateData,
                { new: true, runValidators: true }
            );
            action = 'updated';
        } else {
            // Crear nuevo lead
            const newLead = new Lead({
                ...mappedLead,
                status: 'new',
                createdAt: new Date(),
                lastContactDate: new Date()
            });

            result = await newLead.save();
            action = 'created';
        }

        // Respuesta exitosa
        res.status(action === 'created' ? 201 : 200).json({
            success: true,
            action,
            lead: {
                id: result._id,
                name: result.name,
                email: result.email,
                phone: result.phone,
                source: result.source,
                campaign: result.campaign,
                status: result.status,
                createdAt: result.createdAt,
                lastContactDate: result.lastContactDate
            },
            message: `Lead ${action} successfully`
        });

    } catch (error) {
        console.error('Error in ingestLead:', error);
        
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process lead',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Endpoint de prueba para validar autenticación
 */
export const testAuth = (req, res) => {
    res.json({
        success: true,
        message: 'Authentication successful',
        timestamp: new Date().toISOString()
    });
};