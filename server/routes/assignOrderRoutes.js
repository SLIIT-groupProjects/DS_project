import express from 'express';
import { createAssignedOrder } from '../controllers/assignOrderController.js';

const router = express.Router();

router.post('/assign-order', createAssignedOrder); // No auth for now

export default router;