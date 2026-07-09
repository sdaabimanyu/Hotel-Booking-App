import { messageInRaw } from "svix";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import transporter from "../configs/nodemailer.js";
import stripe from "stripe";
import Review from "../models/Review.js";
import Offer from "../models/Offer.js";

// Function to Check Availability of Room
const checkAvailability = async (checkInDate, checkOutDate, room) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });

    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.error(error.message);
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

    //Before Booking check Availability
    const isAvailable = await checkAvailability(
      checkInDate,
      checkOutDate,
      room,
    );

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is not available",
      });
    }

    // Get totalPrice from Room
    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    // Calculate totalprice based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;

    // Apply Offer
    let discount = 0;

    if (selectedOffer) {
      const offer = await Offer.findById(selectedOffer);

      if (
        offer &&
        offer.isActive &&
        new Date(offer.validTill) >= new Date() &&
        nights >= offer.minimumStay
      ) {
        if (offer.discountType === "percentage") {
          discount = Number(((totalPrice * offer.discount) / 100).toFixed(2));
        } else {
          discount = Number(offer.discount.toFixed(2));
        }

        offer.usedCount += 1;
        await offer.save();
      }
    }

    totalPrice = Number(Math.max(totalPrice - discount, 0).toFixed(2));

    const tax = Number((totalPrice * 0.12).toFixed(2));

    totalPrice = Number((totalPrice + tax).toFixed(2));
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,

      name,
      email,
      phone,
      specialRequest,
      selectedOffer,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: "Hotel Booking Details",
      html: `
      <h2>Your Booking Details</h2>
      <p>Dear ${req.user.username},</p>
      <p>Thank you for your booking! Here are your details:</p>
      <ul>
      <li><strong>Booking ID:</strong> ${booking._id}</li>
      <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
      <li><strong>Location:</strong> ${roomData.hotel.address}</li> 
      <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
      <li><strong>Total Amount:</strong>
      ${process.env.CURRENCY || "$"} ${booking.totalPrice.toFixed(2)}
      </li>
      </ul>
      <p>We look forward to welcoming you!</p>
      <p>If you need to make any changes, feel free to contact us.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Booking Created Successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.log("BOOKING ERROR:", error);

    res.json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;

    const bookings = await Booking.find({ user })
      .populate("room")
      .populate("hotel")
      .populate("selectedOffer")
      .sort({ createdAt: -1 });

    const bookingsWithReviews = await Promise.all(
      bookings.map(async (booking) => {
        const review = await Review.findOne({
          booking: booking._id,
        });

        return {
          ...booking.toObject(),
          reviewSubmitted: !!review,
        };
      }),
    );

    res.json({
      success: true,
      bookings: bookingsWithReviews,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    console.log("===== GET HOTEL BOOKINGS CONTROLLER HIT =====");

    const hotels = await Hotel.find();

    console.log("ALL HOTELS:", hotels);

    console.log("req.user =", req.user);

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    console.log("MATCHED HOTEL:", hotel);

    if (!hotel) {
      return res.json({
        success: false,
        message: "No Hotel Found",
      });
    }
    const allRooms = await Room.find({
      hotel: hotel._id,
    });

    console.log("ROOMS FOUND:", allRooms.length);
    console.log(
      allRooms.map((room) => ({
        id: room._id,
        roomType: room.roomType,
        isDeleted: room.isDeleted,
        isAvailable: room.isAvailable,
      })),
    );
    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user selectedOffer")
      .sort({ createdAt: -1 });
    const totalRooms = await Room.countDocuments({
      hotel: hotel._id,
      isDeleted: false,
    });

    const availableRooms = await Room.countDocuments({
      hotel: hotel._id,
      isAvailable: true,
      isDeleted: false,
    });

    const archivedRooms = await Room.countDocuments({
      hotel: hotel._id,
      isDeleted: true,
    });

    const totalReviews = await Review.countDocuments({
      hotel: hotel._id,
    });

    const reviews = await Review.find({
      hotel: hotel._id,
    });

    const averageRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(1)
        : 0;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const todayCheckIns = bookings.filter((booking) => {
      const checkIn = new Date(booking.checkInDate);

      checkIn.setHours(0, 0, 0, 0);

      return checkIn.getTime() === today.getTime();
    }).length;

    const todayCheckOuts = bookings.filter((booking) => {
      const checkOut = new Date(booking.checkOutDate);

      checkOut.setHours(0, 0, 0, 0);

      return checkOut.getTime() === today.getTime();
    }).length;

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );
    const occupancyRate =
      totalRooms > 0
        ? (((totalRooms - availableRooms) / totalRooms) * 100).toFixed(0)
        : 0;

    const rooms = await Room.find({
      hotel: hotel._id,
      isDeleted: false,
    });

    const roomOccupancy = rooms.map((room) => {
      const roomBookings = bookings.filter(
        (booking) => booking.room._id.toString() === room._id.toString(),
      );

      const occupied = roomBookings.length;

      const occupancy =
        roomBookings.length > 0 ? Math.min(roomBookings.length * 20, 100) : 0;

      return {
        roomType: room.roomType,
        occupancy,
        bookings: occupied,
      };
    });

    console.log("todayCheckIns:", todayCheckIns);
    console.log("todayCheckOuts:", todayCheckOuts);

    res.json({
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
        todayCheckOuts,

        bookings,
        roomOccupancy,
      },
    });
  } catch (error) {
    console.log("GET HOTEL BOOKINGS ERROR:", error);

    res.json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    console.log("BOOKING:", booking);

    const roomData = await Room.findById(booking.room).populate("hotel");

    console.log("ROOM:", roomData);

    const totalPrice = booking.totalPrice;

    const { origin } = req.headers;

    console.log("ORIGIN:", origin);

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    console.log("CREATING STRIPE SESSION...");

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

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only booking owner can cancel
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Cannot cancel after check-in date
    if (new Date() >= new Date(booking.checkInDate)) {
      return res.json({
        success: false,
        message: "Booking can no longer be cancelled",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
