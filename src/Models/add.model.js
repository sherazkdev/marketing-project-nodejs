import mongoose from "mongoose";

/** Add Schema */
const AddSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'USER',
        index:true,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    subCategory:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        trim:true,
        maxLength:2000
    },
    price:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        required:true,
        trim:true,
    },
    coverImage:{
        type:String,
    },
    hashtags:{
        type:[String],
        default:[]
    },
    type:{
        type:String,
        enum:["IMAGE","VIDEO"],
        required:true,
    },
    status:{
        type:String,
        enum:["DELETED","DISABLED","ENABLED"],
        default:"ENABLED"
    }
},{timestamps:true});

/** Add model */
const AddModel = mongoose.model("Add",AddSchema);
export default AddModel;