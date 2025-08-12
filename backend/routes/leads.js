import { Router } from 'express';
import { LeadController } from '../controllers/leads.controllers.js';

const router = Router();

router.get('/', LeadController.getAll);
router.get('/:id', LeadController.getById);
router.post('/', LeadController.create);
router.put('/:id', LeadController.update);
router.delete('/:id', LeadController.delete);

export default router;
