import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/** User Scheme */
const UserSchema = new mongoose.Schema({
    googleId:{
        type:String,
        index:true,
    },
    fullname:{
        type:String,
    },
    username:{
        type:String,
        unique:true,
        index:true
    },
    email:{
        type:String,
        unique:true,
        index:true,
    },
    avatar:{
        type:String,
        default:null
    },
    password:{
        type:String,
    },
    otp:{
        type:String,
        default:null
    },
    otpExpiry:{
        type:Date,
        default:null
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["ENABLED","DISABLED"],
        default:"ENABLED"
    },

},{timestamps:true});

/** Genrate Refresh token */
UserSchema.methods.GenrateRefreshToken = function () {
    try {
        const User = this;
        /* Payload component */
        const UserRefreshTokenPayload = {
            _id:User._id
        };
        const GenratedRefreshToken = jwt.sign(UserRefreshTokenPayload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY});
        return GenratedRefreshToken;
    } catch (error) {
        throw new ApiError(error.status || 500,error?.message || "Error: some thing wrong");
    }
};

/** Verify Hashed Otp */
UserSchema.methods.HashedOtpVerification = async function (otp){
    const compareOtp = await bcrypt.compare(otp,this.otp);
    return compareOtp
}
/** Verify Hashed Password */
UserSchema.methods.HashedPasswordVerification = async function (password){
    const comparePassword = await bcrypt.compare(password,this.password);
    return comparePassword
}

/** Genrate Hashed otp */
UserSchema.methods.GenrateHashedOtp = async function (otp){
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp,otp);
        return hashedOtp;
    } catch (error) {
        throw new ApiError(error.status || 500,error?.message || "Error: some thing wrong");
    }
}

UserSchema.methods.GenrateAccessToken = function () {
    try {
        const User = this;
        /* Payload component */
        const UserAccessTokenPayload = {
            _id:User._id,
            fullname:User?.fullname,
            avatar:User?.avatar
        };
        const GenratedAccessToken = jwt.sign(UserAccessTokenPayload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
        return GenratedAccessToken;
    } catch (error) {
        throw new ApiError(error.status || 500,error?.message || "Error: some thing wrong");
    }
};

UserSchema.pre("save", async function (next) {
    try {
        // "this" refers to the current document
        // If neither password nor OTP is modified, skip hashing
        if (!this.isModified("password") && !this.isModified("otp")) {
            return next();
        }

        // If password is modified
        if (this.isModified("password")) {
            /** Generate salt and hash the password */
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        // If OTP is modified
        if (this.isModified("otp")) {
            /** Generate salt and hash the OTP */
            const salt = await bcrypt.genSalt(10);
            this.otp = await bcrypt.hash(this.otp, salt);
        }

        // Call next middleware
        next();
    } catch (error) {
        // Proper error handling in Mongoose middleware
        next(error);
    }
});

/** Finaly create User model */
const UserModel = mongoose.model("USER",UserSchema);
export default UserModel