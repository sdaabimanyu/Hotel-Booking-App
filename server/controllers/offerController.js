import Hotel from "../models/Hotel.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const createOffer = async (req, res) => {
  try {
    // ==========================================
    // 1. CHECK USER ROLE
    // ==========================================

    if (req.user.role !== "hotelOwner") {
      return res.status(403).json({
        success: false,
        message: "Only hotel owners can create offers",
      });
    }

    // ==========================================
    // 2. GET OFFER DATA
    // ==========================================

    const {
      title,
      description,
      code,
      discount,
      discountType,
      minimumStay,
      validTill,
      image,
    } = req.body;

    // ==========================================
    // 3. VALIDATE REQUIRED FIELDS
    // ==========================================

    if (!title || !description || !code || !discount || !validTill) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ==========================================
    // 4. FIND HOTEL
    // ==========================================

    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // ==========================================
    // 5. NORMALIZE OFFER CODE
    // ==========================================

    const normalizedCode = code.trim().toUpperCase();

    // ==========================================
    // 6. CHECK DUPLICATE OFFER CODE
    // ==========================================

    const existingOffer = await Offer.findOne({
      hotel: hotel._id,
      code: normalizedCode,
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: "Offer code already exists",
      });
    }

    // ==========================================
    // 7. VALIDATE EXPIRY DATE
    // ==========================================

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const expiry = new Date(validTill);

    expiry.setHours(0, 0, 0, 0);

    if (expiry <= today) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future",
      });
    }

    // ==========================================
    // 8. VALIDATE IMAGE
    // ==========================================

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Offer image is required",
      });
    }

    // ==========================================
    // 9. CREATE OFFER
    // ==========================================

    const offer = await Offer.create({
      title,
      description,
      code: normalizedCode,
      discount,
      discountType,
      minimumStay,
      validTill,
      image,
      hotel: hotel._id,
      createdBy: req.user._id,
    });

    console.log("OFFER CREATED:", offer._id);

    // ==========================================
    // 10. FIND ALL NORMAL USERS
    // ==========================================

    const users = await User.find({
      role: "user",
    }).select("_id");

    console.log("NORMAL USERS FOUND:", users.length);

    // ==========================================
    // 11. PREPARE NOTIFICATIONS
    // ==========================================

    const notifications = users.map((user) => ({
      user: user._id,

      type: "special_offer",

      title: "New Special Offer",

      message: `${offer.title} is now available at ${hotel.name}. Use code ${offer.code} and save ${offer.discount}${
        offer.discountType === "percentage" ? "%" : ""
      }.`,

      relatedOffer: offer._id,
    }));

    // ==========================================
    // 12. CREATE NOTIFICATIONS
    // ==========================================

    let notificationsCreated = 0;

    if (notifications.length > 0) {
      const createdNotifications = await Notification.insertMany(notifications);

      notificationsCreated = createdNotifications.length;
    }

    console.log("SPECIAL OFFER NOTIFICATIONS CREATED:", notificationsCreated);

    // ==========================================
    // 13. SEND RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
      notificationsCreated,
    });
  } catch (error) {
    console.log("========== CREATE OFFER ERROR ==========");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("hotel", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      offers,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerOffers = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    const offers = await Offer.find({
      hotel: hotel._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      offers,
    });
  } catch (error) {
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

    const {
      title,
      description,
      code,
      discount,
      discountType,
      minimumStay,
      validTill,
      image,
    } = req.body;

    offer.title = title;
    offer.description = description;
    offer.code = code.trim().toUpperCase();
    offer.discount = discount;
    offer.discountType = discountType;
    offer.minimumStay = minimumStay;
    offer.validTill = validTill;

    if (image) {
      offer.image = image;
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
