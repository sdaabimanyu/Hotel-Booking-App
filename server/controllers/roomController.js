import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { cloudinary } from "../configs/cloudinary.js";
import { getAuth } from "@clerk/express";

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const hotel = await Hotel.findOne({ owner: userId });

    if (!hotel) {
      return res.json({
        success: false,
        message: "No Hotel Found",
      });
    }

    const { roomType, pricePerNight, amenities } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.json({
        success: false,
        message: "No images uploaded",
      });
    }

    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "hotel-booking",
        resource_type: "auto",
        use_filename: true,
      });

      imageUrls.push(result.secure_url);
    }

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities: JSON.parse(amenities),
      images: imageUrls,
    });

    return res.json({
      success: true,
      message: "Room created successfully",
    });
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    console.log("GET ROOMS HIT");

    console.log("ALL ROOMS:", await Room.find({}));
    const rooms = await Room.find({
      isAvailable: true,
      isDeleted: false,
    })
      .populate("hotel")
      .sort({ createdAt: -1 });

    console.log(rooms);

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
