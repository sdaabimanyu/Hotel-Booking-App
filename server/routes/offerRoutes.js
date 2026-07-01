import express from "express";

import {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  applyOfferCode,
  getOwnerOffers,
} from "../controllers/offerController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const offerRouter = express.Router();

// Public
offerRouter.get("/", getOffers);
offerRouter.get("/:id", getOfferById);

// Owner
offerRouter.get("/owner", protect, getOwnerOffers);

// User
offerRouter.post("/apply", protect, applyOfferCode);

// Hotel Owner
offerRouter.post("/", protect, upload.single("image"), createOffer);
offerRouter.put("/:id", protect, upload.single("image"), updateOffer);
offerRouter.delete("/:id", protect, deleteOffer);
offerRouter.patch("/:id/toggle", protect, toggleOfferStatus);

export default offerRouter;
