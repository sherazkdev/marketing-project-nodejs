import joi from "joi";

/** Create add validate */
export const CREATE_ADD_VALIDATE = joi.object({
    title:joi.string().min(3).required(),
    description:joi.string().required(),
    category:joi.string().required(),
    subCategory:joi.string().required(),
    price:joi.string().required().min(1),
    media:joi.array().items(
        joi.object({
            mediaUrl: joi.string().required(),
            filename: joi.string().optional(),
            mediaType: joi.string().required(),
        })
    )
});

/** UPDATE add validate */
export const UPDATE_ADD_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),
    title:joi.string().min(3).required(),
    description:joi.string().required(),
    category:joi.string().required(),
    subCategory:joi.string().required(),
    price:joi.string().required().min(1),
    media:joi.array().items(
        joi.object({
            mediaUrl: joi.string().required(),
            filename: joi.string().optional(),
            mediaType: joi.string().required(),
        })
    )
});

/** Delete add validate */
export const DELETE_ADD_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),
});

/** Update add status validate */
export const UPDATE_ADD_STATUS_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),
    status:joi.string().required(),
});

/** Get adds ASC || DSC */
export const GET_ADDS_VALIDATE = joi.object({
    page:joi.number().optional(),
    sort:joi.string().required(),
    limit:joi.number().optional(),
});

/** Search add validate */
export const SEARCH_ADD_VALIDATE = joi.object({
    q:joi.string().required().min(1),
    sort:joi.string().required(),
    page:joi.number().optional(),
    sort:joi.string().required(),
});