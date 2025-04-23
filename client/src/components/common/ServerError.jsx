import React, { useState, useEffect, useCallback } from 'react';

const ServerError = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Use useCallback to prevent recreation of the handler function on every render
  const handleServerError = useCallback((event) => {
    console.log("Server error event received:", event.detail);
    setErrorMessage(event.detail.message || 'Connection error');
    setIsVisible(true);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  }, []);

  useEffect(() => {
    // Listen for custom server error events
    window.addEventListener('server-error', handleServerError);
    
    // Check if server is available on component mount
    // Use the correct endpoint matching what we defined in the server
    fetch('/api/health-check')
      .catch(() => {
        // If health check fails, show error
        setErrorMessage('Server appears to be offline. Please try again later.');
        setIsVisible(true);
      });
    
    return () => {
      window.removeEventListener('server-error', handleServerError);
    };
  }, [handleServerError]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 top-4 flex justify-center z-50">
      <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <p className="font-medium">{errorMessage || 'Server connection error'}</p>
          <p className="text-sm">Please check your connection or try again later</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)} 
          className="ml-4 text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ServerError;
