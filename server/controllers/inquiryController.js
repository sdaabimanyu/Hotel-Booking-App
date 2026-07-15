import Inquiry from "../models/Inquiry.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Notification from "../models/Notification.js";

// =====================================================
// CREATE BOOKING INQUIRY
// =====================================================

export const createInquiry = async (req, res) => {
  try {
    const { bookingId, subject, message } = req.body;

    if (!bookingId || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide booking, subject, and message",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const inquiry = await Inquiry.create({
      booking: booking._id,
      user: req.user._id,
      hotel: booking.hotel,
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiry,
    });
  } catch (error) {
    console.log("CREATE INQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET LOGGED-IN USER INQUIRIES
// =====================================================

export const getUserInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      user: req.user._id,
    })
      .populate("booking")
      .populate("hotel", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.log("GET USER INQUIRIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET HOTEL OWNER INQUIRIES
// =====================================================

export const getHotelInquiries = async (req, res) => {
  try {
    console.log("========== OWNER INQUIRIES ==========");
    console.log("REQ USER:", req.user);

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    console.log("HOTEL FOUND:", hotel);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const inquiries = await Inquiry.find({
      hotel: hotel._id,
    })
      .populate("booking")
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    console.log("INQUIRY COUNT:", inquiries.length);

    return res.status(200).json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.log("GET HOTEL INQUIRIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// HOTEL OWNER REPLY TO INQUIRY
// =====================================================

export const replyToInquiry = async (req, res) => {
  try {
    const { inquiryId, reply } = req.body;

    if (!inquiryId || !reply?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Inquiry ID and reply are required",
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

    const inquiry = await Inquiry.findOne({
      _id: inquiryId,
      hotel: hotel._id,
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    inquiry.reply = reply.trim();
    inquiry.status = "answered";
    inquiry.repliedAt = new Date();

    await inquiry.save();

    // Create notification for the user
    try {
      await Notification.create({
        user: inquiry.user,

        type: "booking_inquiry",

        title: "Booking Inquiry Answered",

        message: `${hotel.name} has replied to your booking inquiry.`,

        relatedBooking: inquiry.booking,
      });
    } catch (notificationError) {
      console.log("INQUIRY NOTIFICATION ERROR:", notificationError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      inquiry,
    });
  } catch (error) {
    console.log("REPLY TO INQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
