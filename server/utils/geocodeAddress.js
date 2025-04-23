import axios from 'axios';

export const geocodeAddress = async (address) => {
    try {
        const apiKey = '68089e697d758051577077lme2e6b28'
        const encoded = encodeURIComponent(address);
        const res = await axios.get(
            `https://geocode.maps.co/search?q=${encoded}&api_key=${apiKey}`
        );

        if (res.data && res.data.results.length > 0) {
            const { lat, lng } = res.data.results[0].geometry;
            return { lat, lng };
        }

        return null;
    } catch (err) {
        console.error('Geocoding error:', err.message);
        return null;
    }
};
