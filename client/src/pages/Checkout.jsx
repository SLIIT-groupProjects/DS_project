import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../components/Button";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import FMLogo from "../asserts/icons/FMLogo.png";

const Checkout = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ address: "", phone: "" });
  const [cart, setCart] = useState({ items: [], totalPayable: 0 });
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    document.title = "FOOD MART | Checkout";
    const fetchCustomerDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            title: "Error",
            text: "You need to login first!",
            icon: "error",
            confirmButtonText: "Okay",
            customClass: {
              confirmButton:
                "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
            },
            buttonsStyling: false,
          });
          navigate("/login");
          return;
        }

        const res = await axios.get(
          "http://localhost:5002/api/auth/customers/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCustomer(res.data);
      } catch (error) {
        console.error("Error fetching customer details: ", error);
        Swal.fire({
          title: "Error",
          text: "Could not fetch customer details",
          icon: "error",
          confirmButtonText: "Try Again!",
          customClass: {
            confirmButton:
              "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
          },
          buttonsStyling: false,
        });
      }
    };

    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            title: "Error",
            text: "You need to login first!",
            icon: "error",
            confirmButtonText: "Okay",
            customClass: {
              confirmButton:
                "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
            },
            buttonsStyling: false,
          });
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5004/api/cart/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
      } catch (error) {
        console.error("Error fetching cart: ", error);
        Swal.fire({
          title: "Error",
          text: "Could not fetch cart",
          icon: "error",
          confirmButtonText: "Try Again!",
          customClass: {
            confirmButton:
              "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
          },
          buttonsStyling: false,
        });
      }
    };

    fetchCustomerDetails();
    fetchCart();
  }, [navigate]);

  const handleConfirmOrder = async () => {
    if (deliveryOption === "schedule" && (!scheduledDate || !scheduledTime)) {
      Swal.fire({
        title: "Error",
        text: "Please select date and time for scheduled delivery",
        icon: "error",
        confirmButtonText: "Okay",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
      return;
    }

    const orderData = {
      address: customer.address,
      phone: customer.phone,
      deliveryOption,
      scheduledDate,
      scheduledTime,
    };

    console.log("🛒 Order Data Being Sent:", orderData);
    try {
      // Confirm order and save it in the db
      const response = await axios.post(
        "http://localhost:5005/api/orders/confirm",
        orderData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const orderId = response.data.orderId;

      Swal.fire({
        title: "Rate Our Service!",
        html: `
                    <div class="star-rating text-gray-400 cursor-pointer text-4xl">
                        <span class="star" data-value="1">★</span>
                        <span class="star" data-value="2">★</span>
                        <span class="star" data-value="3">★</span>
                        <span class="star" data-value="4">★</span>
                        <span class="star" data-value="5">★</span>
                    </div>
                `,
        showCancelButton: true,
        cancelButtonText: "Skip for now",
        confirmButtonText: "Submit",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
          cancelButton:
            "w-[400px] bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        didOpen: () => {
          const stars = document.querySelectorAll(".star");
          stars.forEach((star) => {
            star.addEventListener("click", () => {
              const rating = star.getAttribute("data-value");
              stars.forEach((s) => s.classList.remove("text-yellow-500"));
              for (let i = 0; i < rating; i++) {
                stars[i].classList.add("text-yellow-500");
              }
              star.setAttribute("data-selected", rating); // Store selected rating
            });
          });
        },
      }).then(async (result) => {
        // If user skips the rating, we assign a default rating
        const selectedRating = document.querySelector("[data-selected]")
          ? document
              .querySelector("[data-selected]")
              .getAttribute("data-selected")
          : null;
        const rating = selectedRating || 5; // Default rating is 5 if no selection

        if (selectedRating) {
          // Show review prompt if the customer rated
          const reviewResult = await Swal.fire({
            title: "Review About Us!",
            input: "textarea",
            inputPlaceholder: "Type your review...",
            showCancelButton: true,
            cancelButtonText: "Skip for now",
            confirmButtonText: "Okay",
            customClass: {
              confirmButton:
                "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
              cancelButton:
                "w-[400px] bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
            },
          });

          const review = reviewResult.isConfirmed ? reviewResult.value : "";

          // Save the rating and review
          await axios.put(
            `http://localhost:5005/api/orders/${orderId}/rating`,
            { rating, review },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }

        // Success message
        Swal.fire({
          title: "Success!",
          text: "Order is placed successfully!",
          icon: "success",
          confirmButtonText: "Okay",
          customClass: {
            confirmButton:
              "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
          },
        }).then(() => {
          navigate("/orders"); // Navigate to orders page
        });
      });
    } catch (error) {
      console.error("Error confirming order:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to confirm order",
        icon: "error",
        confirmButtonText: "Try Again!",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <div className="pt-20 container mx-auto p-6 max-w-5xl">
      <br />
      <div className="flex items-center justify-center">
        <img src={FMLogo} alt="Logo" className="w-20 h-20" />
        <div className="banner items-center justify-center">
          <h1 className="font-roboto text-5xl font-bold text-center text-orange-500 ml-2">
            FOOD MART
          </h1>
          <h5 className="font-roboto text-[0.7rem] font-bold text-center text-black ml-2 tracking-[0.6em]">
            GET YOUR FOODS ONLINE
          </h5>
        </div>
      </div>
      <br />
      <a
        href="/cart"
        className="flex items-center font-roboto hover:text-orange-500 font-bold"
      >
        <ArrowLeftIcon className="h-6 w-6 text-orange-500 mr-2" />
        Back to Cart
      </a>
      <br />
      <div className="flex items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 mx-4">ORDER SUMMARY</h1>
        <div className="flex-grow border-t border-orange-400 mb-4"></div>
      </div>

      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-2">Customer Details</h2>
        <p>
          <strong>Address:</strong> {customer.address || "Loading..."}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone || "Loading..."}
        </p>
        <br />

        <h2 className="text-xl font-bold mt-4 mb-2">Ordered Items</h2>
        {cart.items.length > 0 ? (
          cart.items.map((item, index) => (
            <div key={index} className="border-b py-2">
              <p>
                <strong>{item.name}</strong> ({item.size}) - Rs.{" "}
                {item.price * item.quantity}
              </p>
            </div>
          ))
        ) : (
          <p>No items in the cart</p>
        )}
        <br />

        <h2 className="text-3xl font-bold mt-4">
          Total Payable: Rs. {cart.totalPayable}.00
        </h2>
        <br />

        <h2 className="text-xl font-bold mt-4 mb-2">Delivery Option</h2>
        <div className="space-x-4">
          <select
            id="deliveryOption"
            value={deliveryOption}
            onChange={(e) => setDeliveryOption(e.target.value)}
            className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="standard">Standard (30 mins)</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>

        {deliveryOption === "schedule" && (
          <div className="mt-4">
            <label className="block">Select Date:</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <label className="block mt-2">Select Time:</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        )}
        <br />
        <br />

        <Button
          text="Confirm Order"
          className="mt-4"
          onClick={handleConfirmOrder}
        />
      </div>
      <br />
    </div>
  );
};

export default Checkout;
