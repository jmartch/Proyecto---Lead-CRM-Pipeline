import { useEffect, useState } from 'react';
import '../global.css';
import '../utils/Gestor.css';
import Importcsv from '../components/inputs/Importcsv';
import Exportcsv from '../components/export/Exportcsv';
import Table from '../components/Table/Table';

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

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function Gestor() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);

  const [isLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);



  // Función para recargar leads
  const reloadLeads = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/leads', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log("Datos recibidos:", data);

      if (Array.isArray(data)) {
        setLeads(data);
      } else if (data && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Error cargando leads:", err);
      setMessage({ type: 'error', text: 'Error cargando leads' });
    }
  };

  // Cargar leads al iniciar
  useEffect(() => {
    reloadLeads();
  }, []);

  // Mostrar mensajes temporales
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSelectionChange = (selectedLeadsData: Lead[]) => {
    setSelectedLeads(selectedLeadsData);
  };

  // Estados adicionales para modals y bulk actions
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignResponsable, setAssignResponsable] = useState('');
  const [bulkEditData, setBulkEditData] = useState({ estado: '', responsable: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Función para eliminar leads en lote
  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      showMessage('error', 'Selecciona al menos un lead');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''}?`
    );

    if (!confirmDelete) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const lead of selectedLeads) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${lead.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error eliminando lead ${lead.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showMessage('success', `${successCount} lead${successCount > 1 ? 's' : ''} eliminado${successCount > 1 ? 's' : ''} correctamente`);
        reloadLeads();
        setSelectedLeads([]);
      }

      if (errorCount > 0) {
        showMessage('error', `Error eliminando ${errorCount} lead${errorCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error en eliminación masiva:', error);
      showMessage('error', 'Error durante la eliminación masiva');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para asignar responsable en lote
  // Asignar responsable en lote (usa assignResponsable y el endpoint correcto)
const handleBulkAssign = async () => {
  const nombre = assignResponsable.trim();
  if (!nombre) {
    showMessage('error', 'Ingresa el nombre del responsable');
    return;
  }
  if (nombre.length < 2 || nombre.length > 100) {
    showMessage('error', 'El responsable debe tener entre 2 y 100 caracteres');
    return;
  }

  setIsProcessing(true);
  let successCount = 0, errorCount = 0;

  try {
    for (const lead of selectedLeads) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${lead.id}/responsable`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responsable: nombre })
        });
        if (res.ok) successCount++; else errorCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      showMessage('success', `Responsable asignado a ${successCount} lead${successCount > 1 ? 's' : ''}`);
      reloadLeads();
      setSelectedLeads([]);
      setShowAssignModal(false);
      setAssignResponsable('');
    }
    if (errorCount > 0) {
      showMessage('error', `Error asignando responsable a ${errorCount} lead${errorCount > 1 ? 's' : ''}`);
    }
  } finally {
    setIsProcessing(false);
  }
};


  // Función para editar leads en lote
  const handleBulkEdit = async () => {
    if (!bulkEditData.estado && !bulkEditData.responsable) {
      showMessage('error', 'Selecciona al menos un campo para editar');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const lead of selectedLeads) {
        try {
          const updateData: any = {};
          if (bulkEditData.estado) updateData.estado = bulkEditData.estado;
          if (bulkEditData.responsable) updateData.responsable = bulkEditData.responsable;

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${lead.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error editando lead ${lead.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showMessage('success', `${successCount} lead${successCount > 1 ? 's' : ''} editado${successCount > 1 ? 's' : ''} correctamente`);
        reloadLeads();
        setSelectedLeads([]);
        setShowEditModal(false);
        setBulkEditData({ estado: '', responsable: '' });
      }

      if (errorCount > 0) {
        showMessage('error', `Error editando ${errorCount} lead${errorCount > 1 ? 's' : ''}`);
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
    if (selectedLeads.length === 0) {
      showMessage('error', 'Selecciona al menos un lead');
      return;
    }

    switch (action) {
      case 'delete':
        handleBulkDelete();
        break;
      case 'assign':
        setShowAssignModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      default:
        break;
    }
  };


  return (
    <div className="Gestor">
      <h1 className="titulo-central">Gestor de Leads</h1>
      {/* Mensajes */}
      {message && (
        <div className={`text-center ${message.type === 'success' ? 'mensaje-exito' : 'mensaje-error'}`}>
          {message.text}
        </div>
      )}

      {selectedLeads.length > 0 && (
        <div className="bulk-actions">
          <span className="bulk-actions-text">
            {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} seleccionado{selectedLeads.length > 1 ? 's' : ''}:
          </span>
          <button
            onClick={() => handleBulkAction('assign')}
            className="bulk-action-btn assign-btn"
            disabled={isLoading || isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Asignar Responsable'}
          </button>
          <button
            onClick={() => handleBulkAction('edit')}
            className="bulk-action-btn edit-btn"
            disabled={isLoading || isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Editar Lote'}
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
      {/* Componente de tabla con todas las funcionalidades */}
      <Table
        leads={leads}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
      />
      {/* Modal para asignar responsable */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Asignar Responsable</h3>
            <p>Asignar responsable a {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''}:</p>
            <input
              type="text"
              value={assignResponsable}
              onChange={(e) => setAssignResponsable(e.target.value)}
              placeholder="Nombre del responsable"
              className="modal-input"
              disabled={isProcessing}
            />
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignResponsable('');
                }}
                className="modal-btn cancel-btn"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkAssign}
                className="modal-btn confirm-btn"
                disabled={isProcessing || !assignResponsable.trim()}
              >
                {isProcessing ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar en lote */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Leads en Lote</h3>
            <p>Editar {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''}:</p>

            <div className="modal-form">
              <label>
                Estado:
                <select
                  value={bulkEditData.estado}
                  onChange={(e) => setBulkEditData(prev => ({ ...prev, estado: e.target.value }))}
                  className="modal-select"
                  disabled={isProcessing}
                >
                  <option value="">Sin cambios</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="en_negociacion">En Negociación</option>
                  <option value="cerrado_ganado">Cerrado Ganado</option>
                  <option value="cerrado_perdido">Cerrado Perdido</option>
                </select>
              </label>

              <label>
                Responsable:
                <input
                  type="text"
                  value={bulkEditData.responsable}
                  onChange={(e) => setBulkEditData(prev => ({ ...prev, responsable: e.target.value }))}
                  placeholder="Nombre del responsable"
                  className="modal-input"
                  disabled={isProcessing}
                />
              </label>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setBulkEditData({ estado: '', responsable: '' });
                }}
                className="modal-btn cancel-btn"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkEdit}
                className="modal-btn confirm-btn"
                disabled={isProcessing || (!bulkEditData.estado && !bulkEditData.responsable)}
              >
                {isProcessing ? 'Editando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mensaje si no hay datos */}
      {leads.length === 0 && (
        <div className="text-center">
          No hay leads registrados
        </div>
      )}

      {/* Boton importación CSV */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', gap: '20px', marginTop: '20px' }}>
        <Importcsv
          onImportSuccess={(data) => {
            showMessage('success', `Importación completada: ${data.insertados} registros insertados`);
            // Recargar la lista de leads después de importar
            reloadLeads();
          }}
          onImportError={(error) => {
            console.error("Error al importar:", error);
            showMessage('error', "Error al importar: " + error);
          }}
        />
        <Exportcsv />

      </div>
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
