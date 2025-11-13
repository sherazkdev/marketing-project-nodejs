import express from "express";
import userRoute from "../../../Chat-app-Backend/src/Routes/v1/user.routes";

/** Controllers || Services */
import UserControllers from "../Controllers/user.controller.js";

/** Middlewares */
import AuthMiddleware from "../Middlewares/auth.middleware.js";

/** User Router */
const UserRouter = express.Router();

/** Services */
import AsyncHandler from "../Utils/AsyncHandler";

/** Google 0Auth Routes */
userRoute.route("/google/auth").get(AuthMiddleware.GoogleAuthenticate);
userRoute.route("/google/callback").get(AuthMiddleware.GoogleAuthenticationCallBack,AsyncHandler(UserControllers.HandleGoogle0AuthCallBack));

userRoute.route("/send-otp").path(AsyncHandler(UserControllers.HandleSendOtp));
userRoute.route("/sign-in").path(AsyncHandler(UserControllers.HandleSignInUser));
userRoute.route("/sign-up").path(AsyncHandler(UserControllers.HandleSignUpUser));
userRoute.route("/unique-username").get(AsyncHandler(UserControllers.HandleUniqueUsername));
userRoute.route("/find-user-by-id").get(UserControllers.HandleFindUserById)
userRoute.route("/check-email").get(AsyncHandler(UserControllers.HandleCheckUserEmail));
UserRouter.route("/update-user-fullname").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserFullname));
UserRouter.route("/update-user-avatar").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserAvatar));
UserRouter.route("/update-user-password").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserPassword));

export default UserRouter;