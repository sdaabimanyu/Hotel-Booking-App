import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { sendUpcomingBookingReminders } from "../controllers/notificationController.js";

import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/inAppNotificationController.js";

const notificationRouter = express.Router();

// Automatic booking reminder
notificationRouter.get("/upcoming-bookings", sendUpcomingBookingReminders);

// Get logged-in user's notifications
notificationRouter.get("/user", protect, getUserNotifications);

// Mark one notification as read
notificationRouter.patch("/read", protect, markNotificationAsRead);

// Mark all notifications as read
notificationRouter.patch("/read-all", protect, markAllNotificationsAsRead);

// Delete notification
notificationRouter.delete("/:notificationId", protect, deleteNotification);

export default notificationRouter;
