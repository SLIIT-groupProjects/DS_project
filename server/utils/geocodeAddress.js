import axios from 'axios';

export const geocodeAddress = async (address) => {
    try {
        const apiKey = '682e454929d744eabc0664d2e4b9daac'
        const encoded = encodeURIComponent(address);
        const res = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${encoded}&key=${apiKey}`
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
