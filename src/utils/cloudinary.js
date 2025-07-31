import { v2 as cloudinary } from "cloudinary";
// const fs = require("fs"); // Import required modules
import fs from "fs"; // Import required modules

// Configuration
cloudinary.config({
  cloud_name: process.env.COLUDINARY_CLOUD_NAME,
  api_key: process.env.COLUDINARY_API_KEY,
  api_secret: process.env.COLUDINARY_API_SECRETE, // Click 'View API Keys' above to copy your API secret
});


// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // If no file path is provided, return null
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect file type (image, video, etc.)
    });

    // Log the response for confirmation/debugging
    console.log("File uploaded successfully:", response);

    // Return the Cloudinary response (e.g., URL, public_id)
    return response;
  } catch (error) {
    // If upload fails, remove the local file to clean up
    fs.unlinkSync(localFilePath); // Fixed typo: unlinkSynk -> unlinkSync

    // Log the error
    console.error("Error uploading file:", error);

    // Return null to indicate failure
    return null;
  }
};

export default uploadOnCloudinary;
