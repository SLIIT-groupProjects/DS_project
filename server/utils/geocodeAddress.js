import axios from 'axios';

export const geocodeAddress = async (address) => {
    try {
        const apiKey = '68089e697d758051577077lme2e6b28'
        const encoded = encodeURIComponent(address);
        const res = await axios.get(
            `https://geocode.maps.co/search?q=${encoded}&api_key=${apiKey}`
        );
        const data = res.data;

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No geocoding results found");
        }
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
    } catch (err) {
        console.error('Geocoding error:', err.message);
        return null;
    }
};
