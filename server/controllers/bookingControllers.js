import { messageInRaw } from "svix";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import transporter from "../configs/nodemailer.js";
import stripe from "stripe";
import Review from "../models/Review.js";

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
    const { room, checkInDate, checkOutDate, guests } = req.body;
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
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
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
      <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || "$"} ${booking.totalPrice} /night</li>
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
    console.log("AUTH USER:", req.auth.userId);

    const hotels = await Hotel.find();

    console.log("ALL HOTELS:", hotels);

    console.log("req.auth =", req.auth);
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

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });
    const totalRooms = await Room.countDocuments({
      hotel: hotel._id,
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

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );
    const occupancyRate =
      totalRooms > 0
        ? (((totalRooms - availableRooms) / totalRooms) * 100).toFixed(0)
        : 0;

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
        bookings,
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
            unit_amount: totalPrice * 100,
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

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true },
    );

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.json({
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
