import express from "express";

/** User Router */
const AddRouter = express.Router();

/** Add controllers */
import AddControllers from "../Controllers/add.controller.js";

/** Services */
import AsyncHandler from "../Utils/AsyncHandler.js";

/** Middlewares */
import AuthMiddleware from "../Middlewares/auth.middleware.js";

AddRouter.route("/get-latest-adds").get(AsyncHandler(AddControllers.HandleGetLatestAdds));
AddRouter.route("/get-user-profile").post(AsyncHandler(AddControllers.HandleGetUserProfile));
AddRouter.route("/search-add").post(AsyncHandler(AddControllers.HandleSearchAdd));
AddRouter.route("/get-add").get(AsyncHandler(AddControllers.HandleFindAdd));


/** Secured routes */
AddRouter.route("/create-add").post(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleCreateAdd));
AddRouter.route("/update-add").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleUpdateAdd));
/** is Working currently 
 1: AddRouter.route("/share-whatsapp").post(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleShareWhatsApp));
 2: AddRouter.route("/share-facebook").post(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleShareFacebook));
*/
AddRouter.route("/update-add-coverImage").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.UpdateAddCoverImage));
AddRouter.route("/get-user-adds").get(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleGetUserAdds));
AddRouter.route("/remove-media-from-add").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleDeleteMediaFromAdd));
AddRouter.route("/update-add-status").patch(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleUpdateAddStatus));
AddRouter.route("/generate-description").get(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleGenerateAiBasedDescription));
AddRouter.route("/generate-hashtags").get(AsyncHandler(AddControllers.HandleGenerateAiBasedHashtags));
AddRouter.route("/generate-images").get(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleGenrateAiBasedImages));
AddRouter.route("/delete-add").delete(AuthMiddleware.VerifyJwtToken,AsyncHandler(AddControllers.HandleDeleteAdd));

export default AddRouter;