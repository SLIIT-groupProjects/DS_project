/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatPrice = (amount, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Group menu items by category
 * @param {Array} items - Array of menu items
 * @returns {Object} Object with categories as keys and arrays of items as values
 */
export const groupByCategory = (items) => {
  return items.reduce((acc, item) => {
    // Default category if none provided
    const category = item.category || 'Other';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(item);
    return acc;
  }, {});
};

/**
 * Get a color for an order status
 * @param {string} status - The order status
 * @returns {string} Tailwind CSS color class
 */
export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'confirmed':
      return 'status-confirmed';
    case 'preparing':
      return 'status-preparing';
    case 'ready':
      return 'status-ready';
    case 'delivered':
      return 'status-delivered';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format a date
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Date(date).toLocaleString('en-US', mergedOptions);
};

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str || str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};
