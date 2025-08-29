🚀 Proyecto-Lead-CRM-Pipeline

Lead CRM & Pipeline es una herramienta web para que equipos comerciales gestionen el ciclo completo de sus leads: captura, clasificación, seguimiento y cierre de ventas.

🧩 Estructura del repositorio
/Proyecto-Lead-CRM-Pipeline
├─ backend/   # API (Node.js + Express + MySQL + Swagger)
├─ frontend/  # Cliente web (Vite + React + TypeScript)
└─ README.md  # Documentación principal

✨ Funcionalidades principales

1. Gestión de Leads

Captura de leads (nombre, email, teléfono, origen, campaña, ciudad, responsable).

Estado del lead: nuevo, contactado, en_negociacion, cerrado_ganado, cerrado_perdido.

Control de duplicados por email.

Historial de interacciones (notas, llamadas, emails, cambios de estado, asignaciones).

2.  Gestión de Usuarios

Registro y login con bcrypt + JWT.

Roles: admin, ejecutivo, marketing.

CRUD de usuarios con control de permisos.

Cambio de roles dinámico.

3. Seguridad

Autenticación con JWT.

Middleware de autorización por rol.

Rate limiting por IP o API Key (express-rate-limit).

Endpoints de ingestión con seguridad por API Key y HMAC.

Integración con Webhooks / Landing Pages

Endpoint /api/ingest → ingestión con API Key (X-API-KEY).

Endpoint /api/ingest/webhook → ingestión con firma HMAC para mayor seguridad.

✅ Frontend (React + Vite + TS)

Panel de leads con tabla filtrable, ordenable y paginada.

Dashboard con gráficas (Recharts) de campañas, funnel y tiempos de respuesta.

Carga de datos CSV con multer.

Formularios dinámicos con react-hook-form.

Notificaciones con react-hot-toast.

Sidebar interactivo y navegación con react-router-dom.

📖 Documentación de la API

La API está documentada con Swagger en:

👉 http://localhost:4000/api-docs

Esquemas definidos

Lead → incluye fuente_detallada, tags, fecha_actualizacion.

Usuario → incluye rol y password (encriptado).

Historial → vincula usuarios y leads.

Autenticación en Swagger
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-KEY
    HmacAuth:
      type: apiKey
      in: header
      name: X-Signature

🛠 Requisitos (local)

Node.js ≥ 20.19.0

npm (o yarn/pnpm)

MySQL/MariaDB

Git

⚡ Instalación rápida
# 1. Clonar repositorio
git clone <tu-repo-url>
cd Proyecto-Lead-CRM-Pipeline

# 2. Backend
cd backend
npm install
cp .env.example .env   # configura DB, JWT_SECRET, API_KEY, etc.
npm run dev            # levanta API en http://localhost:4000

# 3. Frontend
cd ../frontend
npm install
npm run dev            # levanta frontend en http://localhost:5173

🧪 Probar API con curl
# Obtener todos los leads
curl http://localhost:4000/api/leads

# Crear lead
curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pepe","email":"pepe@mail.com","telefono":"123","origen":"web","campaña":"test"}'

📊 Dependencias clave
Backend

express, mysql2, jsonwebtoken, bcryptjs, dotenv

swagger-ui-express, swagger-jsdoc

express-rate-limit (seguridad)

multer, csv-parse (importación de datos)

Frontend

react, react-router-dom, react-hook-form

recharts, react-icons, react-hot-toast

axios (API client)

vite, typescript, eslint

🚀 Próximos pasos

Autenticación con OAuth2 (Google, Microsoft).

Integración con CRM externos (Hubspot, Zoho).

Dashboard con métricas en tiempo real (WebSockets).

Tests automáticos (Jest + Supertest).