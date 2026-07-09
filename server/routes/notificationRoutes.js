import express from "express";
import { sendUpcomingBookingReminders } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/upcoming-bookings", sendUpcomingBookingReminders);

export default notificationRouter;
