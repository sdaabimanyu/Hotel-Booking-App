import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getUserData,
  storeRecentSearchedCities,
  getUserProfile,
  updateUserProfile,
  toggleFavoriteHotel,
  toggleFavoriteRoom,
  getFavorites,
} from "../controllers/userController.js";

const userRouter = express.Router();

// EXISTING USER ROUTES
userRouter.get("/", protect, getUserData);

userRouter.post("/store-recent-search", protect, storeRecentSearchedCities);

// PROFILE ROUTES
userRouter.get("/profile", protect, getUserProfile);

userRouter.put("/profile", protect, updateUserProfile);

// FAVORITE ROUTES

// Get all favorite hotels and rooms
userRouter.get("/favorites", protect, getFavorites);

// Add/remove favorite hotel
userRouter.patch("/favorites/hotel", protect, toggleFavoriteHotel);

// Add/remove favorite room
userRouter.patch("/favorites/room", protect, toggleFavoriteRoom);

export default userRouter;
