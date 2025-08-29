import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Menu/Sidebar";
import Login from "../pages/AuthForm";
import Gestor from "../pages/Gestor";
import Inicio from "../pages/Inicio";
import Usuarios from "../pages/Usuarios";
import Dashboard from "../pages/Dashboard";
import { BsLayoutSidebar } from 'react-icons/bs';
import '../global.css'

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  // aplicar el tema al body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // ocultar sidebar en login
  const hideSidebar = location.pathname === "/";

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
{!hideSidebar && (
  <>
    {/* Botón para abrir sidebar (solo cuando está cerrado) */}
    {!isSidebarOpen && (
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`btn-close-app ${theme}`}
      >
        <BsLayoutSidebar size={20} />
      </button>
    )}

    {/* Sidebar */}
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  </>
)}



      {/* Contenido principal que se ajusta cuando el sidebar está abierto */}
      <main
        style={{
          flex: 1,
          marginLeft: !hideSidebar && isSidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s ease',
          paddingTop: !hideSidebar ? '60px' : '0',
          minHeight: '100vh'
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/gestor" element={<Gestor />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/inicio"
            element={
              <Inicio
                onLeadAdded={() => { }}
                onMessage={() => { }}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}