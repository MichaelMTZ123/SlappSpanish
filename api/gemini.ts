import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (!apiKey) {
        return response.status(500).json({ error: "API Key not configured on server." });
    }

    try {
        const payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
        const result = await ai.models.generateContent(payload);

        // Return the full response structure plus the extracted text
        return response.status(200).json({
            ...result,
            text: result.text
        });
    } catch (error: any) {
        console.error("Error in Gemini API Handler:", error);
        return response.status(500).json({ error: error.message || "Internal Server Error" });
    }
}