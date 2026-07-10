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
      .sort({ createdAt: -1 })
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
    console.log("========== MARK READ CONTROLLER START ==========");

    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const userId = req.user?._id;
    const { notificationId } = req.body;

    console.log("USER ID:", userId);
    console.log("NOTIFICATION ID:", notificationId);

    if (!userId) {
      console.log("ERROR: NO USER ID");

      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!notificationId) {
      console.log("ERROR: NO NOTIFICATION ID");

      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notificationBeforeUpdate =
      await Notification.findById(notificationId);

    console.log("NOTIFICATION BEFORE UPDATE:", notificationBeforeUpdate);

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

    console.log("NOTIFICATION AFTER UPDATE:", notification);

    if (!notification) {
      console.log("ERROR: NOTIFICATION NOT FOUND");

      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    console.log("========== MARK READ SUCCESS ==========");

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log("========== MARK READ ERROR ==========");
    console.log(error);

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

    await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
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
