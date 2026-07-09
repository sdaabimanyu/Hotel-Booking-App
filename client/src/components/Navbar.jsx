import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import { Bell } from "lucide-react";

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

      {/* ==========================================
          DESKTOP RIGHT SIDE
      ========================================== */}

      <div className="hidden md:flex items-center gap-5">
        {user ? (
          <>
            {/* ==========================================
                NOTIFICATION BELL
            ========================================== */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((previous) => !previous)}
                className="relative flex items-center justify-center cursor-pointer"
              >
                <Bell
                  className={`w-6 h-6 ${
                    isScrolled ? "text-gray-700" : "text-white"
                  }`}
                />

                {/* UNREAD COUNT BADGE */}

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* ==========================================
                CLERK USER BUTTON
            ========================================== */}

            <UserButton>
              <UserButton.MenuItems>
                {/* MY PROFILE */}

                <UserButton.Action
                  label="My Profile"
                  labelIcon={<i className="fa-solid fa-user"></i>}
                  onClick={() => navigate("/profile")}
                />

                {/* FAVORITES */}

                <UserButton.Action
                  label={`My Favorites (${favoriteRooms?.length || 0})`}
                  labelIcon={<i className="fa-solid fa-heart"></i>}
                  onClick={() => navigate("/favorites")}
                />

                {/* MY BOOKINGS */}

                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<i className="fa-solid fa-book"></i>}
                  onClick={() => navigate("/my-bookings")}
                />

                {/* ADMIN DASHBOARD */}

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
        {/* MOBILE NOTIFICATION BELL */}

        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((previous) => !previous)}
              className="relative flex items-center justify-center cursor-pointer"
            >
              <Bell
                className={`w-6 h-6 ${
                  isScrolled ? "text-gray-700" : "text-white"
                }`}
              />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* MOBILE USER BUTTON */}

        {user && (
          <UserButton>
            <UserButton.MenuItems>
              {/* PROFILE */}

              <UserButton.Action
                label="My Profile"
                labelIcon={<i className="fa-solid fa-user"></i>}
                onClick={() => navigate("/profile")}
              />

              {/* FAVORITES */}

              <UserButton.Action
                label={`My Favorites (${favoriteRooms?.length || 0})`}
                labelIcon={<i className="fa-solid fa-heart"></i>}
                onClick={() => navigate("/favorites")}
              />

              {/* BOOKINGS */}

              <UserButton.Action
                label="My Bookings"
                labelIcon={<i className="fa-solid fa-book"></i>}
                onClick={() => navigate("/my-bookings")}
              />

              {/* ADMIN */}

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

        {/* PROFILE MOBILE LINK */}

        {user && (
          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
            My Profile
          </Link>
        )}

        {/* FAVORITES MOBILE LINK */}

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
