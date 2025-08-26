import { LeadModel } from '../models/leads.model.js';
import { isValidEmail, isValidPhone } from '../utils/validators.js';
import { parse } from "csv-parse";
export const LeadController = {
  // GET /api/leads con filtros, paginación y ordenamiento
  getAll: async (req, res) => {
    try {
      console.log(' Solicitud GET /api/leads con query:', req.query);

      // Si no hay parámetros, usar método simple
      if (Object.keys(req.query).length === 0) {
        const leads = await LeadModel.getAll();
        console.log(` Enviando ${leads.length} leads (sin filtros)`);
        return res.json({ status: 'ok', leads });
      }

      // Usar método con filtros
      const result = await LeadModel.getAllWithFilters(req.query);

      console.log(` Enviando ${result.leads.length} leads de ${result.pagination.total} total`);
      console.log(` Página ${result.pagination.page} de ${result.pagination.total_pages}`);

      res.json({
        status: 'ok',
        ...result
      });
    } catch (error) {
      console.error(' Error obteniendo leads:', error);
      res.status(500).json({ status: 'error', message: 'Error obteniendo leads' });
    }
  },

  // GET /api/leads/:id
  getById: async (req, res) => {
    try {
      console.log(` Solicitud GET /api/leads/${req.params.id}`);
      const lead = await LeadModel.getById(req.params.id);

      if (!lead) {
        console.log(` Lead ${req.params.id} no encontrado`);
        return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
      }

      console.log(` Enviando lead ${req.params.id}`);
      res.json({ status: 'ok', lead });
    } catch (error) {
      console.error(' Error obteniendo lead por ID:', error);
      res.status(500).json({ status: 'error', message: 'Error obteniendo lead' });
    }
  },

  // POST /api/leads
  create: async (req, res) => {
    try {
      console.log(' Solicitud POST /api/leads:', req.body);
      const {
        nombre, email, telefono, origen, campaña,
        ciudad, fuente_detallada, tags, responsable, estado
      } = req.body;

      // Validaciones detalladas
      const errors = [];

      // Validar nombre
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        errors.push('El nombre es requerido y debe ser texto válido');
      } else if (nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      } else if (nombre.trim().length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
      }

      // Validar email
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.push('El email es requerido');
      } else if (!isValidEmail(email.trim())) {
        errors.push('El formato del email no es válido');
      } else if (email.trim().length > 100) {
        errors.push('El email no puede exceder 100 caracteres');
      }

      // Validar teléfono (opcional)
      if (telefono && !isValidPhone(telefono)) {
        errors.push('El formato del teléfono no es válido');
      }

      // Validar longitud de campos opcionales
      if (origen && origen.length > 100) {
        errors.push('El origen no puede exceder 100 caracteres');
      }
      if (campaña && campaña.length > 100) {
        errors.push('La campaña no puede exceder 100 caracteres');
      }
      if (ciudad && ciudad.length > 50) {
        errors.push('La ciudad no puede exceder 50 caracteres');
      }
      if (fuente_detallada && fuente_detallada.length > 200) {
        errors.push('La fuente detallada no puede exceder 200 caracteres');
      }
      if (responsable && responsable.length > 100) {
        errors.push('El responsable no puede exceder 100 caracteres');
      }

      // Validar estado
      const estadosValidos = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];
      if (estado && !estadosValidos.includes(estado)) {
        errors.push('El estado debe ser uno de: ' + estadosValidos.join(', '));
      }

      if (errors.length > 0) {
        console.log(' Errores de validación:', errors);
        return res.status(400).json({
          status: 'error',
          message: errors.join('. '),
          errors
        });
      }

      const id = await LeadModel.create({
        nombre, email, telefono, origen, campaña,
        ciudad, fuente_detallada, tags, responsable, estado
      });

      const newLead = await LeadModel.getById(id);

      console.log(` Lead creado con ID: ${id}`);
      res.status(201).json({
        status: 'ok',
        message: 'Lead creado exitosamente',
        lead: newLead
      });

    } catch (error) {
      console.error(' Error creando lead:', error);

      if (error.message === 'EMAIL_EXISTS') {
        return res.status(409).json({
          status: 'error',
          message: 'Ya existe un lead con este email'
        });
      }

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          status: 'error',
          message: 'Ya existe un lead con este email'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor al crear lead'
      });
    }
  },

  // PUT /api/leads/:id
  update: async (req, res) => {
    try {
      console.log(` Solicitud PUT /api/leads/${req.params.id}:`, req.body);

      // Primero verificar que el lead existe
      const existingLead = await LeadModel.getById(req.params.id);
      if (!existingLead) {
        console.log(` Lead ${req.params.id} no encontrado para actualizar`);
        return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
      }

      // Validaciones similares al create pero más flexibles
      const {
        nombre, email, telefono, origen, campaña,
        ciudad, fuente_detallada, tags, responsable, estado
      } = req.body;

      const errors = [];

      // Solo validar campos que se están enviando
      if (nombre !== undefined) {
        if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
          errors.push('El nombre debe tener al menos 2 caracteres');
        } else if (nombre.length > 100) {
          errors.push('El nombre no puede exceder 100 caracteres');
        }
      }

      if (email !== undefined) {
        if (!email || !isValidEmail(email)) {
          errors.push('El formato del email no es válido');
        } else if (email.length > 100) {
          errors.push('El email no puede exceder 100 caracteres');
        }
      }

      if (telefono !== undefined && telefono && !isValidPhone(telefono)) {
        errors.push('El formato del teléfono no es válido');
      }

      // Validar longitudes
      if (origen && origen.length > 100) errors.push('El origen no puede exceder 100 caracteres');
      if (campaña && campaña.length > 100) errors.push('La campaña no puede exceder 100 caracteres');
      if (ciudad && ciudad.length > 50) errors.push('La ciudad no puede exceder 50 caracteres');
      if (fuente_detallada && fuente_detallada.length > 200) errors.push('La fuente detallada no puede exceder 200 caracteres');
      if (responsable && responsable.length > 100) errors.push('El responsable no puede exceder 100 caracteres');

      if (errors.length > 0) {
        console.log(' Errores de validación en actualización:', errors);
        return res.status(400).json({
          status: 'error',
          message: errors.join('. '),
          errors
        });
      }

      const updated = await LeadModel.update(req.params.id, req.body);

      if (!updated) {
        console.log(` No se pudo actualizar lead ${req.params.id}`);
        return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
      }

      // Obtener el lead actualizado
      const updatedLead = await LeadModel.getById(req.params.id);

      console.log(` Lead ${req.params.id} actualizado exitosamente`);
      res.json({
        status: 'ok',
        message: 'Lead actualizado correctamente',
        lead: updatedLead
      });

    } catch (error) {
      console.error(' Error actualizando lead:', error);

      if (error.message === 'INVALID_STATE') {
        return res.status(400).json({ status: 'error', message: 'Estado no válido' });
      }

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          status: 'error',
          message: 'Ya existe un lead con este email'
        });
      }

      res.status(500).json({ status: 'error', message: 'Error actualizando lead' });
    }
  },

  // DELETE /api/leads/:id
  delete: async (req, res) => {
    try {
      console.log(` Solicitud DELETE /api/leads/${req.params.id}`);

      const deleted = await LeadModel.delete(req.params.id);
      if (!deleted) {
        console.log(` Lead ${req.params.id} no encontrado para eliminar`);
        return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
      }

      console.log(`✅Lead ${req.params.id} eliminado exitosamente`);
      res.json({ status: 'ok', message: 'Lead eliminado correctamente' });
    } catch (error) {
      console.error(' Error eliminando lead:', error);
      res.status(500).json({ status: 'error', message: 'Error eliminando lead' });
    }
  },

  // Endpoint adicional para obtener opciones únicas (útil para filtros en frontend)
  getFilterOptions: async (req, res) => {
    try {

      const [estados, origenes, ciudades, responsables, fuentes] = await Promise.all([
        LeadModel.getUniqueValues('estado'),
        LeadModel.getUniqueValues('origen'),
        LeadModel.getUniqueValues('ciudad'),
        LeadModel.getUniqueValues('responsable'),
        LeadModel.getUniqueValues('fuente_detallada')
      ]);

      res.json({
        status: 'ok',
        options: {
          estados,
          origenes,
          ciudades,
          responsables,
          fuentes_detalladas: fuentes
        }
      });
    } catch (error) {
      console.error(' Error obteniendo opciones de filtro:', error);
      res.status(500).json({ status: 'error', message: 'Error obteniendo opciones' });
    }
  },
  assignResponsable: async (req, res) => {
    try {
      const { LeadId, responsable } = await LeadModel.responsable(req.params.id, req.body.responsable);

    } catch (error) {

    }
  },
  updateState: async (res,req)=>{
    try {
      
    } catch (error) {
      console.error('Error actualizando estado del lead:', error);
      res.status(500).json({ status: 'error', message: 'Error actualizando estado del lead' });
    }
  },
  importcsv: async (req, res) => {
    try {
      console.log('Iniciando importación CSV...');

      if (!req.file) {
        return res.status(400).json({ error: "No se subió ningún archivo" });
      }

      console.log('Archivo recibido:', req.file.originalname);

      const csvBuffer = req.file.buffer.toString();
      const valid = [];
      const invalid = [];

      parse(
        csvBuffer,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ',',
        },
        async (err, rows) => {
          if (err) {
            console.error('Error parseando CSV:', err);
            return res.status(500).json({ error: "Error al procesar CSV: " + err.message });
          }

          console.log(`Procesando ${rows.length} filas del CSV...`);

          rows.forEach((row, index) => {
            const { nombre, email, telefono, origen, campaña } = row;

            // Validaciones básicas
            if (!nombre || !email) {
              invalid.push({
                row: index + 1,
                ...row,
                error: "Nombre y Email son obligatorios",
              });
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              invalid.push({
                row: index + 1,
                ...row,
                error: "Formato de email inválido",
              });
            } else {
              valid.push({
                nombre: nombre.trim(),
                email: email.trim().toLowerCase(),
                telefono: telefono?.trim() || '',
                origen: origen?.trim() || '',
                campaña: campaña?.trim() || ''
              });
            }
          });

          console.log(`Registros válidos: ${valid.length}, inválidos: ${invalid.length}`);

          try {
            let insertedLeads = [];

            if (valid.length > 0) {

              const result = await LeadModel.bulkCreateSafe(valid);
              insertedLeads = result.inserted;

              // Agregar errores de inserción a la lista de inválidos
              if (result.errors && result.errors.length > 0) {
                invalid.push(...result.errors);
              }

              console.log(`${insertedLeads.length} registros insertados en la BD`);
            }

            return res.json({
              message: "Archivo procesado exitosamente",
              insertados: insertedLeads.length,
              rechazados: invalid.length,
              invalid: invalid.length > 0 ? invalid : [],
              leads: insertedLeads
            });

          } catch (dbError) {
            console.error('Error en base de datos:', dbError);
            return res.status(500).json({
              error: "Error al guardar en base de datos",
              detail: dbError.message
            });
          }
        }
      );
    } catch (error) {
      console.error('Error general en importCSV:', error);
      res.status(500).json({ error: "Error interno del servidor: " + error.message });
    }
  },
exportcsv: async (req, res) => {
  try {
    console.log('Iniciando exportación a CSV...');
    
    // Obtener filtros de la query string (opcionales)
    const filters = {
      estado: req.query.estado,
      origen: req.query.origen,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      responsable: req.query.responsable,
      ciudad: req.query.ciudad,
      fuente_detallada: req.query.fuente_detallada,
      // No usar paginación para exportar todos los datos
      limit: 999999,
      page: 1
    };

    // Obtener todos los leads con los filtros aplicados
    const result = await LeadModel.getAllaWithFilters(filters);
    const leads = result.leads;

    console.log(`Exportando ${leads.length} registros...`);

    if (leads.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron registros para exportar' 
      });
    }

    // Definir las columnas que queremos exportar
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'nombre', header: 'Nombre' },
      { key: 'email', header: 'Email' },
      { key: 'telefono', header: 'Teléfono' },
      { key: 'origen', header: 'Origen' },
      { key: 'campaña', header: 'Campaña' },
      { key: 'ciudad', header: 'Ciudad' },
      { key: 'fuente_detallada', header: 'Fuente Detallada' },
      { key: 'responsable', header: 'Responsable' },
      { key: 'estado', header: 'Estado' },
      { key: 'tags', header: 'Tags' },
      { key: 'fecha', header: 'Fecha Creación' },
      { key: 'fecha_actualizacion', header: 'Fecha Actualización' }
    ];

    // Crear el contenido CSV
    let csvContent = '';
    
    // Agregar encabezados
    csvContent += columns.map(col => `"${col.header}"`).join(',') + '\n';
    
    // Agregar datos
    leads.forEach(lead => {
      const row = columns.map(col => {
        let value = lead[col.key];
        
        // Manejar valores especiales
        if (value === null || value === undefined) {
          value = '';
        } else if (col.key === 'tags' && value) {
          // Si tags es JSON, convertir a string legible
          try {
            const tags = typeof value === 'string' ? JSON.parse(value) : value;
            value = Array.isArray(tags) ? tags.join('; ') : value;
          } catch (e) {
            // Si no es JSON válido, mantener como está
          }
        } else if (col.key === 'fecha' || col.key === 'fecha_actualizacion') {
          // Formatear fechas
          if (value instanceof Date) {
            value = value.toISOString().slice(0, 19).replace('T', ' ');
          }
        }
        
        // Escapar comillas y envolver en comillas
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      
      csvContent += row.join(',') + '\n';
    });

    // Configurar headers para descarga
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const filename = `leads_export_${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
    
    // Agregar BOM para compatibilidad con Excel
    const csvWithBOM = '\uFEFF' + csvContent;
    
    console.log(`Exportación completada: ${filename}`);
    
    // Enviar el archivo
    res.send(csvWithBOM);

  } catch (error) {
    console.error('Error en exportación CSV:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
}


};