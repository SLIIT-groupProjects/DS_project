import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, groupByCategory } from '../utils/helpers';
import { isAuthenticated } from '../utils/auth';

const RestaurantDetailPage = ({ isOwnerView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // Use different endpoint based on whether we're in owner view or customer view
        const response = isOwnerView 
          ? await api.get('/restaurants/my-restaurant')
          : await api.get(`/restaurants/${id}`);
        
        setRestaurant(response.data);
        
        // Set first category as active by default if available
        if (response.data.menu?.length > 0) {
          const categories = [...new Set(response.data.menu.map(item => item.category))];
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load restaurant details. Please try again later.');
        setLoading(false);
      }
    };

    // Load existing cart from local storage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }

    fetchRestaurant();
  }, [id, isOwnerView]);

  // Update local storage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (item) => {
    // Don't allow adding items to cart in owner view
    if (isOwnerView) return;
    
    const restaurantId = restaurant._id;
    
    // Check if already in cart
    const existingItem = cart.find(cartItem => 
      cartItem._id === item._id && cartItem.restaurantId === restaurantId
    );

    if (existingItem) {
      // Update quantity if already in cart
      setCart(cart.map(cartItem => 
        cartItem._id === item._id && cartItem.restaurantId === restaurantId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { 
        ...item, 
        quantity: 1, 
        restaurantId: restaurantId,
        restaurantName: restaurant.name
      }]);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const goToCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { redirect: `/restaurant/${id}` } });
      return;
    }
    navigate('/checkout');
  };

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

  if (!restaurant) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
          Restaurant not found.
        </div>
      </div>
    );
  }

  const menuByCategory = groupByCategory(restaurant.menu.filter(item => item.isAvailable));
  const categories = Object.keys(menuByCategory);

  return (
    <div className="container mx-auto p-4">
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {restaurant?.bannerImage ? (
          <div className="h-64 overflow-hidden">
            <img 
              src={restaurant.bannerImage} 
              alt={restaurant.name} 
              className="w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 bg-primary-100"></div>
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
            
            {isOwnerView && (
              <button 
                onClick={() => navigate('/restaurant/menu-management')}
                className="btn btn-primary"
              >
                Manage Menu
              </button>
            )}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
            {restaurant.cuisine && (
              <span className="px-2 py-1 bg-gray-100 rounded-md">{restaurant.cuisine}</span>
            )}
            <span className="px-2 py-1 bg-gray-100 rounded-md">
              {restaurant.isAvailable ? 'Open' : 'Closed'}
            </span>
            {restaurant.rating && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {restaurant.rating}
              </span>
            )}
          </div>
          
          {restaurant.description && (
            <p className="mt-4 text-gray-600">{restaurant.description}</p>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {restaurant.address || 'Address not available'}
            </p>
            {restaurant.phone && (
              <p className="flex items-center mt-1">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {restaurant.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conditional rendering for owner view or customer view */}
      {isOwnerView ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Details</h3>
              <p><span className="font-medium">Address:</span> {restaurant?.address}</p>
              <p><span className="font-medium">Phone:</span> {restaurant?.phone}</p>
              <p><span className="font-medium">Cuisine:</span> {restaurant?.cuisine || 'Not specified'}</p>
              <p><span className="font-medium">Delivery Fee:</span> {formatPrice(restaurant?.deliveryFee || 0)}</p>
              <p><span className="font-medium">Status:</span> {restaurant?.isAvailable ? 'Open' : 'Closed'}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p>{restaurant?.description || 'No description provided.'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/restaurant-dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Categories and Items */}
          <div className="lg:col-span-2">
            {/* Category Navigation */}
            {categories.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${
                        activeCategory === category 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Menu</h2>
              
              {categories.length === 0 ? (
                <p className="text-gray-500">No menu items available at the moment.</p>
              ) : (
                <>
                  {categories.map(category => (
                    <div 
                      key={category} 
                      id={`category-${category}`}
                      className={activeCategory === category ? 'block' : 'hidden'}
                    >
                      <h3 className="text-xl font-medium mb-3">{category}</h3>
                      <div className="space-y-4 mb-8">
                        {menuByCategory[category].map(item => (
                          <div 
                            key={item._id} 
                            className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                              <p className="mt-1 font-medium text-primary-600">{formatPrice(item.price)}</p>
                            </div>
                            
                            {item.imageUrl && (
                              <div className="w-20 h-20 ml-4">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            )}
                            
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="ml-4 p-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Your Order</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="mt-2 text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add items from the menu to start an order</p>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {cart
                      .filter(item => item.restaurantId === id)
                      .map((item, index) => (
                        <div key={index} className="py-3 flex justify-between">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{item.quantity} x</span>
                              <span className="ml-2">{item.name}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.price)} each
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    {restaurant.deliveryFee !== undefined && (
                      <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(restaurant.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>
                        {formatPrice(getTotalPrice() + (restaurant.deliveryFee || 0))}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={goToCheckout}
                    className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition duration-200"
                  >
                    Checkout ({getTotalItems()} items)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
