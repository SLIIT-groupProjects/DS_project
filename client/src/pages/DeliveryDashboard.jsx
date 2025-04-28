import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { reverseGeocode } from "../../../server/utils/reverseGeoCode";
import Chat from "../components/Chat.jsx";
import { FiMessageSquare } from "react-icons/fi";

// Remove this line if you don't have dayjs installed:
// import dayjs from "dayjs";

// Use JS Date for fallback if dayjs is not available
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [orderAddresses, setOrderAddresses] = useState([]);

  // Track which chat popup is open (orderId or null)
  const [chatOrderId, setChatOrderId] = useState(null);

  const ACCEPTED_STORAGE_KEY = "acceptedOrders";

  const token = localStorage.getItem("delivery_token");

  const fetchInitialOrders = async () => {
    try {
      const resAssigned = await fetch(
        "http://localhost:5006/api/delivery/assigned",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resNearby = await fetch(
        "http://localhost:5006/api/delivery/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const dataAssigned = await resAssigned.json();
      const dataNearby = await resNearby.json();

      if (resAssigned.ok && resNearby.ok) {
        setAssignedOrders(dataAssigned.orders);
        const nearby = dataNearby.orders.filter((o) => o.status === "pending");
        setOrders(nearby);
        reverseGeocodeAll([...dataAssigned.orders, ...nearby]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearbyOrders = async () => {
    try {
      const res = await fetch("http://localhost:5006/api/delivery/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        const nearby = data.orders.filter((o) => o.status === "pending");
        setOrders(nearby);

        // Refresh addresses only for nearby + already assigned
        reverseGeocodeAll([...nearby, ...assignedOrders]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reverseGeocodeAll = async (orderList) => {
    const addressMap = {};

    for (const order of orderList) {
      const { lat, lng } = order.customerLocation;
      const address = await reverseGeocode(lat, lng);
      addressMap[order._id] = address;
    }

    setOrderAddresses((prev) => ({ ...prev, ...addressMap }));
  };

  const handleAccept = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:5006/api/delivery/orders/${orderId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        // Find the accepted order
        const acceptedOrder = orders.find((order) => order._id === orderId);

        // Remove from nearby orders and add to assigned
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        setAssignedOrders((prev) => [
          ...prev,
          { ...acceptedOrder, status: "accepted" },
        ]);

        //Save in localStorage
        const saved =
          JSON.parse(localStorage.getItem(ACCEPTED_STORAGE_KEY)) || [];
        const updated = [...saved, { ...acceptedOrder, status: "accepted" }];
        localStorage.setItem(ACCEPTED_STORAGE_KEY, JSON.stringify(updated));

        Swal.fire({
          icon: "success",
          title: "Order Accepted!",
          text: "This order has been successfully accepted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "Failed to accept order", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error accepting order", "error");
    }
  };

  const handlePickup = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:5006/api/delivery/${orderId}/pickup`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setAssignedOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "pickedUp" } : order
          )
        );

        Swal.fire({
          icon: "success",
          title: "Order Picked Up!",
          text: "This order is now ready for delivery.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "Failed to pick up order", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error", "error");
    }
  };

  const handleComplete = (orderId) => {
    Swal.fire({
      title: "Mark as complete?",
      text: "Are you sure you want to complete this order?",
      icon: "question",
      iconColor: "#2196F3",
      showCancelButton: true,
      confirmButtonText: "Yes, complete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `http://localhost:5006/api/delivery/${orderId}/complete`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();

          if (res.ok) {
            setAssignedOrders((prev) =>
              prev.filter((order) => order._id !== orderId)
            );

            Swal.fire({
              icon: "success",
              title: "Order Completed!",
              text: "The order has been marked as delivered.",
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            Swal.fire("Error", data.message || "Failed to complete", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Server error", "error");
        }
      }
    });
  };

  // Helper to open chat popup for any order
  const openChat = (orderId) => setChatOrderId(orderId);
  const closeChat = () => setChatOrderId(null);

  useEffect(() => {
    fetchInitialOrders();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchNearbyOrders();
    }, 10000);

    return () => clearInterval(interval); //to cleanup
  }, []);

  return (
    <div className="min-h-screen bg-orange-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Delivery Dashboard
        </h1>

        {/* Assigned Orders */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            📦 Your Orders to Complete
          </h2>
          {assignedOrders.filter((order) => order.status === "pickedUp")
            .length === 0 ? (
            <p className="text-gray-500">No orders to complete.</p>
          ) : (
            <div className="grid gap-4">
              {assignedOrders
                .filter((order) => order.status === "pickedUp")
                .map((order) => (
                  <div
                    key={order._id}
                    className="p-4 bg-white border border-orange-500 rounded-md shadow flex flex-col mb-4"
                  >
                    <div>
                      <p>
                        <strong>Order ID:</strong> {order._id}
                      </p>
                      <p>
                        <strong>Status:</strong> {order.status}
                      </p>
                      <p>
                        <strong>Customer Location:</strong>
                        {orderAddresses[order._id] || "Loading..."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => openChat(order._id)}
                        className="flex items-center px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500"
                        title="Open Chat"
                      >
                        <FiMessageSquare className="mr-1" /> Chat
                      </button>
                      <button
                        onClick={() => handleComplete(order._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Orders to Pick Up */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">🚚 Orders to Pick Up</h2>
          {assignedOrders.filter((order) => order.status === "accepted")
            .length === 0 ? (
            <p className="text-gray-500">No orders to pick up.</p>
          ) : (
            <div className="grid gap-4">
              {assignedOrders
                .filter((order) => order.status === "accepted")
                .map((order) => (
                  <div
                    key={order._id}
                    className="p-4 bg-white border border-yellow-500 rounded-md shadow flex justify-between items-center"
                  >
                    <div>
                      <p>
                        <strong>Order ID:</strong> {order._id}
                      </p>
                      <p>
                        <strong>Status:</strong> {order.status}
                      </p>
                      <p>
                        <strong>Customer Location:</strong>{" "}
                        {orderAddresses[order._id] || "Loading..."}
                      </p>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => openChat(order._id)}
                          className="flex items-center px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500"
                          title="Open Chat"
                        >
                          <FiMessageSquare className="mr-1" /> Chat
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePickup(order._id)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Pick Up
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>
        {/* Nearby Orders */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            📍 Nearby Orders (within 5 km)
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">No nearby orders available.</p>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 bg-white border border-orange-500 rounded-md shadow flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>Order ID:</strong> {order._id}
                    </p>
                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p>
                      <strong>Customer Location:</strong>{" "}
                      {orderAddresses[order._id] || "Loading..."}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => openChat(order._id)}
                        className="flex items-center px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500"
                        title="Open Chat"
                      >
                        <FiMessageSquare className="mr-1" /> Chat
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAccept(order._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {/* Chat Popup Modal */}
      <SimpleModal isOpen={!!chatOrderId} onRequestClose={closeChat}>
        <div className="flex flex-col h-[500px]">
          <div className="flex justify-between items-center bg-orange-500 text-white px-4 py-2 rounded-t">
            <span className="font-bold">Order Chat</span>
            <button onClick={closeChat} className="text-white text-xl">&times;</button>
          </div>
          {chatOrderId && (
            <Chat
              orderId={chatOrderId}
              sender="delivery"
              isPopup
              formatTime={formatTime}
              onClose={closeChat}
            />
          )}
        </div>
      </SimpleModal>
    </div>
  );
};

// Add SimpleModal component
const SimpleModal = ({ isOpen, onRequestClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        zIndex: 1000,
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onRequestClose}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          padding: 0,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
