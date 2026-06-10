import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebHooks = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log("EVENT:", event.type);
  } catch (error) {
    console.log("WEBHOOK ERROR:", error.message);
    return res.status(400).send(error.message);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      console.log("PAYMENT INTENT SUCCEEDED");

      const paymentIntent = event.data.object;

      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessions.data[0];

      if (!session) {
        console.log("NO SESSION FOUND");
        return res.json({ received: true });
      }

      const bookingId = session.metadata?.bookingId;

      console.log("BOOKING ID:", bookingId);

      if (!bookingId) {
        console.log("NO BOOKING ID FOUND");
        return res.json({ received: true });
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          isPaid: true,
          paymentMethod: "Stripe",
          status: "confirmed",
        },
        { new: true },
      );

      console.log("BOOKING UPDATED:", booking);
    }

    res.json({ received: true });
  } catch (error) {
    console.log("DB UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
