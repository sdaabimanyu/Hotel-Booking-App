import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "hotelOwner"],
      default: "user",
    },

    recentSearchedCities: [
      {
        type: String,
        required: true,
      },
    ],

    // PERSONAL INFORMATION
    profile: {
      phone: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "",
      },
    },

    // BOOKING PREFERENCES
    bookingPreferences: {
      preferredRoomType: {
        type: String,
        default: "",
      },

      preferredGuests: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
