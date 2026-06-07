import Stripe from "stripe";

// API to handle Stripe WebHooks

export const stripeWebHooks = async (request, response) => {
  // Stripe GateWay Initialize
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    ((event = stripeInstance.webhooks.constructEvent(request.body)),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    response.status(400).send(`WebHook Error: ${error.message}`);
  }

  // Handle The Event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;

    // Getting Session MetaData
    const session = await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntentId,
    });

    const { bookingId } = session.data[0].metadata;
    // Mark Payment as paid
    await Booking.findByIdAndUpdate(bookingId, {
      isPaid: true,
      paymentMethod: "Stripe",
    });
  } else {
    console("Unhandled event type :", event.type);
  }
  response.json({ received: true });
};
