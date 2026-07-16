import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import clerkWebhooks from "./controllers/clerkWebHooks.js";
import { stripeWebHooks } from "./controllers/stripeWebhooks.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import inquiryRouter from "./routes/inquiryRoutes.js";

dotenv.config();

const app = express();

// =========================================================
// CORS
// =========================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://el-hotel-booking-app.netlify.app",
    ],
    credentials: true,
  }),
);

// =========================================================
// STRIPE WEBHOOK
// IMPORTANT: MUST BE BEFORE express.json()
// =========================================================

app.post(
  "/api/stripe",
  express.raw({
    type: "application/json",
  }),
  stripeWebHooks,
);

// CLERK WEBHOOK
app.post(
  "/api/clerk",
  express.raw({
    type: "application/json",
  }),
  clerkWebhooks,
);

// =========================================================
// GLOBAL MIDDLEWARE
// =========================================================

app.use(express.json());

app.use(clerkMiddleware());

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.status(200).send("Hotel app server working");
});

// =========================================================
// API ROUTES
// =========================================================

app.use("/api/user", userRouter);

app.use("/api/hotels", hotelRouter);

app.use("/api/rooms", roomRouter);

app.use("/api/bookings", bookingRouter);

app.use("/api/reviews", reviewRouter);

app.use("/api/offers", offerRouter);

app.use("/api/notifications", notificationRouter);

app.use("/api/inquiries", inquiryRouter);

// =========================================================
// PORT
// =========================================================

const PORT = process.env.PORT || 3000;

// =========================================================
// START SERVER
// =========================================================

const startServer = async () => {
  try {
    await connectDB();

    connectCloudinary();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server startup error:", error.message);

    process.exit(1);
  }
};

startServer();
