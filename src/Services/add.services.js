import AddModel from "../Models/add.model.js"
import MediaModel from "../Models/media.model.js";

/** Services */
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import mongoose from "mongoose";
import { STATUS_CODES,ERROR_MESSAGES } from "../Constants/responseContants.js";
import ai from "../Connections/GoogleGemini/googleGemini.js";
import sharp from "sharp";
import axios from "axios";

class AddServices {
    constructor(){
        this.AddModel = AddModel;
        this.ai = ai;
        this.MediaModel = MediaModel;
    }

    /** Create add */ 
    CreateAdd = async (payload) => {
        const {title,description,userId,price,category,subCategory,media,coverImage,hashtags} = payload;
        const createdAdd = await this.AddModel.create({
            owner:new mongoose.Types.ObjectId(userId),
            category:category,
            subCategory:subCategory,
            title:title,
            description:description,
            coverImage:coverImage,
            hashtags:hashtags,
            price:price,
            status:"ENABLED"
        });
        /** media inserting */
        let createdMedia = null;
        if(media?.length > 0){
            // Prepare array of media documents
            const mediaDocs = media.map(url => ({
                addId: createdAdd._id,  // Reference to the Add
                mediaUrl:url,           // The media URL
                mediaType:"IMAGE",
                filename:new Date().getTime() + "add-feed-pk.jpeg" 
            }));

            // Insert all media at once
            createdMedia = await this.MediaModel.insertMany(mediaDocs);
        }
        /** share whatsapp --mock endpoint */
        const sharedToWhatsapp = await axios.post(`${process.env.SERVER_URL}/api/v1/adds/share-whatsapp`,{createdAdd},{withCredentials:true});
        /** share facebook --mock endpoint */
        const sharedToFacebook = await axios.post(`${process.env.SERVER_URL}/api/v1/adds/share-facebook`,{createdAdd},{withCredentials:true});

        /** return saved response */
        return {createdMedia,createdAdd,shared:{sharedToFacebook,sharedToWhatsapp}};
    }
    /** Delete media */
    DeleteMediaFromAdd = async (payload) => {
        const { addId, media } = payload;

        // Step 1: Find if media exists for the given addId
        const dbMedia = await this.MediaModel.find({ addId: new mongoose.Types.ObjectId(addId) });

        if (!dbMedia || dbMedia.length === 0) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.MEDIA_NOT_FOUND);
        }

        // Step 2: Delete the selected media
        const deletedMedia = await this.MediaModel.deleteMany({
            _id: { $in: media.map(_id => new mongoose.Types.ObjectId(_id)) }
        });

        return deletedMedia;
    };

    /** Get add by id */
    GetAddById = async (payload) => {};

    /* Delete add */
    DeleteAdd = async (payload) => {
        const {addId,deleteStatus="PERMANENTLY_DELETE"} = payload;
        if(deleteStatus === "PERMANENTLY_DELETE"){
            const deleteAdd = await this.AddModel.findByIdAndDelete(new mongoose.Types.ObjectId(addId));
            return deleteAdd;
        }
        return false;
    };

    /** Update add status */
    UpdateAddStatus = async (payload) => {
        const {addId,status} = payload;
        const add = await this.FindAddById({_id:addId});
        if(!add){ throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.ADD_NOT_FOUND )};
        add.status = status;
        await add.save({});
        return add;
    };

    /** Update add */
    UpdateAdd = async (payload) => {
        const {_id,title,description,coverImage,media,price,category,subCategory,hashtags,status} = payload;
        const add = await this.AddModel.findById(new mongoose.Types.ObjectId(_id));
        if(!add){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.ADD_NOT_FOUND);
        }
        if(!media || !media.isArray()){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.MEDIA_NOT_FOUND + "Array not found");
        }
        const updateAdd = await this.AddModel.findByIdAndUpdate(new mongoose.Types.ObjectId(add._id),{
            $set : {
                category:category,
                subCategory:subCategory,
                coverImage:coverImage,
                title:title,
                description:description,
                hashtags:hashtags,
                price:price,
                status:status,
            }
        });
        const updateMedia = await this.MediaModel.updateMany({
            addId:new mongoose.Types.ObjectId(updateAdd._id)
        },media);
        return {updateAdd,updateMedia};
    };

    /** Generate ai based description */
    GenerateAiBasedDescription = async (payload) => {
        const {title} = payload;
        const genrateAiBasedHashtags = await this.ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:`Write a catchy, engaging, and SEO-friendly social media description for: "${title}". Keep it under 80 words.`
        });
        const responseText = genrateAiBasedHashtags.text;
        return responseText;
    };

    /** Find add by id */
    FindAddById = async (payload) => {
        const {_id} = payload;
        const add = await this.AddModel.findById(new mongoose.Types.ObjectId(_id));
        return add;
    };

    /** Generate ai based hashtags */
    GenerateAiBasedHashtags = async (payload) => {
        const {title} = payload;
        const genrateAiBasedHashtags = await this.ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:`Generate 10 catchy, trending, and relevant hashtags for an Instagram post about "${title}". 
                Make sure the hashtags are a mix of broad and niche tags, and suitable for social media engagement. 
                Output only the hashtags separated by commas.`
        });
        const responseText = genrateAiBasedHashtags.text;
        const covertedResponseArray = responseText.split(",").map( (hashtag) => hashtag);
        return covertedResponseArray;
    };

    /** Genrate ai based images for coverImage */
    GenerateAiBasedImages = async (payload) => {
        const {title} = payload;
        const genrateAiBasedImage = await this.ai.models.generateImages({
            model:"imagen-4.0-generate-001",
            prompt:title,
            config:{
                numberOfImages:2
            }
        });
        return genrateAiBasedImage.generatedImages;
    };

    /** Share add to social services */
    ShareAddToSocialServices = async (payload) => {

    };

    /** Update coverImage */
    UpdateAddCoverImage = async (payload) => {
        const {coverImage,addId} = payload;
        const updatedCoverImage = await this.AddModel.findByIdAndUpdate(new mongoose.Types.ObjectId(addId),{
            $set : {
                coverImage : coverImage
            }
        },{new:true});
        return updatedCoverImage
    };

    /** Get latest add with asc and dsc */
    GetLatestAdds = async (payload) => {
        const {q,sort="ASC",page=1,limit=30} = payload;

        /* Pagination & sorting**/
        const sortNumber = sort === "ASC" ? 1 : -1;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skipRecords = (pageNumber - 1) * limitNumber;

        /** Search add */
        const adds = await this.AddModel.aggregate([
            {
                $lookup : {
                    from : "users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
            },
            {
                $lookup : {
                    from : "media",
                    let:{addId:"$_id"},
                    pipeline:[
                        {
                            $match : {
                                $expr : {
                                    $eq : ["$addId","$$addId"]
                                }
                            }
                        }
                    ],
                    as:"media"
                }
            },
            {
                $sort : {createdAt:sortNumber}
            },
            {
                $limit:limitNumber
            },
            {
                $skip : skipRecords
            },
            {
                $addFields : {
                    media : {
                        $first : "$media"
                    },
                    owner : {
                        $first : "$owner"
                    }
                }
            },
            {
                $project : {
                    _id:1,
                    "owner._id":1,
                    "owner.fullname":1,
                    "owner.avatar":1,
                    "owner.username":1,
                    category:1,
                    subCategory:1,
                    title:1,
                    description:1,
                    coverImage:1,
                    hashtags:1,
                    price:1,
                    media:1,
                    type:1,
                    status:1,
                    created:1,
                }
            }
        ])
        return adds[0];        
    };

    /** Get user adds */
    GetUserAdds = async (payload) => {
        const {userId,page=1,limit=30,sort="ASC"} = payload;
        /* converting to number **/
        const sortNumber = sort === "ASC" ? 1 : -1;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skipRecords = (pageNumber - 1) * limitNumber;

        /** user adds */
        const userAdds = await this.AddModel.aggregate([
            {
                $match : {
                    $expr : {
                        $eq : ["$owner",new mongoose.Types.ObjectId(userId)]
                    }
                }
            },
            {
                $sort : {createdAt:sortNumber}
            },
            {
                $limit : limitNumber
            },
            {
                $skip : skipRecords
            },
            {
                $project : {
                    _id:1,
                    owner:1,
                    category:1,
                    subCategory:1,
                    title:1,
                    description:1,
                    coverImage:1,
                    hashtags:1,
                    price:1,
                    type:1,
                    status:1,
                    created:1,
                }
            }
        ]);

        return userAdds[0];
    };

    /** Search add */
    SearchAdd = async (payload) => {
        const {q,sort="ASC",page=1,limit=30} = payload;
        /* converting to number **/
        const sortNumber = sort === "ASC" ? 1 : -1;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skipRecords = (pageNumber - 1) * limitNumber;

        /** Search add */
        const adds = await this.AddModel.aggregate([
            {
                $match : {
                    $expr : {
                        $or : [    
                            { title: { $regex: q, $options: "i" } },
                            { description: { $regex: q, $options: "i" } }
                        ]
                    }
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
            },
            {
                $lookup : {
                    from : "media",
                    let:{addId:"$_id"},
                    pipeline:[
                        {
                            $match : {
                                $expr : {
                                    $eq : ["$addId","$$addId"]
                                }
                            }
                        }
                    ],
                    as:"media"
                }
            },
            {
                $sort : {createdAt:sortNumber}
            },
            {
                $limit:limitNumber
            },
            {
                $skip : skipRecords
            },
            {
                $addFields : {
                    media : {
                        $first : "$media"
                    },
                    owner : {
                        $first : "$owner"
                    }
                }
            },
            {
                $project : {
                    _id:1,
                    "owner._id":1,
                    "owner.fullname":1,
                    "owner.avatar":1,
                    "owner.username":1,
                    category:1,
                    subCategory:1,
                    title:1,
                    description:1,
                    coverImage:1,
                    hashtags:1,
                    price:1,
                    media:1,
                    type:1,
                    status:1,
                    created:1,
                }
            }
        ])
        return adds[0];
    };
};

export default AddServices;