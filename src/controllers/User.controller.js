import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponce from "../utils/apiResponce.js";

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
    throw new ApiError(500,"Failed to upload avatar");
  }

  // Create new user
  const newUser = await User.create({
    username,
    password,
    email,
    fullname,
    avatar: avatarResponse.secure_url,
    coverimage: coverImageResponse?.secure_url || null ,
  });

  // Fetch the newly created user (without sensitive fields)
  const createdNewUser = await User.findById(newUser._id).select(
    "-password -refreshtoken"
  );

  if (!createdNewUser) {
    throw new ApiError(500 ,"Failed to retrieve created user");
  }

  // Send success response
  return res
    .status(201)
    .json(new ApiResponce(201, "User registered successfully", createdNewUser));
});

export const loginUser =asyncHandler(async (req,res)=>{

  const {username , email , password ,fullname} = req.body;

  if(!username || !email){
    throw new ApiError(400 , "user name or email is required")
  }

  const userOccured= await User.find({
    $or:[{username} , {email}]
  })

  if(!userOccured){
    throw new ApiError(400 , "User not found")
  }

  const isPasswordValid = await userOccured.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(400 , "Invalid credentials")
  }

  const {accessToken}= await genereteAccessToken(userOccured._id , email , password ,fullname)
  const {refreshToken} = await genereteRefreshToken(userOccured._id)

  const loggedInUser = await User.findById(userOccured._id).select("-password refreshToken");

  const options={
    httpOnly : true,
    secure : true,
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("accessToken",refreshToken,options)
  .json(
    new ApiResponce(
      200,
      {
        userOccured :loggedInUser , accessToken , refreshToken
      },
      "user logged in successfuly"
    )
  )
})

export const logoutUser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
       accessToken: undefined
      }
    },
    {
      new:true
    }
  )

   const options={
    httpOnly : true,
    secure : true,
  }

  return res.status(200)
  .clearCookies("accessToken",options)
  .clearCookies("refreshToken",options)
  .json(new ApiResponce(200 , "User logged out"))
})


