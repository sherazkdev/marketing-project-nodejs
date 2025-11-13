const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const SUCCESS_MESSAGES = {
    /** User success messages */
    USER_LOGGED_IN : "Success: User logged in successfully.",
    USER_LOGOUT : "Success: User logout successfully.",
    USER_OTP_VERIFIED : "Success: User otp successfully verified.",
    USER_UPDATED : "Success: User updated successfully.",
    USER_REGISTERED : "Success: User registered successfully.",
    USER_DELETED: "Success: User deleted successfully.",

    /** Add success messages */
    ADD_UPLOADED : "Success: Add successfully uploaded.",
    ADD_UPDATED : "Success: Add updated successfully.",
    ADD_DELETED : "Success: Add deleted successfully",
};

const ERROR_MESSAGES = {
    USER_NOT_FOUND: "Errro: User not found.",
    USER_IS_NOT_VERIFIED:"Error: User email is not verified",
    USER_ALREADY_EXISTS: "Errro: User with given details already exists.",
    INVALID_CREDENTIALS: "Errro: Invalid username or password.",
    UNAUTHORIZED_ACCESS: "Errro: You are not authorized to perform this action.",
    FORBIDDEN_ACTION: "Errro: This action is forbidden.",
    ALLOWED_ADMIN: "Errro: Only group admins are allowed to perform this action.",

    /** Server Errors */
    INTERNAL_SERVER_ERROR : "Error: Internal server error.",
    // AUTH / OTP
    OTP_EXPIRED: "Errro: OTP has expired. Please request again.",
    OTP_INVALID: "Errro: Invalid OTP entered.",

    /** Media error messages */
    MEDIA_NOT_FOUND : "Error: Media not found",

    /** Add error messages */
    ADD_NOT_FOUND : "Error: Add not found",
    ADD_INVALID : "Error: Invalid ad data provided.",
}