import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { swaggerDocs } from './config/swagger.js';
import { initializeDatabase } from './config/db.js';
import leadRoutes from './routes/leads.js';
import userRoutes from './routes/auth.js';
import ingestRoutes from './routes/ingest.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingest', ingestRoutes);

async function start() {
  await initializeDatabase();

  const PORT = process.env.PORT || 4000;
  swaggerDocs(app, PORT);

  app.listen(PORT, () => {
    console.log(`🚀 API escuchando en puerto ${PORT}`);
    console.log(`🌐 Endpoints disponibles Usuarios:`);
    console.log(`   GET    http://localhost:${PORT}/api/users`);
    console.log(`🌐 Endpoints disponibles Leads:`);
    console.log(`   GET    http://localhost:${PORT}/api/leads`);
    console.log(`🌐 Endpoints disponibles Ingest:`);
    console.log(`   GET    http://localhost:${PORT}/api/ingest`);
  });
}

start();