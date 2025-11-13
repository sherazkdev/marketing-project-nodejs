import mongoose from "mongoose";

class Connection {
    constructor(){
        this.connection = null;
        this.isConnected = false;
        this.mongoose = mongoose;
    }
    
    Connect = async () => {
        try {
            const connectionInstance = await this.mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
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

export default new Connection;