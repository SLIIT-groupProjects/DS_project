import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import FMLogo from "../asserts/icons/FMLogo.png";
import Swal from "sweetalert2";

const DeliveryNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Logout!",
      text: "Do you want to logout from Delivery account?",
      icon: "question",
      confirmButtonText: "Yes. Logout!",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        cancelButton:
          "w-[400px] bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("delivery_token");
        navigate("/deliveryLogin");
      }
    });
  };

  return (
    <nav className="bg-orange-500 fixed top-0 left-0 right-0 z-50 text-white p-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/deliveryDashboard" className="flex items-center">
          <img src={FMLogo} alt="Logo" className="w-12 h-12 mr-2" />
          <span className="text-2xl font-bold">FOOD MART</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <button
            onClick={handleLogout}
            className="hover:text-gray-200 font-bold"
          >
            LOGOUT
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-orange-500 text-white p-4 flex flex-col space-y-2">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="hover:text-gray-200 font-bold"
          >
            LOGOUT
          </button>
        </div>
      )}
    </nav>
  );
};

export default DeliveryNavbar;
