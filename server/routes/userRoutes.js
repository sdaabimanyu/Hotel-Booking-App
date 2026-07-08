import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  getUserData,
  getUserProfile,
  updateUserProfile,
  storeRecentSearchedCities,
} from "../controllers/userController.js";

const userRouter = express.Router();

// EXISTING USER DATA
userRouter.get("/", protect, getUserData);

// USER PROFILE
userRouter.get("/profile", protect, getUserProfile);

userRouter.put("/profile", protect, updateUserProfile);

// RECENT SEARCH
userRouter.post("/store-recent-search", protect, storeRecentSearchedCities);

export default userRouter;
