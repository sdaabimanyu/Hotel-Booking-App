import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    discount: {
      type: Number,
      required: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    minimumStay: {
      type: Number,
      default: 1,
    },

    validTill: {
      type: Date,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    createdBy: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
