import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import NotificationBell from "./NotificationBell";

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

      console.log("4. MARK READ API RESPONSE:", data);

      if (data.success) {
        console.log("5. UPDATING FRONTEND STATE");

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
      console.log("MARK NOTIFICATION READ FULL ERROR:", error);
      console.log("ERROR RESPONSE:", error.response?.data);
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
      console.log("1. DELETE FUNCTION STARTED");
      console.log("2. DELETE NOTIFICATION ID:", notificationId);

      const token = await getToken();

      console.log("3. DELETE TOKEN RECEIVED:", !!token);

      const { data } = await axios.delete(
        `/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("4. DELETE API RESPONSE:", data);

      if (data.success) {
        setNotifications((previousNotifications) => {
          const deletedNotification = previousNotifications.find(
            (notification) => notification._id === notificationId,
          );

          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount((previousCount) =>
              previousCount > 0 ? previousCount - 1 : 0,
            );
          }

          return previousNotifications.filter(
            (notification) => notification._id !== notificationId,
          );
        });
      }
    } catch (error) {
      console.log("DELETE NOTIFICATION FULL ERROR:", error);
      console.log("DELETE ERROR RESPONSE:", error.response?.data);
    }
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

      {user && (
        <div className="ml-auto mr-4 md:ml-0 md:mr-0">
          <NotificationBell
            isScrolled={isScrolled}
            notifications={notifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            unreadCount={unreadCount}
            markNotificationAsRead={markNotificationAsRead}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            deleteNotification={deleteNotification}
          />
        </div>
      )}

      {/* ==========================================
          DESKTOP RIGHT SIDE
      ========================================== */}

      <div className="hidden md:flex items-center gap-5">
        {user ? (
          <>
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

                <UserButton.Action
                  label="My Inquiries"
                  labelIcon={<i className="fa-solid fa-message"></i>}
                  onClick={() => navigate("/my-inquiries")}
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

              <UserButton.Action
                label="My Inquiries"
                labelIcon={<i className="fa-solid fa-message"></i>}
                onClick={() => navigate("/my-inquiries")}
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
