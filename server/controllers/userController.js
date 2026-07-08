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
    res.json({
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
    res.json({
      success: false,
      message: error.message,
    });
  }
};
