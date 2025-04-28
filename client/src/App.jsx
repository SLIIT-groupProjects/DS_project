import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
//user pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import FoodList from "./pages/FoodList";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";

//delivery pages
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryRegister from "./pages/DeliveryRegister";
import DeliveryDashboard from "./pages/DeliveryDashboard";
//restaurant pages
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantRegister from "./pages/RestaurantRegister";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantProfileForm from "./pages/RestaurantProfileForm";
import MenuItemForm from "./pages/MenuItemForm";
//admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";

const App = () => {
  const isCustomerRoute = (path) => {
    const customerRoutes = [
      "/login",
      "/register",
      "/foods",
      "/cart",
      "/checkout",
      "/orders",
    ];
    return (
      customerRoutes.some((route) => path.startsWith(route)) || path === "/"
    );
  };

  const isRestaurantRoute = (path) => {
    return path.startsWith("/restaurant");
  };

  const isDeliveryRoute = (path) => {
    return path.startsWith("/delivery");
  };

  const isAdminRoute = (path) => {
    return path.startsWith("/admin");
  };

  return (
    <Router>
      {/* Conditionally render Navbar only for customer routes */}
      {isCustomerRoute(window.location.pathname) && <Navbar />}

      <div className="min-h-screen flex flex-col justify-between">
        <div className="flex-grow">
          <Routes>
            {/* Customer routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/foods" element={<FoodList />} />
            <Route path="/foods/:id" element={<FoodDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />

            {/* Payment routes */}
            <Route path="/payment" element={<Payment />} />

            {/* Delivery routes */}
            <Route path="/deliveryLogin" element={<DeliveryLogin />} />
            <Route path="/deliveryRegister" element={<DeliveryRegister />} />
            <Route path="/deliveryDashboard" element={<DeliveryDashboard />} />

            {/* Restaurant routes */}
            <Route path="/restaurant/login" element={<RestaurantLogin />} />
            <Route
              path="/restaurant/register"
              element={<RestaurantRegister />}
            />
            <Route
              path="/restaurant/dashboard"
              element={<RestaurantDashboard />}
            />
            <Route
              path="/restaurant/create-profile"
              element={<RestaurantProfileForm />}
            />
            <Route
              path="/restaurant/edit-profile"
              element={<RestaurantProfileForm />}
            />
            <Route path="/restaurant/add-item" element={<MenuItemForm />} />
            <Route
              path="/restaurant/edit-item/:itemId"
              element={<MenuItemForm />}
            />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/register" element={<AdminRegister />} />
          </Routes>
        </div>

        {/* Conditionally render Footer only for customer routes */}
        {isCustomerRoute(window.location.pathname) && <Footer />}
      </div>
    </Router>
  );
};

export default App;
