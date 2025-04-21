import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFromStorage } from '../utils/auth';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRestaurants, setRecentRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching admin dashboard data...");
      const user = getUserFromStorage();
      console.log("Current user:", user);
      
      setLoading(true);
      setError('');
      
      // DEVELOPMENT MODE FLAG - Set to false when backend is ready
      const USE_MOCK_DATA = true;
      
      // Pre-defined mock data for development
      const mockStats = {
        totalRestaurants: 12,
        activeRestaurants: 8,
        totalUsers: 45,
        totalOrders: 156,
        revenue: 3876.50
      };
      
      const mockOrders = [
        {
          _id: 'order1',
          customer: 'John Doe',
          restaurant: 'Burger Palace',
          status: 'delivered',
          total: 35.99,
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          _id: 'order2',
          customer: 'Sarah Smith',
          restaurant: 'Pizza Heaven',
          status: 'preparing',
          total: 42.50,
          createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
          _id: 'order3',
          customer: 'Mike Johnson',
          restaurant: 'Taco Time',
          status: 'pending',
          total: 18.75,
          createdAt: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
        }
      ];
      
      const mockRestaurants = [
        {
          _id: 'rest1',
          name: 'New Thai Bistro',
          owner: 'Lisa Chen',
          status: 'pending_approval',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          _id: 'rest2',
          name: 'Italiano Deluxe',
          owner: 'Marco Romano',
          status: 'pending_approval',
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        },
        {
          _id: 'rest3',
          name: 'Steakhouse Supreme',
          owner: 'Robert Williams',
          status: 'approved',
          createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        }
      ];
      
      // If in development mode, use mock data and skip API calls
      if (USE_MOCK_DATA) {
        console.log("DEVELOPMENT MODE: Using mock data for admin dashboard");
        setStats(mockStats);
        setRecentOrders(mockOrders);
        setRecentRestaurants(mockRestaurants);
        setLoading(false);
        return;
      }
      
      // Get admin dashboard stats - use try/catch for each request
      let dashboardStats = {
        totalRestaurants: 0,
        activeRestaurants: 0,
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0
      };
      
      try {
        const statsResponse = await api.get('/admin/dashboard/stats');
        console.log("Stats response:", statsResponse.data);
        dashboardStats = statsResponse.data || dashboardStats;
      } catch (statsErr) {
        console.warn("Could not fetch dashboard stats:", statsErr);
        // Use default stats from above
      }
      setStats(dashboardStats);
      
      // Get recent orders - with fallback
      let recentOrdersList = [];
      try {
        const ordersResponse = await api.get('/admin/orders/recent');
        console.log("Orders response:", ordersResponse.data);
        recentOrdersList = ordersResponse.data || [];
      } catch (ordersErr) {
        console.warn("Could not fetch recent orders:", ordersErr);
        // Provide some fallback data for development
        recentOrdersList = [
          {
            _id: 'sample1',
            customer: 'Sample Customer',
            restaurant: 'Sample Restaurant',
            status: 'pending',
            total: 25.99,
            createdAt: new Date().toISOString()
          }
        ];
      }
      setRecentOrders(recentOrdersList);
      
      // Get recent restaurant applications - with fallback
      let recentRestaurantsList = [];
      try {
        const restaurantsResponse = await api.get('/admin/restaurants/recent');
        console.log("Restaurants response:", restaurantsResponse.data);
        recentRestaurantsList = restaurantsResponse.data || [];
      } catch (restaurantsErr) {
        console.warn("Could not fetch recent restaurants:", restaurantsErr);
        // Provide some fallback data for development
        recentRestaurantsList = [
          {
            _id: 'sample1',
            name: 'Sample Restaurant',
            owner: 'Sample Owner',
            status: 'pending_approval',
            createdAt: new Date().toISOString()
          }
        ];
      }
      setRecentRestaurants(recentRestaurantsList);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setRefreshing(false);
    });
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending_approval': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRestaurant = async (restaurantId) => {
    try {
      setActionInProgress(true);
      await api.patch(`/admin/restaurants/${restaurantId}/approve`);
      
      // Update the restaurant status in the UI
      setRecentRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant._id === restaurantId 
            ? { ...restaurant, status: 'approved' } 
            : restaurant
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeRestaurants: prev.activeRestaurants + 1
      }));
      setActionInProgress(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve restaurant');
      setActionInProgress(false);
    }
  };

  const handleRejectRestaurant = async (restaurantId) => {
    try {
      setActionInProgress(true);
      await api.patch(`/admin/restaurants/${restaurantId}/reject`);
      
      // Update the restaurant status in the UI
      setRecentRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant._id === restaurantId 
            ? { ...restaurant, status: 'rejected' } 
            : restaurant
        )
      );
      setActionInProgress(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject restaurant');
      setActionInProgress(false);
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-lg w-full mb-4">
          <p className="font-bold">Error Loading Dashboard</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            'Try Again'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button 
          onClick={handleRefresh} 
          className="flex items-center text-sm text-primary-600 hover:text-primary-800"
          disabled={refreshing}
        >
          <svg className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Restaurants</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.totalRestaurants}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Active Restaurants</h2>
          <p className="text-3xl font-bold text-green-600">{stats.activeRestaurants}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.totalOrders}</p>
        </div>
        <div className="dashboard-card">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-primary-600">${(stats.revenue || 0).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-md">
            {recentOrders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No recent orders</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.customer || 'Unknown Customer'}</p>
                        <p className="text-sm text-gray-600">{order.restaurant || 'Unknown Restaurant'}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status || 'pending')}`}>
                            {order.status || 'pending'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {order.createdAt ? formatDate(order.createdAt) : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">${(order.total || 0).toFixed(2)}</p>
                        <Link to={`/admin/orders/${order._id}`} className="text-primary-600 text-xs hover:underline">
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
        
        {/* Recent Restaurant Applications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Restaurant Applications</h2>
            <Link to="/admin/restaurants" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-md">
            {recentRestaurants.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No recent applications</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentRestaurants.map((restaurant) => (
                  <li key={restaurant._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{restaurant.name || 'Unnamed Restaurant'}</p>
                        <p className="text-sm text-gray-600">Owner: {restaurant.owner || 'Unknown'}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(restaurant.status || 'pending_approval')}`}>
                            {restaurant.status === 'pending_approval' ? 'Pending Approval' : (restaurant.status || 'Pending')}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            Applied on {restaurant.createdAt ? formatDate(restaurant.createdAt) : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/admin/restaurant-details/${restaurant._id}`} className="text-primary-600 text-sm hover:underline">
                          Review
                        </Link>
                        {restaurant.status === 'pending_approval' && !actionInProgress && (
                          <>
                            <button 
                              onClick={() => handleApproveRestaurant(restaurant._id)}
                              className="text-green-600 text-sm hover:underline"
                              disabled={actionInProgress}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectRestaurant(restaurant._id)}
                              className="text-red-600 text-sm hover:underline"
                              disabled={actionInProgress}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {actionInProgress && restaurant.status === 'pending_approval' && (
                          <span className="text-gray-500 text-sm">Processing...</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Link to="/admin/users" className="btn btn-primary text-center">
            Manage Users
          </Link>
          <Link to="/admin/restaurants" className="btn btn-secondary text-center">
            Manage Restaurants
          </Link>
          <Link to="/admin/orders" className="btn btn-outline text-center">
            View All Orders
          </Link>
          <Link to="/admin/transactions" className="btn btn-primary text-center">
            Financial Transactions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
