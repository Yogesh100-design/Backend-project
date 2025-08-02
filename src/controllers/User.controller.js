import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponce from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email, fullname } = req.body;
  console.log("Form Fields:", req.body);
  console.log("Uploaded Files:", req.files);

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError("Username or email already exists", 400);
  }

  // Get file paths
  const avtarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverimage?.[0]?.path;

  if (!avtarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  // Upload to Cloudinary
  const avatarResponse = await uploadOnCloudinary(avtarLocalPath);
  const coverImageResponse = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatarResponse) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // Create new user
  const newUser = await User.create({
    username,
    password,
    email,
    fullname,
    avatar: avatarResponse.secure_url,
    coverimage: coverImageResponse?.secure_url || null,
  });

  // Fetch the newly created user (without sensitive fields)
  const createdNewUser = await User.findById(newUser._id).select(
    "-password -refreshtoken",
  );

  if (!createdNewUser) {
    throw new ApiError(500, "Failed to retrieve created user");
  }

  // Send success response
  return res
    .status(201)
    .json(new ApiResponce(201, "User registered successfully", createdNewUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "user name or email is required");
  }

  const userOccured = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!userOccured) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordValid = await userOccured.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = userOccured.genereteAccessToken();
  const refreshToken = userOccured.genereteRefreshToken();

  userOccured.accessToken = accessToken;
  userOccured.refreshToken = refreshToken;
  await userOccured.save();

  const loggedInUser = await User.findById(userOccured._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          userOccured: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfuly",
      ),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        accessToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "User logged out"));
});

export const AccessRefreshToken = asyncHandler(async (req, res) => {
  console.log(req.cookies.refreshToken);
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized request");
  }

  try {
    const devodedRfreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRETE,
    );

    const user = await User.findById(devodedRfreshToken._id);

    if (!user) {
      throw new ApiError(400, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const accessToken = user.genereteAccessToken();
    const newRefreshToken = user.genereteRefreshToken();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponce(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh token");
  }
});

export const updatePassword = asyncHandler(async (req , res)=>{

  const {oldPassword , newPassword}= req.body;

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400 , "Password Incorrect");
  }

  user.password=newPassword;
  await user.save({validateBefore:false})

  return res.status(200)
  .json(new ApiResponce(200 , {} , "Password changed successfully"))
})

export const currentUser = asyncHandler(async (req , res)=>{
  res.status(200)
  .json(200,req.user , "Current user fetched successfully")
})

export const updateAccountDetails = asyncHandler(async (req , res)=>{

  const {fullname , email} = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        fullname,
        email
      }
    }
    ,{new:true}
  ).select("-password")

  res.status(200)
  .json(new ApiResponce(200 , user , "Acconunt details updated successfully"))
})

export const updateUserAvtar = asyncHandler(async (req , res)=>{
  const avtarLocalPath = req.file?.path;

  if(!avtarLocalPath){
    throw new ApiError(400 , "Avatar is missing")
  }

  const avatar = uploadOnCloudinary(avtarLocalPath);

  if(!avatar.url){
    throw new ApiError(400 , "Error while  uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.file?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new : true}
  ).select("-password")

  res.status(200)
  .json(
    new ApiResponce(200 , user , "Cover image updated successfully" )
  )
  
})

export const updateCoverImage = asyncHandler(async (req , res)=>{
  const CoverImageLocalPath = req.file?.path;

  if(!CoverImageLocalPath){
    throw new ApiError(400 , "cover image is missing")
  }

  const coverimage = uploadOnCloudinary(CoverImageLocalPath);

  if(!coverimage.url){
    throw new ApiError(400 , "Error while  uploading cover image")
  }

  const user = await User.findByIdAndUpdate(
    req.file?._id,
    {
      $set:{
        coverimage:coverimage.url
      }
    },
    {new : true}
  ).select("-password")

  res.status(200)
  .json(
    new ApiResponce(200 , user , "Cover image updated successfully" )
  )
  
})