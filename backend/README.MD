
# Backend — Proyecto-Lead-CRM-Pipeline

API en Node.js + Express que persiste leads en MySQL.

---

## 🚀 Tecnologías
- Node.js (recomendado ≥ 20.19.0)
- Express
- nodemon (dev)
- dotenv
- MySQL

---

## 📦 Instalar dependencias

Desde la carpeta `backend`:

```powershell
cd backend
npm install
npm run dev

crea un archivo .env en backend/ con esto (ejemplo):

PORT=4000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=lead_crm
DB_PORT=3306