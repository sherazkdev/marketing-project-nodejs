import express from "express";

/** Controllers || Services */
import UserControllers from "../Controllers/user.controller.js";

/** Middlewares */
import AuthMiddleware from "../Middlewares/auth.middleware.js";

/** User Router */
const UserRouter = express.Router();

/** Services */
import AsyncHandler from "../Utils/AsyncHandler.js";

/** Google 0Auth Routes */
UserRouter.route("/google/auth").get(AuthMiddleware.GoogleAuthenticate);
UserRouter.route("/google/callback").get(AuthMiddleware.GoogleAuthenticationCallBack,AsyncHandler(UserControllers.HandleGoogle0AuthCallBack));

UserRouter.route("/send-otp").patch(AsyncHandler(UserControllers.HandleSendOtp));
UserRouter.route("/sign-in").patch(AsyncHandler(UserControllers.HandleSignInUser));
UserRouter.route("/sign-up").patch(AsyncHandler(UserControllers.HandleSignUpUser));
UserRouter.route("/unique-username").get(AsyncHandler(UserControllers.HandleUniqueUsername));
UserRouter.route("/find-user-by-id").get(UserControllers.HandleFindUserById)
UserRouter.route("/check-email").get(AsyncHandler(UserControllers.HandleCheckUserEmail));
UserRouter.route("/update-user-fullname").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserFullname));
UserRouter.route("/update-user-avatar").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserAvatar));
UserRouter.route("/update-user-password").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserPassword));

export default UserRouter;