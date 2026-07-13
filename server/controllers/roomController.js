import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Review from "../models/Review.js";
import { cloudinary } from "../configs/cloudinary.js";
import { getAuth } from "@clerk/express";

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    // ==========================================
    // 1. GET LOGGED-IN USER
    // ==========================================

    const { userId } = getAuth(req);

    // ==========================================
    // 2. FIND OWNER'S HOTEL
    // ==========================================

    const hotel = await Hotel.findOne({
      owner: userId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel Found",
      });
    }

    // ==========================================
    // 3. GET ROOM DATA
    // ==========================================

    const {
      roomType,
      description,
      roomSize,
      bedType,
      view,
      pricePerNight,
      amenities,
    } = req.body;

    // ==========================================
    // 4. VALIDATE REQUIRED DATA
    // ==========================================

    if (
      !roomType ||
      !description ||
      !roomSize ||
      !bedType ||
      !view ||
      !pricePerNight ||
      !amenities
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required room details",
      });
    }

    // ==========================================
    // 5. VALIDATE PRICE
    // ==========================================

    const roomPrice = Number(pricePerNight);

    if (Number.isNaN(roomPrice) || roomPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid room price",
      });
    }

    // ==========================================
    // 6. PARSE AMENITIES
    // ==========================================

    let parsedAmenities;

    try {
      parsedAmenities = JSON.parse(amenities);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid amenities data",
      });
    }

    if (!Array.isArray(parsedAmenities) || parsedAmenities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one amenity",
      });
    }

    // ==========================================
    // 7. VALIDATE IMAGES
    // ==========================================

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one room image",
      });
    }

    // ==========================================
    // 8. UPLOAD IMAGES TO CLOUDINARY
    // ==========================================

    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "hotel-booking",
        resource_type: "auto",
        use_filename: true,
      });

      imageUrls.push(result.secure_url);
    }

    // ==========================================
    // 9. CREATE ROOM
    // ==========================================

    const room = await Room.create({
      hotel: hotel._id,

      roomType: roomType.trim(),

      description: description.trim(),

      roomSize: roomSize.trim(),

      bedType: bedType.trim(),

      view: view.trim(),

      pricePerNight: roomPrice,

      amenities: parsedAmenities,

      images: imageUrls,
    });

    // ==========================================
    // 10. SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.log("CREATE ROOM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create room",
    });
  }
};

// GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      isAvailable: true,
      isDeleted: false,
    })
      .populate("hotel")
      .sort({ createdAt: -1 })
      .lean();

    const roomsWithReviews = await Promise.all(
      rooms.map(async (room) => {
        const reviews = await Review.find({
          room: room._id,
          $or: [{ status: "approved" }, { status: { $exists: false } }],
        });

        const reviewCount = reviews.length;

        const averageRating =
          reviewCount > 0
            ? reviews.reduce((total, review) => total + review.rating, 0) /
              reviewCount
            : 0;

        return {
          ...room,
          reviewCount,
          averageRating,
        };
      }),
    );

    res.json({
      success: true,
      rooms: roomsWithReviews,
    });
  } catch (error) {
    console.log("GET ROOMS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// OWNER ROOMS
export const getOwnerRooms = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const hotel = await Hotel.findOne({ owner: userId });

    const rooms = await Room.find({
      hotel: hotel._id,
      isDeleted: false,
    }).populate("hotel");

    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findById(roomId);

    room.isAvailable = !room.isAvailable;

    await room.save();

    res.json({
      success: true,
      message: "Room availability updated",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ROOM
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    res.json({
      success: true,
      room,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ROOM
export const updateRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        roomType,
        pricePerNight,
        amenities,
      },
      { new: true },
    );

    res.json({
      success: true,
      room,
      message: "Room Updated Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      isAvailable: false,
    });

    res.json({
      success: true,
      message: "Room archived successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
