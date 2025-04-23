import axios from 'axios';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Twilio WhatsApp ---
export const sendSMS = async (phone, messageBody) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = twilio(accountSid, authToken);

        const from = process.env.TWILIO_WHATSAPP_FROM;

        const to = phone.startsWith('+') ? phone : `+94${phone.replace(/^0+/, '')}`;



        console.log('🟢 Twilio whatsapp sender:', from); // should log 447860099299
        console.log('📨 To:', to);
        console.log('📝 Message:', messageBody);

        const message = await client.messages.create({
            from,
            body: messageBody, // Custom message text here
            to: `whatsapp:${to}`
        });

        console.log(`✅ WhatsApp message sent to ${to}: ${message.sid}`);
    } catch (err) {
        console.error(`❌ Failed to send WhatsApp message to ${phone}:`, err.message);
    }
};

// --- SEND EMAIL ---
export const sendEmail = async (to, subject, message) => {
    try {
        const mail = await transporter.sendMail({
            from: `"Delivery Service" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: message
        });
        console.log(`✅ Email sent to ${to}: MessageID=${mail.messageId}`);
    } catch (err) {
        console.error(`❌ Failed to send email to ${to}:`, err.message);
    }
};