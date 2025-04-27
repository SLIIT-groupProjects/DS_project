import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeftIcon } from "@heroicons/react/solid";

const RestaurantProfileForm = () => {
  const { action } = useParams();
  const isEditing = action === "edit-profile";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    cuisine: "",
    logo: "",
    openingHours: {
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
      sunday: { open: "", close: "" },
    },
  });

  useEffect(() => {
    document.title = isEditing
      ? "FOOD MART | Edit Restaurant Profile"
      : "FOOD MART | Create Restaurant Profile";

    if (isEditing) {
      fetchRestaurantData();
    }
  }, [isEditing]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("restaurant_token");
      const response = await axios.get("http://localhost:5007/api/restaurants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const restaurant = response.data;
      
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        cuisine: restaurant.cuisine || "",
        logo: restaurant.logo || "",
        openingHours: restaurant.openingHours || {
          monday: { open: "", close: "" },
          tuesday: { open: "", close: "" },
          wednesday: { open: "", close: "" },
          thursday: { open: "", close: "" },
          friday: { open: "", close: "" },
          saturday: { open: "", close: "" },
          sunday: { open: "", close: "" },
        },
      });
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Could not load restaurant profile data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      openingHours: {
        ...prevData.openingHours,
        [day]: {
          ...prevData.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("restaurant_token");
      
      if (isEditing) {
        await axios.put(
          "http://localhost:5007/api/restaurants",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your restaurant profile has been updated successfully.",
        }).then(() => {
          navigate("/restaurant/dashboard");
        });
      } else {
        await axios.post(
          "http://localhost:5007/api/restaurants",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        Swal.fire({
          icon: "success",
          title: "Profile Created",
          text: "Your restaurant profile has been created successfully.",
        }).then(() => {
          navigate("/restaurant/dashboard");
        });
      }
    } catch (error) {
      console.error("Error saving restaurant profile:", error);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: error.response?.data?.message || "Failed to save restaurant profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate("/restaurant/dashboard")}
          className="mb-6 flex items-center text-orange-500 hover:text-orange-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-orange-500 px-6 py-4">
            <h1 className="text-xl font-bold text-white">
              {isEditing ? "Edit Restaurant Profile" : "Create Restaurant Profile"}
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Restaurant Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label htmlFor="cuisine" className="block text-gray-700 font-medium mb-2">
                  Cuisine Type*
                </label>
                <input
                  type="text"
                  id="cuisine"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g., Italian, Indian, Chinese"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                Address*
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            
            <div>
              <label htmlFor="logo" className="block text-gray-700 font-medium mb-2">
                Logo URL
              </label>
              <input
                type="text"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a URL to your restaurant logo image
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Opening Hours</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {days.map((day) => (
                  <div key={day} className="border rounded-lg p-4">
                    <p className="font-medium capitalize mb-2">{day}</p>
                    
                    <div className="flex space-x-2">
                      <div>
                        <label htmlFor={`${day}-open`} className="block text-sm text-gray-600 mb-1">
                          Open
                        </label>
                        <input
                          type="time"
                          id={`${day}-open`}
                          value={formData.openingHours[day].open}
                          onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`${day}-close`} className="block text-sm text-gray-600 mb-1">
                          Close
                        </label>
                        <input
                          type="time"
                          id={`${day}-close`}
                          value={formData.openingHours[day].close}
                          onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Leave both fields empty for days when the restaurant is closed.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/restaurant/dashboard")}
                className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Saving...
                  </span>
                ) : (
                  `${isEditing ? "Update" : "Create"} Profile`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfileForm;
