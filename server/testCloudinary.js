import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader
  .upload("./hero1.jpg")
  .then((result) => {
    console.log("UPLOAD SUCCESS:");
    console.log(result.secure_url);
  })
  .catch((err) => {
    console.log("UPLOAD ERROR:");
    console.log(err);
  });