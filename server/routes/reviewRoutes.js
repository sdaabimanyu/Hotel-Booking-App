import express from "express";
import { addReview, getRoomReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, addReview);

reviewRouter.get("/:roomId", getRoomReviews);

export default reviewRouter;
