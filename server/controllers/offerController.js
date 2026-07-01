import { cloudinary } from "../configs/cloudinary.js";
import Hotel from "../models/Hotel.js";
import Offer from "../models/Offer.js";

export const createOffer = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);
    if (req.user.role !== "hotelOwner") {
      return res.json({
        success: false,
        message: "Only hotel owners can create offers",
      });
    }
    const {
      title,
      description,
      code,
      discount,
      discountType,
      minimumStay,
      validTill,
    } = req.body;

    if (!title || !description || !code || !discount || !validTill) {
      return res.json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.json({
        success: false,
        message: "Hotel not found",
      });
    }

    const existingOffer = await Offer.findOne({
      hotel: hotel._id,
      code: code.trim().toUpperCase(),
    });

    if (existingOffer) {
      return res.json({
        success: false,
        message: "Offer code already exists",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(validTill);
    expiry.setHours(0, 0, 0, 0);

    if (expiry <= today) {
      return res.json({
        success: false,
        message: "Expiry date must be in the future",
      });
    }

    if (!req.file) {
      return res.json({
        success: false,
        message: "Offer image is required",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "hotel-offers",
      resource_type: "auto",
      use_filename: true,
    });

    const image = uploadResult.secure_url;

    const offer = await Offer.create({
      title,
      description,
      code: code.trim().toUpperCase(),
      discount,
      discountType,
      minimumStay,
      validTill,
      image,
      hotel: hotel._id,
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({
      isActive: true,
    })
      .populate("hotel", "name")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      offers,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOffer = async (req, res) => {
  try {
    if (req.user.role !== "hotelOwner") {
      return res.json({
        success: false,
        message: "Only hotel owners can update offers",
      });
    }

    const offer = await Offer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!offer) {
      return res.json({
        success: false,
        message: "Offer not found",
      });
    }

    Object.assign(offer, req.body);

    if (offer.code) {
      offer.code = offer.code.toUpperCase();
    }

    await offer.save();

    res.json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    if (req.user.role !== "hotelOwner") {
      return res.json({
        success: false,
        message: "Only hotel owners can delete offers",
      });
    }
    const offer = await Offer.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!offer) {
      return res.json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleOfferStatus = async (req, res) => {
  try {
    if (req.user.role !== "hotelOwner") {
      return res.json({
        success: false,
        message: "Only hotel owners can manage offers",
      });
    }
    const offer = await Offer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!offer) {
      return res.json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.isActive = !offer.isActive;

    await offer.save();

    res.json({
      success: true,
      message: offer.isActive ? "Offer Activated" : "Offer Deactivated",
      offer,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const applyOfferCode = async (req, res) => {
  try {
    const { code } = req.body;

    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!offer) {
      return res.json({
        success: false,
        message: "Invalid Offer Code",
      });
    }

    if (new Date(offer.validTill) < new Date()) {
      return res.json({
        success: false,
        message: "Offer Expired",
      });
    }

    res.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};
