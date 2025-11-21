import app from "./app.js";

/** MONGO CONNECTION */
import Connection from "./Connections/MongoConnection/Connection.js";

Connection().then( () => {
    // app.listen(process.env.PORT,() => console.log(`\n Project at running http://localhost:${process.env.PORT}`));
}).catch( (connectionError) => new Error(connectionError));
