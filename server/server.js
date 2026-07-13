import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controllers/clerkWebHooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

import connectCloudinary from "./configs/cloudinary.js";
import { stripeWebHooks } from "./controllers/stripeWebhooks.js";
import reviewRouter from "./routes/reviewRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hotel-booking-app-nine-rho.vercel.app",
    ],
    credentials: true,
  }),
);

// API to listen to Stripe Webhooks
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebHooks,
);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => {
  res.send("Hotel app server working");
});

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/offers", offerRouter);
app.use("/api/notifications", notificationRouter);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    connectCloudinary();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server startup error:", error.message);
  }
};

startServer();
