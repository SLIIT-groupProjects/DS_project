import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [owner, setOwner] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const restaurantResponse = await api.get(`/admin/restaurants/${id}`);
      setRestaurant(restaurantResponse.data);
      
      if (restaurantResponse.data.owner) {
        const ownerResponse = await api.get(`/admin/users/${restaurantResponse.data.owner}`);
        setOwner(ownerResponse.data);
      }
      
      const ordersResponse = await api.get(`/admin/restaurants/${id}/orders?limit=5`);
      setRecentOrders(ordersResponse.data);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load restaurant data');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending_approval': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRestaurant = async () => {
    try {
      setActionInProgress(true);
      await api.patch(`/admin/restaurants/${id}/approve`);
      setRestaurant({...restaurant, status: 'approved'});
      setActionInProgress(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve restaurant');
      setActionInProgress(false);
    }
  };

  const handleRejectRestaurant = async () => {
    try {
      setActionInProgress(true);
      await api.patch(`/admin/restaurants/${id}/reject`);
      setRestaurant({...restaurant, status: 'rejected'});
      setActionInProgress(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject restaurant');
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/admin/restaurants')} 
            className="mt-2 text-red-700 font-medium underline"
          >
            Return to Restaurants List
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>Restaurant not found</p>
          <button 
            onClick={() => navigate('/admin/restaurants')} 
            className="mt-2 text-yellow-700 font-medium underline"
          >
            Return to Restaurants List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Details</h1>
        <Link to="/admin/restaurants" className="btn btn-outline">
          Back to Restaurants
        </Link>
      </div>

      {/* Restaurant Header */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(restaurant.status)}`}>
              {restaurant.status}
            </span>
          </div>
          {restaurant.status === 'pending_approval' && (
            <div>
              <button
                onClick={handleApproveRestaurant}
                disabled={actionInProgress}
                className="btn btn-primary mr-2"
              >
                Approve
              </button>
              <button
                onClick={handleRejectRestaurant}
                disabled={actionInProgress}
                className="btn btn-danger"
              >
                Reject
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {restaurant.address}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Contact Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {restaurant.phone || 'Not provided'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Cuisine
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {restaurant.cuisine || 'Not specified'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Registration Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(restaurant.createdAt)}
              </dd>
            </div>
            {owner && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Owner
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div>
                    <p>{owner.name}</p>
                    <p className="text-gray-500">{owner.email}</p>
                    <Link 
                      to={`/admin/users/${owner._id}`}
                      className="mt-1 inline-block text-primary-600 hover:underline"
                    >
                      View Owner Profile
                    </Link>
                  </div>
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {restaurant.description || 'No description provided.'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
        </div>
        <div className="border-t border-gray-200">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">
              No recent orders found for this restaurant.
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</div>
                        <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
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
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Menu Items</h2>
          <span className="text-sm text-gray-500">{restaurant.menu?.length || 0} items</span>
        </div>
        <div className="border-t border-gray-200">
          {!restaurant.menu || restaurant.menu.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">
              No menu items found for this restaurant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurant.menu.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-8 flex space-x-4">
        <button 
          onClick={() => navigate('/admin/restaurants')} 
          className="btn btn-outline"
        >
          Back to Restaurant List
        </button>
        {restaurant.status === 'approved' && (
          <button
            onClick={() => navigate(`/restaurant/${id}`)}
            className="btn btn-secondary"
          >
            View Public Page
          </button>
        )}
        {restaurant.status === 'rejected' && (
          <button
            onClick={handleApproveRestaurant}
            disabled={actionInProgress}
            className="btn btn-primary"
          >
            Approve Now
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailsPage;
