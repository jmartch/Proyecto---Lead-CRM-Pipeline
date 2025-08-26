import { useEffect, useState } from 'react';
import '../global.css';
import '../utils/Gestor.css';
import Table from '../components/Table/Table';

// Tipos de datos
interface Usuario {
    id?: number;
    nombre: string;
    email: string;
    password?: string;
    rol: 'admin' | 'ejecutivo' | 'marketing';
    creado?: string;
}

interface Message {
    type: 'success' | 'error';
    text: string;
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [selectedUsuarios, setSelectedUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    // Estados para modals y bulk actions
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({ rol: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    // Estado para crear nuevo usuario
    const [newUser, setNewUser] = useState<Usuario>({
        nombre: '',
        email: '',
        password: '',
        rol: 'ejecutivo'
    });

    // Función para recargar usuarios
    const reloadUsuarios = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/api/usuarios', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log("Datos recibidos:", data);

            if (Array.isArray(data)) {
                setUsuarios(data);
            } else if (data && Array.isArray(data.usuarios)) {
                setUsuarios(data.usuarios);
            } else {
                setUsuarios([]);
            }
        } catch (err) {
            console.error("Error cargando usuarios:", err);
            setMessage({ type: 'error', text: 'Error cargando usuarios' });
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar usuarios al iniciar
    useEffect(() => {
        reloadUsuarios();
    }, []);

    // Mostrar mensajes temporales
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleSelectionChange = (selectedUsuariosData: Usuario[]) => {
        setSelectedUsuarios(selectedUsuariosData);
    };

    // Función para crear nuevo usuario
    const handleCreateUser = async () => {
        if (!newUser.nombre.trim() || !newUser.email.trim() || !newUser.password?.trim()) {
            showMessage('error', 'Todos los campos son requeridos');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
            showMessage('error', 'El formato del email no es válido');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('success', 'Usuario creado exitosamente');
                reloadUsuarios();
                setShowCreateModal(false);
                setNewUser({ nombre: '', email: '', password: '', rol: 'ejecutivo' });
            } else {
                showMessage('error', data.message || 'Error al crear usuario');
            }
        } catch (error) {
            console.error('Error creando usuario:', error);
            showMessage('error', 'Error de conexión al crear usuario');
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para eliminar usuarios en lote
    const handleBulkDelete = async () => {
        if (selectedUsuarios.length === 0) {
            showMessage('error', 'Selecciona al menos un usuario');
            return;
        }

        const confirmDelete = window.confirm(
            `¿Estás seguro de que quieres eliminar ${selectedUsuarios.length} usuario${selectedUsuarios.length > 1 ? 's' : ''}?`
        );

        if (!confirmDelete) return;

        setIsProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const usuario of selectedUsuarios) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${usuario.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`Error eliminando usuario ${usuario.id}:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                showMessage('success', `${successCount} usuario${successCount > 1 ? 's' : ''} eliminado${successCount > 1 ? 's' : ''} correctamente`);
                reloadUsuarios();
                setSelectedUsuarios([]);
            }

            if (errorCount > 0) {
                showMessage('error', `Error eliminando ${errorCount} usuario${errorCount > 1 ? 's' : ''}`);
            }
        } catch (error) {
            console.error('Error en eliminación masiva:', error);
            showMessage('error', 'Error durante la eliminación masiva');
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para editar rol de usuarios en lote
    const handleBulkEdit = async () => {
        if (!bulkEditData.rol) {
            showMessage('error', 'Selecciona un rol para asignar');
            return;
        }

        setIsProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const usuario of selectedUsuarios) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${usuario.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rol: bulkEditData.rol })
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`Error editando usuario ${usuario.id}:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                showMessage('success', `${successCount} usuario${successCount > 1 ? 's' : ''} editado${successCount > 1 ? 's' : ''} correctamente`);
                reloadUsuarios();
                setSelectedUsuarios([]);
                setShowEditModal(false);
                setBulkEditData({ rol: '' });
            }

            if (errorCount > 0) {
                showMessage('error', `Error editando ${errorCount} usuario${errorCount > 1 ? 's' : ''}`);
            }
        } catch (error) {
            console.error('Error en edición masiva:', error);
            showMessage('error', 'Error durante la edición masiva');
        } finally {
            setIsProcessing(false);
        }
    };

    // Función para realizar acciones en lote
    const handleBulkAction = (action: string) => {
        if (selectedUsuarios.length === 0) {
            showMessage('error', 'Selecciona al menos un usuario');
            return;
        }

        switch (action) {
            case 'delete':
                handleBulkDelete();
                break;
            case 'edit':
                setShowEditModal(true);
                break;
            case 'create':
                setShowCreateModal(true);
                break;
            default:
                break;
        }
    };

    // Función para formatear fecha
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Función para obtener clase CSS del rol
    const getRolClass = (rol: string) => {
        switch (rol) {
            case 'admin': return 'rol-admin';
            case 'ejecutivo': return 'rol-ejecutivo';
            case 'marketing': return 'rol-marketing';
            default: return 'rol-default';
        }
    };

    // Adaptamos los datos para que funcionen con el componente Table existente
    const adaptedUsuarios = usuarios.map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: '', // No aplica para usuarios
        origen: usuario.rol, // Usamos origen para mostrar el rol
        campaña: formatDate(usuario.creado), // Usamos campaña para mostrar la fecha
        fecha: usuario.creado,
        responsable: '', // No aplica para usuarios
        estado: usuario.rol // Usamos estado para el rol
    }));

    return (
        <div className="Gestor">
            <h1 className="titulo-central">Gestión de Usuarios</h1>
            
            {/* Mensajes */}
            {message && (
                <div className={`text-center ${message.type === 'success' ? 'mensaje-exito' : 'mensaje-error'}`}>
                    {message.text}
                </div>
            )}

            {/* Botón para crear usuario */}
            <div className="create-user-section">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="create-user-btn"
                    disabled={isProcessing}
                >
                    + Crear Usuario
                </button>
            </div>

            {/* Acciones masivas */}
            {selectedUsuarios.length > 0 && (
                <div className="bulk-actions">
                    <span className="bulk-actions-text">
                        {selectedUsuarios.length} usuario{selectedUsuarios.length > 1 ? 's' : ''} seleccionado{selectedUsuarios.length > 1 ? 's' : ''}:
                    </span>
                    <button
                        onClick={() => handleBulkAction('edit')}
                        className="bulk-action-btn edit-btn"
                        disabled={isLoading || isProcessing}
                    >
                        {isProcessing ? 'Procesando...' : 'Cambiar Rol'}
                    </button>
                    <button
                        onClick={() => handleBulkAction('delete')}
                        className="bulk-action-btn delete-btn"
                        disabled={isLoading || isProcessing}
                    >
                        {isProcessing ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            )}

            {/* Tabla de usuarios personalizada */}
            <div className="usuarios-table-container">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando usuarios...</p>
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="no-data">
                        <p>No hay usuarios registrados</p>
                        <button onClick={() => setShowCreateModal(true)} className="create-first-user-btn">
                            Crear primer usuario
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="usuarios-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsuarios(usuarios);
                                                } else {
                                                    setSelectedUsuarios([]);
                                                }
                                            }}
                                            checked={selectedUsuarios.length === usuarios.length && usuarios.length > 0}
                                        />
                                    </th>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Fecha Creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id} className="table-row">
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsuarios.some(u => u.id === usuario.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsuarios(prev => [...prev, usuario]);
                                                    } else {
                                                        setSelectedUsuarios(prev => prev.filter(u => u.id !== usuario.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="id-cell">{usuario.id}</td>
                                        <td className="nombre-cell">{usuario.nombre}</td>
                                        <td className="email-cell">{usuario.email}</td>
                                        <td className="rol-cell">
                                            <span className={`rol-badge ${getRolClass(usuario.rol)}`}>
                                                {usuario.rol}
                                            </span>
                                        </td>
                                        <td className="fecha-cell">{formatDate(usuario.creado)}</td>
                                        <td className="acciones-cell">
                                            <button 
                                                onClick={() => {
                                                    if (usuario.id) {
                                                        const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
                                                        if (confirmDelete) {
                                                            fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${usuario.id}`, {
                                                                method: 'DELETE'
                                                            }).then(() => {
                                                                showMessage('success', 'Usuario eliminado correctamente');
                                                                reloadUsuarios();
                                                            }).catch(() => {
                                                                showMessage('error', 'Error al eliminar usuario');
                                                            });
                                                        }
                                                    }
                                                }}
                                                className="delete-btn"
                                                title="Eliminar usuario"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para crear usuario */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Crear Nuevo Usuario</h3>
                        
                        <div className="modal-form">
                            <label>
                                Nombre:
                                <input
                                    type="text"
                                    value={newUser.nombre}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))}
                                    placeholder="Nombre completo"
                                    className="modal-input"
                                    disabled={isProcessing}
                                />
                            </label>

                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="correo@ejemplo.com"
                                    className="modal-input"
                                    disabled={isProcessing}
                                />
                            </label>

                            <label>
                                Contraseña:
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Contraseña"
                                    className="modal-input"
                                    disabled={isProcessing}
                                />
                            </label>

                            <label>
                                Rol:
                                <select
                                    value={newUser.rol}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, rol: e.target.value as 'admin' | 'ejecutivo' | 'marketing' }))}
                                    className="modal-select"
                                    disabled={isProcessing}
                                >
                                    <option value="ejecutivo">Ejecutivo</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewUser({ nombre: '', email: '', password: '', rol: 'ejecutivo' });
                                }}
                                className="modal-btn cancel-btn"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateUser}
                                className="modal-btn confirm-btn"
                                disabled={isProcessing || !newUser.nombre.trim() || !newUser.email.trim() || !newUser.password?.trim()}
                            >
                                {isProcessing ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar rol en lote */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cambiar Rol de Usuarios</h3>
                        <p>Cambiar rol de {selectedUsuarios.length} usuario{selectedUsuarios.length > 1 ? 's' : ''}:</p>

                        <div className="modal-form">
                            <label>
                                Nuevo Rol:
                                <select
                                    value={bulkEditData.rol}
                                    onChange={(e) => setBulkEditData(prev => ({ ...prev, rol: e.target.value }))}
                                    className="modal-select"
                                    disabled={isProcessing}
                                >
                                    <option value="">Seleccionar rol</option>
                                    <option value="ejecutivo">Ejecutivo</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setBulkEditData({ rol: '' });
                                }}
                                className="modal-btn cancel-btn"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkEdit}
                                className="modal-btn confirm-btn"
                                disabled={isProcessing || !bulkEditData.rol}
                            >
                                {isProcessing ? 'Actualizando...' : 'Actualizar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}