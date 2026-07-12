import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Review from "../models/Review.js";

// =========================================================
// ADD REVIEW
// =========================================================

export const addReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // =====================================================
    // VALIDATE INPUT
    // =====================================================

    if (!bookingId || !rating || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Booking, rating, and comment are required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // =====================================================
    // FIND BOOKING
    // =====================================================

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // =====================================================
    // ONLY BOOKING OWNER CAN REVIEW
    // =====================================================

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =====================================================
    // ONLY CHECKED-OUT BOOKINGS CAN BE REVIEWED
    // =====================================================

    if (booking.status !== "checked-out") {
      return res.status(400).json({
        success: false,
        message: "You can review only after your stay is completed",
      });
    }

    // =====================================================
    // ONLY PAID BOOKINGS CAN BE REVIEWED
    // =====================================================

    if (!booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be reviewed",
      });
    }

    // =====================================================
    // PREVENT DUPLICATE REVIEWS
    // =====================================================

    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Review already submitted",
      });
    }

    // =====================================================
    // GET USER NAME
    // =====================================================

    const userName =
      req.user.username ||
      req.user.firstName ||
      req.user.name ||
      req.user.email ||
      "Guest";

    // =====================================================
    // CREATE REVIEW
    // =====================================================

    const review = await Review.create({
      user: booking.user,

      userName,

      hotel: booking.hotel,

      room: booking.room,

      booking: booking._id,

      rating: numericRating,

      comment: comment.trim(),

      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully and is awaiting approval",
      review,
    });
  } catch (error) {
    console.log("ADD REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

// =========================================================
// GET REVIEWS FOR A ROOM
// =========================================================

export const getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      room: req.params.roomId,

      // Show approved reviews and old reviews without status
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    }).sort({
      createdAt: -1,
    });

    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, review) => acc + review.rating, 0) /
              reviews.length
            ).toFixed(1),
          )
        : 0;

    return res.status(200).json({
      success: true,
      reviews,
      averageRating,
    });
  } catch (error) {
    console.log("GET ROOM REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch room reviews",
    });
  }
};

// =========================================================
// GET HOTEL REVIEWS FOR HOTEL OWNER
// =========================================================

export const getHotelReviews = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const reviews = await Review.find({
      hotel: hotel._id,
    })
      .populate("room", "roomType images")
      .populate("hotel", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("GET HOTEL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotel reviews",
    });
  }
};

// =========================================================
// GET ALL PUBLIC APPROVED REVIEWS
// =========================================================

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      // Show approved reviews and old reviews without status
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    })
      .populate("room", "roomType images")
      .populate("hotel", "name city address")
      .sort({
        createdAt: -1,
      })
      .limit(100);

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("GET ALL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

// =========================================================
// APPROVE REVIEW
// =========================================================

export const approveReview = async (req, res) => {
  try {
    // =====================================================
    // FIND HOTEL OWNED BY LOGGED-IN USER
    // =====================================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // =====================================================
    // FIND REVIEW BELONGING TO OWNER'S HOTEL
    // =====================================================

    const review = await Review.findOne({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // =====================================================
    // APPROVE REVIEW
    // =====================================================

    review.status = "approved";

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review approved successfully",
      review,
    });
  } catch (error) {
    console.log("APPROVE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve review",
    });
  }
};

// =========================================================
// REJECT REVIEW
// =========================================================

export const rejectReview = async (req, res) => {
  try {
    // =====================================================
    // FIND HOTEL OWNED BY LOGGED-IN USER
    // =====================================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // =====================================================
    // FIND REVIEW BELONGING TO OWNER'S HOTEL
    // =====================================================

    const review = await Review.findOne({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // =====================================================
    // REJECT REVIEW
    // =====================================================

    review.status = "rejected";

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      review,
    });
  } catch (error) {
    console.log("REJECT REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject review",
    });
  }
};

// =========================================================
// HOTEL OWNER RESPONSE TO REVIEW
// =========================================================

export const respondToReview = async (req, res) => {
  try {
    const { response } = req.body;

    // =====================================================
    // VALIDATE RESPONSE
    // =====================================================

    if (!response || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: "Response is required",
      });
    }

    // =====================================================
    // FIND HOTEL OWNED BY LOGGED-IN USER
    // =====================================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // =====================================================
    // FIND REVIEW BELONGING TO OWNER'S HOTEL
    // =====================================================

    const review = await Review.findOne({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // =====================================================
    // ADD HOTEL OWNER RESPONSE
    // =====================================================

    review.adminResponse = response.trim();

    review.respondedAt = new Date();

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Response added successfully",
      review,
    });
  } catch (error) {
    console.log("RESPOND REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to respond to review",
    });
  }
};

// =========================================================
// DELETE REVIEW
// =========================================================

export const deleteReview = async (req, res) => {
  try {
    // =====================================================
    // FIND HOTEL OWNED BY LOGGED-IN USER
    // =====================================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // =====================================================
    // DELETE ONLY REVIEW BELONGING TO OWNER'S HOTEL
    // =====================================================

    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      hotel: hotel._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review",
    });
  }
};
