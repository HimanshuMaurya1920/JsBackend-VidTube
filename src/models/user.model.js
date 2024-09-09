 /**
  users [icon: user] {
  id string pk
  username string
  email string
  fullName string
  avatar string
  coverImage string
  watchHistory ObjectId[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date
}
  */

import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
    username:{
        type     : String ,
        required : true,
        unique   : true,
        lowercase: true,
        trim     : true,
        index    : true ,
    },
    email:{
        type     : String ,
        required : true,
        unique   : true,
        lowercase: true,
        trim     : true,
        index    : true ,
    },
    fullname:{
        type     : String ,
        required : true,
        unique   : false,
        lowercase: false,
        trim     : true,
        index    : true ,
    },
    avatar:{
        type     : String , //aws URL
        required : true,
    },
    coverImage:{
        type     : String , //aws URL
    },
    watchHistory:[
        {
            type : Schema.Types.ObjectId ,
            ref  : "Video"
        }
    ],
    password :{
        type : String ,
        required : [true , "Password is Required"]
    },
    refreshToken:{
        type : String ,
    }
},
{
    timestamps : true
}
);

userSchema.pre("save",async function(next){
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password , 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password , this.password);
}

userSchema.method.genrateAccessToken = function(){
    //short lived access token
     return jwt.sign({
         _id : this._id,
         email : this.email ,
         username : this.username ,
        }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}

userSchema.method.genrateRefreshToken = function(){
    //short lived access token
     return jwt.sign({
         _id : this._id
        }, process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}



export const User = mongoose.model("User",userSchema);


