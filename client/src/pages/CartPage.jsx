import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import { isAuthenticated } from '../utils/auth';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart from local storage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        
        // Group cart items by restaurant
        const grouped = parsedCart.reduce((acc, item) => {
          if (!acc[item.restaurantId]) {
            acc[item.restaurantId] = {
              restaurantName: item.restaurantName,
              items: []
            };
          }
          acc[item.restaurantId].items.push(item);
          return acc;
        }, {});
        
        setGroupedCart(grouped);
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Update local storage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleRemoveItem = (itemId, restaurantId) => {
    const newCart = cart.filter(item => 
      !(item._id === itemId && item.restaurantId === restaurantId)
    );
    setCart(newCart);
    
    // Update grouped cart
    const grouped = newCart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {});
    
    setGroupedCart(grouped);
  };

  const handleUpdateQuantity = (itemId, restaurantId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const newCart = cart.map(item => 
      item._id === itemId && item.restaurantId === restaurantId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCart(newCart);
    
    // Update grouped cart
    const grouped = newCart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {});
    
    setGroupedCart(grouped);
  };

  const getSubtotalByRestaurant = (restaurantId) => {
    return groupedCart[restaurantId].items.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { redirect: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
      setGroupedCart({});
      localStorage.removeItem('cart');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-semibold mt-4">Your cart is empty</h2>
          <p className="text-gray-600 mt-2">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="mt-6 inline-block bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart ({getTotalItems()} items)</h1>
        <button 
          onClick={clearCart}
          className="text-red-600 hover:text-red-800"
        >
          Clear Cart
        </button>
      </div>

      {Object.keys(groupedCart).map(restaurantId => (
        <div key={restaurantId} className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">
              {groupedCart[restaurantId].restaurantName}
            </h2>
          </div>
          
          <div className="divide-y">
            {groupedCart[restaurantId].items.map(item => (
              <div key={item._id} className="p-6 flex items-center">
                <div className="flex-grow">
                  <h3 className="font-medium">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <p className="text-primary-600 mt-1">{formatPrice(item.price)}</p>
                </div>
                
                <div className="flex items-center">
                  <button
                    onClick={() => handleUpdateQuantity(item._id, restaurantId, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="mx-3 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, restaurantId, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                <div className="ml-8 font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
                
                <button
                  onClick={() => handleRemoveItem(item._id, restaurantId)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(getSubtotalByRestaurant(restaurantId))}</span>
            </div>
          </div>
        </div>
      ))}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>{formatPrice(getTotalPrice())}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>Delivery Fee</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
          <span>Total</span>
          <span>{formatPrice(getTotalPrice())}</span>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link 
            to="/"
            className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-center"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleCheckout}
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
