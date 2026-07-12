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
    // 1. VALIDATE REQUIRED DATA
    // =====================================================

    if (!bookingId || !rating || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Booking, rating, and comment are required",
      });
    }

    // =====================================================
    // 2. VALIDATE RATING
    // =====================================================

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
    // 4. ONLY BOOKING OWNER CAN REVIEW
    // =====================================================

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to review this booking",
      });
    }

    // =====================================================
    // 5. CANCELLED BOOKINGS CANNOT BE REVIEWED
    // =====================================================

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be reviewed",
      });
    }

    // =====================================================
    // 6. ONLY CHECKED-OUT BOOKINGS CAN BE REVIEWED
    // =====================================================

    if (booking.status !== "checked-out") {
      return res.status(400).json({
        success: false,
        message: "You can review only after completing your stay",
      });
    }

    // =====================================================
    // 7. CHECK IF REVIEW ALREADY EXISTS
    // =====================================================

    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Review already submitted for this booking",
      });
    }

    // =====================================================
    // 8. CREATE REVIEW
    // =====================================================

    const review = await Review.create({
      user: booking.user,

      userName:
        req.user.firstName || req.user.username || req.user.email || "Guest",

      hotel: booking.hotel,

      room: booking.room,

      booking: booking._id,

      rating: numericRating,

      comment: comment.trim(),

      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully and is waiting for approval",
      review,
    });
  } catch (error) {
    console.log("ADD REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

// =========================================================
// GET REVIEWS FOR ONE ROOM
// =========================================================

export const getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      room: req.params.roomId,

      $or: [
        {
          status: "approved",
        },
        {
          status: {
            $exists: false,
          },
        },
      ],
    }).sort({
      createdAt: -1,
    });

    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce(
                (accumulator, review) => accumulator + review.rating,
                0,
              ) / reviews.length
            ).toFixed(1),
          )
        : 0;

    return res.json({
      success: true,
      reviews,
      averageRating,
    });
  } catch (error) {
    console.log("GET ROOM REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch room reviews",
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

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("GET HOTEL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotel reviews",
    });
  }
};

// =========================================================
// GET ALL PUBLIC REVIEWS
// =========================================================

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      $or: [
        {
          status: "approved",
        },
        {
          status: {
            $exists: false,
          },
        },
      ],
    })
      .populate("room", "roomType images")
      .populate("hotel", "name city address")
      .sort({
        createdAt: -1,
      })
      .limit(100);

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("GET ALL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// =========================================================
// APPROVE REVIEW
// =========================================================

export const approveReview = async (req, res) => {
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

    review.status = "approved";

    await review.save();

    return res.json({
      success: true,
      message: "Review approved successfully",
      review,
    });
  } catch (error) {
    console.log("APPROVE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve review",
    });
  }
};

// =========================================================
// REJECT REVIEW
// =========================================================

export const rejectReview = async (req, res) => {
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

    review.status = "rejected";

    await review.save();

    return res.json({
      success: true,
      message: "Review rejected successfully",
      review,
    });
  } catch (error) {
    console.log("REJECT REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject review",
    });
  }
};

// =========================================================
// HOTEL OWNER RESPONSE
// =========================================================

export const respondToReview = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Response is required",
      });
    }

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

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

    review.adminResponse = response.trim();

    review.respondedAt = new Date();

    await review.save();

    return res.json({
      success: true,
      message: "Response added successfully",
      review,
    });
  } catch (error) {
    console.log("RESPOND REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add response",
    });
  }
};

// =========================================================
// DELETE REVIEW
// =========================================================

export const deleteReview = async (req, res) => {
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

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
