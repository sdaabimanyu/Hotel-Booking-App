import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebHooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Webhook Signature Error:", err.message);

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("SESSION:", session);

      const bookingId = session.metadata.bookingId;

      console.log("BOOKING ID:", bookingId);

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
      });

      console.log("UPDATED BOOKING:", updatedBooking);
    }

    res.json({ received: true });
  } catch (error) {
    console.log("WEBHOOK ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
