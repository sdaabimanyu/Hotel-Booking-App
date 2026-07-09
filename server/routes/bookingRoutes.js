import express from "express";

import {
  cancelBooking,
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
  updateBookingStatus,
  markBookingAsPaid,
} from "../controllers/bookingControllers.js";

import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);

bookingRouter.post("/book", protect, createBooking);

bookingRouter.get("/user", protect, getUserBookings);

bookingRouter.get("/hotel", protect, getHotelBookings);

bookingRouter.put("/status", protect, updateBookingStatus);

bookingRouter.put("/mark-paid", protect, markBookingAsPaid);

bookingRouter.post("/cancel", protect, cancelBooking);

bookingRouter.post("/stripe-payment", protect, stripePayment);

export default bookingRouter;
