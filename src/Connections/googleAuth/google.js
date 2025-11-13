import Auth0Strategy from "passport-auth0";
import passport from "passport";

/** User model */
import UserModel from "../../Models/User.model";

const auth0Strategy = new Auth0Strategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.CLIENT_CALLBACK_URL
},async function(req,accessToken,refreshToken, profile, done){
    try {
        let user;
        user = await UserModel.findOne({googleId:profile.id});
        if(!user){
            user = await UserModel.create({
                googleId:profile.id,
                fullname:profile.displayName,
                email:profile.emails[0].value,
                avatar:profile.photos[0].value,
                isVerified:true,
                status:"ENABLED"
            });
        }
        return done(null,user);
    } catch (error) {
        return done(error,null);
    }
});

passport.use(auth0Strategy);

export default passport;