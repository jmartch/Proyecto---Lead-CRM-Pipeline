import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import './index.css';

// Tipos de datos
interface Lead {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  origen: string;
  campaña: string;
  fecha?: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState<Lead>({
    nombre: '',
    email: '',
    telefono: '',
    origen: '',
    campaña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Validación de email básica
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Cargar leads al iniciar
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/leads')
      .then(r => r.json())
      .then(data => {

        if (Array.isArray(data)) {
          setLeads(data);
        } else if (data && Array.isArray(data.leads)) {
          setLeads(data.leads);
        } else {
          setLeads([]);
        }
      })
      .catch(err => {
        console.error("Error cargando leads:", err);
        setMessage({ type: 'error', text: 'Error cargando leads' });
      });
  }, []);

  // Mostrar mensajes temporales
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Validar datos del formulario
  const validateForm = () => {
    if (!form.nombre.trim()) {
      showMessage('error', 'El nombre es requerido');
      return false;
    }
    if (!form.email.trim()) {
      showMessage('error', 'El email es requerido');
      return false;
    }
    if (!emailRegex.test(form.email)) {
      showMessage('error', 'El formato del email no es válido');
      return false;
    }
    if (form.telefono && !/^\+?[\d\s\-\(\)]+$/.test(form.telefono)) {
      showMessage('error', 'El formato del teléfono no es válido');
      return false;
    }
    return true;
  };


  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.status === 'ok' && data.lead) {
        setLeads(prev => [data.lead, ...prev]);
        setForm({ nombre: '', email: '', telefono: '', origen: '', campaña: '' });
        showMessage('success', '¡Lead agregado exitosamente!');
      } else {
        showMessage('error', data.message || 'Error al agregar lead');
      }
    } catch (error) {
      console.error("Error enviando lead:", error);
      showMessage('error', 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="App">
      <h1 className="titulo-central">Gestor de Leads</h1>

      {/* Formulario */}
      <form onSubmit={submit}>
        <input
          required
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          placeholder="Nombre *"
          disabled={isLoading}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="Email *"
          disabled={isLoading}
        />
        <input
          value={form.telefono}
          onChange={e => setForm({ ...form, telefono: e.target.value })}
          placeholder="Teléfono"
          disabled={isLoading}
          pattern="[\+]?[\d\s\-\(\)]+"
        />
        <input
          value={form.origen}
          onChange={e => setForm({ ...form, origen: e.target.value })}
          placeholder="Origen"
          disabled={isLoading}
        />
        <input
          value={form.campaña}
          onChange={e => setForm({ ...form, campaña: e.target.value })}
          placeholder="Campaña"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Agregar Lead'}
        </button>
      </form>

      {/* Mensajes */}
      {message && (
        <div className={`text-center ${message.type === 'success' ? 'mensaje-exito' : 'mensaje-error'}`}>
          {message.text}
        </div>
      )}

      {/* Tabla de leads */}
      <table className="leads-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Origen</th>
            <th>Campaña</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody className="leads-table-body">
          {leads.map(l => (
            <tr key={l.id}>
              <td>{l.nombre}</td>
              <td>{l.email}</td>
              <td>{l.telefono}</td>
              <td>{l.origen}</td>
              <td>{l.campaña}</td>
              <td>{l.fecha ? new Date(l.fecha).toLocaleDateString('es-ES') : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mensaje si no hay datos */}
      {leads.length === 0 && (
        <div className="text-center">
          No hay leads registrados
        </div>
      )}

      {/* Animaciones */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
