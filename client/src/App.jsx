import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryRegister from "./pages/DeliveryRegister";
import DeliveryDashboard from "./pages/DeliveryDashboard";

const App = () => (
  <Router>
    <Routes>
      <Route path="/deliveryLogin" element={<DeliveryLogin />} />
      <Route path="/deliveryRegister" element={<DeliveryRegister />} />
      <Route path="/deliveryDashboard" element={<DeliveryDashboard />} />
    </Routes>
  </Router>
);

export default App;
