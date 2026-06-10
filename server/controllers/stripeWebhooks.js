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
  } catch (error) {
    console.log("WEBHOOK ERROR:", error.message);
    return res.status(400).send(error.message);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessions.data[0];

      if (!session) {
        return res.json({ received: true });
      }

      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        return res.json({ received: true });
      }

      await Booking.findByIdAndUpdate(
        bookingId,
        {
          isPaid: true,
          paymentMethod: "Stripe",
          status: "confirmed",
        },
        { new: true },
      );
    }

    return res.json({ received: true });
  } catch (error) {
    console.log("DB UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
