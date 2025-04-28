import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import deliveryloginImg from "../assets/deliverylogin.png";
import { Link } from "react-router-dom";

const DeliveryLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5006/api/authDelivery/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("delivery_token", data.token);
        navigate("/deliveryDashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-300">
      <div className="bg-white p-6 rounded-xl shadow-lg flex w-3/5 overflow-hidden">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96">
          <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
          <button
            type="button"
            className="w-full mt-2 bg-white text-gray-800 border py-2 rounded hover:bg-gray-100"
          >
            <Link to="/deliveryRegister">Create an account</Link>
          </button>
        </form>

        {/*Image section*/}

        <div className="hidden md:block md:w-1/2 bg-gray-100">
          <img
            src={deliveryloginImg}
            alt="Register Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
