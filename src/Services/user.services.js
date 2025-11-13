import mongoose from "mongoose";
import UserModel from "../Models/User.model.js";

/** Services */
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import Mailer from "../Connections/NodeMailer/mailer.js";

class UserServices {
    constructor(){
        this.UserModel = UserModel;
    }
    
    // Sign in user verify email and password
    SignInUser = async (payload) => {
        const {inputValue,password} = payload;
        const user = await this.UserModel.findOne({
            $or : [
                {username:inputValue.toString().trim()},
                {email:inputValue.toString().trim()}
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
        let otp = '';
        for(let i = 1; i < 5; i++){
            otp += Math.floor(Math.random() * 5);
        }
        return otp;
    }

    // Send Otp
    SendOtp = async (payload) => {
        const {email} = payload;
        const checkEmailIsExist = await this.FindUserByEmail({email:email});
        if(checkEmailIsExist){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.USER_ALREADY_EXISTS);
        }
        /** Generate otp */
        const GenerateOtp = this.GenerateRandomOtp();

        /** Send mail payload */
        const SendMailPayload = {
            to:email,
            subject:"Add Feed Mail Verificatio --noreply",
            body:{
                otp:GenerateOtp
            }
        }
        const NodeMailer = new Mailer();
        const sendMail = await NodeMailer.SendMail(SendMailPayload);

        /** Create user record */
        const user = await this.UserModel.create({
            email:email.toString(),
            otp:GenerateOtp,
            isVerified:false,
            otpExpiry:new Date().getTime() + ( 5 * 60 * 1000),
            status:"DISABLED"
        });
        
        /** saved user return */
        return {user};
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
        user.username = username;
        user.avatar = avatar;
        
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
        const RefreshToken = user.GenerateRefreshToken();
        const AccessToken = user.GenerateAccessToken();

        /** Assing refresh token to db refreshToken */
        user.refreshToken = RefreshToken;
        await user.save({validateBeforeSave:true});
        return {AccessToken,RefreshToken};
    };

    /** Verify hashed otp */
    VerifyHashedOtp = async (payload) => {
        const {otp,userId} = payload;
        const user = await this.FindUserById({_id:userId});
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        if(user.otpExpiry.getTime() < new Date().getTime()){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.OTP_EXPIRED)
        }
        const compareHashedOtp = user.HashedOtpVerification(otp);
        if(!compareHashedOtp){
            throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.OTP_INVALID);
        }
    
        /* otp and otp exipry set null and isVerified is true */
        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        
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
        const user = await this.UserModel.findOne({email:email});
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

}

export default UserServices;