// GET BASIC USER DATA
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities;

    res.json({
      success: true,
      role,
      recentSearchedCities,
    });
  } catch (error) {
    console.log("GET USER DATA ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET LOGGED-IN USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
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

    res.status(500).json({
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

    user.profile = {
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "",
    };

    user.bookingPreferences = {
      preferredRoomType: preferredRoomType || "",
      preferredGuests: Number(preferredGuests) || 1,
    };

    await user.save();

    res.json({
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

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STORE RECENT SEARCHED CITIES
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body;

    const user = req.user;

    if (user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCity);
    } else {
      user.recentSearchedCities.shift();
      user.recentSearchedCities.push(recentSearchedCity);
    }

    await user.save();

    res.json({
      success: true,
      message: "City added",
    });
  } catch (error) {
    console.log("STORE RECENT SEARCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE FAVORITE HOTEL
export const toggleFavoriteHotel = async (req, res) => {
  try {
    const { hotelId } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID is required",
      });
    }

    const user = req.user;

    const favoriteHotels = user.favoriteHotels || [];

    const isFavorite = favoriteHotels.some((id) => id.toString() === hotelId);

    if (isFavorite) {
      user.favoriteHotels = favoriteHotels.filter(
        (id) => id.toString() !== hotelId,
      );

      await user.save();

      return res.json({
        success: true,
        message: "Hotel removed from favorites",
        isFavorite: false,
      });
    }

    user.favoriteHotels.push(hotelId);

    await user.save();

    res.json({
      success: true,
      message: "Hotel added to favorites",
      isFavorite: true,
    });
  } catch (error) {
    console.log("TOGGLE FAVORITE HOTEL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE FAVORITE ROOM
export const toggleFavoriteRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    const user = req.user;

    const favoriteRooms = user.favoriteRooms || [];

    const isFavorite = favoriteRooms.some((id) => id.toString() === roomId);

    if (isFavorite) {
      user.favoriteRooms = favoriteRooms.filter(
        (id) => id.toString() !== roomId,
      );

      await user.save();

      return res.json({
        success: true,
        message: "Room removed from favorites",
        isFavorite: false,
      });
    }

    user.favoriteRooms.push(roomId);

    await user.save();

    res.json({
      success: true,
      message: "Room added to favorites",
      isFavorite: true,
    });
  } catch (error) {
    console.log("TOGGLE FAVORITE ROOM ERROR:", error);

    res.status(500).json({
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

    res.json({
      success: true,
      favoriteHotels: req.user.favoriteHotels || [],
      favoriteRooms: req.user.favoriteRooms || [],
    });
  } catch (error) {
    console.log("GET FAVORITES ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
