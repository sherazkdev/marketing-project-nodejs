/** User model */
import UserModel from "../Models/User.model";
import ApiError from "../Utils/ApiError";
import jwt from "jsonwebtoken";

/** Services */
import UserServices from "../Services/user.services";
import passport from "passport";

class Authentications extends UserServices {

    /** decode jwt token */
    VerifyJwtToken = async (req,res,next) => {
        try {
            const accessToken = req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
            if(!accessToken){
                throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.INVALID_CREDENTIALS);
            }
            const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
            const User = await this.FindById({_id:decodedToken._id});
            /** User is not exist to throw error */
            if(!User){
                throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.USER_NOT_FOUND);
            }
            /** Assing user to request */
            req.user = User;
            next();
        } catch (error) {
            throw new ApiError(error.status || 500,error.message || "Error: some thing wrong");
        }
    }
    /** Redirect to google url */
    GoogleAuthenticate = (req,res,next) => {
        passport.authenticate("google",{scope:["profile","email"]});
        next();
    }
    /** get logged in user info */
    GoogleAuthenticationCallBack = (req,res,next) => {
        passport.authenticate("google",{session:false});
        next();
    }
    
}

export default new Authentications;