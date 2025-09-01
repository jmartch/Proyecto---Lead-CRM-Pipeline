import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import '../utils/Gestor.css'

// Tipos de datos
interface Lead {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  origen: string;
  campaña: string;
  fecha?: string;
  responsable?: string;
  estado?: string;
}

interface LeadFormProps {
  onLeadAdded: (lead: Lead) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export default function Inicio({ onLeadAdded, onMessage }: LeadFormProps) {
  const [form, setForm] = useState<Lead>({
    nombre: '',
    email: '',
    telefono: '',
    origen: '',
    campaña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Validación de email básica
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Función para verificar si el email ya existe
  const emailExists = (email: string): boolean => {
    return leads.some(lead => lead.email.toLowerCase() === email.toLowerCase());
  };

  // Función para cargar leads desde el servidor
  const loadLeads = async () => {
    setIsLoadingTable(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/leads', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setLeads(data);
      } else if (data && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Error cargando leads:", error);
      onMessage('error', 'Error cargando la lista de leads');
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Cargar leads al montar el componente
  useEffect(() => {
    loadLeads();
  }, []);

  // Validar datos del formulario
  const validateForm = () => {
    if (!form.nombre.trim()) {
      onMessage('error', 'El nombre es requerido');
      return false;
    }
    if (!form.email.trim()) {
      onMessage('error', 'El email es requerido');
      return false;
    }
    if (!emailRegex.test(form.email)) {
      onMessage('error', 'El formato del email no es válido');
      return false;
    }
    
    // Verificar si el email ya existe
    if (emailExists(form.email)) {
      onMessage('error', 'Ya existe un lead con este email. No se permiten emails duplicados.');
      return false;
    }
    
    if (form.telefono && !/^\+?[\d\s\-\(\)]+$/.test(form.telefono)) {
      onMessage('error', 'El formato del teléfono no es válido');
      return false;
    }
    return true;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.status === 'ok' && data.lead) {
        // Actualizar la lista local agregando el nuevo lead al principio
        setLeads(prev => [data.lead, ...prev]);
        onLeadAdded(data.lead);
        setForm({ nombre: '', email: '', telefono: '', origen: '', campaña: '' });
        onMessage('success', '¡Lead agregado exitosamente!');
      } else {
        // Si el servidor devuelve error por email duplicado
        if (data.message && data.message.includes('email')) {
          onMessage('error', 'Este email ya está registrado en el sistema');
        } else {
          onMessage('error', data.message || 'Error al agregar lead');
        }
      }
    } catch (error) {
      console.error("Error enviando lead:", error);
      onMessage('error', 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  }

  // Función para eliminar un lead
  const handleDelete = async (leadId: number) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este lead?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
        onMessage('success', 'Lead eliminado correctamente');
      } else {
        onMessage('error', 'Error al eliminar el lead');
      }
    } catch (error) {
      console.error("Error eliminando lead:", error);
      onMessage('error', 'Error de conexión al eliminar el lead');
    }
  };

  // Función para obtener clase CSS del estado
  const getEstadoClass = (estado?: string) => {
    switch (estado) {
      case 'nuevo': return 'estado-nuevo';
      case 'contactado': return 'estado-contactado';
      case 'en_negociacion': return 'estado-negociacion';
      case 'cerrado_ganado': return 'estado-ganado';
      case 'cerrado_perdido': return 'estado-perdido';
      default: return 'estado-default';
    }
  };

  // Función para resaltar leads duplicados (opcional, para visualización)
  const getDuplicateEmailClass = (email: string, currentId?: number) => {
    const duplicates = leads.filter(lead => 
      lead.email.toLowerCase() === email.toLowerCase() && lead.id !== currentId
    );
    return duplicates.length > 0 ? 'email-duplicate' : '';
  };

  return (
    <div className="lead-form-container">
      <h1 className="titulo-central">Agregar Nuevo Lead</h1>

      {/* Formulario */}
      <form onSubmit={submit} className="lead-form">
        <div className="form-row">
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
            className={emailExists(form.email) ? 'input-error' : ''}
          />
        </div>
        <div className="form-row">
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
        </div>
        <div className="form-row">
          <input
            value={form.campaña}
            onChange={e => setForm({ ...form, campaña: e.target.value })}
            placeholder="Campaña"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Enviando...' : 'Agregar Lead'}
          </button>
        </div>
      </form>

      {/* Mensaje de advertencia si hay email duplicado */}
      {form.email && emailExists(form.email) && (
        <div className="warning-message">
          ⚠️ Este email ya está registrado en el sistema
        </div>
      )}

      {/* Tabla de leads */}
      <div className="leads-table-container">
        <h2 className="table-title">Leads Registrados ({leads.length})</h2>

        {isLoadingTable ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="no-data">
            <p>No hay leads registrados aún.</p>
            <p>Agrega tu primer lead usando el formulario de arriba.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Origen</th>
                  <th>Campaña</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Borrar</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="table-row">
                    <td className="nombre-cell">{lead.nombre}</td>
                    <td className={`email-cell ${getDuplicateEmailClass(lead.email, lead.id)}`}>
                      {lead.email}
                    </td>
                    <td className="telefono-cell">{lead.telefono || '-'}</td>
                    <td className="origen-cell">{lead.origen || '-'}</td>
                    <td className="campaña-cell">{lead.campaña || '-'}</td>
                    <td className="estado-cell">
                      <span className={`estado-badge ${getEstadoClass(lead.estado)}`}>
                        {lead.estado || 'nuevo'}
                      </span>
                    </td>
                    <td className="responsable-cell">{lead.responsable || '-'}</td>
                    <td className="acciones-cell">
                      <button
                        onClick={() => lead.id && handleDelete(lead.id)}
                        className="delete-btn"
                        title="Eliminar lead"
                      >
                        < AiOutlineDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}