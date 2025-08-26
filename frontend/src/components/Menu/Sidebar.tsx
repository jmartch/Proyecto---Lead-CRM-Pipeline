import React from 'react'
import { Link } from 'react-router-dom'
import '../../utils/Sidebar.css'
import Button from '../buttons/Button';
import { useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from 'react-icons/fa'
import { BsLayoutSidebar } from 'react-icons/bs';
import { useEffect, useState } from 'react';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    theme: string; // "light" | "dark"
    toggleTheme: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={onClose}>< BsLayoutSidebar size={20} /></button>
            <nav>
                <ul>
                    <li><Link to="/inicio" onClick={onClose}>Inicio</Link></li>
                    <li><Link to="/usuarios" onClick={onClose}>Usuarios</Link></li>
                    <li><Link to="/gestor" onClick={onClose}>Gestor Leads</Link></li>
                    <li><Link to="/dashboard" onClick={onClose}>Dashboard</Link></li>

                </ul>
            </nav>
            {/* Botón de cambio de tema */}
            <div className="theme-toggle"
                onClick={toggleTheme}
                style={{ cursor: "pointer", position: "absolute", top: "30px", right: "50px" }}>
                {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
            </div>

            {/* Botón cerrar sesión */}
            <div style={{ position: "absolute", bottom: "70px", left: "90px" }}>
                <Button onClick={() => navigate('/')} disabled={isLoading}>
                    Cerrar Sesión
                </Button>
            </div>
        </div>

    )
}

export default Sidebar