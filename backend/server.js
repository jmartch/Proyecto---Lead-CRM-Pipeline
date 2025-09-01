import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { swaggerDocs } from './config/swagger.js';
import { initializeDatabase } from './config/db.js';
import leadRoutes from './routes/leads.js';
import userRoutes from './routes/auth.js';
import ingestRoutes from './routes/ingest.js';
import historialRoutes from './routes/historial.js';
import asignacionRoutes from './routes/assignment.js';
import webhookRoutes from './routes/webhooks.js';


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/webhooks', webhookRoutes);


async function start() {
  await initializeDatabase();

  const PORT = process.env.PORT || 4000;
  swaggerDocs(app, PORT);

  app.listen(PORT, () => {
    console.log(`🚀 API escuchando en puerto ${PORT}`);
    console.log(``);

    console.log(`🌐 Endpoints disponibles:`);
    console.log(`Usuarios (DB: usuarios_crm)`);
    console.log(`   GET    http://localhost:${PORT}/api/users`);
    console.log(`   POST   http://localhost:${PORT}/api/users`);
    console.log(``);

    console.log(`Leads (DB: lead_crm)`);
    console.log(`   GET    http://localhost:${PORT}/api/leads`);
    console.log(`   POST   http://localhost:${PORT}/api/leads`);
    console.log(``);

    console.log(`Ingest (entrada externa de leads)`);
    console.log(`   POST   http://localhost:${PORT}/api/ingest`);
    console.log(``);

    console.log(`Historial (DB: historial_crm)`);
    console.log(`   GET    http://localhost:${PORT}/api/historial/:leadId`);
    console.log(`   POST   http://localhost:${PORT}/api/historial`);
    console.log(``);

    console.log(`Asignaciones (DB: asignacion_reglas_crm)`);
    console.log(`   GET    http://localhost:${PORT}/api/asignaciones`);
    console.log(`   POST   http://localhost:${PORT}/api/asignaciones`);
    console.log(``);

    console.log(`Webhooks (DB: webhook_logs_crm)`);
    console.log(`   GET    http://localhost:${PORT}/api/webhooks`);
    console.log(`   POST   http://localhost:${PORT}/api/webhooks`);
    console.log(``);
  });
}

start();