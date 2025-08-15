import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './pages/App.tsx'
import AuthForm from './pages/AuthForm.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthForm />
  </StrictMode>,
)
