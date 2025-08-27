import React, { useState, useMemo } from 'react';
import '../../utils/TableUser.css';

interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol: 'admin' | 'ejecutivo' | 'marketing';
  creado?: string;
}

interface TableUsuariosProps {
  usuarios: Usuario[];
  onSelectionChange?: (selectedUsuarios: Usuario[]) => void;
  isLoading?: boolean;
}

interface Filters {
  searchTerm: string;
}

const TableUsuarios: React.FC<TableUsuariosProps> = ({ usuarios, onSelectionChange, isLoading = false }) => {
  // Estado para búsqueda y paginación
  const [filters, setFilters] = useState<Filters>({ searchTerm: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsuarios, setSelectedUsuarios] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filtrar y buscar usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario =>
      !filters.searchTerm ||
      Object.values(usuario).some(value =>
        value?.toString().toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    );
  }, [usuarios, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsuarios = filteredUsuarios.slice(startIndex, startIndex + itemsPerPage);

  // Cambiar filtro de búsqueda
  const handleFilterChange = (value: string) => {
    setFilters({ searchTerm: value });
    setCurrentPage(1);
  };

  // Selección de usuarios
  const handleSelectUsuario = (usuarioId: number) => {
    const newSelected = new Set(selectedUsuarios);
    if (newSelected.has(usuarioId)) {
      newSelected.delete(usuarioId);
    } else {
      newSelected.add(usuarioId);
    }
    setSelectedUsuarios(newSelected);

    const selectedUsuariosData = usuarios.filter(u => newSelected.has(u.id!));
    onSelectionChange?.(selectedUsuariosData);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsuarios(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(paginatedUsuarios.map(u => u.id!));
      setSelectedUsuarios(allIds);
      const selectedUsuariosData = usuarios.filter(u => allIds.has(u.id!));
      onSelectionChange?.(selectedUsuariosData);
    }
    setSelectAll(!selectAll);
  };

  // Generar páginas
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="usuarios-table-container">
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Información de resultados */}
      <div className="results-info">
        <span>
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsuarios.length)}
          de {filteredUsuarios.length} usuarios
        </span>
        {selectedUsuarios.size > 0 && (
          <span className="selection-info">
            ({selectedUsuarios.size} seleccionados)
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
          </select>
          por página
        </label>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={paginatedUsuarios.length === 0}
                />
              </th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha creación</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="loading-cell">Cargando...</td>
              </tr>
            ) : paginatedUsuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data-cell">
                  {filteredUsuarios.length === 0 && filters.searchTerm
                    ? 'No se encontraron usuarios'
                    : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              paginatedUsuarios.map(usuario => (
                <tr
                  key={usuario.id}
                  className={selectedUsuarios.has(usuario.id!) ? 'selected-row' : ''}
                >
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedUsuarios.has(usuario.id!)}
                      onChange={() => handleSelectUsuario(usuario.id!)}
                    />
                  </td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`role-badge role-${usuario.rol}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>{usuario.creado ? new Date(usuario.creado).toLocaleDateString('es-ES') : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={currentPage === pageNum ? 'active' : ''}
            >
              {pageNum}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
        </div>
      )}
    </div>
  );
};

export default TableUsuarios;
