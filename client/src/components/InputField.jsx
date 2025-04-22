const InputField = ({ label, type, placeholder, name, value, onChange }) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
      </div>
    );
  };
  
  export default InputField;
  