import express from "express";
import {
  addReview,
  getAllReviews,
  getHotelReviews,
  getRoomReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, addReview);

reviewRouter.get("/room/:roomId", getRoomReviews);

reviewRouter.get("/hotel", protect, getHotelReviews);

reviewRouter.get("/", getAllReviews);

reviewRouter.get("/test", (req, res) => {
  res.send("Review Route Working");
});

export default reviewRouter;
