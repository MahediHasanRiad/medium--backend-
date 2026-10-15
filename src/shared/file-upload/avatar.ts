import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAvatar(localFilePath?: any | null) {
  if (!localFilePath) {
    return null;
  }
  try {
    // 1. Upload an image from a remote URL
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath);
    return uploadResult.url;
  } catch (error) {
    console.error("Error executing Cloudinary operations:", error);
  }
}
