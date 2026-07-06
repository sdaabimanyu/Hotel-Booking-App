import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [isOwner, setIsowner] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

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

      if (!user) {
        setIsowner(false);
        return;
      }

      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
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

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUser();
    } else {
      setIsowner(false);
      setUserLoading(false);
    }
  }, [user]);

  const value = {
    currency,
    axios,
    navigate,
    user,
    getToken,
    isOwner,
    userLoading,
    setIsowner,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
