const Button = ({ text, onClick, type = "button" }) => {
    return (
      <button
        type={type}
        onClick={onClick}
        className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        {text}
      </button>
    );
  };
  
  export default Button;
  