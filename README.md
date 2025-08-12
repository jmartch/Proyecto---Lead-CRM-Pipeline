# 🚀 Proyecto-Lead-CRM-Pipeline

**Lead CRM & Pipeline** es una herramienta web para que equipos comerciales gestionen el ciclo completo de sus *leads*: captura, clasificación, seguimiento y cierre de ventas.

---

## 🧩 Estructura del repositorio

/Proyecto-Lead-CRM-Pipeline
├─ backend/ # API (Node.js + Express + MySQL)
├─ frontend/ # Client (Vite + React + TypeScript)
└─ README.md # (este archivo)


---

## ✨ Características principales

- Captura de leads (nombre, email, teléfono, origen, campaña).
- Almacenamiento en MySQL con control de duplicados por email.
- API REST simple: `GET /api/leads` y `POST /api/leads`.
- Frontend con Vite y hot-reload (HMR) para desarrollo rápido.

---

## 🛠 Requisitos (local)

- Node.js (recomendado ≥ **20.19.0** — ver nota sobre `vite`).
- npm (incluido con Node) o yarn.
- MySQL (o MariaDB) corriendo localmente.
- Git

> Si usas Windows, recomendamos PowerShell o Windows Terminal. Si tu Node es una versión anterior, usa `nvm` / Volta / instalador oficial para actualizar.

---
  
   git clone <tu-repo-url>
   cd Proyecto-Lead-CRM-Pipeline

Prueba Rapidas(Curl)
curl http://localhost:4000/api/leads

curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pepe","email":"pepe@mail.com","telefono":"123","origen":"web","campaña":"test"}'


