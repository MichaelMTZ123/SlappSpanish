import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export default async function handler(request: any, response: any) {
    if (!apiKey) {
        return response.status(500).json({ error: "API Key not configured on server." });
    }

    try {
        // The request body should contain the payload for generateContent
        // e.g. { model: '...', contents: '...' }
        const payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

        // The prompt rules require using ai.models.generateContent
        // We extract model and other params from the payload
        const result = await ai.models.generateContent(payload);

        // We verify if the response has the text accessor/property, but we need to send 
        // a plain JSON object back to the client. The SDK response object usually 
        // has a `text` getter. We need to serialize the meaningful data.
        // The SDK's `response.text` is a getter that extracts from candidates.
        
        const responseText = result.text;

        // Return the full response structure plus the extracted text to make it easy for the client
        return response.status(200).json({
            ...result,
            text: responseText
        });
    } catch (error: any) {
        console.error("Error in Gemini API Handler:", error);
        return response.status(500).json({ error: error.message || "Internal Server Error" });
    }
}