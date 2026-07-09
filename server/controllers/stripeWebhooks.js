import Stripe from "stripe";
import Booking from "../models/Booking.js";
import transporter from "../configs/nodemailer.js";

export const stripeWebHooks = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];

  let event;

  // ==========================================
  // 1. VERIFY STRIPE WEBHOOK
  // ==========================================

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
    // ==========================================
    // 2. HANDLE SUCCESSFUL PAYMENT
    // ==========================================

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      console.log("STRIPE PAYMENT SUCCESS:", paymentIntent.id);

      // ==========================================
      // 3. FIND CHECKOUT SESSION
      // ==========================================

      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessions.data[0];

      if (!session) {
        console.log("NO STRIPE SESSION FOUND");

        return res.json({
          received: true,
        });
      }

      // ==========================================
      // 4. GET BOOKING ID
      // ==========================================

      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.log("NO BOOKING ID IN STRIPE METADATA");

        return res.json({
          received: true,
        });
      }

      console.log("STRIPE BOOKING ID:", bookingId);

      // ==========================================
      // 5. FIND BOOKING
      // ==========================================

      const booking = await Booking.findById(bookingId)
        .populate("hotel")
        .populate("room")
        .populate("user");

      if (!booking) {
        console.log("BOOKING NOT FOUND");

        return res.json({
          received: true,
        });
      }

      // ==========================================
      // 6. PREVENT DUPLICATE PAYMENT PROCESSING
      // ==========================================

      if (booking.isPaid) {
        console.log("BOOKING ALREADY PAID");

        return res.json({
          received: true,
        });
      }

      // ==========================================
      // 7. UPDATE PAYMENT
      // ==========================================

      booking.isPaid = true;

      booking.paymentMethod = "Stripe";

      booking.status = "confirmed";

      booking.paidAt = new Date();

      await booking.save();

      console.log("STRIPE BOOKING UPDATED:", booking._id);

      // ==========================================
      // 8. SEND PAYMENT RECEIPT EMAIL
      // ==========================================

      const mailOptions = {
        from: process.env.SENDER_EMAIL,

        to: booking.email,

        subject: "Cash Payment Receipt - Hotel Booking",

        html: `
    <h2>Payment Received</h2>

    <p>Dear ${booking.name},</p>

    <p>
      We have successfully received your cash payment.
    </p>

    <h3>Payment Receipt</h3>

    <ul>

      <li>
        <strong>Booking ID:</strong>
        ${booking._id}
      </li>

      <li>
        <strong>Amount Paid:</strong>
        ${process.env.CURRENCY || "$"}${booking.totalPrice.toFixed(2)}
      </li>

      <li>
        <strong>Payment Method:</strong>
        Cash
      </li>

      <li>
        <strong>Payment Date:</strong>
        ${booking.paidAt.toDateString()}
      </li>

    </ul>

    <p>
      Thank you for your payment. We hope you enjoy your stay.
    </p>
  `,
      };

      await transporter.sendMail(mailOptions);

      console.log("CASH PAYMENT RECEIPT EMAIL SENT TO:", booking.email);
    }

    // ==========================================
    // 9. RESPOND TO STRIPE
    // ==========================================

    return res.json({
      received: true,
    });
  } catch (error) {
    console.log("STRIPE WEBHOOK PROCESSING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
