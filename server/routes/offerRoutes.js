import express from "express";

import {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  applyOfferCode,
} from "../controllers/offerController.js";

import { protect } from "../middleware/authMiddleware.js";

const offerRouter = express.Router();

// Public
offerRouter.get("/", getOffers);
offerRouter.get("/:id", getOfferById);

// User
offerRouter.post("/apply", protect, applyOfferCode);

// Hotel Owner
offerRouter.post("/", protect, createOffer);
offerRouter.put("/:id", protect, updateOffer);
offerRouter.delete("/:id", protect, deleteOffer);
offerRouter.patch("/:id/toggle", protect, toggleOfferStatus);

export default offerRouter;
