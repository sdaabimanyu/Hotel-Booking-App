import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebHooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

dotenv.config();

connectDB();
connectCloudinary();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hotel-booking-app-nine-rho.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/clerk", clerkWebhooks);
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

app.get("/", (req, res) => {
  res.send("Hotel app server working");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});