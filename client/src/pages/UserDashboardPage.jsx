import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFromStorage } from '../utils/auth';
import api from '../services/api';
import { formatDate, getOrderStatusColor } from '../utils/helpers';

const UserDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const userData = getUserFromStorage();
    setUser(userData);

    // Fetch orders from API
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-primary-700">Total Orders</h3>
            <p className="text-2xl font-bold text-primary-600">{orders.length}</p>
          </div>
          <div className="bg-secondary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-secondary-700">Active Orders</h3>
            <p className="text-2xl font-bold text-secondary-600">
              {orders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-700">Ready for Pickup</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(order => order.status === 'ready').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <button 
            onClick={fetchOrders} 
            className="flex items-center text-sm text-primary-600 hover:text-primary-800"
            disabled={refreshing}
          >
            <svg className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500">You haven't placed any orders yet</p>
            <Link to="/" className="mt-2 inline-block text-primary-600 hover:text-primary-700">
              Browse restaurants to place an order
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map(order => (
              <div key={order._id || order.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{order.restaurant?.name || order.restaurant}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate ? formatDate(order.createdAt || order.date) : new Date(order.createdAt || order.date).toLocaleDateString()}
                    </p>
                    {order.items && order.items.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}: 
                        {order.items.slice(0, 2).map((item, index) => (
                          <span key={index} className="ml-1">
                            {item.quantity || 1}x {item.name}{index < Math.min(order.items.length, 2) - 1 ? ',' : ''}
                          </span>
                        ))}
                        {order.items.length > 2 && <span> and {order.items.length - 2} more...</span>}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(order.total || 0).toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${getOrderStatusColor ? getOrderStatusColor(order.status) : 'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-4">
                  <Link
                    to={`/track-order/${order._id || order.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    Track Order
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  {order.status === 'delivered' && (
                    <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                      Reorder
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {orders.length > 0 && (
          <div className="mt-6 text-center">
            <Link to="/orders" className="text-primary-600 hover:text-primary-800">
              View all orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
