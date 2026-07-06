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

      // Show approved reviews + old reviews without status
      $or: [{ status: "approved" }, { status: { $exists: false } }],
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
    console.log("GET ROOM REVIEWS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHotelReviews = async (req, res) => {
  try {
    console.log("Logged In User:", req.user);

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });
    console.log("Hotel Found:", hotel);

    if (!hotel) {
      return res.json({
        success: false,
        message: "Hotel not found",
      });
    }

    const reviews = await Review.find({
      hotel: hotel._id,
    })
      .populate("user", "username")
      .populate("room", "roomType images")
      .populate("hotel", "name")
      .sort({ createdAt: -1 });

    console.log("Reviews:", reviews);

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      // Show approved reviews + old reviews without status
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    })
      .populate("room", "roomType images")
      .populate("hotel", "name city address")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("GET ALL REVIEWS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// APPROVE REVIEW
export const approveReview = async (req, res) => {
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

    const review = await Review.findOne({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = "approved";

    await review.save();

    res.json({
      success: true,
      message: "Review approved successfully",
      review,
    });
  } catch (error) {
    console.log("APPROVE REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REJECT REVIEW
export const rejectReview = async (req, res) => {
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

    const review = await Review.findOne({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = "rejected";

    await review.save();

    res.json({
      success: true,
      message: "Review rejected successfully",
      review,
    });
  } catch (error) {
    console.log("REJECT REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN RESPONSE
export const respondToReview = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.json({
        success: false,
        message: "Response is required",
      });
    }

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.json({
        success: false,
        message: "Hotel not found",
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    review.adminResponse = response.trim();
    review.respondedAt = new Date();

    await review.save();

    res.json({
      success: true,
      message: "Response added successfully",
      review,
    });
  } catch (error) {
    console.log("RESPOND REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE REVIEW
export const deleteReview = async (req, res) => {
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

    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("DELETE REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
