import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

import {
  createRoom,
  deleteRoom,
  getOwnerRooms,
  getRoomById,
  getRooms,
  toggleRoomAvailability,
  updateRoom,
} from "../controllers/roomController.js";

const roomRouter = express.Router();

// CREATE ROOM
roomRouter.post("/", protect, upload.array("images", 4), createRoom);

// GET ALL PUBLIC ROOMS
roomRouter.get("/", getRooms);

// GET HOTEL OWNER ROOMS
roomRouter.get("/owner", protect, getOwnerRooms);

// TOGGLE ROOM AVAILABILITY
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);

// GET SINGLE PUBLIC ROOM
roomRouter.get("/:id", getRoomById);

// UPDATE ROOM
roomRouter.put("/:id", protect, updateRoom);

// ARCHIVE ROOM
roomRouter.delete("/:id", protect, deleteRoom);

export default roomRouter;
