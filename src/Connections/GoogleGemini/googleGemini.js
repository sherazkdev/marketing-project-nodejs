import {GoogleGenAI} from "@google/genai"
import DotEnv from "dotenv";

DotEnv.config();

const ai = new GoogleGenAI({});

export default ai;