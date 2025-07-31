// controllers/User.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponce from "../utils/apiResponce.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  const { username, password, email, fullname} =req.body;
  
  const existingUser= await User.findOne({
    $or:[{username},{email}]
  })

  if(existingUser){
    throw new apiError(
      "Username or email already exists",
      400
    );
  }
  
  const avtarLocalPath = req.files?.avtar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avtarLocalPath) {
    throw new apiError("Avatar is required", 400);
  }

  //upoload avatar to cloudinary
  const avatarResponse = await uploadOnCloudinary(avtarLocalPath);
  const coverImageresponce = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarResponse) {
    throw new apiError("Failed to upload avatar", 500); 
  }    


  const newUser = await User.create({
    username,
    password,
    email,
    fullname,
    avatar: avatarResponse.secure_url, // Use the URL from Cloudinary response
    coverImage: coverImageresponce?.secure_url, // Optional, if cover image is provided
  });

 const createdNewUser = User.findById(newUser._id).select("-password -refreshtoken");
 if (!createdNewUser) {
    throw new apiError("Failed to create user", 500);
  }

  return res.status(201).json(
    new ApiResponce(201, "User registered successfully", createdNewUser)
  );
  console.log("Registering user:", { username, email,password });


});


