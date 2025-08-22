import React, { useState, useRef } from 'react'
import Button from '../buttons/Button'

interface importcsvProps {
    onImportSuccess: (data: any) => void;
    onImportError?: (error: string) => void;

}
const Importcsv: React.FC<importcsvProps> = ({onImportSuccess,onImportError}) => {
const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para importar leads
  const importLeads = async (file: File) => {
    try {
      setIsLoading(true);

      // Validar que sea un archivo CSV
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('El archivo debe ser de tipo CSV');
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);

      // Realizar la petición al endpoint de importación
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/leads/importcsv', {
        method: 'POST',
        body: formData
      });

      // Verificar si la respuesta es exitosa
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error en la importación');
      }

      const data = await res.json();
      
      console.log('Importación exitosa:', data);
      
      // Callback de éxito si se proporciona
      if (onImportSuccess) {
        onImportSuccess(data);
      } else {
        // Mensaje por defecto
        alert(`Archivo procesado exitosamente:
        - Registros insertados: ${data.insertados}
        - Registros rechazados: ${data.rechazados}`);
      }
      
      // Si hay registros inválidos, mostrar detalles
      if (data.invalid && data.invalid.length > 0) {
        console.log('Registros inválidos:', data.invalid);
      }

      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return data;

    } catch (error) {
      console.error('Error al importar leads:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Callback de error si se proporciona
      if (onImportError) {
        onImportError(errorMessage);
      } else {
        // Mensaje por defecto
        alert('Error al importar el archivo: ' + errorMessage);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importLeads(file);
    }
  };

  // Activar el selector de archivos
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Botón personalizado */}
      <Button onClick={triggerFileInput} disabled={isLoading}>
        {isLoading ? 'Importando...' : 'Importar Leads (CSV)'}
      </Button>
    </div>
  );
};

export default Importcsv