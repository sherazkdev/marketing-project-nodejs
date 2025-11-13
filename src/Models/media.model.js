import { required } from "joi";
import mongoose from "mongoose";

/** Media Schema */
const MediaSchema = new mongoose.Schema({
    adId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Add",
        index:true,
        required:true,
    },
    filename:{
        type:String,
        required:true,
    },
    mediaType:{
        type:String,
        enum:["IMAGE","VIDEO"],
        required:true,
    },
    mediaUrl:{
        type:String,
        required:true,
    },
},{timestamps:true});

/** Media model */
const MediaModel = mongoose.model("Media",MediaSchema);
export default MediaModel;