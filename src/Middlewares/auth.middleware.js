/** User model */
import ApiError from "../Utils/ApiError.js";
import jwt from "jsonwebtoken";

/** Services */
import UserServices from "../Services/user.services.js";
import GoogleAuth from "../Connections/googleAuth/google.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../Constants/responseContants.js";

class Authentications extends UserServices {

    constructor(){
        super();
    }

    /** decode jwt token */
    VerifyJwtToken = async (req,res,next) => {
        try {
            console.log("Is Requested")
            const accessToken = req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
            if(!accessToken){
                throw new ApiError(STATUS_CODES.UNAUTHORIZED,ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
            }
            const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
            const User = await this.FindUserById({_id:decodedToken._id});
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
    GoogleAuthenticate = GoogleAuth.authenticate("google", { scope: ["profile","email"] });
    
    /** get logged in user info */
    GoogleAuthenticationCallBack = GoogleAuth.authenticate("google",{session:false});


    
}

export default new Authentications;