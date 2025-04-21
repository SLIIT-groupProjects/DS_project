import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        setRestaurants(response.data);
        
        // Extract unique cuisines
        const uniqueCuisines = [...new Set(response.data.map(r => r.cuisine).filter(Boolean))];
        setCuisines(uniqueCuisines);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load restaurants. Please try again later.');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = !cuisineFilter || restaurant.cuisine === cuisineFilter;
    return matchesSearch && matchesCuisine && restaurant.isAvailable;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-primary-600 text-white p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Delicious Food, Delivered</h1>
        <p className="text-lg">Find and order from the best restaurants in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search restaurants..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <select
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
          >
            <option value="">All Cuisines</option>
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Restaurant List */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">No restaurants found matching your criteria</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} className="block">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {restaurant.imageUrl ? (
                  <img 
                    src={restaurant.imageUrl} 
                    alt={restaurant.name} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                    {restaurant.rating && (
                      <span className="flex items-center bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-sm">
                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {restaurant.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{restaurant.cuisine || 'Various Cuisine'}</p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{restaurant.address || 'Address not available'}</span>
                  </div>
                  {restaurant.deliveryFee !== undefined && (
                    <div className="mt-1 text-sm text-gray-500">
                      Delivery fee: {formatPrice(restaurant.deliveryFee)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
