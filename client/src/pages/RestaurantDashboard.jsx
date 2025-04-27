import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FiPlus, FiEdit2, FiTrash2, FiSettings, FiMenu, FiShoppingBag, FiHome, FiLogOut, FiToggleLeft, FiToggleRight } from "react-icons/fi";

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "FOOD MART | Restaurant Dashboard";
    checkAuthentication();
    fetchRestaurantData();
    fetchMenuItems();
    fetchOrders();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem("restaurant_token");
    if (!token) {
      navigate("/restaurant/login");
    }
  };

  const fetchRestaurantData = async () => {
    try {
      const token = localStorage.getItem("restaurant_token");
      const response = await axios.get("http://localhost:5007/api/restaurants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRestaurant(response.data);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem("restaurant_token");
      const response = await axios.get("http://localhost:5007/api/menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("restaurant_token");
      const response = await axios.get("http://localhost:5007/api/restaurants/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff5a1f",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("restaurant_token");
        localStorage.removeItem("restaurant_user");
        navigate("/restaurant/login");
      }
    });
  };

  const toggleRestaurantAvailability = async () => {
    try {
      const token = localStorage.getItem("restaurant_token");
      const response = await axios.put(
        "http://localhost:5007/api/restaurants/availability",
        {
          isAvailable: !restaurant.isAvailable,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRestaurant(response.data.restaurant);
      
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Your restaurant is now ${response.data.restaurant.isAvailable ? "available" : "unavailable"} for orders.`,
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update restaurant availability.",
      });
    }
  };

  const toggleMenuItemAvailability = async (itemId, currentAvailability) => {
    try {
      const token = localStorage.getItem("restaurant_token");
      const response = await axios.patch(
        `http://localhost:5007/api/menu/${itemId}/availability`,
        {
          isAvailable: !currentAvailability,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setMenuItems(menuItems.map(item => 
        item._id === itemId ? response.data.menuItem : item
      ));
      
      Swal.fire({
        icon: "success",
        title: "Item Updated",
        text: `Menu item is now ${response.data.menuItem.isAvailable ? "available" : "unavailable"}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update menu item availability.",
      });
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      Swal.fire({
        title: "Delete Menu Item",
        text: "Are you sure you want to delete this menu item? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const token = localStorage.getItem("restaurant_token");
          await axios.delete(`http://localhost:5007/api/menu/${itemId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Update local state
          setMenuItems(menuItems.filter(item => item._id !== itemId));
          
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Menu item has been deleted.",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete menu item.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            
            {restaurant && !restaurant.isVerified && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                <p className="font-bold">Account Pending Verification</p>
                <p>Your restaurant is pending verification by the admin. Some features may be limited until verification is complete.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">Menu Items</h3>
                <p className="text-3xl font-bold text-orange-500">{menuItems.length}</p>
                <p className="text-gray-500 mt-2">Total menu items</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">Orders</h3>
                <p className="text-3xl font-bold text-orange-500">{orders.length}</p>
                <p className="text-gray-500 mt-2">Total orders</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">Restaurant Status</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${restaurant?.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-xl font-medium">{restaurant?.isAvailable ? 'Available' : 'Unavailable'}</p>
                </div>
                <button 
                  onClick={toggleRestaurantAvailability}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
                >
                  Toggle Availability
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
              
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Order ID</th>
                        <th className="py-3 px-6 text-left">Customer</th>
                        <th className="py-3 px-6 text-left">Status</th>
                        <th className="py-3 px-6 text-right">Total</th>
                        <th className="py-3 px-6 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {orders.slice(0, 5).map(order => (
                        <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left whitespace-nowrap">
                            <span className="font-medium">{order._id.substring(0, 8)}...</span>
                          </td>
                          <td className="py-3 px-6 text-left">
                            {order.address.substring(0, 20)}...
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "delivered" ? "bg-green-200 text-green-800" :
                              order.status === "pending" ? "bg-yellow-200 text-yellow-800" :
                              "bg-blue-200 text-blue-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            Rs. {order.totalPayable}
                          </td>
                          <td className="py-3 px-6 text-right">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {orders.length > 5 && (
                <div className="mt-4 text-right">
                  <button 
                    onClick={() => setActiveSection("orders")}
                    className="text-orange-500 hover:text-orange-700 font-medium"
                  >
                    View All Orders
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case "menu":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Link 
                to="/restaurant/add-item" 
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300 flex items-center"
              >
                <FiPlus className="mr-2" /> Add New Item
              </Link>
            </div>
            
            {menuItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't added any menu items yet.</p>
                <Link 
                  to="/restaurant/add-item" 
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
                >
                  Add Your First Menu Item
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={item.name} 
                        className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.isAvailable ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      <p className="text-lg font-bold text-orange-500 mb-3">Rs. {item.price}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/restaurant/edit-item/${item._id}`)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                            title="Edit Item"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => deleteMenuItem(item._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            title="Delete Item"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        <button 
                          onClick={() => toggleMenuItemAvailability(item._id, item.isAvailable)}
                          className={`flex items-center text-sm font-medium ${
                            item.isAvailable ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <FiToggleRight className="mr-1" size={16} />
                              Mark Unavailable
                            </>
                          ) : (
                            <>
                              <FiToggleLeft className="mr-1" size={16} />
                              Mark Available
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case "orders":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order Management</h2>
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No orders received yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Order ID</th>
                        <th className="py-3 px-6 text-left">Customer</th>
                        <th className="py-3 px-6 text-left">Items</th>
                        <th className="py-3 px-6 text-left">Status</th>
                        <th className="py-3 px-6 text-right">Total</th>
                        <th className="py-3 px-6 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {orders.map(order => (
                        <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left whitespace-nowrap">
                            <span className="font-medium">{order._id.substring(0, 8)}...</span>
                          </td>
                          <td className="py-3 px-6 text-left">
                            <div>
                              <p className="font-medium">{order.address.substring(0, 20)}...</p>
                              <p className="text-xs text-gray-500">{order.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            <div className="text-xs">
                              {order.items.map((item, index) => (
                                <p key={index} className="mb-1">
                                  {item.quantity}x {item.name} ({item.size})
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "delivered" ? "bg-green-200 text-green-800" :
                              order.status === "pending" ? "bg-yellow-200 text-yellow-800" :
                              "bg-blue-200 text-blue-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            Rs. {order.totalPayable}
                          </td>
                          <td className="py-3 px-6 text-right">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
        
      case "profile":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Restaurant Profile</h2>
            
            {restaurant ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0">
                    <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                      {restaurant.logo ? (
                        <img 
                          src={restaurant.logo} 
                          alt={restaurant.name} 
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <FiSettings className="w-12 h-12 mx-auto mb-2" />
                          <p>No Logo Available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <button 
                        onClick={() => navigate("/restaurant/edit-profile")}
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center"
                      >
                        <FiEdit2 className="mr-2" /> Edit Profile
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 md:pl-6">
                    <h3 className="text-xl font-semibold mb-4">{restaurant.name}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 font-medium">Email</p>
                        <p>{restaurant.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Phone</p>
                        <p>{restaurant.phone}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Address</p>
                        <p>{restaurant.address}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Cuisine</p>
                        <p>{restaurant.cuisine}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Status</p>
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${restaurant.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <p>{restaurant.isAvailable ? 'Available' : 'Unavailable'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Verification</p>
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${restaurant.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          <p>{restaurant.isVerified ? 'Verified' : 'Pending Verification'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">Opening Hours</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {restaurant.openingHours && Object.entries(restaurant.openingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between border-b pb-1">
                            <span className="capitalize">{day}</span>
                            <span>{hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't set up your restaurant profile yet.</p>
                <Link 
                  to="/restaurant/create-profile" 
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
                >
                  Set Up Your Restaurant
                </Link>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Invalid section</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-orange-500 text-white md:min-h-screen">
          <div className="p-4 border-b border-orange-400">
            <h1 className="text-xl font-bold">Restaurant Dashboard</h1>
            <p className="text-sm opacity-75">
              {restaurant ? restaurant.name : "Welcome back!"}
            </p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "dashboard"
                      ? "bg-orange-600 text-white"
                      : "hover:bg-orange-400"
                  }`}
                >
                  <FiHome className="mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("menu")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "menu"
                      ? "bg-orange-600 text-white"
                      : "hover:bg-orange-400"
                  }`}
                >
                  <FiMenu className="mr-3" />
                  Menu Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("orders")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "orders"
                      ? "bg-orange-600 text-white"
                      : "hover:bg-orange-400"
                  }`}
                >
                  <FiShoppingBag className="mr-3" />
                  Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "profile"
                      ? "bg-orange-600 text-white"
                      : "hover:bg-orange-400"
                  }`}
                >
                  <FiSettings className="mr-3" />
                  Restaurant Profile
                </button>
              </li>
              <li className="pt-4 mt-4 border-t border-orange-400">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 rounded-md hover:bg-orange-400 transition-colors duration-200"
                >
                  <FiLogOut className="mr-3" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
