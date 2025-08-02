import { header } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponce from "../utils/apiResponce.js";
import jwt from "jsonwebtoken"
import User from "../models/user.models.js";
import ApiError from "../utils/apiError.js";


export const verifyJWT= asyncHandler(async (req , res , next)=>{

    try {
        const token = req.cookies?.accessToken || header("authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiResponce(401 , "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRETE)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401 , "invalid access token ")
        }
    
        req.user=user;
    
        next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid access token")
    }
})