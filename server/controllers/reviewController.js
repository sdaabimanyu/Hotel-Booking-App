import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Review from "../models/Review.js";

export const addReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // Review only after stay is completed
    if (new Date() < new Date(booking.checkOutDate)) {
      return res.json({
        success: false,
        message: "You can review only after your stay is completed",
      });
    }

    // Only booking owner can review
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Only paid bookings
    if (!booking.isPaid) {
      return res.json({
        success: false,
        message: "Complete payment first",
      });
    }

    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.json({
        success: false,
        message: "Review already submitted",
      });
    }

    await Review.create({
      user: booking.user,
      userName:
        req.user.firstName ||
        req.user.username ||
        req.user.emailAddresses?.[0]?.emailAddress ||
        "Guest",

      hotel: booking.hotel,
      room: booking.room,
      booking: bookingId,
      rating,
      comment,
    });

    res.json({
      success: true,
      message: "Review Added",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
export const getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      room: req.params.roomId,
    })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      reviews,
      averageRating,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getHotelReviews = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.json({
        success: false,
        message: "Hotel not found",
      });
    }

    const reviews = await Review.find({
      hotel: hotel._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
