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

reviewRouter.post("/", protect, addReview);

reviewRouter.get("/room/:roomId", getRoomReviews);

reviewRouter.get("/hotel", protect, getHotelReviews);

reviewRouter.patch("/:id/approve", protect, approveReview);

reviewRouter.patch("/:id/reject", protect, rejectReview);

reviewRouter.patch("/:id/respond", protect, respondToReview);

reviewRouter.delete("/:id", protect, deleteReview);

reviewRouter.get("/", getAllReviews);

reviewRouter.get("/test", (req, res) => {
  res.send("Review Route Working");
});

export default reviewRouter;
