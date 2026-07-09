import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [isOwner, setIsowner] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const fetchRooms = async () => {
    try {
      console.log("FETCHING ROOMS...");

      const { data } = await axios.get("/api/rooms");

      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.log("FETCH ROOM ERROR:", error);
    }
  };

  const fetchUser = async () => {
    try {
      setUserLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setIsowner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities || []);
      } else {
        setIsowner(false);
      }
    } catch (error) {
      console.log("FETCH USER ERROR:", error);
      setIsowner(false);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      if (!user) return;

      const token = await getToken();

      const { data } = await axios.get("/api/user/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("FAVORITES RESPONSE:", data);

      if (data.success) {
        setFavoriteRooms(data.favoriteRooms || []);
        setFavoriteHotels(data.favoriteHotels || []);
      }
    } catch (error) {
      console.log(
        "FETCH FAVORITES ERROR:",
        error.response?.data || error.message,
      );
    }
  };

  const toggleFavoriteRoom = async (roomId) => {
    try {
      if (!user) {
        toast.error("Please login to save favorites");
        return;
      }

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/user/favorites/room",
        {
          roomId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        await fetchFavorites();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(
        "TOGGLE FAVORITE ROOM ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message || "Failed to update favorite room",
      );
    }
  };

  const toggleFavoriteHotel = async (hotelId) => {
    try {
      if (!user) {
        toast.error("Please login to save favorites");
        return;
      }

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/user/favorites/hotel",
        {
          hotelId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        await fetchFavorites();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(
        "TOGGLE FAVORITE HOTEL ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message || "Failed to update favorite hotel",
      );
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (!user) return;

      const token = await getToken();

      const { data } = await axios.get("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("USER PROFILE RESPONSE:", data);

      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.log(
        "FETCH USER PROFILE ERROR:",
        error.response?.data || error.message,
      );
    }
  };

  const isRoomFavorite = (roomId) => {
    return favoriteRooms.some((room) => room._id === roomId);
  };

  const isHotelFavorite = (hotelId) => {
    return favoriteHotels.some((hotel) => hotel._id === hotelId);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      setIsowner(false);
      setFavoriteRooms([]);
      setFavoriteHotels([]);
      setUserProfile(null);
      setUserLoading(false);
      return;
    }

    fetchUser();
    fetchFavorites();
    fetchUserProfile();
  }, [user, isLoaded]);

  const value = {
    currency,
    axios,
    navigate,
    user,
    getToken,

    isOwner,
    setIsowner,
    userLoading,

    showHotelReg,
    setShowHotelReg,

    searchedCities,
    setSearchedCities,

    rooms,
    setRooms,

    favoriteRooms,
    setFavoriteRooms,

    favoriteHotels,
    setFavoriteHotels,

    userProfile,
    setUserProfile,
    fetchUserProfile,

    fetchFavorites,

    toggleFavoriteRoom,
    toggleFavoriteHotel,

    isRoomFavorite,
    isHotelFavorite,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
