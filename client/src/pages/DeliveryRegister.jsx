import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import deliverRegisterImg from "../assets/register-deliver.png";

const DeliveryRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const geoRes = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          formData.address
        )}&key=682e454929d744eabc0664d2e4b9daac`
      );
      const geoData = await geoRes.json();

      if (!geoData.results.length) {
        alert("Invalid address. Please enter a valid location.");
        return;
      }

      const { lat, lng } = geoData.results[0].geometry;

      const res = await fetch(
        "http://localhost:5002/api/authDelivery/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            location: { lat, lng },
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/deliveryDashboard");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-300">
      <div className="bg-white p-6 rounded-xl shadow-lg flex w-3/5 overflow-hidden">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Register Delivery Person
          </h2>
          {["name", "email", "phone", "password", "address"].map((field, i) => (
            <input
              key={i}
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              required
              className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Account
          </button>
          <button
            type="button"
            className="w-full mt-2 bg-white text-gray-800 border py-2 rounded hover:bg-gray-100"
          >
            <Link to="/deliveryLogin">Login</Link>
          </button>
        </form>

        {/*Image section*/}

        <div className="hidden md:block md:w-1/2 bg-gray-100">
          <img
            src={deliverRegisterImg}
            alt="Register Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegister;
