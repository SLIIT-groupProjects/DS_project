// Authentication utility functions

// Store user data in localStorage
export const setUserToStorage = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Get user data from localStorage
export const getUserFromStorage = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Remove user data from localStorage (logout)
export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getUserFromStorage();
  return !!user && !!user.token;
};

// Check if user is an admin
export const isAdmin = () => {
  const user = getUserFromStorage();
  return user && user.role === 'admin';
};

// Check if user is a restaurant owner
export const isRestaurantOwner = () => {
  const user = getUserFromStorage();
  return user && user.role === 'restaurant_owner';
};

// Get dashboard path based on user role
export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'restaurant_owner':
      return '/restaurant-dashboard';
    default:
      return '/user-dashboard';
  }
};

// Get path to redirect to based on user role
export const getRedirectPathForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'restaurant_owner':
      return '/restaurant-dashboard';
    default:
      return '/user-dashboard';
  }
};

// Check if user role is correct for the route
export const hasRequiredRole = (allowedRoles) => {
  const user = getUserFromStorage();
  return user && allowedRoles.includes(user.role);
};

// Get user role
export const getUserRole = () => {
  const user = getUserFromStorage();
  return user ? user.role : null;
};

// Check if user can access dashboard
export const canAccessDashboard = (role) => {
  const userRole = getUserRole();
  switch (role) {
    case 'user':
      return userRole === 'user';
    case 'restaurant_owner':
      return userRole === 'restaurant_owner';
    case 'admin':
      return userRole === 'admin';
    default:
      return false;
  }
};
