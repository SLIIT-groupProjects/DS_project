import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/ds.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import authDeliveryRoutes from './routes/authDeliveryRoutes.js';
import assignOrderRoutes from './routes/assignOrderRoutes.js'

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/authDelivery', authDeliveryRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/assignOrder', assignOrderRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));