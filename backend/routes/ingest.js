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
 * @swagger
 * tags:
 *   name: Ingest
 *   description: Endpoints para la ingestión de leads externos (landing pages, anuncios, webhooks)
 */

/**
 * @swagger
 * /api/ingest:
 *   post:
 *     summary: Ingestar lead externo mediante API Key
 *     description: Recibe leads de landing pages o anuncios externos usando autenticación básica con **X-API-KEY**.
 *     tags: [Ingest]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan.perez@mail.com
 *               phone:
 *                 type: string
 *                 example: "+57 3001234567"
 *               source:
 *                 type: string
 *                 example: landing_page
 *               campaign:
 *                 type: string
 *                 example: Facebook Ads - Enero
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   utm_source: facebook
 *                   utm_campaign: enero2025
 *     responses:
 *       201:
 *         description: Lead ingresado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Autenticación fallida (API Key inválida)
 *       429:
 *         description: Demasiadas solicitudes (rate limit alcanzado)
 */
router.post(
    '/ingest',
    ingestRateLimit,
    authenticateApiKey,
    ingestLead
);

/**
 * @swagger
 * /api/ingest/webhook:
 *   post:
 *     summary: Ingestar lead externo mediante Webhook con autenticación HMAC
 *     description: Endpoint seguro para recibir leads vía **webhooks firmados** usando autenticación HMAC.
 *     tags: [Ingest]
 *     security:
 *       - HmacAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *               campaign:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Lead ingresado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Autenticación fallida (firma HMAC inválida)
 *       429:
 *         description: Demasiadas solicitudes (rate limit alcanzado)
 */
router.post(
    '/ingest/webhook',
    ingestRateLimit,
    authenticateHMAC,
    ingestLead
);

export default router;
