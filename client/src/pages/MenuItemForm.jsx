import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeftIcon } from "@heroicons/react/solid";

const MenuItemForm = () => {
  const { itemId } = useParams();
  const isEditing = !!itemId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    sizes: ["Regular", "Large"],
    prepTime: 15,
    specialDiet: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
    },
    isAvailable: true,
  });

  useEffect(() => {
    document.title = isEditing
      ? "FOOD MART | Edit Menu Item"
      : "FOOD MART | Add Menu Item";

    if (isEditing) {
      fetchMenuItemData();
    }
  }, [isEditing, itemId]);

  const fetchMenuItemData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("restaurant_token");
      
      // First get all menu items
      const response = await axios.get("http://localhost:5007/api/menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Find the specific menu item by ID
      const menuItem = response.data.find(item => item._id === itemId);
      
      if (!menuItem) {
        throw new Error("Menu item not found");
      }
      
      setFormData({
        name: menuItem.name || "",
        description: menuItem.description || "",
        price: menuItem.price || "",
        category: menuItem.category || "",
        imageUrl: menuItem.imageUrl || "",
        sizes: menuItem.sizes || ["Regular", "Large"],
        prepTime: menuItem.prepTime || 15,
        specialDiet: menuItem.specialDiet || {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
        },
        isAvailable: typeof menuItem.isAvailable === 'boolean' ? menuItem.isAvailable : true,
      });
    } catch (error) {
      console.error("Error fetching menu item:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Could not load menu item data.",
      }).then(() => {
        navigate("/restaurant/dashboard");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      if (name.startsWith("specialDiet.")) {
        const dietProperty = name.split(".")[1];
        setFormData((prevData) => ({
          ...prevData,
          specialDiet: {
            ...prevData.specialDiet,
            [dietProperty]: checked,
          },
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
        }));
      }
    } else if (name === "price" || name === "prepTime") {
      // Ensure these are numbers
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "number" ? parseInt(value, 10) : parseFloat(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSizeChange = (index, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = value;
    setFormData({
      ...formData,
      sizes: newSizes,
    });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, ""],
    });
  };

  const removeSize = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      sizes: newSizes,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("restaurant_token");
      const submitData = {
        ...formData,
        price: Number(formData.price),
        prepTime: Number(formData.prepTime),
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:5007/api/menu/${itemId}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        Swal.fire({
          icon: "success",
          title: "Menu Item Updated",
          text: "The menu item has been updated successfully.",
        }).then(() => {
          navigate("/restaurant/dashboard");
        });
      } else {
        // Use the correct endpoint
        await axios.post(
          "http://localhost:5007/api/menu",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        Swal.fire({
          icon: "success",
          title: "Menu Item Added",
          text: "The menu item has been added successfully.",
        }).then(() => {
          navigate("/restaurant/dashboard");
        });
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      
      // Add more detailed error handling
      let errorMessage = "Failed to save menu item.";
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading menu item data...</p>
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
              {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Item Name*
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
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Category*
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Appetizer, Main Course, Dessert"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                  Price (Rs.)*
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label htmlFor="prepTime" className="block text-gray-700 font-medium mb-2">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Describe the dish, ingredients, flavors, etc."
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
                Image URL*
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="https://example.com/food-image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a URL to the food item image
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Sizes
              </label>
              <div className="space-y-3">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Size name (e.g., Small, Medium, Large)"
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSize}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Size
                </button>
                
                <p className="text-sm text-gray-500">
                  Add different size options for this menu item
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-700 font-medium mb-3">Dietary Options</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    name="specialDiet.isVegetarian"
                    checked={formData.specialDiet.isVegetarian}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isVegetarian" className="ml-2 block text-gray-700">
                    Vegetarian
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVegan"
                    name="specialDiet.isVegan"
                    checked={formData.specialDiet.isVegan}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isVegan" className="ml-2 block text-gray-700">
                    Vegan
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isGlutenFree"
                    name="specialDiet.isGlutenFree"
                    checked={formData.specialDiet.isGlutenFree}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isGlutenFree" className="ml-2 block text-gray-700">
                    Gluten Free
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-gray-700 font-medium">
                Item is Available for Order
              </label>
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
                  `${isEditing ? "Update" : "Add"} Menu Item`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;
