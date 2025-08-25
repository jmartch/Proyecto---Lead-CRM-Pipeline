// routes/ingest.js
import express from 'express';
import { authenticateApiKey, authenticateHMAC } from '../middlewares/auth.middlewares.js';
import { ingestLead } from '../controllers/ingest.controller.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

const ingestRateLimit = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100,
    message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded for ingest endpoint'
    }
});

/**
 * POST /api/ingest
 * Endpoint principal para ingestión de leads externos
 * Autenticación: X-API-KEY
 */
router.post('/ingest', 
    ingestRateLimit,
    authenticateApiKey, 
    ingestLead
);

/**
 * POST /api/ingest/webhook
 * Endpoint alternativo con autenticación HMAC
 * Para webhooks más seguros
 */
router.post('/ingest/webhook', 
    ingestRateLimit,
    authenticateHMAC, 
    ingestLead
);


export default router;

