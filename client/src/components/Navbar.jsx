import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi"; // Icons
import FMLogo from "../asserts/icons/FMLogo.png";
import Swal from "sweetalert2";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (using token) when the component mounts
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Method to log out
  const handleLogout = () => {
    Swal.fire({
      title: "Logout!",
      text: "Do you need to logout?",
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
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
      }
    });
  };

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <nav className="bg-orange-500 fixed top-0 left-0 right-0 z-50 text-white p-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="https://res.cloudinary.com/fmart/image/upload/v1743634267/FMLogo_nktw1c.png"
          className="flex items-center"
        >
          <img src={FMLogo} alt="Logo" className="w-12 h-12 mr-2" />
          <span className="text-2xl font-bold">FOOD MART</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {isAuthPage ? (
            <>
              <Link to="/register" className="hover:text-gray-200 font-bold">
                SIGN UP
              </Link>
              <Link to="/login" className="hover:text-gray-200 font-bold">
                LOGIN
              </Link>
              <Link
                to="/deliveryLogin"
                className="hover:text-gray-200 font-bold"
              >
                DELIVERY
              </Link>
              <Link
                to="/restaurant/login"
                className="hover:text-gray-200 font-bold"
              >
                RESTAURANT
              </Link>
              <Link to="/admin/login" className="hover:text-gray-200 font-bold">
                ADMIN
              </Link>
            </>
          ) : isLoggedIn ? (
            <>
              <Link to="/foods" className="hover:text-gray-200 font-bold">
                HOME
              </Link>
              <Link to="/orders" className="hover:text-gray-200 font-bold">
                ORDERS
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-gray-200 font-bold"
              >
                LOGOUT
              </button>
              <Link
                to="/cart"
                className="hover:text-gray-200 flex items-center font-bold"
              >
                <FiShoppingCart className="ml-5 text-2xl" />
              </Link>
            </>
          ) : null}
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
          {isAuthPage ? (
            <>
              <Link
                to="/register"
                className="hover:text-gray-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                SIGN UP
              </Link>
              <Link
                to="/login"
                className="hover:text-gray-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                LOGIN
              </Link>
            </>
          ) : isLoggedIn ? (
            <>
              <Link
                to="/foods"
                className="hover:text-gray-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                HOME
              </Link>
              <Link
                to="/orders"
                className="hover:text-gray-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                ORDERS
              </Link>
              <Link
                to="/payments"
                className="hover:text-gray-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                PAYMENTS
              </Link>
              <Link
                to="/cart"
                className="hover:text-gray-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                CART
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="hover:text-gray-200 font-bold flex items-right"
              >
                LOGOUT
              </button>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
