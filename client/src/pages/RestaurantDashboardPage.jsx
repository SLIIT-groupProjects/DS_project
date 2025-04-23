import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserFromStorage } from '../utils/auth';
import api from '../services/api';

const RestaurantDashboardPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    todaysRevenue: 0,
    totalMenuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderUpdateLoading, setOrderUpdateLoading] = useState(false);
  const [noRestaurant, setNoRestaurant] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const user = getUserFromStorage();
      
      // Real API call to get restaurant data
      const restaurantResponse = await api.get('/restaurants/my-restaurant');
      setRestaurant(restaurantResponse.data);
      
      // Get restaurant stats
      const statsResponse = await api.get(`/orders/restaurant/${restaurantResponse.data._id}/stats`);
      setStats(statsResponse.data);
      
      // Get recent orders
      const ordersResponse = await api.get(`/orders/restaurant/${restaurantResponse.data._id}`);
      setRecentOrders(ordersResponse.data.slice(0, 5)); // Show only the 5 most recent
      
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404 && 
          err.response.data.message === 'No restaurant found for this owner') {
        // Handle case where owner doesn't have a restaurant yet
        setNoRestaurant(true);
      } else {
        setError(err.response?.data?.message || 'Failed to load restaurant data');
      }
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await api.patch(`/restaurants/${restaurant._id}/toggle-availability`);
      setRestaurant({
        ...restaurant,
        isAvailable: response.data.isAvailable
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update restaurant availability');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderUpdateLoading(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update the order in the UI
      setRecentOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );

      // Refresh stats after order status update
      if (restaurant?._id) {
        const statsResponse = await api.get(`/orders/restaurant/${restaurant._id}/stats`);
        setStats(statsResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setOrderUpdateLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchRestaurantData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (noRestaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, Restaurant Owner!</h1>
          <p className="text-lg text-gray-600 mb-8">
            It looks like you haven't registered your restaurant yet.
          </p>
          <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Get Started</h2>
            <p className="mb-6">
              Register your restaurant to start receiving orders and managing your business.
            </p>
            <Link 
              to="/create-restaurant" 
              className="btn btn-primary inline-block"
            >
              Register My Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{restaurant?.name} Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Restaurant Status:</span>
          <button 
            className={`toggle-switch ${restaurant?.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={handleToggleAvailability}
            aria-label={restaurant?.isAvailable ? 'Set restaurant to closed' : 'Set restaurant to open'}
          >
            <span className="sr-only">Toggle restaurant status</span>
            <span
              className={`${
                restaurant?.isAvailable ? 'translate-x-5' : 'translate-x-0'
              } inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200`}
            />
          </button>
          <span className="text-sm font-medium">
            {restaurant?.isAvailable ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Pending Orders</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.pendingOrders}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Completed Today</h2>
          <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Today's Revenue</h2>
          <p className="text-3xl font-bold text-primary-600">${stats.todaysRevenue.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Menu Items</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.totalMenuItems}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <button 
            onClick={refreshData} 
            className="flex items-center text-sm text-primary-600 hover:text-primary-800"
            disabled={refreshing}
          >
            <svg className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden rounded-md">
          {recentOrders.length === 0 ? (
            <div className="p-4 border-b border-gray-200 text-center text-gray-500">
              No recent orders to display
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <li key={order._id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center">
                        <p className="font-medium">{order.user?.name || 'Customer'}</p>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Order #{order._id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      <p className="text-sm font-medium mt-1">${order.total.toFixed(2)}</p>
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Items:</span> {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                          className="btn btn-primary text-xs py-1"
                          disabled={orderUpdateLoading}
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                          className="btn btn-primary text-xs py-1"
                          disabled={orderUpdateLoading}
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'ready')}
                          className="btn btn-primary text-xs py-1"
                          disabled={orderUpdateLoading}
                        >
                          Mark as Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                          className="btn btn-primary text-xs py-1"
                          disabled={orderUpdateLoading}
                        >
                          Mark as Delivered
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                          className="btn btn-danger text-xs py-1"
                          disabled={orderUpdateLoading}
                        >
                          Cancel
                        </button>
                      )}
                      <Link 
                        to={`/restaurant/orders/${order._id}`} 
                        className="btn btn-outline text-xs py-1"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link to="/restaurant/menu-management" className="btn btn-primary text-center">
            Manage Menu
          </Link>
          <Link to="/restaurant/orders" className="btn btn-secondary text-center">
            View All Orders
          </Link>
          <Link to="/restaurant/settings" className="btn btn-outline text-center">
            Restaurant Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
