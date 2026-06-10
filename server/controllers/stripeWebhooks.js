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
    console.log("EVENT:", event.type);

    if (event.type === "checkout.session.completed") {
      console.log("INSIDE CHECKOUT SESSION COMPLETED");

      const session = event.data.object;

      console.log("SESSION:", session);

      const bookingId = session.metadata.bookingId;

      console.log("BOOKING ID:", bookingId);

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
