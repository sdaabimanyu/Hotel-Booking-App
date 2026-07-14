import mongoose from "mongoose";
import Notification from "../models/Notification.js";

// ==========================================
// GET LOGGED-IN USER NOTIFICATIONS
// ==========================================

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.log("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const { notificationId } = req.body;

    // ==========================================
    // VALIDATE NOTIFICATION ID
    // ==========================================

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    // ==========================================
    // FIND AND UPDATE USER'S NOTIFICATION
    // ==========================================

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.log("MARK ALL NOTIFICATIONS READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE ONE NOTIFICATION
// ==========================================

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const { notificationId } = req.params;

    // ==========================================
    // VALIDATE NOTIFICATION ID
    // ==========================================

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    // ==========================================
    // DELETE ONLY LOGGED-IN USER'S NOTIFICATION
    // ==========================================

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log("DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
