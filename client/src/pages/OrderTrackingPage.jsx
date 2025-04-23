import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // In a real app, this would be an API call to get order details
        // const response = await api.get(`/orders/${orderId}`);
        // setOrder(response.data);
        
        // Mock data for development
        setTimeout(() => {
          const mockOrder = {
            _id: orderId,
            status: 'preparing',
            createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
            estimatedDeliveryTime: new Date(Date.now() + 20 * 60000).toISOString(),
            items: [
              { name: 'Chicken Burger', quantity: 2, price: 12.99 },
              { name: 'French Fries', quantity: 1, price: 4.99 },
              { name: 'Soft Drink', quantity: 2, price: 2.99 }
            ],
            total: 36.95,
            restaurant: {
              _id: 'rest123',
              name: 'Burger Palace',
              address: '123 Main St, Anytown, USA',
              phone: '555-123-4567'
            },
            deliveryAddress: '456 Elm St, Anytown, USA',
          };
          setOrder(mockOrder);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Could not load order details. Please try again.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
        <Link to="/" className="mt-4 text-primary-600 hover:underline block">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
          Order not found. The order may have been cancelled or the ID is incorrect.
        </div>
        <Link to="/" className="mt-4 text-primary-600 hover:underline block">
          Return to Home
        </Link>
      </div>
    );
  }

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    return steps.indexOf(status);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Order';
      case 'ready': return 'Ready for Pickup/Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const currentStep = getStatusStep(order.status);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Order Tracking</h1>
          <p className="text-gray-600 mt-1">Order #{order._id}</p>
        </div>
        
        {/* Order Status */}
        <div className="px-6 py-8 border-b">
          <div className="relative">
            <div className="timeline-track">
              <div className="timeline-track-line"></div>
            </div>
            
            <div className="relative flex justify-between">
              {['pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`timeline-point ${
                      index <= currentStep ? 'timeline-point-complete' : 'timeline-point-incomplete'
                    } ${order.status === step ? 'timeline-point-current' : ''}`}
                  >
                    {index <= currentStep && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className={`timeline-label ${
                    index <= currentStep ? 'timeline-label-complete' : 'timeline-label-incomplete'
                  }`}>
                    {getStatusLabel(step)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold">
              {order.status === 'delivered' 
                ? 'Your order has been delivered' 
                : `Your order is ${order.status}`}
            </p>
            {order.estimatedDeliveryTime && order.status !== 'delivered' && (
              <p className="text-sm text-gray-600 mt-1">
                Estimated delivery by {formatDate(order.estimatedDeliveryTime)}
              </p>
            )}
          </div>
        </div>
        
        {/* Restaurant Info */}
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-lg mb-2">Restaurant</h2>
          <div className="flex items-start">
            <div>
              <p className="font-medium">{order.restaurant.name}</p>
              <p className="text-sm text-gray-600">{order.restaurant.address}</p>
              <p className="text-sm text-gray-600">{order.restaurant.phone}</p>
            </div>
          </div>
        </div>
        
        {/* Delivery Info */}
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-lg mb-2">Delivery Address</h2>
          <p className="text-gray-800">{order.deliveryAddress}</p>
        </div>
        
        {/* Order Items */}
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-lg mb-2">Order Items</h2>
          <div className="divide-y">
            {order.items.map((item, index) => (
              <div key={index} className="py-2 flex justify-between">
                <div>
                  <span className="font-medium">{item.quantity}x </span>
                  <span>{item.name}</span>
                </div>
                <div className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 flex justify-between">
          <Link to="/" className="text-primary-600 hover:underline">
            Return to Home
          </Link>
          
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button className="text-red-600 hover:underline">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
