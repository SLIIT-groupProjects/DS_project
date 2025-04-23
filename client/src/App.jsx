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
//delivery pages
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryRegister from "./pages/DeliveryRegister";
import DeliveryDashboard from "./pages/DeliveryDashboard";

const App = () => (
  <Router>
    <Navbar />
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex-grow">
        <Routes>
          {/* thisal routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/foods" element={<FoodList />} />
          <Route path="/foods/:id" element={<FoodDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />

          {/* vihara-delivery routes */}
          <Route path="/deliveryLogin" element={<DeliveryLogin />} />
          <Route path="/deliveryRegister" element={<DeliveryRegister />} />
          <Route path="/deliveryDashboard" element={<DeliveryDashboard />} />
        </Routes>
      </div>
      <Footer />
    </div>
  </Router>
);

export default App;
