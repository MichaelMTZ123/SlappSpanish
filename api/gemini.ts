/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";

// This file is on the server, so process.env.API_KEY is available.
// This is the secure way to handle the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Vercel Serverless Function to proxy requests to the Gemini API.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { payload } = req.body;

    if (!payload) {
        return res.status(400).json({ error: 'Missing payload' });
    }

    // Pass the entire payload from the client to the Gemini SDK
    const response = await ai.models.generateContent(payload);

    // The client expects an object with a `text` property, 
    // which is a string (and can be a JSON string).
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error('Error in Gemini API proxy:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
