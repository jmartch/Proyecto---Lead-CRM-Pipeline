import React, { useState, useMemo } from 'react';
import '../../utils/Table.css';

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

interface TableProps {
  leads: Lead[];
  onSelectionChange?: (selectedLeads: Lead[]) => void;
  isLoading?: boolean;
}

interface Filters {
  estado: string;
  campaña: string;
  responsable: string;
  fechaInicio: string;
  fechaFin: string;
  searchTerm: string;
}

const Table: React.FC<TableProps> = ({ leads, onSelectionChange, isLoading = false }) => {
  // Estados para filtros y paginación
  const [filters, setFilters] = useState<Filters>({
    estado: '',
    campaña: '',
    responsable: '',
    fechaInicio: '',
    fechaFin: '',
    searchTerm: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Obtener valores únicos para los filtros
  const uniqueValues = useMemo(() => {
    const estados = [...new Set(leads.map(lead => lead.estado).filter(Boolean))];
    const campañas = [...new Set(leads.map(lead => lead.campaña).filter(Boolean))];
    const responsables = [...new Set(leads.map(lead => lead.responsable).filter(Boolean))];

    return { estados, campañas, responsables };
  }, [leads]);

  // Filtrar y buscar leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Búsqueda general
      const searchMatch = !filters.searchTerm ||
        Object.values(lead).some(value =>
          value?.toString().toLowerCase().includes(filters.searchTerm.toLowerCase())
        );

      // Filtros específicos
      const estadoMatch = !filters.estado || lead.estado === filters.estado;
      const campañaMatch = !filters.campaña || lead.campaña === filters.campaña;
      const responsableMatch = !filters.responsable || lead.responsable === filters.responsable;

      // Filtro de fecha
      let fechaMatch = true;
      if (filters.fechaInicio || filters.fechaFin) {
        const leadDate = lead.fecha ? new Date(lead.fecha) : null;
        if (leadDate) {
          if (filters.fechaInicio) {
            fechaMatch = fechaMatch && leadDate >= new Date(filters.fechaInicio);
          }
          if (filters.fechaFin) {
            fechaMatch = fechaMatch && leadDate <= new Date(filters.fechaFin);
          }
        }
      }

      return searchMatch && estadoMatch && campañaMatch && responsableMatch && fechaMatch;
    });
  }, [leads, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // Resetear página cuando cambian los filtros
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      estado: '',
      campaña: '',
      responsable: '',
      fechaInicio: '',
      fechaFin: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  // Manejo de selección
  const handleSelectLead = (leadId: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);

    // Notificar cambios de selección
    const selectedLeadsData = leads.filter(lead => newSelected.has(lead.id!));
    onSelectionChange?.(selectedLeadsData);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(paginatedLeads.map(lead => lead.id!));
      setSelectedLeads(allIds);
      const selectedLeadsData = leads.filter(lead => allIds.has(lead.id!));
      onSelectionChange?.(selectedLeadsData);
    }
    setSelectAll(!selectAll);
  };

  // Generar páginas para navegación
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="leads-table-container">
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar en todos los campos..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="search-input"
        />
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filters-grid">
          <select
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {uniqueValues.estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>

            ))}
          </select>

          <select
            value={filters.campaña}
            onChange={(e) => handleFilterChange('campaña', e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las campañas</option>
            {uniqueValues.campañas.map(campaña => (
              <option key={campaña} value={campaña}>{campaña}</option>
            ))}
          </select>

          <select
            value={filters.responsable}
            onChange={(e) => handleFilterChange('responsable', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los responsables</option>
            {uniqueValues.responsables.map(responsable => (
              <option key={responsable} value={responsable}>{responsable}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
            className="filter-date"
            placeholder="Fecha inicio"
          />

          <input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
            className="filter-date"
            placeholder="Fecha fin"
          />

          <button onClick={clearFilters} className="clear-filters-btn">
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="results-info">
        <span>
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLeads.length)}
          de {filteredLeads.length} leads
        </span>
        {selectedLeads.size > 0 && (
          <span className="selection-info">
            ({selectedLeads.size} seleccionados)
          </span>
        )}
      </div>

      {/* Configuración de paginación */}
      <div className="pagination-config">
        <label>
          Mostrar:
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="items-per-page-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          por página
        </label>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="leads-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={paginatedLeads.length === 0}
                />
              </th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Origen</th>
              <th>Campaña</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody className="leads-table-body">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="loading-cell">
                  <div className="loading-spinner">Cargando...</div>
                </td>
              </tr>
            ) : paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data-cell">
                  {filteredLeads.length === 0 && filters.searchTerm ?
                    'No se encontraron leads que coincidan con la búsqueda' :
                    'No hay leads registrados'
                  }
                </td>
              </tr>
            ) : (
              paginatedLeads.map(lead => (
                <tr
                  key={lead.id}
                  className={selectedLeads.has(lead.id!) ? 'selected-row' : ''}
                >
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id!)}
                      onChange={() => handleSelectLead(lead.id!)}
                    />
                  </td>
                  <td>{lead.nombre}</td>
                  <td>{lead.email}</td>
                  <td>{lead.telefono}</td>
                  <td>{lead.origen}</td>
                  <td>{lead.campaña}</td>
                  <td>
                    <span className={`status-badge status-${lead.estado?.toLowerCase() || 'sin-estado'}`}>
                      {lead.estado || 'Sin estado'}
                    </span>
                  </td>
                  <td>{lead.responsable || 'Sin asignar'}</td>
                  <td>{lead.fecha ? new Date(lead.fecha).toLocaleDateString('es-ES') : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            «
          </button>

          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ‹
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            ›
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;