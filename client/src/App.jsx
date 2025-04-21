import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isRestaurantOwner, getUserFromStorage } from './utils/auth';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantDashboardPage from './pages/RestaurantDashboardPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import UserDashboardPage from './pages/UserDashboardPage';
import CreateRestaurantPage from './pages/CreateRestaurantPage';
import RestaurantMenuManagement from './pages/RestaurantMenuManagement';

// Import admin components
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import RestaurantDetailsPage from './pages/admin/RestaurantDetailsPage';

// Import components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ServerError from './components/common/ServerError';

export default function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in on app load
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Global server error notification */}
      <ServerError />
      
      <Navbar user={user} setUser={setUser} />
      
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
          <Route path="/restaurants" element={<HomePage />} /> {/* Redirect to homepage for now */}
          <Route path="/checkout" element={<CartPage />} /> {/* Redirect to cart for now */}
          
          {/* Protected routes - User */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute isAllowed={isAuthenticated()}>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute isAllowed={isAuthenticated()}>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          
          {/* Protected routes - Restaurant Owner */}
          <Route 
            path="/restaurant-dashboard" 
            element={
              <ProtectedRoute isAllowed={isRestaurantOwner()}>
                <RestaurantDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/menu-management" 
            element={
              <ProtectedRoute isAllowed={isRestaurantOwner()}>
                <RestaurantMenuManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/orders" 
            element={
              <ProtectedRoute isAllowed={isRestaurantOwner()}>
                <OrderTrackingPage isRestaurantView={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/orders/:id" 
            element={
              <ProtectedRoute isAllowed={isRestaurantOwner()}>
                <OrderTrackingPage isRestaurantView={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/settings" 
            element={
              <ProtectedRoute isAllowed={isRestaurantOwner()}>
                <RestaurantDetailPage isOwnerView={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-restaurant" 
            element={
              <ProtectedRoute isAllowed={isRestaurantOwner()}>
                <CreateRestaurantPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes - Admin */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/restaurants" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <AdminRestaurantsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/restaurant-details/:id" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <RestaurantDetailsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <AdminOrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders/:id" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <OrderTrackingPage isAdminView={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <AdminUsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/transactions" 
            element={
              <ProtectedRoute isAllowed={isAdmin()}>
                <AdminTransactionsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /profile to /user-dashboard */}
          <Route
            path="/profile"
            element={<Navigate to="/user-dashboard" replace />}
          />
          
          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}
