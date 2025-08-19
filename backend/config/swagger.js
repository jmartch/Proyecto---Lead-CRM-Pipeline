import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lead CRM API',
      version: '1.0.0',
      description: 'Documentación de la API del CRM de Leads',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Función para inicializar swagger
export const swaggerDocs = (app, PORT) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Swagger docs disponibles en: http://localhost:${PORT}/api-docs`);
};

export default swaggerSpec;

