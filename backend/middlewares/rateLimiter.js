import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const rateLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutos por defecto
        max: 100, // máximo 100 requests por ventana de tiempo
        message: {
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.'
        },
        standardHeaders: true, // Incluir headers de rate limit
        legacyHeaders: false,
        // Función para generar la key (por defecto usa IP)
        keyGenerator: (req) => {
            // Priorizar X-API-KEY si existe, sino usar IP
            return req.headers['x-api-key'] || ipKeyGenerator(req);
        },
        // Función para saltar el rate limit
        skip: (req) => {
            // Saltar para IPs whitelisted o en desarrollo
            const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
            return process.env.NODE_ENV === 'development' || 
                   whitelistedIPs.includes(req.ip);
        }
    };

    return rateLimit({
        ...defaultOptions,
        ...options
    });
};

// Rate limiter estricto para endpoints sensibles
export const strictRateLimit = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // máximo 5 requests por minuto
    message: {
        error: 'Rate limit exceeded',
        message: 'Too many requests to this sensitive endpoint'
    }
});

// Rate limiter permisivo para endpoints públicos
export const publicRateLimit = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 1000, // máximo 1000 requests por minuto
    message: {
        error: 'Rate limit exceeded',
        message: 'Too many requests from this client'
    }
});