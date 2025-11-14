import ai from "./src/Connections/GoogleGemini/googleGemini.js";

async function GenerateImages(payload) {
    
        const {title = "healthy breakfast recipes"} = payload;
        const genrateAiBasedHashtags = await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:`Generate 10 catchy, trending, and relevant hashtags for an Instagram post about "${title}". 
                Make sure the hashtags are a mix of broad and niche tags, and suitable for social media engagement. 
                Output only the hashtags separated by commas.`
        });
        
}

GenerateImages({});