import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createInquiry,
  getUserInquiries,
  getHotelInquiries,
  replyToInquiry,
} from "../controllers/inquiryController.js";

const inquiryRouter = express.Router();

// User creates a booking inquiry
inquiryRouter.post("/", protect, createInquiry);

// Logged-in user gets their inquiries
inquiryRouter.get("/user", protect, getUserInquiries);

// Hotel owner gets inquiries for their hotel
inquiryRouter.get("/hotel", protect, getHotelInquiries);

// Hotel owner replies to an inquiry
inquiryRouter.patch("/reply", protect, replyToInquiry);

export default inquiryRouter;
