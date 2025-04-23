import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'API Gateway is running',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route traffic to appropriate microservices
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

app.use('/api/restaurants', proxy(process.env.RESTAURANT_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/restaurants${req.url}`
}));

app.use('/api/orders', proxy(process.env.ORDER_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/orders${req.url}`
}));

app.use('/api/admin', proxy(process.env.ADMIN_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/admin${req.url}`
}));

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Restaurant Management Service API Gateway',
    version: '1.0.0',
    endpoints: {
      healthCheck: '/api/health-check',
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on port ${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
});

export default app;
