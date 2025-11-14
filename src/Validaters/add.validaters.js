import Joi from "joi";
import joi from "joi";

/** Create add validate */
export const CREATE_ADD_VALIDATE = joi.object({
    title:joi.string().min(3).required(),
    description:joi.string().required(),
    category:joi.string().required(),
    subCategory:joi.string().required(),
    price:joi.string().required().min(1),
    hashtags:joi.array(),
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
    hashtags:joi.array(),
    price:joi.string().required().min(1),
    media:joi.array().items(
        joi.object({
            mediaUrl: joi.string().required(),
            filename: joi.string().optional(),
            mediaType: joi.string().required(),
        })
    )
});

/** Generate ai based description validate */
export const GENERATE_AI_BASED_DESCRIPTION_VALIDATE = Joi.object({
    title:joi.string().min(3).required(),
});

/** Generate ai based hashtags validate */
export const GENERATE_AI_BASED_HASHTAGS_VALIDATE = Joi.object({
    title:joi.string().min(3).required(),
});

/** Generate ai based images validate */
export const GENERATE_AI_BASED_IMAGES_VALIDATE = Joi.object({
    title:joi.string().min(3).required(),
});

/** Update add coverImage */
export const UPDATE_ADD_COVERIMAGE_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),
    avatar:joi.string().required()
});


/** Delete Media from add */
export const DELETE_MEDIA_FROM_ADD_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),
    media:joi.array().required(),
});

/** Delete add validate */
export const DELETE_ADD_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),
    deleteStatus:joi.string().required()
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

/** Get add by id */
export const GET_ADD_BY_ID_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),  
})

/** Get user profileb by id */
export const GET_USER_PROFILE_VALIDATE = joi.object({
    _id:joi.string().min(24).max(24).required(),  
})