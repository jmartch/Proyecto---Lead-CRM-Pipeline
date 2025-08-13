export const isValidEmail = (email) => {
  if(!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPhone = (phone) => {
  if(!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^\+?[0-9\s\-()]+$/; // Permite números, espacios, guiones y paréntesis
    return phoneRegex.test(phone.trim()) && phone.trim().length >= 7;
};

export const isValidState = (estado) => {
  const estadosValido = ['nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'];
  return !estado || estadosValido.includes(estado);
};

export const isValidDate = (fecha) => {
  if (!fecha) return true;
  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date);
};

export const sanitizeString = (str, maxLength = null) => {
  if (!str || typeof str !== 'string') return null;
  const sanitized = str.trim();
  if (maxLength && sanitized.length > maxLength) {
    throw new Error(`El texto no puede exceder ${maxLength} caracteres`);
  }
  return sanitized || null;
};

export const validateLeadData = (leadData, isUpdate = false) => {
  const errors = [];
  const {
    nombre, email, telefono, origen, campaña,
    ciudad, fuente_detallada, responsable, estado
  } = leadData;

  // Validaciones obligatorias para creación
  if (!isUpdate) {
    if (!nombre) errors.push('El nombre es requerido');
    if (!email) errors.push('El email es requerido');
  }

  // Validaciones de formato
  if (nombre && (nombre.length < 2 || nombre.length > 100)) {
    errors.push('El nombre debe tener entre 2 y 100 caracteres');
  }

  if (email && !isValidEmail(email)) {
    errors.push('El formato del email no es válido');
  }

  if (telefono && !isValidPhone(telefono)) {
    errors.push('El formato del teléfono no es válido');
  }

  if (!isValidState(estado)) {
    errors.push('El estado no es válido');
  }

  // Validaciones de longitud
  if (origen && origen.length > 100) errors.push('El origen no puede exceder 100 caracteres');
  if (campaña && campaña.length > 100) errors.push('La campaña no puede exceder 100 caracteres');
  if (ciudad && ciudad.length > 50) errors.push('La ciudad no puede exceder 50 caracteres');
  if (fuente_detallada && fuente_detallada.length > 200) errors.push('La fuente detallada no puede exceder 200 caracteres');
  if (responsable && responsable.length > 100) errors.push('El responsable no puede exceder 100 caracteres');

  return errors;
};