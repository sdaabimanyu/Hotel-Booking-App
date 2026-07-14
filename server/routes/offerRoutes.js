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

const offerRouter = express.Router();

// =========================================================
// PUBLIC ROUTES
// =========================================================

// GET ALL OFFERS
offerRouter.get("/", getOffers);

// =========================================================
// USER ROUTES
// =========================================================

// APPLY OFFER CODE
offerRouter.post("/apply", protect, applyOfferCode);

// =========================================================
// HOTEL OWNER ROUTES
// =========================================================

// GET OWNER OFFERS
offerRouter.get("/owner", protect, getOwnerOffers);

// CREATE OFFER
offerRouter.post("/", protect, createOffer);

// UPDATE OFFER
offerRouter.put("/:id", protect, updateOffer);

// DELETE OFFER
offerRouter.delete("/:id", protect, deleteOffer);

// TOGGLE OFFER STATUS
offerRouter.patch("/:id/toggle", protect, toggleOfferStatus);

// =========================================================
// DYNAMIC PUBLIC ROUTES
// KEEP THESE AFTER FIXED ROUTES
// =========================================================

// GET SINGLE OFFER
offerRouter.get("/:id", getOfferById);

export default offerRouter;
