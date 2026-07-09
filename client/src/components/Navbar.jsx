import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Offers", path: "/offers" },
    { name: "My Bookings", path: "/my-bookings" },
    { name: "Reviews", path: "/reviews" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ==========================================
  // NOTIFICATION STATES
  // ==========================================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);

  const { openSignIn } = useClerk();

  const location = useLocation();

  const {
    user,
    navigate,
    isOwner,
    setShowHotelReg,
    favoriteRooms,
    axios,
    getToken,
  } = useAppContext();

  // ==========================================
  // HANDLE NAVBAR BACKGROUND WHEN SCROLLING
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== "/") {
        setIsScrolled(true);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  // ==========================================
  // SCROLL TO TOP WHEN ROUTE CHANGES
  // ==========================================

  useEffect(() => {
    window.scrollTo(0, 0);

    setIsMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // ==========================================
  // FETCH USER NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      if (!user) return;

      const token = await getToken();

      const { data } = await axios.get("/api/notifications/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("NOTIFICATION RESPONSE:", data);

      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.log(
        "FETCH NOTIFICATIONS ERROR:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    }
  }, [user]);

  // ==========================================
  // CLOSE NOTIFICATION DROPDOWN OUTSIDE CLICK
  // ==========================================

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
  }, []);

  // ==========================================
  // MARK ONE NOTIFICATION AS READ
  // ==========================================

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = await getToken();

      const { data } = await axios.patch(
        "/api/notifications/read",
        {
          notificationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        setNotifications((previousNotifications) =>
          previousNotifications.map((notification) =>
            notification._id === notificationId
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification,
          ),
        );

        setUnreadCount((previousCount) =>
          previousCount > 0 ? previousCount - 1 : 0,
        );
      }
    } catch (error) {
      console.log(
        "MARK NOTIFICATION READ ERROR:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  const markAllNotificationsAsRead = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.patch(
        "/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        setNotifications((previousNotifications) =>
          previousNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.log(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const deleteNotification = async (notificationId) => {
    try {
      const token = await getToken();

      const notificationToDelete = notifications.find(
        (notification) => notification._id === notificationId,
      );

      const { data } = await axios.delete(
        `/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        setNotifications((previousNotifications) =>
          previousNotifications.filter(
            (notification) => notification._id !== notificationId,
          ),
        );

        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount((previousCount) =>
            previousCount > 0 ? previousCount - 1 : 0,
          );
        }
      }
    } catch (error) {
      console.log(
        "DELETE NOTIFICATION ERROR:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ==========================================
  // HANDLE NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick = async (notification) => {
    console.log("NOTIFICATION CLICKED:", notification);

    if (!notification.isRead) {
      console.log("MARKING AS READ:", notification._id);

      await markNotificationAsRead(notification._id);
    }

    console.log("RELATED BOOKING:", notification.relatedBooking);

    if (notification.relatedBooking) {
      setShowNotifications(false);
      navigate("/my-bookings");
      return;
    }

    if (notification.relatedOffer) {
      setShowNotifications(false);
      navigate("/offers");
      return;
    }
  };

  // ==========================================
  // FORMAT NOTIFICATION TIME
  // ==========================================

  const formatNotificationTime = (createdAt) => {
    const createdDate = new Date(createdAt);

    const now = new Date();

    const difference = now.getTime() - createdDate.getTime();

    const minutes = Math.floor(difference / (1000 * 60));

    const hours = Math.floor(difference / (1000 * 60 * 60));

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "Just now";
    }

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

  // ==========================================
  // OWNER / LIST HOTEL BUTTON
  // ==========================================

  const handleOwnerButton = () => {
    if (isOwner) {
      navigate("/owner");
    } else {
      setShowHotelReg(true);
    }
  };

  // ==========================================
  // NOTIFICATION BELL + DROPDOWN COMPONENT
  // ==========================================

  const NotificationBell = () => {
    return (
      <div ref={notificationRef} className="relative">
        {/* BELL BUTTON */}

        <button
          type="button"
          onClick={() =>
            setShowNotifications((previousValue) => !previousValue)
          }
          className="relative flex items-center justify-center cursor-pointer"
          aria-label="Notifications"
        >
          <Bell
            className={`w-6 h-6 transition-colors ${
              isScrolled ? "text-gray-700" : "text-white"
            }`}
          />

          {/* UNREAD BADGE */}

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold rounded-full border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* ==========================================
            NOTIFICATION DROPDOWN
        ========================================== */}

        {showNotifications && (
          <div className="fixed md:absolute top-20 md:top-11 right-3 md:right-0 w-[calc(100vw-24px)] md:w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 z-[100]">
            {/* DROPDOWN HEADER */}

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
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MARK ALL AS READ */}

            {unreadCount > 0 && (
              <div className="flex justify-end px-5 py-2 border-b border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            )}

            {/* ==========================================
                NOTIFICATION LIST
            ========================================== */}

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                /* EMPTY NOTIFICATIONS */

                <div className="py-16 px-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-slate-300" />
                  </div>

                  <h3 className="font-playfair text-lg font-semibold text-slate-800">
                    No notifications yet
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    Booking reminders, payment updates, and special offers will
                    appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`relative flex items-start gap-3 px-5 py-4 border-b border-slate-100 last:border-b-0 transition-colors ${
                      notification.isRead
                        ? "bg-white hover:bg-slate-50"
                        : "bg-amber-50/60 hover:bg-amber-50"
                    }`}
                  >
                    {/* NOTIFICATION TYPE ICON */}

                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className="flex items-start gap-3 flex-1 text-left cursor-pointer"
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

                      {/* NOTIFICATION INFORMATION */}

                      <div className="flex-1 min-w-0 pr-7">
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
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {notification.message}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-2">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                    </button>

                    {/* DELETE BUTTON */}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        deleteNotification(notification._id);
                      }}
                      className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      aria-label="Delete notification"
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

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
        isScrolled
          ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
          : "py-4 md:py-6"
      }`}
    >
      {/* ==========================================
          LOGO
      ========================================== */}

      <Link to="/" className="flex items-center gap-x-2">
        <h1
          className={`text-4xl font-semibold font-bonheur ${
            isScrolled ? "text-gray-700" : "text-white"
          }`}
        >
          El Hotel
        </h1>
      </Link>

      {/* ==========================================
          DESKTOP NAVIGATION
      ========================================== */}

      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${
              isScrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {link.name}

            <div
              className={`${
                isScrolled ? "bg-gray-700" : "bg-white"
              } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </Link>
        ))}

        {user && (
          <button
            onClick={handleOwnerButton}
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
              isScrolled ? "text-black" : "text-white"
            } transition-all`}
          >
            {isOwner ? "Admin Dashboard" : "List Your Hotel"}
          </button>
        )}
      </div>

      {/* ==========================================
          DESKTOP RIGHT SIDE
      ========================================== */}

      <div className="hidden md:flex items-center gap-5">
        {user ? (
          <>
            <NotificationBell />

            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Profile"
                  labelIcon={<i className="fa-solid fa-user"></i>}
                  onClick={() => navigate("/profile")}
                />

                <UserButton.Action
                  label={`My Favorites (${favoriteRooms?.length || 0})`}
                  labelIcon={<i className="fa-solid fa-heart"></i>}
                  onClick={() => navigate("/favorites")}
                />

                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<i className="fa-solid fa-book"></i>}
                  onClick={() => navigate("/my-bookings")}
                />

                {isOwner && (
                  <UserButton.Action
                    label="Admin Dashboard"
                    labelIcon={<i className="fa-solid fa-hotel"></i>}
                    onClick={() => navigate("/owner")}
                  />
                )}
              </UserButton.MenuItems>
            </UserButton>
          </>
        ) : (
          <button
            onClick={openSignIn}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
              isScrolled ? "text-white bg-black" : "bg-white text-black"
            }`}
          >
            Login
          </button>
        )}
      </div>

      {/* ==========================================
          MOBILE RIGHT SIDE
      ========================================== */}

      <div className="flex items-center gap-4 md:hidden">
        {user && <NotificationBell />}

        {user && (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Profile"
                labelIcon={<i className="fa-solid fa-user"></i>}
                onClick={() => navigate("/profile")}
              />

              <UserButton.Action
                label={`My Favorites (${favoriteRooms?.length || 0})`}
                labelIcon={<i className="fa-solid fa-heart"></i>}
                onClick={() => navigate("/favorites")}
              />

              <UserButton.Action
                label="My Bookings"
                labelIcon={<i className="fa-solid fa-book"></i>}
                onClick={() => navigate("/my-bookings")}
              />

              {isOwner && (
                <UserButton.Action
                  label="Admin Dashboard"
                  labelIcon={<i className="fa-solid fa-hotel"></i>}
                  onClick={() => navigate("/owner")}
                />
              )}
            </UserButton.MenuItems>
          </UserButton>
        )}

        {/* HAMBURGER BUTTON */}

        <svg
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-6 w-6 cursor-pointer ${
            isScrolled ? "text-gray-700" : "text-white"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </div>

      {/* ==========================================
          MOBILE MENU
      ========================================== */}

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* CLOSE BUTTON */}

        <button
          type="button"
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* MOBILE LINKS */}

        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        {/* PROFILE */}

        {user && (
          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
            My Profile
          </Link>
        )}

        {/* FAVORITES */}

        {user && (
          <Link
            to="/favorites"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2"
          >
            My Favorites
            {favoriteRooms?.length > 0 && (
              <span className="bg-red-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {favoriteRooms.length}
              </span>
            )}
          </Link>
        )}

        {/* OWNER BUTTON */}

        {user && (
          <button
            type="button"
            onClick={() => {
              handleOwnerButton();
              setIsMenuOpen(false);
            }}
            className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
          >
            {isOwner ? "Admin Dashboard" : "List Your Hotel"}
          </button>
        )}

        {/* LOGIN */}

        {!user && (
          <button
            type="button"
            onClick={() => {
              openSignIn();
              setIsMenuOpen(false);
            }}
            className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
