import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";



const helthCheck = asyncHandler(async (req , res)=>{
    return res.status(200)
                .json(new ApiResponse(200 , "ok","Helth Check Pass"));
})

export {helthCheck};



