import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// GET BASIC USER DATA
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities || [];

    return res.status(200).json({
      success: true,
      role,
      recentSearchedCities,
    });
  } catch (error) {
    console.log("GET USER DATA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET LOGGED-IN USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,

      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,

        profile: {
          phone: user.profile?.phone || "",
          address: user.profile?.address || "",
          city: user.profile?.city || "",
          country: user.profile?.country || "",
        },

        bookingPreferences: {
          preferredRoomType: user.bookingPreferences?.preferredRoomType || "",

          preferredGuests: user.bookingPreferences?.preferredGuests || 1,
        },
      },
    });
  } catch (error) {
    console.log("GET USER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE LOGGED-IN USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const {
      phone,
      address,
      city,
      country,
      preferredRoomType,
      preferredGuests,
    } = req.body;

    const user = req.user;

    // ==========================================
    // VALIDATE PREFERRED GUEST COUNT
    // ==========================================

    const guestCount = Number(preferredGuests || 1);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Preferred guests must be at least 1",
      });
    }

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    user.profile = {
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      city: city?.trim() || "",
      country: country?.trim() || "",
    };

    // ==========================================
    // UPDATE BOOKING PREFERENCES
    // ==========================================

    user.bookingPreferences = {
      preferredRoomType: preferredRoomType?.trim() || "",
      preferredGuests: guestCount,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,

        profile: user.profile,

        bookingPreferences: user.bookingPreferences,
      },
    });
  } catch (error) {
    console.log("UPDATE USER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STORE RECENT SEARCHED CITIES
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body;

    // ==========================================
    // VALIDATE CITY
    // ==========================================

    if (typeof recentSearchedCity !== "string" || !recentSearchedCity.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    const user = req.user;

    const normalizedCity = recentSearchedCity.trim();

    // ==========================================
    // REMOVE DUPLICATE CITY
    // ==========================================

    const recentCities = (user.recentSearchedCities || []).filter(
      (city) => city.toLowerCase() !== normalizedCity.toLowerCase(),
    );

    // ==========================================
    // ADD NEWEST CITY
    // ==========================================

    recentCities.push(normalizedCity);

    // ==========================================
    // KEEP ONLY LAST 3 CITIES
    // ==========================================

    user.recentSearchedCities = recentCities.slice(-3);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "City added",
      recentSearchedCities: user.recentSearchedCities,
    });
  } catch (error) {
    console.log("STORE RECENT SEARCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE FAVORITE HOTEL
export const toggleFavoriteHotel = async (req, res) => {
  try {
    const { hotelId } = req.body;

    // ==========================================
    // VALIDATE HOTEL ID
    // ==========================================

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID is required",
      });
    }

    if (!mongoose.isValidObjectId(hotelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    // ==========================================
    // VERIFY HOTEL EXISTS
    // ==========================================

    const hotelExists = await Hotel.exists({
      _id: hotelId,
    });

    if (!hotelExists) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const user = req.user;

    const favoriteHotels = user.favoriteHotels || [];

    const isFavorite = favoriteHotels.some((id) => id.toString() === hotelId);

    // ==========================================
    // REMOVE FAVORITE
    // ==========================================

    if (isFavorite) {
      user.favoriteHotels = favoriteHotels.filter(
        (id) => id.toString() !== hotelId,
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Hotel removed from favorites",
        isFavorite: false,
      });
    }

    // ==========================================
    // ADD FAVORITE
    // ==========================================

    user.favoriteHotels.push(hotelId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Hotel added to favorites",
      isFavorite: true,
    });
  } catch (error) {
    console.log("TOGGLE FAVORITE HOTEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE FAVORITE ROOM
export const toggleFavoriteRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    // ==========================================
    // VALIDATE ROOM ID
    // ==========================================

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    // ==========================================
    // VERIFY ROOM EXISTS
    // ==========================================

    const roomExists = await Room.exists({
      _id: roomId,
    });

    if (!roomExists) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const user = req.user;

    const favoriteRooms = user.favoriteRooms || [];

    const isFavorite = favoriteRooms.some((id) => id.toString() === roomId);

    // ==========================================
    // REMOVE FAVORITE
    // ==========================================

    if (isFavorite) {
      user.favoriteRooms = favoriteRooms.filter(
        (id) => id.toString() !== roomId,
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Room removed from favorites",
        isFavorite: false,
      });
    }

    // ==========================================
    // ADD FAVORITE
    // ==========================================

    user.favoriteRooms.push(roomId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Room added to favorites",
      isFavorite: true,
    });
  } catch (error) {
    console.log("TOGGLE FAVORITE ROOM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL USER FAVORITES
export const getFavorites = async (req, res) => {
  try {
    await req.user.populate([
      {
        path: "favoriteHotels",
      },
      {
        path: "favoriteRooms",

        populate: {
          path: "hotel",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      favoriteHotels: req.user.favoriteHotels || [],
      favoriteRooms: req.user.favoriteRooms || [],
    });
  } catch (error) {
    console.log("GET FAVORITES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
