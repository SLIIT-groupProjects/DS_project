import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { handleNewOrderAssignment } from '../controllers/assignOrderController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY in environment variables');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'lkr',
      payment_method_types: ['card']
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add webhook endpoint to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      console.log('Processing payment success:', paymentIntent.id);
      
      // First find the order
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      
      if (!order) {
        console.error('Order not found for payment:', paymentIntent.id);
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update the order status to paid
      order.status = 'paid';
      await order.save();
      
      console.log('Order status updated to paid:', order._id);
      
      // Clear cart and assign delivery
      await Cart.deleteOne({ customerId: order.customerId });
      await handleNewOrderAssignment(order._id);

      console.log('Post-payment processing completed for order:', order._id);
      
    } catch (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ error: 'Error updating order status' });
    }
  }

  res.json({ received: true });
});

export default router;
