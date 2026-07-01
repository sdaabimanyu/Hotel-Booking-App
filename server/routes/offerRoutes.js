import express from "express";

import {
  createOffer,
  getOffers,
  getOwnerOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  applyOfferCode,
} from "../controllers/offerController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const offerRouter = express.Router();

// Public
offerRouter.get("/", getOffers);

// Owner
offerRouter.get("/owner", protect, getOwnerOffers);

// Public
offerRouter.get("/:id", getOfferById);

// User
offerRouter.post("/apply", protect, applyOfferCode);

// Hotel Owner
offerRouter.post("/", protect, upload.single("image"), createOffer);
offerRouter.put("/:id", protect, upload.single("image"), updateOffer);
offerRouter.delete("/:id", protect, deleteOffer);
offerRouter.patch("/:id/toggle", protect, toggleOfferStatus);

export default offerRouter;
