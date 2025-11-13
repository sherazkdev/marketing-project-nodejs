import express from "express";
import cookieParser from "cookie-parser";
import DotEnv from "dotenv";
import cors from "cors";

/** Envorment variables configration */
DotEnv.config({
    path : "../.env"
});

/** App */
const app = express();

// Error Handler
import ErroHandler from "./Middlewares/errorHandler.middleware.js";import e from "express";
import UserRouter from "./Routes/user.routes.js";
import AddRouter from "./Routes/add.routes.js";

// Middlewares
app.use(cors({
    allowedHeaders:true,
    credentials:true,
    methods:["POST","GET","DELETE","PUT","PATH"],
    origin:process.env.CORS_ORIGIN,
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(express.json());

/** Routes */
app.use("/api/v1/users",UserRouter);
app.use("/api/v1/adds",AddRouter)
app.use(ErroHandler);


export default app;
