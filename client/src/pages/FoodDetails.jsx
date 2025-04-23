import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; 
import Button from "../components/Button";
import FMLogo from "../asserts/icons/FMLogo.png";
import Swal from "sweetalert2";
import { ArrowLeftIcon } from '@heroicons/react/solid';

const FoodDetails = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    document.title = "FOOD MART | Home";
    const getFoodDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5003/api/foods/${id}`);
        setFood(response.data);
        setSelectedSize(response.data.sizes[0]);
      } catch (error) {
        console.error("Error fetching food details: ", error);
      }
    };
    getFoodDetails();
  }, [id]);

  if (!food) {
    return <p className="text-center mt-10 text-gray-500">Loading food details...</p>;
  }

  // Calculate total price
  const totalPrice = food.price * quantity;

  const addToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Error!",
          text: "Please log in first!",
          icon: "error",
          confirmButtonText: "Okay",
          customClass: {
            confirmButton: 'w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
          },
          buttonsStyling: false,
        });
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        "http://localhost:5004/api/cart", 
        {
          foodId: food._id,
          size: selectedSize,
          quantity,
        }, 
        config
      );

      Swal.fire({
        title: "Success!",
        text: "Food item added to the cart!",
        icon: "success",
        confirmButtonText: "Okay",
        customClass: {
          confirmButton: 'w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    } catch (error) {
      console.error("Error adding item to cart:", error.response ? error.response.data : error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Error adding food item!",
        icon: "error",
        confirmButtonText: "Try Again!",
        customClass: {
          confirmButton: 'w-[400px] bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <div className="pt-20 container mx-auto p-6 max-w-5xl"><br/>
      <div className="flex items-center justify-center">
        <img src={FMLogo} alt="Logo" className="w-20 h-20" />
        <div className="banner items-center justify-center">
          <h1 className="font-roboto text-5xl font-bold text-center text-orange-500 ml-2">FOOD MART</h1>
          <h5 className="font-roboto text-[0.7rem] font-bold text-center text-black ml-2 tracking-[0.6em]">GET YOUR FOODS ONLINE</h5>
        </div>
      </div>
      <br/>
      <a href="/foods" className="flex items-center font-roboto hover:text-orange-500 font-bold"><ArrowLeftIcon className="h-6 w-6 text-orange-500 mr-2" />Back to Home</a>
      <br/>
      <img
        src={food.imageUrl}
        alt={food.name}
        className="w-full h-60 object-cover rounded-lg mb-4"
      />
      <h1 className="text-3xl font-bold">{food.name}</h1>
      <p className="text-gray-600 text-lg">Restaurant: {food.restaurant}</p>
      <p className="text-orange-500 text-xl font-semibold my-2">
        Price: Rs. {food.price}
      </p>
      <p className="text-gray-700">Reviews: {food.reviews} stars</p>
      <p className="text-gray-700">Sold: {food.sold} units</p>

      <div className="mt-4">
        <label className="block text-lg font-semibold text-gray-700">
          Select Size:
        </label>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="mt-2 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {food.sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-lg font-semibold text-gray-700">
          Quantity:
        </label>
        <input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-2 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <p className="font-semibold mt-8 text-2xl">Total Price: Rs. {totalPrice}.00</p>
      <br />

      <Button
        className="mt-4 p-2 bg-orange-400 text-white px-6 py-2 rounded-md hover:bg-orange-500"
        text="Add to Cart"
        onClick={addToCart}
      />
      <br />
      <br />
    </div>
  );
};

export default FoodDetails;
