/** Services */
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import mongoose from "mongoose";
import { STATUS_CODES,SUCCESS_MESSAGES,ERROR_MESSAGES } from "../Constants/responseContants.js";
import ai from "../Connections/GoogleGemini/googleGemini.js";
import sharp from "sharp";
import axios from "axios";
import AddServices from "../Services/add.services.js";

/** Validaters */
import { CREATE_ADD_VALIDATE, DELETE_ADD_VALIDATE, DELETE_MEDIA_FROM_ADD_VALIDATE, GENERATE_AI_BASED_DESCRIPTION_VALIDATE, GENERATE_AI_BASED_HASHTAGS_VALIDATE, GENERATE_AI_BASED_IMAGES_VALIDATE, GET_ADD_BY_ID_VALIDATE, GET_ADDS_VALIDATE, GET_USER_PROFILE_VALIDATE, SEARCH_ADD_VALIDATE, UPDATE_ADD_COVERIMAGE_VALIDATE, UPDATE_ADD_STATUS_VALIDATE, UPDATE_ADD_VALIDATE } from "../Validaters/add.validaters.js";

class AddControllers extends AddServices {

    constructor(){
        super();
    }

    /** create add  */
    HandleCreateAdd = async (req,res) => {
        const {error,value} = CREATE_ADD_VALIDATE.validate(req.body);
        if(error){
            console.log(error)
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Create add payload */
        const createAddPayload = {
            category:value?.category,
            subCategory:value?.subCategory,
            title:value?.title,
            description:value?.description,
            coverImage:value?.coverImage,
            price:value?.price,
            location:value?.location,
            hashtags:value?.hashtags,
            media:value?.media,
            userId:req.user._id
        };
        const createdAdd = await this.CreateAdd(createAddPayload);
        console.log(createAddPayload)
        return res.status(STATUS_CODES.OK).json( new ApiResponse(createdAdd,SUCCESS_MESSAGES.ADD_CREATED,true,STATUS_CODES.OK))
    };

    /** Delete Media from add */
    HandleDeleteMediaFromAdd = async (req,res) => {
        const {error,value} = DELETE_MEDIA_FROM_ADD_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** delete media add payload */
        const deleteMediaPayload = {
            addId:value?._id,
            media:value?.media
        };
        const deletedMedia = await this.DeleteMediaFromAdd(deleteMediaPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(deletedMedia,SUCCESS_MESSAGES.ADD_UPDATED,true,STATUS_CODES.OK))
    };

    /** Delete media */
    HandleDeleteAdd = async (req,res) => {
        const {error,value} = DELETE_ADD_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** delete add payload */
        const deleteAddPayload = {
            addId:value?._id,
            deleteStatus:value?.deleteStatus
        };
        const deletedAdd = await this.DeleteAdd(deleteAddPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(deletedAdd,SUCCESS_MESSAGES.ADD_DELETED,true,STATUS_CODES.OK))
    };

    /** Update add status */
    HandleUpdateAddStatus = async (req,res) => {
        const {error,value} = UPDATE_ADD_STATUS_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Update add status payload */
        const updateAddStatusPayload = {
            addId:value?._id,
            status:value?.status
        };
        const updatedAddStatus = await this.UpdateAddStatus(updateAddStatusPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updatedAddStatus,SUCCESS_MESSAGES.ADD_UPDATED,true,STATUS_CODES.OK))    
    };

    /** update add */
    HandleUpdateAdd = async (req,res) => {
        const {error,value} = UPDATE_ADD_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Update full add payload */
        const updateAddPayload = {
            _id:value?._id,
            category:value?.category,
            subCategory:value?.subCategory,
            title:value?.title,
            description:value?.description,
            coverImage:value?.coverImage,
            price:value?.price,
            hashtags:value?.hashtags,
            media:value?.media,
            location:value?.location
        };
        console.log(updateAddPayload)
        const updateAdd = await this.UpdateAdd(updateAddPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updateAdd,SUCCESS_MESSAGES.ADD_UPDATED,true,STATUS_CODES.OK))
    };

    /** find add */
    HandleFindAdd = async (req,res) => {
        const {error,value} = GET_ADD_BY_ID_VALIDATE.validate(req.query);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** find add payload */
        const findAddPayload = {
            _id:value?.id,
        };
        const findedAdd = await this.FindSingleAdd(findAddPayload);
        if(!findedAdd){ throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.ADD_NOT_FOUND) }
        return res.status(STATUS_CODES.OK).json( new ApiResponse(findedAdd,SUCCESS_MESSAGES.ADD_DELETED,true,STATUS_CODES.OK))
    };

    /** search add */ 
    HandleSearchAdd = async (req,res) => {
        const {error,value} = SEARCH_ADD_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** search add payload */
        const searchAddPayload = {
            q:value?.q || "",
            sortField:value?.sortField,
            order:value?.order,
            page:value?.page,
            limit:value?.limit,
            minPrice:value?.minPrice,
            maxPrice:value?.maxPrice
        };
        const searchedResult = await this.SearchAdd(searchAddPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(searchedResult,SUCCESS_MESSAGES.USER_FETCHED,true,STATUS_CODES.OK))
    };

    /** Genrate ai based content */
    HandleGenerateAiBasedDescription = async (req,res) => {
        const {error,value} = GENERATE_AI_BASED_DESCRIPTION_VALIDATE.validate(req.query);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Generate ai based content payload */
        const generateAiBasedContentPayload = {
            title:value?.title
        };
        const generatedAiBasedContent = await this.GenerateAiBasedDescription(generateAiBasedContentPayload);
        console.log(generateAiBasedContentPayload)
        return res.status(STATUS_CODES.OK).json( new ApiResponse(generatedAiBasedContent,SUCCESS_MESSAGES.AI_BASED_CONTENT_GENERATED,true,STATUS_CODES.OK))
    };

    /** Generate ai based hashtags */
    HandleGenerateAiBasedHashtags = async (req,res) => {
        const {error,value} = GENERATE_AI_BASED_HASHTAGS_VALIDATE.validate(req.query);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        console.log(value)
        /** Generate ai based hashtags payload */
        const generateAiBasedHashtagsPayload = {
            title:value?.title
        };
        const generatedAiBasedHashtags = await this.GenerateAiBasedHashtags(generateAiBasedContentPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(generatedAiBasedHashtags,SUCCESS_MESSAGES.AI_BASED_HASHTAGS_GENERATED,true,STATUS_CODES.OK))
    };

    /** Generate ai based images */
    HandleGenrateAiBasedImages = async (req,res) => {
        const {error,value} = GENERATE_AI_BASED_IMAGES_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Generate ai based images payload */
        const generateAiBasedImagePayload = {
            title:value?.title
        };
        const generatedAiBasedImages = await this.GenerateAiBasedImages(generateAiBasedContentPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(generatedAiBasedImages,SUCCESS_MESSAGES.AI_BASED_IMAGES_GENERATED,true,STATUS_CODES.OK))
    };

    /** handle user profile */
    HandleGetUserProfile = async (req,res) => {
        const {error,value} = GET_USER_PROFILE_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Get user payload */
        const getUserProfilePayload = {
            userId:value?._id
        };
        const userProfile = await this.GetUserAdds(getUserProfilePayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(userProfile,SUCCESS_MESSAGES.USER_FETCHED,true,STATUS_CODES.OK))
    };

    HandleGetUserAdds = async (req,res) => {
        
        /** Get user payload */
        const getUserProfilePayload = {
            userId:req?.user?._id
        };
        console.log(getUserProfilePayload)
        const userProfile = await this.GetUserAdds(getUserProfilePayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(userProfile,SUCCESS_MESSAGES.USER_FETCHED,true,STATUS_CODES.OK))
    };

    /** handle get lastest adds */
    HandleGetLatestAdds = async (req,res) => {
        const {error,value} = GET_ADDS_VALIDATE.validate(req.query);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Get latest adds payload */
        const getLatestAddsPayload = {
            page:value?.page,
            sort:value?.sort,
            limit:value?.limit
        };
        const latestAdds = await this.GetLatestAdds(getLatestAddsPayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(latestAdds,SUCCESS_MESSAGES.ADD_DELETED,true,STATUS_CODES.OK))
    };

    /** Update add coverImage */
    HandleUpdateCoverImage = async (req,res) => {
        const {error,value} = UPDATE_ADD_COVERIMAGE_VALIDATE.validate(req.body);
        if(error){
            let errors = [];
            error.details.map( (e) => errors.push(e.message));
            throw new ApiError(STATUS_CODES.NOT_FOUND,errors);
        }
        /** Update cover image add payload */
        const updateCoverImagePayload = {
            addId:value?._id,
            coverImage:value?.coverImage
        };
        const updatedAddCoverImage = await this.UpdateAddCoverImage(updateCoverImagePayload);
        return res.status(STATUS_CODES.OK).json( new ApiResponse(updatedAddCoverImage,SUCCESS_MESSAGES.ADD_UPDATED,true,STATUS_CODES.OK))
    };
}

export default new AddControllers;