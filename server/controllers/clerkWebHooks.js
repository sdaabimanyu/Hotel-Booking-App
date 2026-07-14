import { Webhook } from "svix";
import User from "../models/User.js";

const clerkWebhooks = async (req, res) => {
  try {
    // ==========================================
    // 1. VALIDATE WEBHOOK SECRET
    // ==========================================

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Clerk webhook secret is not configured",
      });
    }

    // ==========================================
    // 2. GET SVIX HEADERS
    // ==========================================

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Svix headers",
      });
    }

    // ==========================================
    // 3. CREATE WEBHOOK INSTANCE
    // ==========================================

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ==========================================
    // 4. VERIFY WEBHOOK
    // req.body is a Buffer because server.js
    // will use express.raw()
    // ==========================================

    const event = webhook.verify(req.body.toString(), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    // ==========================================
    // 5. GET EVENT DATA
    // ==========================================

    const { data, type } = event;

    // ==========================================
    // 6. HANDLE CLERK EVENTS
    // ==========================================

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,

          email: data.email_addresses?.[0]?.email_address || "",

          username:
            `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",

          image: data.image_url || "",
        };

        await User.findByIdAndUpdate(data.id, userData, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        });

        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",

          username:
            `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",

          image: data.image_url || "",
        };

        await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });

        break;
      }

      case "user.deleted": {
        if (data.id) {
          await User.findByIdAndDelete(data.id);
        }

        break;
      }

      default:
        break;
    }

    // ==========================================
    // 7. SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.log("CLERK WEBHOOK ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: "Invalid Clerk webhook",
    });
  }
};

export default clerkWebhooks;
