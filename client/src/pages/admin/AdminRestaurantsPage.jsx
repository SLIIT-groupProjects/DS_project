import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/restaurants');
      setRestaurants(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load restaurants');
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

  const handleApproveRestaurant = async (restaurantId) => {
    try {
      setActionInProgress(true);
      await api.patch(`/admin/restaurants/${restaurantId}/approve`);
      
      // Update the restaurant status in the UI
      setRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant._id === restaurantId 
            ? { ...restaurant, status: 'approved' } 
            : restaurant
        )
      );
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
      setRestaurants(prevRestaurants => 
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restaurants Management</h1>
        <Link to="/admin-dashboard" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-md">
        {restaurants.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No restaurants found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {restaurant.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{restaurant.owner?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{restaurant.owner?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(restaurant.status)}`}>
                      {restaurant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(restaurant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/restaurant-details/${restaurant._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                      View
                    </Link>
                    {restaurant.status === 'pending_approval' && !actionInProgress && (
                      <>
                        <button 
                          onClick={() => handleApproveRestaurant(restaurant._id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                          disabled={actionInProgress}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectRestaurant(restaurant._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={actionInProgress}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantsPage;
