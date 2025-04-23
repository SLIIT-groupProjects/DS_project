import express from 'express';
import { registerDeliveryPerson, loginDeliveryPerson } from '../controllers/authDeliveryController.js';

const router = express.Router();

router.post('/register', registerDeliveryPerson);
router.post('/login', loginDeliveryPerson);

export default router;