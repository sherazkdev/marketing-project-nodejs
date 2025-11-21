import joi from "joi";

/** Sign Up validate */
export const SIGN_UP_VALIDATE = joi.object({
    fullname:joi.string().required().min(3).max(30),
    username:joi.string().lowercase().min(3).max(30).required(),
    avatar:joi.string().required(),
    password:joi.string().min(7).required(),
    userId:joi.string().length(24).required(),
    email:joi.string().email().optional()
});

/** Sign In user validate */
export const SIGN_IN_VALIDATE = joi.object({
    inputValue:joi.string().required(),
    password:joi.string().min(3).required()
});

/** Send otp for sign up validate */
export const SEND_OTP_VALIDATE = joi.object({
    email:joi.string().email().required()
});

/** username validate checking username is unique */
export const UNIQUE_USERNAME_VALIDATE = joi.object({
    username:joi.string().lowercase().min(3).max(30).required()
});

/** verify otp validate */
export const VERIFY_OTP_VALIDATE = joi.object({
    email:joi.string().email().required(),
    otp:joi.string().required()
});

/** email validate checking email is unique */
export const UNIQUE_EMAIL_VALIDATE = joi.object({
    email:joi.string().email().required()
});

/** user update avatar validate */
export const UPDATE_USER_AVATAR_VALIDATE = joi.object({
    avatar:joi.string().required()
});

/** user update fullname validate */
export const UPDATE_USER_FULLNAME_VALIDATE = joi.object({
    fullname:joi.string().min(3).max(30).required()
});

/** user update username validate */
export const UPDATE_USER_USERNAME_VALIDATE = joi.object({
    username:joi.string().lowercase().min(3).max(30).required()
});

/** user update password validate */
export const UPDATE_USER_PASSWORD_VALIDATE = joi.object({
    password:joi.string().min(3).required()
});

/** find user validate */
export const FIND_USER_BY_ID_VALIDATE = joi.object({
    userId:joi.string().min(24).max(24).required()
});