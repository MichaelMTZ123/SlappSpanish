/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Interacts with the Gemini API via the secure server-side proxy.
 * @param payload The same payload object you would send to ai.models.generateContent()
 * @returns A promise that resolves to an object with a `text` property.
 */
export async function generateContent(payload: any) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get response from AI service.");
    }
}