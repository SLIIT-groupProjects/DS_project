import { useState, useEffect } from "react";
import { fetchFoods } from "../api/api";
import { useNavigate } from "react-router-dom";
import FMLogo from "../asserts/icons/FMLogo.png";

const FoodList = () => {
    const [foods, setFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "FOOD MART | Home";
        const getFoods = async () => {
            try{
                setLoading(true);
                const response = await fetchFoods();
                setFoods(response.data);
                setLoading(false);
            }catch(error){
                console.error("Error fetching food items: ", error);
                setError("Failed to load food items. Please try again later.");
                setLoading(false);
            }
        };
        getFoods();
    }, []);

    const filteredFoods = foods.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="pt-20 container mx-auto p-6 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading delicious food items...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-20 container mx-auto p-6 flex justify-center items-center min-h-screen">
                <div className="text-center text-red-500">
                    <p className="text-xl">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="pt-20 container mx-auto p-6"><br/>
            <div className="flex items-center justify-center">
                <img src={FMLogo} alt="Logo" className="w-20 h-20" />
                <div className="banner items-center justify-center">
                    <h1 className="font-roboto text-5xl font-bold text-center text-orange-500 ml-2">FOOD MART</h1>
                    <h5 className="font-roboto text-[0.7rem] font-bold text-center text-black ml-2 tracking-[0.6em]">GET YOUR FOODS ONLINE</h5>
                </div>
            </div>
            <div className="flex items-center justify-center my-6">
                <div className="flex-grow border-t border-orange-400 mb-4"></div>
                <h2 className="font-roboto text-2xl font-bold text-center mb-4 mx-4 tracking-widest">CHOOSE YOUR FAVOURITE FOOD</h2>
                <div className="flex-grow border-t border-orange-400 mb-4"></div>
            </div>

            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search FOOD MART..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredFoods.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-xl text-gray-600">No food items found.</p>
                    {searchQuery && (
                        <p className="mt-2 text-gray-500">
                            Try adjusting your search or check back later for new items.
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredFoods.map((food) => (
                        <div 
                            key={food._id} 
                            className="bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                            onClick={() => navigate(`/foods/${food._id}`)}
                        >
                            <img 
                                src={food.imageUrl} 
                                alt={food.name} 
                                className="w-full h-40 object-cover rounded-lg mb-2"
                            />
                            <h2 className="text-lg font-bold">{food.name}</h2>
                            <p className="text-gray-600">{food.restaurant}</p>
                            <p className="text-orange-500 font-semibold">Rs. {food.price}</p>
                        </div>
                    ))}
                </div>
            )}
            <br/>
        </div>
    );
};

export default FoodList;