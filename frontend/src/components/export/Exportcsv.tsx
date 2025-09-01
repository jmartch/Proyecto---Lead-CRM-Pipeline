import React, { useState } from 'react'
import Button from '../buttons/Button'

interface ExportcsvProps {
  onExportStart?: () => void;
  onExportSuccess?: (message: string) => void;
  onExportError?: (error: string) => void;
  filters?: {
    estado?: string;
    origen?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    responsable?: string;
    ciudad?: string;
    fuente_detallada?: string;
  };
  className?: string;
  buttonText?: string;
}

const Exportcsv: React.FC<ExportcsvProps> = ({
  onExportStart,
  onExportSuccess,
  onExportError,
  filters = {},
  buttonText = 'Exportar CSV'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Función para exportar leads
  const exportLeads = async () => {
    try {
      setIsLoading(true);
      
      // Callback de inicio si se proporciona
      if (onExportStart) {
        onExportStart();
      }

      // Construir URL con filtros
      const queryParams = new URLSearchParams();
      
      // Agregar filtros activos a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `${import.meta.env.VITE_API_URL}/api/leads/exportcsv${queryString ? `?${queryString}` : ''}`;
      
      console.log('Iniciando exportación desde:', url);

      // Realizar la petición
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        // Intentar obtener el error del JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la exportación');
        } catch {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'leads_export.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convertir la respuesta a blob
      const blob = await response.blob();
      
      // Crear URL temporal para descarga
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Crear elemento <a> temporal para trigger la descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('Exportación completada:', filename);

      // Callback de éxito
      const successMessage = `Archivo exportado exitosamente: ${filename}`;
      if (onExportSuccess) {
        onExportSuccess(successMessage);
      } else {
        alert(successMessage);
      }

    } catch (error) {
      console.error('Error al exportar leads:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la exportación';
      
      // Callback de error
      if (onExportError) {
        onExportError(errorMessage);
      } else {
        alert('Error al exportar el archivo: ' + errorMessage);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div >
      <Button 
        onClick={exportLeads} 
        disabled={isLoading}
      >
        {isLoading ? 'Exportando...' : buttonText}
      </Button>
    </div>
  );
};

export default Exportcsv;