import app from "./app";

/** MONGO CONNECTION */
import Connection from "./Connections/MongoConnection/Connection";

Connection.Connect().then( () => {
    app.listen(process.env.PORT,() => console.log(`\n Project at running http://localhost:${process.env.PORT}`));
}).catch( (connectionError) => new Error(connectionError));
