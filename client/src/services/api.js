import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Updated to use relative path for proxy
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API response error:', error);
    
    // Server connection errors
    if (!error.response) {
      // Dispatch custom event for server error component
      const serverErrorEvent = new CustomEvent('server-error', {
        detail: { 
          message: 'Network error: Server may be down or unreachable. Please ensure the server is running.' 
        }
      });
      window.dispatchEvent(serverErrorEvent);
      
      // Log helpful debugging information
      console.error('=== SERVER CONNECTION ERROR ===');
      console.error('Please make sure the server is running by following these steps:');
      console.error('1. Open a terminal and navigate to the server directory');
      console.error('2. Run: npm run dev');
      console.error('3. Wait for the server to start and retry your request');
      console.error('==============================');
    }
    
    return Promise.reject(error);
  }
);

// Helper method to check server health
api.checkServerHealth = async () => {
  try {
    const response = await fetch('/api/health-check');
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

export default api;
