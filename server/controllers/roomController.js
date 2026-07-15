import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Review from "../models/Review.js";
import { cloudinary } from "../configs/cloudinary.js";
import { getAuth } from "@clerk/express";

// =========================================================
// CREATE ROOM
// =========================================================

export const createRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    // =========================================================
    // 1. FIND OWNER'S HOTEL
    // =========================================================

    const hotel = await Hotel.findOne({
      owner: userId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel Found",
      });
    }

    // =========================================================
    // 2. GET ROOM DATA
    // =========================================================

    const {
      roomType,
      description,
      roomSize,
      bedType,
      view,
      pricePerNight,
      amenities,
    } = req.body;

    // =========================================================
    // 3. VALIDATE REQUIRED DATA
    // =========================================================

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

    // =========================================================
    // 4. VALIDATE PRICE
    // =========================================================

    const roomPrice = Number(pricePerNight);

    if (Number.isNaN(roomPrice) || roomPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid room price",
      });
    }

    // =========================================================
    // 5. PARSE AMENITIES
    // =========================================================

    let parsedAmenities;

    try {
      parsedAmenities =
        typeof amenities === "string" ? JSON.parse(amenities) : amenities;
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

    // =========================================================
    // 6. VALIDATE IMAGES
    // =========================================================

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one room image",
      });
    }

    // =========================================================
    // 7. UPLOAD IMAGES
    // =========================================================

    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "hotel-booking",
        resource_type: "auto",
        use_filename: true,
      });

      imageUrls.push(result.secure_url);
    }

    // =========================================================
    // 8. CREATE ROOM
    // =========================================================

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

// =========================================================
// GET ALL PUBLIC ROOMS
// =========================================================

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      isAvailable: true,
      isDeleted: false,
    })
      .populate("hotel")
      .sort({
        createdAt: -1,
      })
      .lean();

    const roomsWithReviews = await Promise.all(
      rooms.map(async (room) => {
        const reviews = await Review.find({
          room: room._id,

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
        });

        const reviewCount = reviews.length;

        const averageRating =
          reviewCount > 0
            ? reviews.reduce(
                (total, review) => total + Number(review.rating || 0),
                0,
              ) / reviewCount
            : 0;

        return {
          ...room,

          reviewCount,

          averageRating: Number(averageRating.toFixed(1)),
        };
      }),
    );

    return res.status(200).json({
      success: true,
      rooms: roomsWithReviews,
    });
  } catch (error) {
    console.log("GET ROOMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET OWNER ROOMS
// =========================================================

export const getOwnerRooms = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    console.log("========== OWNER ROOMS ==========");
    console.log("REQ USER:", req.user);
    const hotel = await Hotel.findOne({
      owner: userId,
    });
    console.log("HOTEL FOUND:", hotel);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel Found",
      });
    }

    const rooms = await Room.find({
      hotel: hotel._id,
      isDeleted: false,
    })
      .populate("hotel")
      .sort({
        createdAt: -1,
      });
    console.log("ROOM COUNT:", rooms.length);
    console.log("ROOMS:", rooms);
    return res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.log("GET OWNER ROOMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// TOGGLE ROOM AVAILABILITY
// =========================================================

export const toggleRoomAvailability = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    // =========================================================
    // FIND OWNER HOTEL
    // =========================================================

    const hotel = await Hotel.findOne({
      owner: userId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel Found",
      });
    }

    // =========================================================
    // FIND ROOM BELONGING TO OWNER
    // =========================================================

    const room = await Room.findOne({
      _id: roomId,
      hotel: hotel._id,
      isDeleted: false,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // =========================================================
    // TOGGLE AVAILABILITY
    // =========================================================

    room.isAvailable = !room.isAvailable;

    await room.save();

    return res.status(200).json({
      success: true,

      message: room.isAvailable
        ? "Room is now available"
        : "Room is now unavailable",

      room,
    });
  } catch (error) {
    console.log("TOGGLE ROOM AVAILABILITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET SINGLE ROOM
// =========================================================

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.log("GET ROOM BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// UPDATE ROOM
// =========================================================

// UPDATE ROOM
export const updateRoom = async (req, res) => {
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
        message: "Hotel not found",
      });
    }

    // ==========================================
    // 3. FIND ROOM
    // ==========================================

    const room = await Room.findOne({
      _id: req.params.id,
      hotel: hotel._id,
      isDeleted: false,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // ==========================================
    // 4. GET UPDATED DATA
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
    // 5. VALIDATE REQUIRED DATA
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
    // 6. VALIDATE PRICE
    // ==========================================

    const roomPrice = Number(pricePerNight);

    if (Number.isNaN(roomPrice) || roomPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid room price",
      });
    }

    // ==========================================
    // 7. VALIDATE AMENITIES
    // ==========================================

    if (!Array.isArray(amenities) || amenities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one amenity",
      });
    }

    // ==========================================
    // 8. UPDATE ROOM
    // ==========================================

    room.roomType = roomType.trim();

    room.description = description.trim();

    room.roomSize = roomSize.trim();

    room.bedType = bedType.trim();

    room.view = view.trim();

    room.pricePerNight = roomPrice;

    room.amenities = amenities.map((item) => item.trim()).filter(Boolean);

    // ==========================================
    // 9. SAVE ROOM
    // ==========================================

    await room.save();

    // ==========================================
    // 10. SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.log("UPDATE ROOM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update room",
    });
  }
};

// =========================================================
// ARCHIVE ROOM
// =========================================================

export const deleteRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    // =========================================================
    // 1. FIND OWNER HOTEL
    // =========================================================

    const hotel = await Hotel.findOne({
      owner: userId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel Found",
      });
    }

    // =========================================================
    // 2. FIND OWNER'S ROOM
    // =========================================================

    const room = await Room.findOne({
      _id: req.params.id,
      hotel: hotel._id,
      isDeleted: false,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // =========================================================
    // 3. ARCHIVE ROOM
    // =========================================================

    room.isDeleted = true;

    room.isAvailable = false;

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room archived successfully",
    });
  } catch (error) {
    console.log("DELETE ROOM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
