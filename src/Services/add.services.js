import AddModel from "../Models/add.model.js"
import MediaModel from "../Models/media.model.js";

/** Services */
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import mongoose from "mongoose";
import { STATUS_CODES,SUCCESS_MESSAGES,ERROR_MESSAGES } from "../Constants/responseContants.js";
import ai from "../Connections/GoogleGemini/googleGemini.js";
import sharp from "sharp";
import axios from "axios";
import DotEnv from "dotenv";

/** Envorments variables configration */
DotEnv.config();

class AddServices {
    constructor(){
        this.AddModel = AddModel;
        this.ai = ai;
        this.MediaModel = MediaModel;
    }

    /** Create add */ 
    CreateAdd = async (payload) => {
        const {title,description,userId,price,category,subCategory,media,coverImage,hashtags,location} = payload;

        const createdAdd = await AddModel.create({
            owner:new mongoose.Types.ObjectId(userId),
            category,
            subCategory,
            title,
            description,
            coverImage,
            hashtags,
            type:"IMAGE",
            price:Number(price),
            location,
            status:"ENABLED"
        });
        /** media inserting */
        let createdMedia = null;
        if(media?.length > 0){
            // Prepare array of media documents
            console.log(media)
            const mediaDocs = media.map(media => ({
                addId: createdAdd._id,  // Reference to the Add
                mediaUrl:media?.mediaUrl, // The media URL
                mediaType:media?.mediaType,
                filename:media?.filename, 
            }));

            // Insert all media at once
            createdMedia = await this.MediaModel.insertMany(mediaDocs);
        }

        /** Working on these controllers currenlty 
            Lable : share whatsapp --mock endpoint 
            1: const sharedToWhatsapp = await axios.post(`${process.env.SERVER_URL}/api/v1/adds/share-whatsapp`,{createdAdd},{withCredentials:true});
            Lable : share facebook --mock endpoint 
            2: const sharedToFacebook = await axios.post(`${process.env.SERVER_URL}/api/v1/adds/share-facebook`,{createdAdd},{withCredentials:true});
        */

        /** return saved response */
        return {createdMedia,createdAdd};
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
        const {_id,title,description,coverImage,media,price,category,subCategory,hashtags,status,location} = payload;
        const add = await this.AddModel.findById(new mongoose.Types.ObjectId(_id));
        if(!add){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.ADD_NOT_FOUND);
        }
        if(!Array.isArray(media)){
            throw new ApiError(STATUS_CODES.NOT_FOUND,ERROR_MESSAGES.MEDIA_NOT_FOUND + " Array not found");
        }
        add.category = category;
        add.subCategory = subCategory;
        add.coverImage = coverImage;
        add.title = title;
        add.description = description;
        add.hashtags = hashtags;
        add.price = Number(price);
        add.location = location;
        if(status){
            add.status = status;
        }
        await add.save();

        await this.MediaModel.deleteMany({
            addId:new mongoose.Types.ObjectId(add._id)
        });

        let updatedMedia = [];
        if(media.length){
            const mediaDocs = media.map(mediaItem => ({
                addId:add._id,
                mediaUrl:mediaItem.mediaUrl,
                mediaType:mediaItem.mediaType,
                filename:mediaItem.filename
            }));
            updatedMedia = await this.MediaModel.insertMany(mediaDocs);
        }

        return {updateAdd:add,updateMedia:updatedMedia};
    };

    /** Generate ai based description */
    GenerateAiBasedDescription = async (payload) => {
        const {title} = payload;
        const genrateAiBasedHashtags = await this.ai.models.generateContent({
            model:"gemini-1.5-mini",
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
            model:"gemini-1.5-mini",
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
    // ShareAddToSocialServices = async (payload) => {
    // };

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
                    location:1,
                    hashtags:1,
                    price:1,
                    media:1,
                    type:1,
                    status:1,
                    created:1,
                }
            }
        ])
        return adds;        
    };

    /** Single add and related adds */
    FindSingleAdd = async (payload) => {
        const {_id} = payload;
        console.log(payload)

        /** Aggergate piplines getting add info and related adds */
        const add = await this.AddModel.aggregate( [
            {
                $match : {
                    $expr : {
                        $eq : ["$_id",new mongoose.Types.ObjectId(_id)]
                    }
                }
            },
            {
                $lookup : {
                    from : "users",
                    let:{owner:"$owner"},
                    pipeline:[
                        {
                            $match : {
                                $expr : {
                                    $eq : ["$_id","$$owner"]
                                }
                            }
                        },
                        {
                            $lookup : {
                                from : "adds",
                                let:{owner:"$_id"},
                                pipeline:[
                                    {
                                        $match : {
                                            $expr : {
                                                $and : [
                                                    {$eq : ["$owner","$$owner"]},
                                                    {$eq : ["$status","ENABLED"]},
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as:"activeAdds"
                            }
                        }
                    ],
                    as:"owner"
                }
            },
            {
                $lookup : {
                    from : "media",
                    localField:"_id",
                    foreignField:"addId",
                    as:"media"
                }
            },
            {
                $lookup : {
                    from : "adds",
                    let:{category:"$category"},
                    pipeline:[
                        {
                            $match : {
                                $expr : {
                                    $and : [
                                        { $eq: ["$category", "$$category"] },
                                        { $ne: ["$_id", new mongoose.Types.ObjectId(_id)] }
                                    ]
                                }
                            }
                        }
                    ],
                    as:"relatedAdds"
                }
            },
            {
                $addFields: {
                    owner: { $first: "$owner" },  
                    activeAdds: { $size: "$owner.activeAdds" } 
                }                
            },
            {
                $project : {
                    _id:1,
                    "owner._id":1,
                    "owner.fullname":1,
                    "owner.email":1,
                    "owner.avatar":1,
                    "owner.createdAt":1,
                    activeAdds:1,
                    category:1,
                    subCategory:1,
                    coverImage:1,
                    location:1,
                    price:1,
                    hashtags:1,
                    relatedAdds:1,
                    title:1,
                    description:1,
                    media:1,
                    createdAt:1,
                    status:1,
                }
            }
        ] );
        return add[0];
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
                    location:1,
                    hashtags:1,
                    price:1,
                    type:1,
                    status:1,
                    created:1,
                }
            }
        ]);

        return userAdds;
    };

    /** Search add */
    SearchAdd = async (payload) => {
        const {
            q = "",
            sortField = "createdAt",
            order = "ASC",
            page = 1,
            limit = 30,
            minPrice,
            maxPrice
        } = payload;

        const sortNumber = order === "ASC" ? 1 : -1;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skipRecords = (pageNumber - 1) * limitNumber;

        const pipeline = [];

        const priceFilter = {};
        if(typeof minPrice === "number"){
            priceFilter.$gte = minPrice;
        }
        if(typeof maxPrice === "number"){
            priceFilter.$lte = maxPrice;
        }
        if(Object.keys(priceFilter).length){
            pipeline.push({
                $match : {
                    price: priceFilter
                }
            });
        }

        pipeline.push(
            {
                $lookup : {
                    from : "users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
            },
            {
                $unwind : {
                    path:"$owner",
                    preserveNullAndEmptyArrays:true
                }
            }
        );

        if(q){
            const regex = new RegExp(q, "i");
            pipeline.push({
                $match : {
                    $or : [
                        { title: { $regex: regex } },
                        { description: { $regex: regex } },
                        { "owner.username": { $regex: regex } }
                    ]
                }
            });
        }

        pipeline.push(
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
                $addFields : {
                    media : {
                        $first : "$media"
                    }
                }
            },
            {
                $sort : {
                    [sortField === "price" ? "price" : "createdAt"] : sortNumber
                }
            },
            {
                $skip : skipRecords
            },
            {
                $limit:limitNumber
            },
            {
                $project : {
                    _id:1,
                    owner:{
                        _id:"$owner._id",
                        fullname:"$owner.fullname",
                        avatar:"$owner.avatar",
                        username:"$owner.username"
                    },
                    category:1,
                    subCategory:1,
                    title:1,
                    description:1,
                    coverImage:1,
                    location:1,
                    hashtags:1,
                    price:1,
                    media:1,
                    type:1,
                    status:1,
                    createdAt:1,
                }
            }
        );

        const adds = await this.AddModel.aggregate(pipeline);
        return adds;
    };
};

export default AddServices;