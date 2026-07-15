import { messageInRaw } from "svix";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import transporter from "../configs/nodemailer.js";
import stripe from "stripe";
import Review from "../models/Review.js";
import Offer from "../models/Offer.js";
import Notification from "../models/Notification.js";

// Function to Check Availability of Room
const checkAvailability = async (checkInDate, checkOutDate, room) => {
  try {
    const conflictingBooking = await Booking.findOne({
      room,

      status: {
        $ne: "cancelled",
      },

      checkInDate: {
        $lt: new Date(checkOutDate),
      },

      checkOutDate: {
        $gt: new Date(checkInDate),
      },
    });

    return !conflictingBooking;
  } catch (error) {
    console.error("CHECK AVAILABILITY ERROR:", error);
    throw error;
  }
};

// API to Check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability(
      checkInDate,
      checkOutDate,
      room,
    );
    res.json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to create a new Booking
// POST /api/booking/book

export const createBooking = async (req, res) => {
  try {
    const {
      room,
      checkInDate,
      checkOutDate,
      guests,
      name,
      email,
      phone,
      specialRequest,
      selectedOffer,
    } = req.body;

    const user = req.user._id;

    // ==========================================
    // 1. VALIDATE REQUIRED BOOKING DATA
    // ==========================================

    if (
      !room ||
      !checkInDate ||
      !checkOutDate ||
      !guests ||
      !name ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking information",
      });
    }

    // ==========================================
    // 2. VALIDATE BOOKING DATES
    // ==========================================

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking dates",
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // ==========================================
    // 3. FIND ROOM
    // ==========================================

    const roomData = await Room.findById(room).populate("hotel");

    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!roomData.hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found for this room",
      });
    }

    // ==========================================
    // 4. CHECK ROOM AVAILABILITY
    // ==========================================

    const isAvailable = await checkAvailability(
      checkInDate,
      checkOutDate,
      room,
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Room is not available for the selected dates",
      });
    }

    // ==========================================
    // 5. CALCULATE NUMBER OF NIGHTS
    // ==========================================

    const timeDifference = checkOut.getTime() - checkIn.getTime();

    const nights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: "Booking must be for at least one night",
      });
    }

    // ==========================================
    // 6. CALCULATE SUBTOTAL
    // ==========================================

    const subtotal = Number((roomData.pricePerNight * nights).toFixed(2));

    let discount = 0;
    let validOffer = null;

    // ==========================================
    // 7. VALIDATE AND APPLY SELECTED OFFER
    // ==========================================

    if (selectedOffer) {
      const offer = await Offer.findById(selectedOffer);

      if (!offer) {
        return res.status(400).json({
          success: false,
          message: "Selected offer is invalid",
        });
      }

      if (offer.hotel.toString() !== roomData.hotel._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Selected offer does not belong to this hotel",
        });
      }

      if (!offer.isActive) {
        return res.status(400).json({
          success: false,
          message: "Selected offer is no longer active",
        });
      }

      if (new Date(offer.validTill) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Selected offer has expired",
        });
      }

      if (nights < offer.minimumStay) {
        return res.status(400).json({
          success: false,
          message: `This offer requires a minimum stay of ${offer.minimumStay} nights`,
        });
      }

      if (offer.discountType === "percentage") {
        discount = Number(((subtotal * offer.discount) / 100).toFixed(2));
      } else {
        discount = Number(Math.min(offer.discount, subtotal).toFixed(2));
      }

      validOffer = offer;
    }

    // ==========================================
    // 8. CALCULATE PRICE AFTER DISCOUNT
    // ==========================================

    const discountedPrice = Number(Math.max(subtotal - discount, 0).toFixed(2));

    // ==========================================
    // 9. CALCULATE TAX
    // ==========================================

    const tax = Number((discountedPrice * 0.12).toFixed(2));

    // ==========================================
    // 10. CALCULATE FINAL TOTAL
    // ==========================================

    const totalPrice = Number((discountedPrice + tax).toFixed(2));

    // ==========================================
    // 11. CREATE BOOKING
    // ==========================================

    const booking = await Booking.create({
      user,

      room,

      hotel: roomData.hotel._id,

      guests: Number(guests),

      checkInDate,

      checkOutDate,

      totalPrice,

      name: name.trim(),

      email: email.trim(),

      phone: phone.trim(),

      specialRequest: specialRequest?.trim() || "",

      selectedOffer: validOffer?._id || null,
    });

    console.log("NEW BOOKING CREATED:", {
      id: booking._id,
      user: booking.user,
      room: booking.room,
      hotel: booking.hotel,
      nights,
      subtotal,
      discount,
      tax,
      totalPrice,
      selectedOffer: booking.selectedOffer,
      status: booking.status,
      isPaid: booking.isPaid,
      createdAt: booking.createdAt,
    });

    // ==========================================
    // 12. INCREASE OFFER USAGE
    // ==========================================

    if (validOffer) {
      await Offer.findByIdAndUpdate(validOffer._id, {
        $inc: {
          usedCount: 1,
        },
      });
    }

    // ==========================================
    // 13. CREATE IN-APP BOOKING NOTIFICATION
    // ==========================================

    try {
      const bookingNotification = await Notification.create({
        user: booking.user,

        type: "booking_confirmation",

        title: "Booking Created",

        message: `Your booking at ${roomData.hotel.name} for ${roomData.roomType} has been created successfully and is currently pending confirmation.`,

        relatedBooking: booking._id,
      });

      console.log("BOOKING NOTIFICATION CREATED:", bookingNotification._id);
    } catch (notificationError) {
      console.log("BOOKING NOTIFICATION ERROR:", notificationError.message);
    }

    // ==========================================
    // 14. SEND BOOKING CONFIRMATION EMAIL
    // ==========================================

    const mailOptions = {
      from: process.env.SENDER_EMAIL,

      to: email,

      subject: "Hotel Booking Details",

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

          <h2>
            Your Booking Details
          </h2>

          <p>
            Dear ${name},
          </p>

          <p>
            Thank you for your booking.
            Here are your reservation details:
          </p>

          <ul style="line-height: 1.8;">

            <li>
              <strong>Booking ID:</strong>
              ${booking._id}
            </li>

            <li>
              <strong>Hotel:</strong>
              ${roomData.hotel.name}
            </li>

            <li>
              <strong>Location:</strong>
              ${roomData.hotel.address}
            </li>

            <li>
              <strong>Room:</strong>
              ${roomData.roomType}
            </li>

            <li>
              <strong>Check-In:</strong>
              ${booking.checkInDate.toDateString()}
            </li>

            <li>
              <strong>Check-Out:</strong>
              ${booking.checkOutDate.toDateString()}
            </li>

            <li>
              <strong>Guests:</strong>
              ${booking.guests}
            </li>

            <li>
              <strong>Number of Nights:</strong>
              ${nights}
            </li>

            <li>
              <strong>Subtotal:</strong>
              ${process.env.CURRENCY || "$"}${subtotal.toFixed(2)}
            </li>

            ${
              validOffer
                ? `
                  <li>
                    <strong>Offer:</strong>
                    ${validOffer.code}
                  </li>

                  <li>
                    <strong>Discount:</strong>
                    -${process.env.CURRENCY || "$"}${discount.toFixed(2)}
                  </li>
                `
                : ""
            }

            <li>
              <strong>Tax:</strong>
              ${process.env.CURRENCY || "$"}${tax.toFixed(2)}
            </li>

            <li>
              <strong>Total Amount:</strong>
              ${process.env.CURRENCY || "$"}${booking.totalPrice.toFixed(2)}
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

        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);

      console.log("BOOKING CONFIRMATION EMAIL SENT TO:", email);
    } catch (emailError) {
      console.log("BOOKING CONFIRMATION EMAIL ERROR:", emailError.message);
    }

    // ==========================================
    // 15. SEND RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,

      message: "Booking Created Successfully",

      bookingId: booking._id,

      priceDetails: {
        nights,
        subtotal,
        discount,
        tax,
        totalPrice,
      },
    });
  } catch (error) {
    console.log("BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    // ==========================================
    // 1. GET LOGGED-IN USER ID
    // ==========================================

    const userId = req.user._id;

    // ==========================================
    // 2. FIND ALL BOOKINGS OF THE USER
    // ==========================================

    const bookings = await Booking.find({
      user: userId,
    })
      .populate("room")
      .populate("hotel")
      .populate("selectedOffer")
      .sort({
        createdAt: -1,
      })
      .lean();

    // ==========================================
    // 3. GET ALL BOOKING IDS
    // ==========================================

    const bookingIds = bookings.map((booking) => booking._id);

    // ==========================================
    // 4. FIND REVIEWS FOR THESE BOOKINGS
    // ==========================================

    const reviews = await Review.find({
      booking: {
        $in: bookingIds,
      },
    })
      .select("booking")
      .lean();

    // ==========================================
    // 5. CREATE SET OF REVIEWED BOOKING IDS
    // ==========================================

    const reviewedBookingIds = new Set(
      reviews.map((review) => review.booking.toString()),
    );

    // ==========================================
    // 6. ADD reviewSubmitted TO EACH BOOKING
    // ==========================================

    const bookingsWithReviewStatus = bookings.map((booking) => ({
      ...booking,

      reviewSubmitted: reviewedBookingIds.has(booking._id.toString()),
    }));

    // ==========================================
    // 7. SEND RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      bookings: bookingsWithReviewStatus,
    });
  } catch (error) {
    console.log("GET USER BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to fetch user bookings",
    });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    // =========================================================
    // 1. FIND LOGGED-IN HOTEL OWNER'S HOTEL
    // =========================================================

    console.log("========== OWNER BOOKINGS ==========");
    console.log("REQ USER:", req.user);

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    console.log("HOTEL FOUND:", hotel);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel Found",
      });
    }

    // =========================================================
    // 2. GET ALL ACTIVE ROOMS
    // =========================================================

    const rooms = await Room.find({
      hotel: hotel._id,
      isDeleted: false,
    });

    // =========================================================
    // 3. GET ALL HOTEL BOOKINGS
    // =========================================================

    const bookings = await Booking.find({
      hotel: hotel._id,
    })
      .populate("room")
      .populate("hotel")
      .populate("user")
      .populate("selectedOffer")
      .sort({ createdAt: -1 });

    console.log("BOOKING COUNT:", bookings.length);

    // =========================================================
    // 4. ROOM ANALYTICS
    // =========================================================

    const totalRooms = rooms.length;

    const archivedRooms = await Room.countDocuments({
      hotel: hotel._id,
      isDeleted: true,
    });

    // =========================================================
    // 5. REVIEW ANALYTICS
    // =========================================================

    const reviews = await Review.find({
      hotel: hotel._id,
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce(
                (sum, review) => sum + Number(review.rating || 0),
                0,
              ) / totalReviews
            ).toFixed(1),
          )
        : 0;

    const reviewAnalytics = [1, 2, 3, 4, 5].map((rating) => {
      const count = reviews.filter(
        (review) => Number(review.rating) === rating,
      ).length;

      return {
        rating,
        count,
      };
    });

    // =========================================================
    // 6. CREATE TODAY DATE RANGE
    // =========================================================

    const todayStart = new Date();

    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();

    todayEnd.setHours(23, 59, 59, 999);

    // =========================================================
    // 7. TODAY CHECK-INS
    // =========================================================

    const todayCheckIns = bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkInDate);

      return (
        booking.status === "checked-in" &&
        checkInDate >= todayStart &&
        checkInDate <= todayEnd
      );
    }).length;

    // =========================================================
    // 8. TODAY SCHEDULED CHECK-OUTS
    // =========================================================

    const scheduledCheckOuts = bookings.filter((booking) => {
      const checkOutDate = new Date(booking.checkOutDate);

      return (
        booking.status === "checked-in" &&
        checkOutDate >= todayStart &&
        checkOutDate <= todayEnd
      );
    }).length;

    // =========================================================
    // 9. TOTAL BOOKINGS
    // =========================================================

    const totalBookings = bookings.length;

    // =========================================================
    // 10. TOTAL REVENUE
    // =========================================================

    const paidBookings = bookings.filter(
      (booking) => booking.isPaid === true && booking.status !== "cancelled",
    );

    const totalRevenue = paidBookings.reduce(
      (total, booking) => total + Number(booking.totalPrice || 0),
      0,
    );

    // =========================================================
    // 11. CURRENTLY OCCUPIED ROOMS
    // =========================================================

    const currentlyOccupiedRoomIds = new Set(
      bookings
        .filter(
          (booking) => booking.status === "checked-in" && booking.room?._id,
        )
        .map((booking) => booking.room._id.toString()),
    );

    const occupiedRooms = currentlyOccupiedRoomIds.size;

    // =========================================================
    // 12. AVAILABLE ROOMS
    // =========================================================

    const availableRooms = Math.max(totalRooms - occupiedRooms, 0);

    // =========================================================
    // 13. CURRENT OCCUPANCY RATE
    // =========================================================

    const occupancyRate =
      totalRooms > 0
        ? Number(((occupiedRooms / totalRooms) * 100).toFixed(0))
        : 0;

    // =========================================================
    // 14. ROOM BOOKING ANALYTICS
    // =========================================================

    const nonCancelledBookings = bookings.filter(
      (booking) => booking.status !== "cancelled",
    );

    const roomOccupancy = rooms.map((room) => {
      const roomBookings = nonCancelledBookings.filter(
        (booking) => booking.room?._id?.toString() === room._id.toString(),
      );

      return {
        roomId: room._id,
        roomType: room.roomType,
        bookings: roomBookings.length,
      };
    });

    // =========================================================
    // 15. SEND DASHBOARD DATA
    // =========================================================

    return res.status(200).json({
      success: true,

      dashboardData: {
        totalBookings,

        totalRevenue,

        totalRooms,

        availableRooms,

        archivedRooms,

        totalReviews,

        averageRating,

        occupancyRate,

        todayCheckIns,

        scheduledCheckOuts,

        bookings,

        roomOccupancy,

        reviewAnalytics,
      },
    });
  } catch (error) {
    console.log("GET HOTEL BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotel dashboard",
    });
  }
};

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized",
      });
    }

    console.log("BOOKING:", booking);

    const roomData = await Room.findById(booking.room).populate("hotel");

    console.log("ROOM:", roomData);

    const totalPrice = booking.totalPrice;

    const { origin } = req.headers;

    console.log("ORIGIN:", origin);

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    console.log("CREATING STRIPE SESSION...");

    if (booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Booking has already been paid",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be paid",
      });
    }

    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: roomData.hotel.name,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/loader/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      metadata: {
        bookingId,
      },
    });
    console.log("SESSION CREATED:", session.id);

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log("STRIPE ERROR:", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    // ==========================================
    // 1. VALIDATE REQUIRED DATA
    // ==========================================

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and status are required",
      });
    }

    // ==========================================
    // 2. FIND HOTEL OWNED BY LOGGED-IN USER
    // ==========================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this owner",
      });
    }

    // ==========================================
    // 3. FIND BOOKING
    // ==========================================

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // 4. VERIFY BOOKING BELONGS TO OWNER'S HOTEL
    // ==========================================

    if (booking.hotel.toString() !== hotel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking",
      });
    }

    // ==========================================
    // 5. VALID BOOKING STATUSES
    // ==========================================

    const validStatuses = [
      "pending",
      "confirmed",
      "checked-in",
      "checked-out",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // ==========================================
    // 6. ALLOWED STATUS TRANSITIONS
    // ==========================================

    const allowedTransitions = {
      pending: ["confirmed", "cancelled"],

      confirmed: ["checked-in", "cancelled"],

      "checked-in": ["checked-out"],

      "checked-out": [],

      cancelled: [],
    };

    const currentStatus = booking.status;

    const allowedNextStatuses = allowedTransitions[currentStatus];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change booking status from ${currentStatus} to ${status}`,
      });
    }

    // ==========================================
    // 7. UPDATE BOOKING STATUS
    // ==========================================

    booking.status = status;

    await booking.save();

    // ==========================================
    // 8. POPULATE UPDATED BOOKING
    // ==========================================

    await booking.populate("room hotel user selectedOffer");

    // ==========================================
    // 9. SEND RESPONSE
    // ==========================================

    return res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    console.log("UPDATE BOOKING STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API TO MARK CASH / PAY AT HOTEL BOOKING AS PAID
// PUT /api/bookings/mark-paid

export const markBookingAsPaid = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // 1. VALIDATE BOOKING ID
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // 2. FIND HOTEL OWNED BY LOGGED-IN USER
    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this owner",
      });
    }

    // 3. FIND BOOKING
    const booking = await Booking.findById(bookingId)
      .populate("room")
      .populate("hotel")
      .populate("user")
      .populate("selectedOffer");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 4. VERIFY BOOKING BELONGS TO OWNER'S HOTEL
    if (booking.hotel._id.toString() !== hotel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking",
      });
    }

    // 5. CHECK IF ALREADY PAID
    if (booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    // 6. CASH PAYMENT CAN ONLY BE RECORDED AFTER CHECK-IN
    if (booking.status !== "checked-in") {
      return res.status(400).json({
        success: false,
        message: "Cash payment can only be recorded after guest check-in",
      });
    }

    // 7. MARK BOOKING AS PAID
    booking.isPaid = true;
    booking.paymentMethod = "cash";
    booking.paidAt = new Date();

    await booking.save();

    console.log("CASH BOOKING SAVED:", {
      bookingId: booking._id,
      isPaid: booking.isPaid,
      paymentMethod: booking.paymentMethod,
      email: booking.email,
    });

    // 8. SEND CASH PAYMENT RECEIPT EMAIL
    try {
      console.log("SENDING CASH RECEIPT TO:", booking.email);

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: booking.email,
        subject: "Payment Receipt - Hotel Booking",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            
            <h2 style="color: #16a34a;">
              Payment Received Successfully
            </h2>

            <p>Dear ${booking.name},</p>

            <p>
              We have successfully received your cash payment for your hotel booking.
            </p>

            <h3>Payment Details</h3>

            <ul>
              <li>
                <strong>Booking ID:</strong>
                ${booking._id}
              </li>

              <li>
                <strong>Hotel:</strong>
                ${booking.hotel.name}
              </li>

              <li>
                <strong>Room:</strong>
                ${booking.room.roomType}
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
                <strong>Amount Paid:</strong>
                ${process.env.CURRENCY || "$"}${booking.totalPrice.toFixed(2)}
              </li>

              <li>
                <strong>Payment Method:</strong>
                Cash
              </li>

              <li>
                <strong>Payment Date:</strong>
                ${new Date(booking.paidAt).toLocaleString()}
              </li>
            </ul>

            <p>
              Thank you for choosing ${booking.hotel.name}.
            </p>

            <p>
              We hope you enjoy your stay!
            </p>

          </div>
        `,
      };

      const emailInfo = await transporter.sendMail(mailOptions);

      console.log("CASH PAYMENT RECEIPT EMAIL SENT TO:", booking.email);

      console.log("EMAIL MESSAGE ID:", emailInfo.messageId);
    } catch (emailError) {
      console.log("CASH PAYMENT RECEIPT EMAIL ERROR:", emailError.message);
    }

    // 9. SEND SUCCESS RESPONSE
    return res.json({
      success: true,
      message: "Cash payment marked as paid successfully",
      booking,
    });
  } catch (error) {
    console.log("MARK BOOKING AS PAID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // ==========================================
    // 1. VALIDATE BOOKING ID
    // ==========================================

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // ==========================================
    // 2. FIND BOOKING
    // ==========================================

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // 3. VERIFY BOOKING OWNER
    // ==========================================

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    // ==========================================
    // 4. PREVENT DUPLICATE CANCELLATION
    // ==========================================

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // ==========================================
    // 5. PREVENT CANCELLING COMPLETED BOOKINGS
    // ==========================================

    if (booking.status === "checked-out") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    // ==========================================
    // 6. PREVENT CANCELLING CHECKED-IN BOOKINGS
    // ==========================================

    if (booking.status === "checked-in") {
      return res.status(400).json({
        success: false,
        message: "Checked-in bookings cannot be cancelled",
      });
    }

    // ==========================================
    // 7. CHECK CHECK-IN DATE
    // ==========================================

    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);

    if (now >= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Booking can no longer be cancelled",
      });
    }

    // ==========================================
    // 8. CANCEL BOOKING
    // ==========================================

    booking.status = "cancelled";

    await booking.save();

    console.log("BOOKING CANCELLED:", {
      bookingId: booking._id,
      user: booking.user,
      isPaid: booking.isPaid,
      paymentMethod: booking.paymentMethod,
      status: booking.status,
    });

    // ==========================================
    // 9. SEND RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message: booking.isPaid
        ? "Booking cancelled successfully. Payment remains recorded."
        : "Booking cancelled successfully",

      booking: {
        bookingId: booking._id,
        status: booking.status,
        isPaid: booking.isPaid,
        paymentMethod: booking.paymentMethod,
      },
    });
  } catch (error) {
    console.log("CANCEL BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

// =========================================================
// UPDATE / MODIFY BOOKING BY HOTEL OWNER
// PUT /api/bookings/modify
// =========================================================

export const modifyBooking = async (req, res) => {
  try {
    const { bookingId, checkInDate, checkOutDate, guests, specialRequest } =
      req.body;

    // =====================================================
    // 1. VALIDATE REQUIRED DATA
    // =====================================================

    if (!bookingId || !checkInDate || !checkOutDate || !guests) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking information",
      });
    }

    // =====================================================
    // 2. FIND HOTEL OWNED BY LOGGED-IN USER
    // =====================================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this owner",
      });
    }

    // =====================================================
    // 3. FIND BOOKING
    // =====================================================

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // =====================================================
    // 4. VERIFY BOOKING BELONGS TO OWNER'S HOTEL
    // =====================================================

    if (booking.hotel.toString() !== hotel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this booking",
      });
    }

    // =====================================================
    // 5. ONLY PENDING / CONFIRMED BOOKINGS CAN BE MODIFIED
    // =====================================================

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `${booking.status} bookings cannot be modified`,
      });
    }

    // =====================================================
    // 6. PAID BOOKINGS CANNOT BE MODIFIED
    // =====================================================

    if (booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Paid bookings cannot be modified",
      });
    }

    // =====================================================
    // 7. VALIDATE DATES
    // =====================================================

    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);

    if (
      Number.isNaN(newCheckIn.getTime()) ||
      Number.isNaN(newCheckOut.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking dates",
      });
    }

    if (newCheckOut <= newCheckIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // =====================================================
    // 8. VALIDATE GUEST COUNT
    // =====================================================

    const guestCount = Number(guests);

    if (Number.isNaN(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid number of guests",
      });
    }

    // =====================================================
    // 9. FIND ROOM
    // =====================================================

    const room = await Room.findById(booking.room);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // =====================================================
    // 10. CHECK DATE CONFLICT
    //
    // IMPORTANT:
    // EXCLUDE THE CURRENT BOOKING USING $ne
    // =====================================================

    const conflictingBooking = await Booking.findOne({
      _id: {
        $ne: booking._id,
      },

      room: booking.room,

      status: {
        $ne: "cancelled",
      },

      checkInDate: {
        $lt: newCheckOut,
      },

      checkOutDate: {
        $gt: newCheckIn,
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "Room is not available for the selected dates",
      });
    }

    // =====================================================
    // 11. CALCULATE NUMBER OF NIGHTS
    // =====================================================

    const timeDifference = newCheckOut.getTime() - newCheckIn.getTime();

    const nights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: "Booking must be for at least one night",
      });
    }

    // =====================================================
    // 12. CALCULATE SUBTOTAL
    // =====================================================

    const subtotal = Number((room.pricePerNight * nights).toFixed(2));

    let discount = 0;

    // =====================================================
    // 13. REVALIDATE EXISTING OFFER
    // =====================================================

    if (booking.selectedOffer) {
      const offer = await Offer.findById(booking.selectedOffer);

      const offerIsValid =
        offer &&
        offer.isActive &&
        new Date(offer.validTill) >= new Date() &&
        nights >= offer.minimumStay;

      if (offerIsValid) {
        if (offer.discountType === "percentage") {
          discount = Number(
            ((subtotal * Number(offer.discount)) / 100).toFixed(2),
          );
        } else {
          discount = Number(
            Math.min(Number(offer.discount), subtotal).toFixed(2),
          );
        }
      } else {
        // Remove offer if new dates no longer qualify
        booking.selectedOffer = null;
      }
    }

    // =====================================================
    // 14. CALCULATE PRICE AFTER DISCOUNT
    // =====================================================

    const discountedPrice = Number(Math.max(subtotal - discount, 0).toFixed(2));

    // =====================================================
    // 15. CALCULATE TAX
    // =====================================================

    const tax = Number((discountedPrice * 0.12).toFixed(2));

    // =====================================================
    // 16. CALCULATE NEW TOTAL
    // =====================================================

    const totalPrice = Number((discountedPrice + tax).toFixed(2));

    // =====================================================
    // 17. UPDATE BOOKING
    // =====================================================

    booking.checkInDate = newCheckIn;

    booking.checkOutDate = newCheckOut;

    booking.guests = guestCount;

    booking.specialRequest = specialRequest?.trim() || "";

    booking.totalPrice = totalPrice;

    // Since dates changed, allow reminder cron to send again
    booking.reminderSent = false;

    // IMPORTANT:
    // Some older bookings do not contain name, email, and phone.
    // Disable full-document validation when modifying those bookings.
    await booking.save({
      validateBeforeSave: false,
    });

    // =====================================================
    // 18. POPULATE UPDATED BOOKING
    // =====================================================

    await booking.populate("room hotel user selectedOffer");

    // =====================================================
    // 19. CREATE USER NOTIFICATION
    // =====================================================

    try {
      await Notification.create({
        user: booking.user._id || booking.user,

        type: "booking_update",

        title: "Booking Updated",

        message: `Your booking dates have been updated to ${newCheckIn.toDateString()} - ${newCheckOut.toDateString()}.`,

        relatedBooking: booking._id,
      });
    } catch (notificationError) {
      console.log(
        "BOOKING UPDATE NOTIFICATION ERROR:",
        notificationError.message,
      );
    }

    // =====================================================
    // 20. SUCCESS RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message: "Booking modified successfully",

      booking,

      priceDetails: {
        nights,
        subtotal,
        discount,
        tax,
        totalPrice,
      },
    });
  } catch (error) {
    console.log("MODIFY BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to modify booking",
    });
  }
};
