import { sendSMS, sendEmail } from '../config/smsEmail.js';
import { reverseGeocode } from '../utils/reverseGeoCode.js';

export const sendNotification = async ({ to, orderId, type, customerLocation }) => {

    //coverting lng/lat to adrress
    const address = await reverseGeocode(customerLocation.lat, customerLocation.lng);

    const message = `New order assigned to you: Order ID ${orderId}\nto the Customer Address: ${address}`;
    const subject = `New Order Assigned - Order ${orderId}`;

    // Extract name from email or phone if needed (fallback)
    const name = to.name || (to.email?.split('@')[0] || 'Customer');

    await sendSMS(to.phone, message);
    await sendEmail(to.email, subject, message);
};