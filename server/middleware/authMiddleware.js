import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    console.log("AUTH:", req.auth());

    const { userId } = req.auth();

    console.log("USER ID:", userId);

    if (!userId) {
      return res.json({
        success: false,
        message: "not authenticated",
      });
    }

    const user = await User.findById(userId);

    console.log("DB USER:", user);

    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};