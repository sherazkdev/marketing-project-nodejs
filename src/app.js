import express from "express";
import cookieParser from "cookie-parser";
import DotEnv from "dotenv";
import cors from "cors";
import passport from "passport";
import GoogleAuth from "./Connections/googleAuth/google.js";


/** Passport */
import "./Connections/googleAuth/google.js";

/** Envorment variables configration */
DotEnv.config({
    path : ".env"
});

/** App */
const app = express();

// Error Handler
import ErroHandler from "./Middlewares/errorHandler.middleware.js";
import UserRouter from "./Routes/user.routes.js";
import AddRouter from "./Routes/add.routes.js";

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(express.json());

/** Routes */
app.use("/api/v1/users",UserRouter);
app.use("/api/v1/adds",AddRouter)
app.use(ErroHandler);


export default app;
