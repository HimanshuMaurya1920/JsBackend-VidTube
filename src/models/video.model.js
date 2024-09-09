/*
videos [icon: video] {
  id string pk
  owner ObjectId users
  videoFile string
  thumbnail string
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date
}
*/



import mongoose ,{Schema, Types} from "mongoose"; 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    owner  :{
        type : Schema.Types.ObjectId ,
        ref : "User"
    },
    videoFile : {
        type : String, //aws 
        required : true
    },
    thumbnail : {
        type : String, //aws 
        required : false
    },
    title : {
        type : String, //aws 
        required : true
    },
    description : {
        type : String, //aws 
        required : true
    },
    duration : {
        type : Number, //aws 
        required : true
    },
    views : {
        type : Number, //aws 
        default : 0
    },
    isPublished : {
        type : Boolean, //aws 
        default :  true
    },
    





},{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",videoSchema);