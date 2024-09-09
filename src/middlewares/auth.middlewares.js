import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const verifyJWT = asyncHandler(async (req , _ , next)=>{
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer " , "") || req.body?.accessToken  ;

    if(!token) throw new ApiError(401 , "Unauthorized Access");

    try {
        const decodedTocken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decodedTocken._id).select("-password -refreshTocken");
        
        if(!user) throw new ApiError(401 , "Unauthorized ");

        req.user = user ;

        next();

    } catch (error) {
        throw new ApiError(401 , error?.message || "Something went wrong in middleware verifyJWT");
        
    }

})







