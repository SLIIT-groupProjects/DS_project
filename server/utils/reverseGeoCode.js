export const reverseGeocode = async (lat, lng) => {
    const apiKey = '68089e697d758051577077lme2e6b28';
    const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data?.address) {
            const a = data.address;

            // Build a shorter address from available fields
            const parts = [
                a.road,
                a.neighbourhood,
                a.suburb,
                a.village,
                a.town,
                a.city
            ].filter(Boolean); // remove undefined/null

            return parts.join(', ');
        } else {
            console.warn("⚠️ No address details found");
            return "Unknown Location";
        }
    } catch (err) {
        console.error('Reverse geocode failed:', err);
        return 'Unknown Location';
    }
};