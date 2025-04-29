import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import Button from "../components/Button";
import { ArrowLeftIcon } from '@heroicons/react/solid';
import FMLogo from "../asserts/icons/FMLogo.png";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], totalPayable: 0 });

    useEffect(() => {
        document.title = "FOOD MART | Cart";
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }
            const response = await axios.get("http://localhost:5004/api/cart", {
                headers: { Authorization: `Bearer ${token}` } 
            });
            setCart(response.data);  // Set cart data
        } catch (error) {
            console.error("Error fetching cart: ", error);
        }
    };
    
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
    
        try {
            await axios.put(
                `http://localhost:5004/api/cart/item/${cartItemId}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            fetchCart(); 
        } catch (error) {
            console.error("Error updating quantity: ", error);
        }
    };
    
    const removeItem = async (cartItemId) => {
        try {
            await axios.delete(
                `http://localhost:5004/api/cart/item/${cartItemId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            fetchCart(); 
        } catch (error) {
            console.error("Error removing item: ", error);
        }
    };    
    
    return (
        <div className="pt-20 container mx-auto p-6 max-w-5xl">
            <br />
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
            <div className="flex items-center justify-center">
                <h1 className="font-roboto text-3xl font-bold mb-4 mx-4">YOUR CART</h1>
                <div className="flex-grow border-t border-orange-400 mb-4"></div>
            </div>

            {cart.items.length === 0 ? (
                <p className="text-gray-500">Your cart is empty...</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {cart.items.map((item, index) => (
                            <div key={index} className="bg-white shadow-lg rounded-lg p-4 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                
                                <img
                                    src={item.image}  
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-md"
                                />
                                    <div>
                                        <h2 className="text-lg font-bold">{item.name}</h2>
                                        <p className="text-gray-600">{item.size}</p>
                                        <p className="text-orange-500 font-semibold">Rs. {item.price * item.quantity}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        -
                                    </button>
                                    <span className="mx-3">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 mr-10"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => removeItem(item._id)}
                                        className="text-orange-500 hover:text-red-700"
                                    >
                                        <Trash size={30} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-3xl font-bold mt-10">Sub Total: Rs. {cart.totalPayable}.00</h2>
                    <br />
                    <br />

                    <Button
                        className="mt-4 p-2 bg-orange-400 text-white px-6 py-2 rounded-md hover:bg-orange-500"
                        text="Go to Checkout"
                        onClick={() => navigate("/checkout")}
                    />
                    <br />
                    <br />
                </>
            )}
        </div>
    );
};

export default Cart;
