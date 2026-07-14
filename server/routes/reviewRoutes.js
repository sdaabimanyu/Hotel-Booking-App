import express from "express";

import {
  addReview,
  approveReview,
  deleteReview,
  getAllReviews,
  getHotelReviews,
  getRoomReviews,
  rejectReview,
  respondToReview,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

// ADD REVIEW
reviewRouter.post("/", protect, addReview);

// GET PUBLIC REVIEWS
reviewRouter.get("/", getAllReviews);

// GET ROOM REVIEWS
reviewRouter.get("/room/:roomId", getRoomReviews);

// GET HOTEL OWNER REVIEWS
reviewRouter.get("/hotel", protect, getHotelReviews);

// APPROVE REVIEW
reviewRouter.patch("/:id/approve", protect, approveReview);

// REJECT REVIEW
reviewRouter.patch("/:id/reject", protect, rejectReview);

// RESPOND TO REVIEW
reviewRouter.patch("/:id/respond", protect, respondToReview);

// DELETE REVIEW
reviewRouter.delete("/:id", protect, deleteReview);

export default reviewRouter;
