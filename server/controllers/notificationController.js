import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import transporter from "../configs/nodemailer.js";

export const sendUpcomingBookingReminders = async (req, res) => {
  // ==========================================
  // VERIFY CRON REQUEST
  // ==========================================

  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized cron request",
    });
  }

  try {
    // ==========================================
    // 1. CREATE TOMORROW DATE RANGE
    // ==========================================

    const tomorrowStart = new Date();

    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);

    tomorrowEnd.setHours(23, 59, 59, 999);

    // ==========================================
    // 2. FIND TOMORROW'S BOOKINGS
    // ==========================================

    const bookings = await Booking.find({
      checkInDate: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd,
      },

      status: {
        $in: ["pending", "confirmed"],
      },

      reminderSent: false,
    })
      .populate("hotel")
      .populate("room");

    let sentCount = 0;

    // ==========================================
    // 3. PROCESS EACH BOOKING
    // ==========================================

    for (const booking of bookings) {
      try {
        // ==========================================
        // VALIDATE EMAIL
        // ==========================================

        if (!booking.email) {
          console.log("REMINDER SKIPPED - NO EMAIL:", booking._id);

          continue;
        }

        // ==========================================
        // 4. CREATE EMAIL
        // ==========================================

        const mailOptions = {
          from: process.env.SENDER_EMAIL,

          to: booking.email,

          subject: `Upcoming Stay Reminder - ${
            booking.hotel?.name || "Hotel Booking"
          }`,

          html: `
            <div
              style="
                max-width: 650px;
                margin: auto;
                padding: 30px;
                font-family: Arial, sans-serif;
                color: #222;
              "
            >

              <h2 style="color: #d97706;">
                Your Stay Is Almost Here!
              </h2>

              <p>
                Dear ${booking.name || "Guest"},
              </p>

              <p>
                This is a friendly reminder that your hotel
                reservation begins tomorrow.
              </p>

              <h3>Reservation Details</h3>

              <ul style="line-height: 1.8;">

                <li>
                  <strong>Booking ID:</strong>
                  ${booking._id}
                </li>

                <li>
                  <strong>Hotel:</strong>
                  ${booking.hotel?.name || "Hotel"}
                </li>

                <li>
                  <strong>Room:</strong>
                  ${booking.room?.roomType || "Room"}
                </li>

                <li>
                  <strong>Check-In:</strong>
                  ${new Date(booking.checkInDate).toDateString()}
                </li>

                <li>
                  <strong>Check-Out:</strong>
                  ${new Date(booking.checkOutDate).toDateString()}
                </li>

                <li>
                  <strong>Guests:</strong>
                  ${booking.guests}
                </li>

                <li>
                  <strong>Booking Status:</strong>
                  ${booking.status}
                </li>

                <li>
                  <strong>Payment Status:</strong>
                  ${booking.isPaid ? "Paid" : "Unpaid"}
                </li>

              </ul>

              <p>
                We look forward to welcoming you!
              </p>

              <p>
                Thank you for choosing
                ${booking.hotel?.name || "our hotel"}.
              </p>

            </div>
          `,
        };

        // ==========================================
        // 5. SEND EMAIL
        // ==========================================

        await transporter.sendMail(mailOptions);

        // ==========================================
        // 6. CREATE IN-APP NOTIFICATION
        // ==========================================

        try {
          await Notification.create({
            user: booking.user,

            type: "booking_reminder",

            title: "Upcoming Stay Reminder",

            message: `Your stay at ${
              booking.hotel?.name || "the hotel"
            } begins tomorrow.`,

            relatedBooking: booking._id,
          });
        } catch (notificationError) {
          console.log(
            "REMINDER NOTIFICATION ERROR:",
            notificationError.message,
          );
        }

        // ==========================================
        // 7. MARK REMINDER AS SENT
        // ==========================================

        booking.reminderSent = true;

        await booking.save();

        sentCount++;

        console.log("UPCOMING BOOKING REMINDER SENT TO:", booking.email);
      } catch (emailError) {
        console.log("REMINDER EMAIL ERROR:", booking.email, emailError.message);
      }
    }

    // ==========================================
    // 8. SEND RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Upcoming booking reminders processed successfully",
      bookingsFound: bookings.length,
      remindersSent: sentCount,
    });
  } catch (error) {
    console.log("UPCOMING REMINDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
