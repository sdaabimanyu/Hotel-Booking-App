export const stripeWebHooks = async (req, res) => {
  console.log("WEBHOOK HIT");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("EVENT TYPE:", event.type);
  } catch (err) {
    console.log("SIGNATURE ERROR:", err.message);

    return res.status(400).send(err.message);
  }

  try {
    if (event.type === "checkout.session.completed") {
      console.log("CHECKOUT COMPLETED");

      const session = event.data.object;

      console.log("SESSION:", session);

      console.log("METADATA:", session.metadata);

      const bookingId = session.metadata.bookingId;

      console.log("BOOKING ID:", bookingId);

      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          isPaid: true,
          paymentMethod: "Stripe",
        },
        { new: true }
      );

      console.log("UPDATED:", updated);
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