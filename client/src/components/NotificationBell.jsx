import React, { useEffect, useRef } from "react";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";

const NotificationBell = ({
  isScrolled,
  notifications,
  showNotifications,
  setShowNotifications,
  unreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
}) => {
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [setShowNotifications]);

  const formatNotificationTime = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();

    const difference = now.getTime() - createdDate.getTime();

    const minutes = Math.floor(difference / (1000 * 60));

    const hours = Math.floor(difference / (1000 * 60 * 60));

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return createdDate.toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    console.log("NOTIFICATION CLICKED:", notification._id);

    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
    }
  };

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        onClick={() => setShowNotifications((previousValue) => !previousValue)}
        className="relative flex items-center justify-center cursor-pointer"
      >
        <Bell
          className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold rounded-full border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="fixed md:absolute top-20 md:top-11 right-3 md:right-0 w-[calc(100vw-24px)] md:w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 z-[100]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-playfair text-xl font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {unreadCount > 0 && (
            <div className="flex justify-end px-5 py-2 border-b border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-600 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <Bell className="w-6 h-6 text-slate-300 mx-auto" />

                <h3 className="mt-4 font-semibold">No notifications yet</h3>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative flex items-start gap-3 px-5 py-4 pr-14 border-b border-slate-100 cursor-pointer ${
                    notification.isRead ? "bg-white" : "bg-amber-50/60"
                  }`}
                >
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                      notification.isRead ? "bg-slate-100" : "bg-amber-100"
                    }`}
                  >
                    <Bell
                      className={`w-4 h-4 ${
                        notification.isRead
                          ? "text-slate-500"
                          : "text-amber-600"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm ${
                          notification.isRead
                            ? "font-medium text-slate-700"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-2">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      deleteNotification(notification._id);
                    }}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
