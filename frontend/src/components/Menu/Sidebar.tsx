import React from 'react'
import { Link } from 'react-router-dom' // Corregido: era 'rmeact-router-dom'
import '../../utils/Sidebar.css'
import Button from '../buttons/Button';
import { useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from 'react-icons/fa'
import { BsLayoutSidebar } from 'react-icons/bs';
import {useState } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    theme: string; // "light" | "dark"
    toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [isLoading] = useState(false);

    return (
        <div className={`sidebar ${isOpen ? "open" : ""} ${theme}`}>
            {/* Botón para cerrar sidebar */}
            <button className="close-btn" onClick={onClose}>
                <BsLayoutSidebar size={20} />
            </button>

            {/* Botón de cambio de tema */}
            <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === "light" ? (
                    <>
                        <FaMoon size={18} />
                        <span>Modo Oscuro</span>
                    </>
                ) : (
                    <>
                        <FaSun size={18} />
                        <span>Modo Claro</span>
                    </>
                )}
            </button>

            {/* Navegación */}
            <nav className="sidebar-nav">
                <ul>
                    <li><Link to="/inicio" onClick={onClose}>Inicio</Link></li>
                    <li><Link to="/usuarios" onClick={onClose}>Usuarios</Link></li>
                    <li><Link to="/gestor" onClick={onClose}>Gestor Leads</Link></li>
                    <li><Link to="/dashboard" onClick={onClose}>Dashboard</Link></li>
                </ul>
            </nav>

            {/* Botón cerrar sesión */}
            <div className="logout-container">
                <Button onClick={() => navigate('/')} disabled={isLoading}>
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}

export default Sidebar