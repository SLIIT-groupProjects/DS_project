import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromStorage, isRestaurantOwner } from '../utils/auth';
import api from '../services/api';

const RestaurantMenuManagement = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newlyAddedItems, setNewlyAddedItems] = useState([]); // Add state for newly added items
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserFromStorage();
    if (!user || !isRestaurantOwner()) {
      navigate('/login');
      return;
    }

    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/restaurants/my-restaurant`);
        setRestaurant(response.data);
        setMenuItems(response.data.menu || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set((response.data.menu || [])
          .map(item => item.category)
          .filter(Boolean))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load restaurant data');
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/restaurants/${restaurant._id}/menu`, formData);
      setMenuItems([...menuItems, response.data]);
      
      // Add to newly added items
      setNewlyAddedItems([...newlyAddedItems, response.data]);
      
      // Update categories if needed
      if (!categories.includes(formData.category)) {
        setCategories([...categories, formData.category]);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true
      });
      
      // Scroll to newly added items section
      setTimeout(() => {
        document.getElementById('newly-added-items')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add menu item');
    }
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(
        `/restaurants/${restaurant._id}/menu/${currentItem._id}`, 
        formData
      );
      setMenuItems(menuItems.map(item => 
        item._id === currentItem._id ? response.data : item
      ));
      
      // Update categories if needed
      if (!categories.includes(formData.category)) {
        setCategories([...categories, formData.category]);
      }
      
      setEditMode(false);
      setCurrentItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/restaurants/${restaurant._id}/menu/${itemId}`);
        const updatedItems = menuItems.filter(item => item._id !== itemId);
        setMenuItems(updatedItems);
        
        // Update categories
        const updatedCategories = [...new Set(updatedItems
          .map(item => item.category)
          .filter(Boolean))];
        setCategories(updatedCategories);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete menu item');
      }
    }
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable
    });
    setEditMode(true);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCurrentItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true
    });
  };

  const handleToggleItemAvailability = async (itemId, currentStatus) => {
    try {
      const response = await api.patch(
        `/restaurants/${restaurant._id}/menu/${itemId}/toggle-availability`,
        { isAvailable: !currentStatus }
      );
      
      setMenuItems(menuItems.map(item => 
        item._id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item availability');
    }
  };

  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  const clearNewlyAddedItems = () => {
    setNewlyAddedItems([]);
  };

  const menuByCategory = groupByCategory(menuItems);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <button 
          onClick={() => navigate('/restaurant-dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Add/Edit Menu Item Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>
        <form onSubmit={editMode ? handleUpdateMenuItem : handleAddMenuItem}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  list="categories"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <datalist id="categories">
                  {categories.map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                Item is available
              </label>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {editMode ? 'Update Item' : 'Add Item'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Menu Items List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Menu Items</h2>

        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items yet. Add your first item above.</p>
        ) : (
          <>
            {Object.keys(menuByCategory).map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium border-b pb-2 mb-4">{category}</h3>
                <div className="space-y-4">
                  {menuByCategory[category].map(item => (
                    <div key={item._id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {!item.isAvailable && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Unavailable
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <p className="text-primary-600 mt-1">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleToggleItemAvailability(item._id, item.isAvailable)}
                          className={`text-sm ${item.isAvailable ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* Newly Added Items Section */}
      {newlyAddedItems.length > 0 && (
        <div id="newly-added-items" className="mt-8 bg-green-50 shadow-md rounded-lg p-6 border border-green-200 animate-pulse-custom">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-800">Recently Added Items</h2>
            <button 
              onClick={clearNewlyAddedItems}
              className="text-sm text-green-700 hover:text-green-900"
            >
              Dismiss
            </button>
          </div>
          
          <div className="space-y-4">
            {newlyAddedItems.map(item => (
              <div key={item._id} className="flex items-center justify-between border-b border-green-200 pb-4 transition-all duration-300 ease-in-out">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {!item.isAvailable && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <p className="text-primary-600 mt-1">${parseFloat(item.price).toFixed(2)}</p>
                  <p className="text-xs text-green-700 mt-1">Category: {item.category}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuManagement;
