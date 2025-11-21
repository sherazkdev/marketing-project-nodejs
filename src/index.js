import app from "./app.js";

/** MONGO CONNECTION */
import Connection from "./Connections/MongoConnection/Connection.js";


const MongooseConnection = async () => {
    try {
        await Connection();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

await MongooseConnection();

export default app;
