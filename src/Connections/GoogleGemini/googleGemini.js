import {GoogleGenAI} from "@google/genai"
import DotEnv from "dotenv";

DotEnv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-mini"
});

export default ai;