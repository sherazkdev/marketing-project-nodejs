import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { STATUS_CODES,SUCCESS_MESSAGES,ERROR_MESSAGES } from "../Constants/responseContants.js";

/** services */
import UserServices from "../Services/user.services.js";
import { SEND_OTP_VALIDATE, FIND_USER_BY_ID_VALIDATE,SIGN_IN_VALIDATE, UNIQUE_EMAIL_VALIDATE, UNIQUE_USERNAME_VALIDATE, UPDATE_USER_AVATAR_VALIDATE, UPDATE_USER_FULLNAME_VALIDATE, UPDATE_USER_PASSWORD_VALIDATE, VERIFY_OTP_VALIDATE, UPDATE_USER_USERNAME_VALIDATE, SIGN_UP_VALIDATE } from "../Validaters/user.validaters.js";
import mongoose from "mongoose";

class UserControllers extends UserServices {
    
    constructor(){
        super();
    }

    /** Sign in user */
    HandleSignInUser = async (req,res) => {
        const {error,value} = SIGN_IN_VALIDATE.validate(req.body);
        if(error){
            let errors = error.details.map( (e) => e.message);
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Sign user payload */
        const signInUserPayload = {
            inputValue:value?.inputValue,
            password:value?.password,
        };
        const {AccessToken,RefreshToken,user} = await this.SignInUser(signInUserPayload);
        /** set cookies */
        const cookieOptions = {
            httpOnly:true,
            secure:true,
            sameSite:"None",
            expires:new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000)
        };

        return res.status(STATUS_CODES.OK)
        .cookie("accessToken",AccessToken,cookieOptions)
        .cookie("refreshToken",RefreshToken,cookieOptions)
        .json( new ApiResponse(user,SUCCESS_MESSAGES.USER_LOGGED_IN,true,STATUS_CODES.OK));
    };

    // Verify hashed otp
    HandleVerifyOtp = async (req,res) => {
        const {error,value} = VERIFY_OTP_VALIDATE.validate(req.body);
        if(error){
            let errors = error.details.map( (e) => e.message);
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Verify hashed otp payload */
        const verifyOtpPayload = {
            email:value?.email,
            otp:value?.otp
        };
        const verificationProccessResponse = await this.VerifyHashedOtp(verifyOtpPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(verificationProccessResponse,SUCCESS_MESSAGES.OTP_VERIFIED,true,STATUS_CODES.OK));
    }

    // Current user token verification
    HandleGetCurrentUser = async (req,res) => {
        return res.status(STATUS_CODES.OK).json( new ApiResponse(req.user,SUCCESS_MESSAGES.USER_FETCHED,true,STATUS_CODES.OK));
    };
    
    /** Sign up user */
    HandleSignUpUser = async (req,res) => {
        const {error,value} = SIGN_UP_VALIDATE.validate(req.body);
        if(error){
            let errors = error.details.map( (e) => e.message);
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }        
        /** SignUp user payload */
        const signUpUserPayload = {
            username:value?.username,
            avatar:value?.avatar,
            password:value?.password,
            fullname:value?.fullname,
            userId:value?.userId
        };
        const {AccessToken,RefreshToken,user} = await this.SignUpUser(signUpUserPayload);
        /** set cookies */
        const cookieOptions = {
            httpOnly:true,
            secure:true,
            sameSite:"None",
            expires:new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000)
        };

        return res.status(STATUS_CODES.OK)
        .cookie("accessToken",AccessToken,cookieOptions)
        .cookie("refreshToken",RefreshToken,cookieOptions)
        .json( new ApiResponse(user,SUCCESS_MESSAGES.USER_LOGGED_IN,true,STATUS_CODES.OK));
    };

    /** Send otp */
    HandleSendOtp = async (req,res) => {
        const {error,value} = SEND_OTP_VALIDATE.validate(req.body);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error);
        }
        /** Send Otp payload */
        const sendOtpPayload = {
            email:value?.email
        };
        const {user} = await this.SendOtp(sendOtpPayload);
        console.log(user);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(user,SUCCESS_MESSAGES.OTP_SENT,true,STATUS_CODES.OK));
    };

    /** Unique username */
    HandleUniqueUsername = async (req,res) => {
        const payload = Object.keys(req.body || {}).length ? req.body : req.query;
        const {error,value} = UNIQUE_USERNAME_VALIDATE.validate(payload);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error.details[0].message);
        }
        const findUserByUsernamePayload = {
            username:value?.username
        };
        const findedUser = await this.FindUserByUsername(findUserByUsernamePayload);
        /** username is exit to true is not exit to false */
        const uniqueUsernameStatus = findedUser ? true : false;
        
        return res.status(STATUS_CODES.OK).json( new ApiResponse(uniqueUsernameStatus,SUCCESS_MESSAGES.DATA_FETCHED,true,STATUS_CODES.OK))
    };
    
    /** Find user email is already used */
    HandleCheckUserEmail = async (req,res) => {
        const payload = Object.keys(req.body || {}).length ? req.body : req.query;
        const {error,value} = UNIQUE_EMAIL_VALIDATE.validate(payload);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error);
        }
        const findUserByEmailPayload = {
            email:value?.email
        };
        const findedUser = await this.FindUserByEmail(findUserByEmailPayload);
        /** username is exit to true is not exit to false */
        const uniqueEmailStatus = findedUser ? true : false;
        
        return res.status(STATUS_CODES.OK).json( new ApiResponse(uniqueEmailStatus,SUCCESS_MESSAGES.DATA_FETCHED,true,STATUS_CODES.OK))
    };

    /** Update user avatar */
    HandleUpdateUserAvatar = async (req,res) => {
        const {error,value} = UPDATE_USER_AVATAR_VALIDATE.validate(req.body);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error.details[0].message);
        }
        /** Update user avatar payload */
        const updateUserAvatarPayload = {
            avatar:value?.avatar,
            userId:req.user._id
        };
        const updateUserAvatar = await this.UpdateUserAvatar(updateUserAvatarPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updateUserAvatar,SUCCESS_MESSAGES.USER_UPDATED,true,STATUS_CODES.OK));
    };

    /** Update user fullname */
    HandleUpdateUserFullname = async (req,res) => {
        const {error,value} = UPDATE_USER_FULLNAME_VALIDATE.validate(req.body);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error.details[0].message);
        }
        /** Update user fullname payload */
        const updateUserFullnamePayload = {
            fullname:value?.fullname,
            userId:req.user._id
        };
        const updateUserFullname = await this.UpdateUserFullname(updateUserFullnamePayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updateUserFullname,SUCCESS_MESSAGES.USER_UPDATED,true,STATUS_CODES.OK));
    };

    /** Update user username */
    HandleUpdateUserUsername = async (req,res) => {
        const {error,value} = UPDATE_USER_USERNAME_VALIDATE.validate(req.body);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error.details[0].message);
        }

        const normalizedUsername = value?.username?.toLowerCase();
        const existingUser = await this.FindUserByUsername({username:normalizedUsername});
        if(existingUser && existingUser._id.toString() !== req.user._id.toString()){
            throw new ApiError(STATUS_CODES.CONFLICT,ERROR_MESSAGES.USERNAME_ALREADY_USED);
        }

        const updateUserUsernamePayload = {
            username: normalizedUsername,
            userId: req.user._id
        };

        const updatedUser = await this.UpdateUserUsername(updateUserUsernamePayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updatedUser,SUCCESS_MESSAGES.USER_UPDATED,true,STATUS_CODES.OK));
    };

    /** Update User password */
    HandleUpdateUserPassword = async (req,res) => {
        const {error,value} = UPDATE_USER_PASSWORD_VALIDATE.validate(req.body);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error.details[0].message);
        }
        /** Update user password payload */
        const updateUserPasswordPayload = {
            password:value?.password,
            userId:req.user._id
        };
        const updateUserPassword = await this.UpdateUserPassword(updateUserPasswordPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updateUserPassword,SUCCESS_MESSAGES.USER_UPDATED,true,STATUS_CODES.OK));
    };

    /** Google 0Auth Callback */
    HandleGoogle0AuthCallBack = async (req,res) => {

        const {AccessToken,RefreshToken} = await this.GenerateAccessTokenAndRefreshToken({userId:req.user?._id});
        console.log(AccessToken,RefreshToken,req.user);
        /** cookie expiry */
        const cookieOptions = {
            httpOnly:true,
            secure:true,
            sameSite:"None",
            expires:new Date(Date.now() + Number(process.env.COOKIE_EXPIRY) * 24 * 60 * 60 * 1000)
        };
        console.log(cookieOptions,process.env.CLIENT_URL);

        return res.status(STATUS_CODES.OK)
        .cookie("accessToken",AccessToken,cookieOptions)
        .cookie("refreshToken",RefreshToken,cookieOptions)
        .redirect(`${process.env.CLIENT_URL}/google/callback`)
    };

    /** User signout */
    HandleUserSignOut = async (req,res) => {
        const user = await this.UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(req.user._id),{
            $set : {
                refreshToken:null
            }
        });

        /** cookie expiry */
        const cookieOptions = {
            httpOnly:true,
            secure:true,
            sameSite:"None",
            expires:new Date(0)
        };

        return res.status(STATUS_CODES.OK)
        .clearCookie("accessToken",cookieOptions)
        .clearCookie("refreshToken",cookieOptions)
        .json( new ApiResponse([],SUCCESS_MESSAGES.USER_LOGOUT,true,STATUS_CODES.OK));
    };

    /** Find user */
    HandleFindUserById = async (req,res) => {
        const {error,value} = FIND_USER_BY_ID_VALIDATE.validate(req.query);
        if(error){
            throw new ApiError(STATUS_CODES.NOT_FOUND,error.details[0].message);
        }
        /** Find user payload */
        const findUserPayload = {
            _id:value?.userId,
        };
        const user = await this.FindUserById(findUserPayload);
        if(!user){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return res.status(STATUS_CODES.OK).json( new ApiResponse(user,SUCCESS_MESSAGES.DATA_FETCHED,true,STATUS_CODES.OK));
    };
}

export default new UserControllers;