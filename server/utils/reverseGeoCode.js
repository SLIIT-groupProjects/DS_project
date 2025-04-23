export const reverseGeocode = async (lat, lng) => {
    const apiKey = '682e454929d744eabc0664d2e4b9daac';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.results[0]?.formatted || 'Unknown Location';
    } catch (err) {
        console.error('Reverse geocode failed:', err);
        return 'Unknown Location';
    }
};