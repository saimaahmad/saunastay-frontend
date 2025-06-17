// index.js (ES Module compatible)
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import { onRequest } from 'firebase-functions/v2/https';


// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

// Initialize Stripe
const stripe = new Stripe('sk_test_51RUUSCGC1dxXlhZhCwt0x1drp6Nx5GqWkFuOtVUTEXBSse4riQEOu0ekgQzmu9TcF9si8KG7io2sXIdAyCz8rBP000X9zYBBaY', { apiVersion: '2022-11-15' });
const YOUR_FRONTEND_URL = 'http://localhost:5176';
const endpointSecret = 'whsec_EhfRSWd4F3V5He2teNHbnYi6J9gX3QIB'; // replace with your actual secret

// 1. Callable function
export const createCheckoutSession = onCall({ region: 'europe-west1' }, async (req) => {
  const data = req.data;
  const amountInCents = Math.round(data.amount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    locale: data.language || 'en', // Set the UI language here
automatic_tax: { enabled: false },

    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: data.saunaName || 'Sauna Booking',
            description: data.description || '',
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    customer_email: data.customerEmail,
success_url: data.successUrl,
cancel_url: data.cancelUrl,

    metadata: {
      bookingId: data.bookingId,
      customerEmail:data.customerEmail,
      saunaId: data.saunaId,
      ownerEmail: data.saunaOwnerEmail,
      amount: data.amount.toString(),
      language: data.lang || 'en'
    },
  });

  return { url: session.url };
});

// 2. Webhook handler
const app = express();
app.use(bodyParser.raw({ type: 'application/json' }));
app.post('/webhook', async (req, res) => {

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
      const {
      bookingId,
      saunaId,
      customerEmail,
      ownerEmail,
      amount
    } = session.metadata;

 try {
      // 1. Confirm the booking
      const bookingRef = db.doc(`bookings/${bookingId}`);
      await bookingRef.update({
        status: 'confirmed',
        confirmedAt: admin.firestore.Timestamp.now()
      });
    
    
        await db.collection('payment').add({
          bookingId,
          saunaId,
          saunaOwnerEmail: metadata.ownerEmail,
customerEmail,

          amountPaid: session.amount_total / 100,
          saunaRevenue: (session.amount_total * 0.95) / 100,
          status: session.payment_status,
          method: session.payment_method_types?.[0] || 'unknown',
     lang: metadata.language || 'fi',
          timestamp: FieldValue.serverTimestamp(),
        });

       
        return res.status(200).send('Payment saved and booking updated');
      } catch (error) {
        console.error('DB update error:', error);
        return res.status(500).send('Internal error');
      }}
    

  res.status(200).send('Received');
});

export const stripeWebhook = onRequest({ region: 'europe-west1' }, app);
