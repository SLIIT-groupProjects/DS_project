import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import FMLogo from "../asserts/icons/FMLogo.png";

const RestaurantRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationDocuments: {
      businessLicense: "",
      identityProof: "",
      addressProof: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure your passwords match.",
        confirmButtonText: "Try Again",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5007/api/authRestaurant/register",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          verificationDocuments: formData.verificationDocuments,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Your account is pending verification. You can login to check your status.",
        confirmButtonText: "Continue to Login",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      }).then(() => {
        navigate("/restaurant/login");
      });
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "An error occurred during registration",
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
          Restaurant Partner Registration
        </h2>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Restaurant Owner Name
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
              htmlFor="phone"
              className="block text-gray-700 font-medium mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
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

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Verification Documents
            </h3>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="businessLicense"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Business License (URL)
                </label>
                <input
                  type="text"
                  id="businessLicense"
                  name="verificationDocuments.businessLicense"
                  value={formData.verificationDocuments.businessLicense}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="https://example.com/license.pdf"
                />
              </div>

              <div>
                <label
                  htmlFor="identityProof"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Identity Proof (URL)
                </label>
                <input
                  type="text"
                  id="identityProof"
                  name="verificationDocuments.identityProof"
                  value={formData.verificationDocuments.identityProof}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="https://example.com/identity.pdf"
                />
              </div>

              <div>
                <label
                  htmlFor="addressProof"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Address Proof (URL)
                </label>
                <input
                  type="text"
                  id="addressProof"
                  name="verificationDocuments.addressProof"
                  value={formData.verificationDocuments.addressProof}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="https://example.com/address.pdf"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-300 flex justify-center mt-6"
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
              "Register"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have a restaurant account?{" "}
            <Link
              to="/restaurant/login"
              className="text-orange-500 hover:text-orange-600"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegister;
