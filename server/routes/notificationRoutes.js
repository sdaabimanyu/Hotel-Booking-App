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

// ==========================================
// AUTOMATIC UPCOMING BOOKING EMAIL REMINDER
// Called by Vercel Cron
// Security is handled using CRON_SECRET
// ==========================================

notificationRouter.get("/upcoming-bookings", sendUpcomingBookingReminders);

notificationRouter.get("/user", protect, getUserNotifications);

// ==========================================
// GET LOGGED-IN USER NOTIFICATIONS
// ==========================================

notificationRouter.get("/user", protect, getUserNotifications);

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

notificationRouter.patch("/read", protect, markNotificationAsRead);

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

notificationRouter.patch("/read-all", protect, markAllNotificationsAsRead);

// ==========================================
// DELETE ONE NOTIFICATION
// ==========================================

notificationRouter.delete("/:notificationId", protect, deleteNotification);

export default notificationRouter;
