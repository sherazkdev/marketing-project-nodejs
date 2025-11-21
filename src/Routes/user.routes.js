import express from "express";

/** Controllers || Services */
import UserControllers from "../Controllers/user.controller.js";

/** Middlewares */
import AuthMiddleware from "../Middlewares/auth.middleware.js";

/** User Router */
const UserRouter = express.Router();

/** Services */
import AsyncHandler from "../Utils/AsyncHandler.js";

// /** Google 0Auth Routes */
UserRouter.route("/google/auth").get(AuthMiddleware.GoogleAuthenticate);
UserRouter.route("/google/callback").get(AuthMiddleware.GoogleAuthenticationCallBack,AsyncHandler(UserControllers.HandleGoogle0AuthCallBack));

UserRouter.route("/send-otp").post(AsyncHandler(UserControllers.HandleSendOtp));
UserRouter.route("/verify-otp").patch(AsyncHandler(UserControllers.HandleVerifyOtp));
UserRouter.route("/current-user").get(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleGetCurrentUser));
UserRouter.route("/sign-in").patch(AsyncHandler(UserControllers.HandleSignInUser));
UserRouter.route("/sign-up").patch(AsyncHandler(UserControllers.HandleSignUpUser));
UserRouter.route("/sign-out").post(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUserSignOut));
UserRouter.route("/unique-username")
    .get(AsyncHandler(UserControllers.HandleUniqueUsername))
    .post(AsyncHandler(UserControllers.HandleUniqueUsername));
UserRouter.route("/find-user-by-id").get(UserControllers.HandleFindUserById)
UserRouter.route("/check-email")
    .get(AsyncHandler(UserControllers.HandleCheckUserEmail))
    .post(AsyncHandler(UserControllers.HandleCheckUserEmail));
UserRouter.route("/update-user-fullname").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserFullname));
UserRouter.route("/update-user-avatar").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserAvatar));
UserRouter.route("/update-user-password").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserPassword));
UserRouter.route("/update-user-username").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(UserControllers.HandleUpdateUserUsername));

export default UserRouter;