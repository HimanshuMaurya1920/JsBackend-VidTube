import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary , deleteFromClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const genrateAccessAndRefreshTocken = async (userId)=>{
    try {
        const user = await User.findById(userId);
        if(!user) throw new ApiError("404","User Not Found");
    
        const accessTocken  = user.genrateAccessToken()
        const refreshTocken = user.genrateRefreshToken()
    
        user.refreshTocken = refreshTocken;
        await user.save({validateBeforeSave : false});
    
        return { accessTocken , refreshTocken }
    } catch (error) {
        throw new ApiError("500","Something went wrong while genrating Access and Refresh Tocken");
    }
}

const refreshAccessTocken = asyncHandler(async ( req , res )=>{
    const incomingRefreshTocken = req.cookies.refreshTocken || req.body.refreshTocken ;
    
    if(!incomingRefreshTocken) throw new ApiError(401 , "refresh Tocken is Required");

    try {
        const decodedTocken =  jwt.verify(
            incomingRefreshTocken ,
            process.env.REFRESH_TOKEN_SECRET ,
        )

        const  user = await User.findById(decodedTocken._id);

        if(!user) throw new ApiError(404 , "User Not Found");

        if(incomingRefreshTocken !== user?.refreshToken){
            throw new ApiError(401 , "Invalid Refresh Tocken");
        }

        const option = {
            httpOnly : true ,
            secure : process.env.NODE_ENV === "production"
        }

        const { accessTocken , refreshTocken : newRefreshTocken } = await genrateAccessAndRefreshTocken(user._id);

        return res.status(200)
                    .cookie("accessTocken" , accessTocken , option)
                    .cookie("refreshTocken" , newRefreshTocken , option)
                    .json(
                        new ApiResponse(
                            200 ,
                             {
                                accessTocken ,
                                 refreshTocken : newRefreshTocken
                            } ,
                             "Access Tocken Refreshed"))

    } catch (error) {
        throw new ApiError(401 , "Something went wrong while refreshing Access Tocken");
    }

})


const loginUser = asyncHandler(async (req , res)=>{
    //get data from request body

    //validation
    if(Object.keys(req.body).length === 0) throw new ApiError("400","Fields are Missing");
    
    //destructure it
    const { email , password } = req.body ;

    if(!email || !password) throw  new ApiError("400" , "all fields are required");

    //find that user in 
    const user = await User.findById({
        $or: [{username},{email}]
    })

    if(!user) throw new ApiError("404" , "User Not Found");

    //compare password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect) throw new ApiError("400" , "Wrong Password");


    //genrate access and refresh tocken
    const { accessTocken , refreshTocken } = await genrateAccessAndRefreshTocken(user._id);

    const loggedInUser = await User.findById(user._id)
                                    .select("-password -refreshTocken");
        
    const option = {
        httpOnly : true ,
        secure : process.env.NODE_ENV === "production" 
    }

    return res
        .status(200)
        .cookie("accessTocken" , accessTocken , option )
        .cookie("refreshTocken" , refreshTocken , option )
        .json(new ApiResponse(200 , { user : loggedInUser , Access : accessTocken ,Refresh : refreshTocken } , "SuccessFully Logged in"));

})



const registerUser = asyncHandler(async (req , res)=>{
    // console.log(req.body);
    if(Object.keys(req.body).length === 0) throw new ApiError("400","Fields are Missing");
    
    const {fullname , username ,email , password } = req.body;
    //validation
    if( [fullname , username , email , password].some((field)=> field?.trim() === "" )){
        throw new ApiError(400 , "all fields are required");
    }

    const ExistingUser = await  User.findOne({
        $or : [{username},{email}],
    })

    if (ExistingUser) throw new ApiError("400","Email or Username Already Exist , try new");
    
    const avatarLocalPath =  req.files?.avatar?.[0]?.path ;
    const coverLocalPath  =  req.files?.coverImage?.[0]?.path ; 

    // if (! avatarLocalPath) {
    //     throw new ApiError("400","Avatar Image is Missing");
    // }
        
    // let avatarImage = await uploadOnCloudinary(avatarLocalPath);
    // console.log(avatarImage);
    
    // let coverImage = "";
    // if (coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverLocalPath);
    // }

    let avatarImage ;
    try {
        avatarImage = await uploadOnCloudinary(avatarLocalPath);
    } catch (error) {
        console.log("Error uploadinhg avatar on cloudinary",error);
        throw new ApiError("400","Error uploading avatar on cloudinary");
    }

    let coverImage ;
    if (coverLocalPath) {
        try {
            coverImage = await uploadOnCloudinary(coverLocalPath);
        } catch (error) {
            console.log("Error uploadinhg cover on cloudinary",error);
            throw new ApiError("400","Error uploading cover on cloudinary");
        }
    }
        
    try {
        
            const user = await User.create({
                fullname ,
                avatar : avatarImage.url || "",
                coverImage : coverImage.url || "" ,
                email ,
                password ,
                username : username.toLowerCase()
            })
            
            const createdUser = await User.findById(user._id).select("-password -refreshToken")
        
            if (! createdUser) {
                throw new ApiError(500 , "Something Went Wrong While Registering User");
            }
        
            return res
                .status(200)
                .json(new ApiResponse(200 , createdUser , "User is Created "))
        
    } catch (error) {
        console.log("User Creation Failed ",error);
        if (avatarImage?.public_id) {
            await deleteFromClodinary(avatarImage.public_id)
        }
        if (coverImage?.public_id) {
            await deleteFromClodinary(coverImage.public_id);
        }
        
        throw new ApiError("500","Something Went Wrong While Registering User and image Deleted");
        
    }

})


const loggoutUser = asyncHandler(async ( req , res )=> {
    await User.findByIdAndUpdate(
        //todo : need to come here after Middleware
        req.user._id ,
        {
            $set :{
                refreshTocken : undefined
            }
        },
        {new : true}
    )

    const option = {
            httpOnly : true ,
            secure : process.env.NODE_ENV === "production" 
        }
    
        return res
            .status(200)
            .clearCookie("accessToken" , option)
            .clearCookie("refreshToken" , option)
            .json(new ApiResponse(200 , {} , "SuccessFully Logged out"));

})


export {
    registerUser ,
    loginUser    ,
    refreshAccessTocken ,
    loggoutUser,
}