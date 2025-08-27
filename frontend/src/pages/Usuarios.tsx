import { useEffect, useState } from 'react';
import '../global.css';
import '../utils/Gestor.css';
import TableUsuarios from '../components/Table/TableUsuarios';

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState<Usuario>({
    nombre: '',
    email: '',
    password: '',
    rol: 'ejecutivo',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Llama al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'No hay sesión. Inicia sesión.' });
      return;
    }
    reloadUsuarios();
  }, []);

  // Crear una función helper para peticiones autenticadas
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

const reloadUsuarios = async () => {
  setIsLoading(true);
  try {
    const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/users`);
    if (!response.ok) {
      if (response.status === 401) {
        setMessage({ type: 'error', text: 'Sesión expirada o no autorizada' });
        // opcional: redirigir al login
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setUsuarios(Array.isArray(data) ? data : data.usuarios || []);
  } catch (err) {
    setMessage({ type: 'error', text: 'Error cargando usuarios' });
    console.error('Error:', err);
  } finally {
    setIsLoading(false);
  }
};

  // Mensajes
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Crear usuario
const handleCreateUser = async () => {
  if (!newUser.nombre || !newUser.email || !newUser.password) {
    showMessage('error', 'Todos los campos son requeridos');
    return;
  }
  setIsProcessing(true);
  try {
    const res = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      showMessage('success', 'Usuario creado');
      await reloadUsuarios();
      setShowCreateModal(false);
      setNewUser({ nombre: '', email: '', password: '', rol: 'ejecutivo' });
    } else {
      const data = await res.json();
      showMessage('error', data.message || 'Error al crear usuario');
    }
  } catch {
    showMessage('error', 'Error de conexión');
  } finally {
    setIsProcessing(false);
  }
};

  // Agrega esto temporalmente en tu componente Usuarios
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token disponible:', token ? 'SÍ' : 'NO');
    console.log('Token:', token); // Solo para debug, quítalo después
  }, []);

  return (
    <div className="Gestor">
      <h1 className="titulo-central">Gestión de Usuarios</h1>

      {/* Mensajes */}
      {message && (
        <div className={`text-center ${message.type === 'success' ? 'mensaje-exito' : 'mensaje-error'}`}>
          {message.text}
        </div>
      )}

      {/* Botón crear */}
      <div className="create-user-section">
        <button onClick={() => setShowCreateModal(true)} className="create-user-btn">
          + Crear Usuario
        </button>
      </div>

      {/* Tabla */}
      <TableUsuarios
        usuarios={usuarios}
        onSelectionChange={setSelectedUsuarios}
        isLoading={isLoading}
      />

      {/* Modal Crear Usuario */}
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
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="modal-input"
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="modal-input"
                />
              </label>
              <label>
                Contraseña:
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="modal-input"
                />
              </label>
              <label>
                Rol:
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as Usuario['rol'] })}
                  className="modal-select"
                >
                  <option value="ejecutivo">Ejecutivo</option>
                  <option value="marketing">Marketing</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowCreateModal(false)} className="modal-btn cancel-btn">
                Cancelar
              </button>
              <button onClick={handleCreateUser} className="modal-btn confirm-btn" disabled={isProcessing}>
                {isProcessing ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
