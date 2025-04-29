import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import FMLogo from "../asserts/icons/FMLogo.png";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    permissions: {
      manageRestaurants: true,
      manageUsers: true,
      manageTransactions: true
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as admin
    const token = localStorage.getItem("admin_token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "You must be logged in as an admin to register new admins",
      }).then(() => {
        navigate("/admin/login");
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      if (name.startsWith("permissions.")) {
        const permissionName = name.split(".")[1];
        setFormData({
          ...formData,
          permissions: {
            ...formData.permissions,
            [permissionName]: checked
          }
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "Please make sure the passwords match.",
      });
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      
      const response = await axios.post(
        "http://localhost:5008/api/authAdmin/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          permissions: formData.permissions
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "New admin has been registered successfully.",
        confirmButtonText: "Continue",
      }).then(() => {
        navigate("/admin/dashboard");
      });
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.response?.data?.message || "An error occurred during registration",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pt-20 pb-10">
      <div className="flex flex-col items-center mb-8">
        <img src={FMLogo} alt="Food Mart Logo" className="w-20 h-20" />
        <h1 className="font-roboto text-4xl font-bold text-orange-500 mt-2">
          FOOD MART
        </h1>
        <h2 className="font-roboto text-xl font-semibold text-gray-700 mt-2">
          Register New Admin
        </h2>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Permissions</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manageRestaurants"
                  name="permissions.manageRestaurants"
                  checked={formData.permissions.manageRestaurants}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor="manageRestaurants" className="ml-2 block text-gray-700">
                  Manage Restaurants
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manageUsers"
                  name="permissions.manageUsers"
                  checked={formData.permissions.manageUsers}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor="manageUsers" className="ml-2 block text-gray-700">
                  Manage Users
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manageTransactions"
                  name="permissions.manageTransactions"
                  checked={formData.permissions.manageTransactions}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor="manageTransactions" className="ml-2 block text-gray-700">
                  Manage Transactions
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-300 flex justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Register Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
