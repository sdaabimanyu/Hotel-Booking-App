import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
        trim: true,
      },
    ],

    profile: {
      phone: {
        type: String,
        default: "",
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "",
        trim: true,
      },
    },

    bookingPreferences: {
      preferredRoomType: {
        type: String,
        default: "",
        trim: true,
      },

      preferredGuests: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    favoriteHotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ],

    favoriteRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
