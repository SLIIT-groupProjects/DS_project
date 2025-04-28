import { useState, useEffect } from "react";
import axios from "axios";
import { Trash } from "lucide-react";
import FMLogo from "../asserts/icons/FMLogo.png";
import { useNavigate } from "react-router-dom";
import Chat from "../components/Chat.jsx";
import { FiMessageSquare } from "react-icons/fi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [chatOrderId, setChatOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FOOD MART | Orders";
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch orders data and ensure that the `rating` field exists for each order
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/api/orders/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Fetched Orders:", response.data); // Check if each order has a `rating`
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5005/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(orders.filter((order) => order._id !== orderId)); // Update state
    } catch (error) {
      console.error("Error deleting order: ", error);
    }
  };

  const renderStars = (rating) => {
    const totalStars = 5;
    return (
      <span className="text-3xl">
        {Array.from({ length: totalStars }, (_, index) => (
          <span
            key={index}
            className={index < rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </span>
    );
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
      <div className="flex items-center justify-center">
        <h1 className="font-roboto text-3xl font-bold mb-4 mx-4">
          YOUR ORDERS
        </h1>
        <div className="flex-grow border-t border-orange-400 mb-4"></div>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="relative bg-white shadow-lg rounded-lg p-4"
            >
              <p>
                <strong>Address:</strong>{" "}
                <span className="ml-[100px]">{order.address}</span>
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <span className="ml-[112px]">{order.phone}</span>
              </p>
              <p>
                <strong>Total Payable:</strong>{" "}
                <span className="ml-[60px]">Rs. {order.totalPayable}.00</span>
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="ml-[114px]">{order.status}</span>
              </p>
              <p>
                <strong>Delivery Option:</strong>{" "}
                <span className="ml-[41px]">{order.deliveryOption}</span>
              </p>
              {order.deliveryOption === "schedule" && order.scheduledTime && (
                <p>
                  <strong>Scheduled Time:</strong>
                  <span className="ml-[41px]">
                    {new Date(order.scheduledTime).toLocaleString()}
                  </span>
                </p>
              )}

              <div className="mt-4">
                <strong className="text-orange-500">Rating:</strong>
                <span className="ml-[108px]">
                  {order.rating ? renderStars(order.rating) : " Not Rated"}
                </span>
                <br />
                <strong className="text-orange-500">Review:</strong>
                <span className="ml-[105px]">
                  {order.review ? order.review : "No review yet."}
                </span>
              </div>

              {/* Add Chat for this order */}
              <div className="mt-4">
                <button
                  className="flex items-center px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500"
                  onClick={() => setChatOrderId(order._id)}
                  type="button"
                >
                  <FiMessageSquare className="mr-1" /> Chat
                </button>
              </div>

              <button
                className="absolute top-2 right-2 text-orange-500 hover:text-red-700"
                onClick={() => deleteOrder(order._id)}
              >
                <Trash size={30} />
              </button>
              {order.status === "pending" && (
                <button
                  className="absolute bottom-2 right-2 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
                  onClick={() => {
                    // Navigate to payment page with order details
                    navigate('/payment', {
                      state: {
                        amount: order.totalPayable,
                        orderData: {
                          address: order.address,
                          phone: order.phone,
                          deliveryOption: order.deliveryOption,
                          scheduledDate: order.scheduledDate,
                          scheduledTime: order.scheduledTime,
                          items: order.items,
                          customerId: order.customerId,
                          _id: order._id
                        }
                      }
                    });
                  }}
                >
                  Continue Payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Popup Chat */}
      {chatOrderId && (
        <Chat
          orderId={chatOrderId}
          sender="user"
          isPopup
          onClose={() => setChatOrderId(null)}
          formatTime={(timestamp) => {
            if (!timestamp) return "";
            const date = new Date(timestamp);
            return (
              date.toLocaleDateString() +
              " " +
              date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            );
          }}
        />
      )}
      <br />
    </div>
  );
};

export default Orders;
