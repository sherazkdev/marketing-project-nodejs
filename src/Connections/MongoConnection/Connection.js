import mongoose from "mongoose";
import {DB_NAME} from "../../Constants/constants.js";
import DotEnv from "dotenv";

DotEnv.config();

const connectDB = async () => {
    try {
        console.log(DB_NAME);
        const connectDB = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectDB.connection.host}`);
    } catch (error) {
        console.log("Db Not connected",error)
        throw error;
    }
}

export default connectDB;


/** import mongoose from "mongoose";

import {DB_NAME} from "../../Constants/constants.js";

class Connection {
    constructor(){
        this.connection = null;
        this.isConnected = false;
        this.mongoose = mongoose;
    }
    
    Connect = async () => {
        try {
            const connectionInstance = await this.mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
            this.connection = connectionInstance;
            this.isConnected = true;
            console.log(`\n MongoDB connected at ${connectionInstance.connection.host}`);
            return true;
        } catch (e) {
            throw new Error(e);
        }   
    }

    Disconnect = async () => {
        try {
            if(this.isConnected){
                await this.connection.disconnect();
                this.isConnected = false;
            }
        } catch (e) {
            throw new Error(e)
        }
    }
}

export default new Connection; **/
