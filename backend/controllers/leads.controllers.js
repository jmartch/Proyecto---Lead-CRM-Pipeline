import { LeadModel } from '../models/leads.model.js';
import { isValidEmail, isValidPhone } from '../utils/validators.js';

export const LeadController = {
  getAll: async (req, res) => {
    try {
      const leads = await LeadModel.getAll();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error obteniendo leads' });
    }
  },

  getById: async (req, res) => {
    const lead = await LeadModel.getById(req.params.id);
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
    }
    res.json(lead);
  },

  create: async (req, res) => {
    const { nombre, email, telefono, origen, campaña } = req.body;
    const errors = [];

    if (!nombre || nombre.length < 2) errors.push('Nombre inválido');
    if (!isValidEmail(email)) errors.push('Email inválido');
    if (!isValidPhone(telefono)) errors.push('Teléfono inválido');

    if (errors.length) {
      return res.status(400).json({ status: 'error', message: errors.join('. ') });
    }

    const id = await LeadModel.create({ nombre, email, telefono, origen, campaña });
    const newLead = await LeadModel.getById(id);
    res.status(201).json({ status: 'ok', lead: newLead });
  },

  update: async (req, res) => {
    const updated = await LeadModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
    res.json({ status: 'ok', message: 'Lead actualizado' });
  },

  delete: async (req, res) => {
    const deleted = await LeadModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ status: 'error', message: 'Lead no encontrado' });
    res.json({ status: 'ok', message: 'Lead eliminado' });
  }
};
