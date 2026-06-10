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

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      console.log("INSIDE CHECKOUT SESSION COMPLETED");

      const session = event.data.object;

      console.log("SESSION ID:", session.id);
      console.log("SESSION METADATA:", session.metadata);

      const bookingId = session.metadata?.bookingId;

      console.log("BOOKING ID:", bookingId);

      if (!bookingId) {
        console.log("BOOKING ID NOT FOUND IN METADATA");

        return res.json({
          received: true,
        });
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          isPaid: true,
          paymentMethod: "Stripe",
          status: "confirmed",
        },
        {
          new: true,
        },
      );

      console.log("BOOKING UPDATED:", updatedBooking);
    }

    // Optional backup handler
    if (event.type === "payment_intent.succeeded") {
      console.log("PAYMENT INTENT SUCCEEDED");
    }

    return res.json({
      received: true,
    });
  } catch (error) {
    console.log("DB UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
