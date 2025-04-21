import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [filter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders?status=${filter}&page=${page}&limit=10`);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <Link to="/admin-dashboard" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setFilter('all'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            All Orders
          </button>
          <button 
            onClick={() => { setFilter('pending'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => { setFilter('confirmed'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'confirmed' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Confirmed
          </button>
          <button 
            onClick={() => { setFilter('preparing'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'preparing' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Preparing
          </button>
          <button 
            onClick={() => { setFilter('ready'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'ready' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Ready
          </button>
          <button 
            onClick={() => { setFilter('delivered'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'delivered' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Delivered
          </button>
          <button 
            onClick={() => { setFilter('cancelled'); setPage(1); }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'cancelled' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-md">
        {orders.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No orders found</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</div>
                      <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.restaurant?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      ${order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/orders/${order._id}`} className="text-primary-600 hover:text-primary-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page > 1 ? page - 1 : 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page > 1 ? page - 1 : 1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages).keys()].map(i => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${page === i + 1 ? 'bg-primary-50 border-primary-500 text-primary-600' : 'border-gray-300 bg-white text-gray-700'} text-sm font-medium hover:bg-gray-50`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
