/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'custom-bg': "url('https://res.cloudinary.com/fmart/image/upload/v1743648804/BGImage02_hzx5in.png')",
      },
    },
  },
  plugins: [],
};
