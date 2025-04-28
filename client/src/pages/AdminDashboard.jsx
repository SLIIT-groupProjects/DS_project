import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FiUsers, FiShoppingBag, FiCheckCircle, FiXCircle, FiDollarSign, FiLogOut, FiRefreshCw } from "react-icons/fi";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("restaurants");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantOwners, setRestaurantOwners] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FOOD MART | Admin Dashboard";
    checkAuthentication();
    fetchData();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      
      const [restaurantsRes, ownersRes, pendingRes, usersRes, transactionsRes] = await Promise.all([
        axios.get("http://localhost:5008/api/admin/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5008/api/admin/restaurant-owners", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5008/api/admin/pending-verifications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5008/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5008/api/admin/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRestaurants(restaurantsRes.data);
      setRestaurantOwners(ownersRes.data);
      setPendingVerifications(pendingRes.data);
      setUsers(usersRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Data",
        text: "There was an error loading the dashboard data.",
      });
    } finally {
      setLoading(false);
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
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        navigate("/admin/login");
      }
    });
  };

  const verifyRestaurant = async (restaurantId) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `http://localhost:5008/api/admin/restaurants/${restaurantId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      Swal.fire({
        icon: "success",
        title: "Restaurant Verified",
        text: "The restaurant has been successfully verified.",
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error verifying restaurant:", error);
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: "Failed to verify the restaurant.",
      });
    }
  };

  const verifyRestaurantOwner = async (ownerId) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `http://localhost:5008/api/admin/restaurant-owners/${ownerId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      Swal.fire({
        icon: "success",
        title: "Owner Verified",
        text: "The restaurant owner has been successfully verified.",
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error verifying owner:", error);
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: "Failed to verify the restaurant owner.",
      });
    }
  };

  const updateTransactionStatus = async (transactionId, status) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `http://localhost:5008/api/admin/transactions/${transactionId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      Swal.fire({
        icon: "success",
        title: "Transaction Updated",
        text: `The transaction status has been updated to ${status}.`,
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update the transaction status.",
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    const AdminActions = () => (
      <div className="flex justify-end mb-6">
        <Link 
          to="/admin/register" 
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300 flex items-center"
        >
          <span className="mr-2">+</span> Register New Admin
        </Link>
      </div>
    );

    switch (activeSection) {
      case "restaurants":
        return (
          <div>
            <AdminActions />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Restaurant Management</h2>
              <button
                onClick={fetchData}
                className="flex items-center text-orange-500 hover:text-orange-700 transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Name</th>
                      <th className="py-3 px-6 text-left">Owner</th>
                      <th className="py-3 px-6 text-left">Email</th>
                      <th className="py-3 px-6 text-left">Phone</th>
                      <th className="py-3 px-6 text-left">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {restaurants.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 px-6 text-center">
                          No restaurants found
                        </td>
                      </tr>
                    ) : (
                      restaurants.map((restaurant) => (
                        <tr key={restaurant._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            {restaurant.name}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {restaurant.owner?.name || 'No owner assigned'}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {restaurant.email}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {restaurant.phone}
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              restaurant.isVerified ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                            }`}>
                              {restaurant.isVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            {!restaurant.isVerified && (
                              <button
                                onClick={() => verifyRestaurant(restaurant._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case "owners":
        return (
          <div>
            <AdminActions />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Restaurant Owners</h2>
              <button
                onClick={fetchData}
                className="flex items-center text-orange-500 hover:text-orange-700 transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Name</th>
                      <th className="py-3 px-6 text-left">Email</th>
                      <th className="py-3 px-6 text-left">Phone</th>
                      <th className="py-3 px-6 text-left">Verification Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {restaurantOwners.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-6 text-center">
                          No restaurant owners found
                        </td>
                      </tr>
                    ) : (
                      restaurantOwners.map((owner) => (
                        <tr key={owner._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            {owner.name}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {owner.email}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {owner.phone}
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              owner.isVerified ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                            }`}>
                              {owner.isVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            {!owner.isVerified && (
                              <button
                                onClick={() => verifyRestaurantOwner(owner._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case "verifications":
        return (
          <div>
            <AdminActions />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Pending Verifications</h2>
              <button
                onClick={fetchData}
                className="flex items-center text-orange-500 hover:text-orange-700 transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
            
            {pendingVerifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No pending verifications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingVerifications.map((owner) => (
                  <div key={owner._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{owner.name}</h3>
                        <p className="text-gray-600">{owner.email}</p>
                        <p className="text-gray-600">{owner.phone}</p>
                        <p className="text-gray-600 mt-2">Registration Date: {new Date(owner.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => verifyRestaurantOwner(owner._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
                      >
                        Verify Owner
                      </button>
                    </div>
                    
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Verification Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {owner.verificationDocuments?.businessLicense && (
                          <div className="border rounded-md p-3">
                            <p className="font-medium text-sm mb-1">Business License</p>
                            <a 
                              href={owner.verificationDocuments.businessLicense} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-words text-sm"
                            >
                              {owner.verificationDocuments.businessLicense}
                            </a>
                          </div>
                        )}
                        
                        {owner.verificationDocuments?.identityProof && (
                          <div className="border rounded-md p-3">
                            <p className="font-medium text-sm mb-1">Identity Proof</p>
                            <a 
                              href={owner.verificationDocuments.identityProof} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-words text-sm"
                            >
                              {owner.verificationDocuments.identityProof}
                            </a>
                          </div>
                        )}
                        
                        {owner.verificationDocuments?.addressProof && (
                          <div className="border rounded-md p-3">
                            <p className="font-medium text-sm mb-1">Address Proof</p>
                            <a 
                              href={owner.verificationDocuments.addressProof} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-words text-sm"
                            >
                              {owner.verificationDocuments.addressProof}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case "users":
        return (
          <div>
            <AdminActions />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button
                onClick={fetchData}
                className="flex items-center text-orange-500 hover:text-orange-700 transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Name</th>
                      <th className="py-3 px-6 text-left">Email</th>
                      <th className="py-3 px-6 text-left">Address</th>
                      <th className="py-3 px-6 text-left">Phone</th>
                      <th className="py-3 px-6 text-center">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-6 text-center">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            {user.name}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {user.email}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {user.address}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {user.phone}
                          </td>
                          <td className="py-3 px-6 text-center">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case "transactions":
        return (
          <div>
            <AdminActions />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Transactions</h2>
              <button
                onClick={fetchData}
                className="flex items-center text-orange-500 hover:text-orange-700 transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Transaction ID</th>
                      <th className="py-3 px-6 text-left">Restaurant</th>
                      <th className="py-3 px-6 text-left">Order ID</th>
                      <th className="py-3 px-6 text-right">Amount</th>
                      <th className="py-3 px-6 text-right">Platform Fee</th>
                      <th className="py-3 px-6 text-right">Restaurant Amount</th>
                      <th className="py-3 px-6 text-left">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-4 px-6 text-center">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            {transaction._id.substring(0, 8)}...
                          </td>
                          <td className="py-3 px-6 text-left">
                            {transaction.restaurantId?.name || "Unknown"}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {transaction.orderId?._id.substring(0, 8) || "Unknown"}...
                          </td>
                          <td className="py-3 px-6 text-right">
                            Rs. {transaction.amount}
                          </td>
                          <td className="py-3 px-6 text-right">
                            Rs. {transaction.platformFee}
                          </td>
                          <td className="py-3 px-6 text-right">
                            Rs. {transaction.restaurantAmount}
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === "completed" ? "bg-green-200 text-green-800" :
                              transaction.status === "pending" ? "bg-yellow-200 text-yellow-800" :
                              transaction.status === "failed" ? "bg-red-200 text-red-800" :
                              "bg-blue-200 text-blue-800"
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            {transaction.status === "pending" && (
                              <div className="flex space-x-1 justify-center">
                                <button
                                  onClick={() => updateTransactionStatus(transaction._id, "completed")}
                                  className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                                  title="Mark as Completed"
                                >
                                  <FiCheckCircle />
                                </button>
                                <button
                                  onClick={() => updateTransactionStatus(transaction._id, "failed")}
                                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                  title="Mark as Failed"
                                >
                                  <FiXCircle />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
        <div className="w-full md:w-64 bg-gray-800 text-white md:min-h-screen">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm opacity-75">
              FOOD MART Management
            </p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("restaurants")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "restaurants"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FiShoppingBag className="mr-3" />
                  Restaurants
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("owners")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "owners"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FiUsers className="mr-3" />
                  Restaurant Owners
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("verifications")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "verifications"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FiCheckCircle className="mr-3" />
                  Pending Verifications
                  {pendingVerifications.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {pendingVerifications.length}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("users")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "users"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FiUsers className="mr-3" />
                  Customers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("transactions")}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeSection === "transactions"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FiDollarSign className="mr-3" />
                  Transactions
                </button>
              </li>
              <li className="pt-4 mt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;