import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserModel from "../../Models/user.model.js";

import DotEnv from "dotenv";
import e from "express";
DotEnv.config();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await UserModel.findOne({ googleId: profile.id });
      console.log(profile);
      if (!user) {
        user = await UserModel.create({
          googleId: profile.id,
          fullname: profile.displayName,
          username:profile?.email?.replace("@gmail.com",""),
          email: profile.emails[0].value,
          avatar: profile.photos[0].value.replace("=s"),
          isVerified: true,
          status: "ENABLED",
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

export default passport;
