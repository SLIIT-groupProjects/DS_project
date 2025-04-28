import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import Swal from "sweetalert2";
import FMLogo from "../asserts/icons/FMLogo.png";
import { ArrowLeftIcon } from "@heroicons/react/solid";

// Update with your publishable key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ amount, orderData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      if (!stripe || !elements) {
        throw new Error("Stripe has not been initialized");
      }

      // Create payment intent
      const { data: intentData } = await axios.post(
        "http://localhost:5009/api/payment/create-payment-intent",
        {
          amount,
        }
      );

      if (!intentData.clientSecret) {
        throw new Error("Could not get payment credentials");
      }

      // Confirm card payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment was not successful");
      }

      // Add payment status and ID to order data
      const formattedOrderData = {
        ...orderData,
        orderId: orderData._id, // Ensure orderId is sent for updating
        paymentIntentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        items: orderData.items,
      };

      // This POST will update the order status to 'paid' if payment succeeded
      console.log(
        "Sending payment/order update to backend:",
        formattedOrderData
      );
      const { data: orderResponse } = await axios.post(
        "http://localhost:5005/api/orders/confirm",
        formattedOrderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Order response from backend:", orderResponse);

      await Swal.fire({
        title: "Success!",
        text: "Payment Successful and Order Placed!",
        icon: "success",
        confirmButtonText: "View Orders",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });

      navigate("/orders");
    } catch (err) {
      setError(err.message);
      Swal.fire({
        title: "Payment Failed",
        text: err.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!stripe) {
    return <div>Loading Stripe...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <CardElement
          className="p-4 border rounded-lg shadow-sm"
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : `Pay Rs. ${amount}.00`}
      </button>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [amount, setAmount] = useState(null);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (orderId) {
          const response = await axios.get(
            `http://localhost:5005/api/orders/${orderId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          setOrderData(response.data);
          setAmount(response.data.totalPayable);
          setIsLoading(false);
        } else if (location.state?.amount && location.state?.orderData) {
          setOrderData(location.state?.orderData);
          setAmount(location.state?.amount);
          setIsLoading(false);
        } else {
          Swal.fire({
            title: "Error",
            text: "Invalid payment details",
            icon: "error",
            confirmButtonText: "Go Back",
          }).then(() => {
            navigate("/checkout");
          });
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to fetch order details",
          icon: "error",
          confirmButtonText: "Go Back",
        }).then(() => {
          navigate("/checkout");
        });
      }
    };

    fetchOrderDetails();
  }, [location.state, navigate, orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center mb-8">
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

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Complete Your Payment
          </h2>
          <div className="mb-6 text-center">
            <p className="text-lg">Total Amount:</p>
            <p className="text-3xl font-bold text-orange-500">
              Rs. {amount}.00
            </p>
          </div>
          <Elements stripe={stripePromise}>
            <PaymentForm amount={amount} orderData={orderData} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default Payment;
