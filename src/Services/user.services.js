import mongoose from "mongoose";
import UserModel from "../Models/user.model.js";

/** Services */
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import Mailer from "../Connections/NodeMailer/mailer.js";
import { STATUS_CODES,SUCCESS_MESSAGES,ERROR_MESSAGES } from "../Constants/responseContants.js";

class UserServices {
    constructor(){
        this.UserModel = UserModel;
    }
    
    // Sign in user verify email and password
    SignInUser = async (payload) => {
        const {inputValue,password} = payload;
        const normalizedInput = inputValue.toString().trim();
        const normalizedEmailOrUsername = normalizedInput.toLowerCase();
        const user = await this.UserModel.findOne({
            $or : [
                {username:normalizedEmailOrUsername},
                {email:normalizedEmailOrUsername}
            ],
            status:"ENABLED",
            isVerified:true
        });
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        /** Next step verify hashed password to normal password */
        const HashedPassword = await user.HashedPasswordVerification(password);
        if(!HashedPassword){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        
        /** Next step Generate user AccessToken and RefreshToken */
        const {AccessToken,RefreshToken} = await this.GenerateAccessTokenAndRefreshToken({userId:user._id});
        if(!AccessToken || !RefreshToken){
            throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR,ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
        
        /** Assign to user mongo object refreshToken */
        user.refreshToken = RefreshToken;
        await user.save();

        return {AccessToken,RefreshToken,user};
    };

    GenerateRandomOtp = async () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send Otp
    SendOtp = async (payload) => {
        const {email} = payload;
        if(!email){
            throw new ApiError(STATUS_CODES.BAD_REQUEST,"Error: Email is required");
        }

        const normalizedEmail = email.toString().trim().toLowerCase();
        const existingUser = await this.FindUserByEmail({email:normalizedEmail});
        const generatedOtp = await this.GenerateRandomOtp();
        const otpExpiry = new Date(Date.now() + (5 * 60 * 1000));

        /** Send mail payload */
        const SendMailPayload = {
            to:normalizedEmail,
            subject:"Add Feed Mail Verification --noreply",
            body:{
                otp:generatedOtp
            }
        };
        const NodeMailer = new Mailer();
        await NodeMailer.SendMail(SendMailPayload);

        let userRecord = existingUser;

        if(existingUser){
            const hasCompletedSignup = Boolean(existingUser.password && existingUser.username && existingUser.status === "ENABLED");
            if(hasCompletedSignup){
                throw new ApiError(STATUS_CODES.CONFLICT,ERROR_MESSAGES.USER_ALREADY_EXISTS);
            }
            existingUser.otp = generatedOtp;
            existingUser.otpExpiry = otpExpiry;
            existingUser.isVerified = false;
            existingUser.status = "DISABLED";
            userRecord = await existingUser.save();
        }else{
            userRecord = await this.UserModel.create({
                email:normalizedEmail,
                otp:generatedOtp,
                username:null,
                isVerified:false,
                otpExpiry,
                status:"DISABLED"
            });
        }
        
        /** saved user return */
        return {user:{_id:userRecord._id,email:userRecord.email}};
    };
    
    // Sign up user verify user otp
    SignUpUser = async (payload) => {
        const {password,fullname,username,avatar,userId} = payload;
        const user = await this.FindUserById({_id:userId});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        
        /** check user is Verified */
        if(user.isVerified !== true){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.USER_IS_NOT_VERIFIED)
        }
        user.fullname = fullname;
        user.password = password;
        user.username = username?.toLowerCase();
        user.avatar = avatar;
        user.status = "ENABLED";
        
        /** Next step Generate AccessToken and RefreshToken */
        const {AccessToken,RefreshToken} = await this.GenerateAccessTokenAndRefreshToken({userId:user._id});
        if(!AccessToken || !RefreshToken){
            throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR,ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }

        /** save user with updated info */
        user.refreshToken = RefreshToken;
        await user.save();

        return {AccessToken,RefreshToken,user};
    };

    // Generate refreshToken and accessToken
    GenerateAccessTokenAndRefreshToken = async (payload) => {
        const {userId} = payload;
        const user = await this.FindUserById({_id:userId});
        const RefreshToken = await user.GenerateRefreshToken();
        const AccessToken = await user.GenerateAccessToken();

        /** Assing refresh token to db refreshToken */
        user.refreshToken = RefreshToken;
        await user.save({validateBeforeSave:true});

        return {AccessToken,RefreshToken};
    };

    /** Verify hashed otp */
    VerifyHashedOtp = async (payload) => {
        const {otp,email} = payload;
        const sanitizedEmail = email?.toString().trim().toLowerCase();
        const user = await this.FindUserByEmail({email:sanitizedEmail});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        if(!user.otp || !user.otpExpiry){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.OTP_EXPIRED);
        }
        if(new Date(user.otpExpiry).getTime() < new Date().getTime()){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.OTP_EXPIRED)
        }
        const normalizedOtp = otp?.toString().trim();
        if(!normalizedOtp){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.OTP_INVALID);
        }
        const digitsOnlyOtp = normalizedOtp.replace(/\D/g,"");
        const compareHashedOtp = await user.HashedOtpVerification(digitsOnlyOtp);
        if(!compareHashedOtp){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.OTP_INVALID);
        }
    
        /* otp and otp exipry set null and isVerified is true */
        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        user.status = "DISABLED";
        
        /** save user */
        await user.save();
        return user;
    };

    /** Generate Hashed Otp */
    GenerateHashedOtp = async (payload) => {
        const {userId,otp} = payload;        
        const user = await this.FindUserById({_id:userId});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        const hashedOtp = user.GenerateHashedOtp(otp);
        /** assing hashed otp and set expiry otp */
        user.otp = hashedOtp;
        user.otpExpiry = new Date().getTime() + ( 5 * 60 * 1000)

        /** save user with updated info */
        await user.save();
        return user;
    }

    // Find user by id
    FindUserById = async (payload) => {
        const {_id} = payload;
        const user = await this.UserModel.findById(new mongoose.Types.ObjectId(_id));
        return user;
    };

    // Find user by email
    FindUserByEmail = async (payload) => {
        const {email} = payload;
        const normalizedEmail = email?.toString().trim().toLowerCase();
        const user = await this.UserModel.findOne({email:normalizedEmail});
        return user;        
    };

    // Find user by username
    FindUserByUsername = async (payload) => {
        const {username} = payload;
        const user = await this.UserModel.findOne({username:username});
        return user;
    };

    // Update user avatar
    UpdateUserAvatar = async (payload) => {
        const {avatar,userId} = payload;
        const user = await this.UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(userId),{
            $set : {
                avatar:avatar
            }
        },{new:true});
        return user;
    };

    // Update user password
    UpdateUserPassword = async (payload) => {
        const {userId,password} = payload;
        const user = await this.FindUserById({_id:userId});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        user.password = password;
        await user.save();
        return user;
    };

    // Update User fullname
    UpdateUserFullname = async (payload) => {
        const {userId,fullname} = payload;
        const user = await this.FindUserById({_id:userId});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        user.fullname = fullname;
        await user.save();
        return user;
    };

    // Update user username
    UpdateUserUsername = async (payload) => {
        const {userId,username} = payload;
        const user = await this.FindUserById({_id:userId});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        user.username = username;
        await user.save();
        return user;
    };

}

export default UserServices;