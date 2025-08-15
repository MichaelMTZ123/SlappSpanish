/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Calls the server-side proxy to interact with the Gemini API.
 * @param payload The same payload object you would send to ai.models.generateContent()
 * @returns A promise that resolves to an object with a `text` property, e.g., { text: "..." }
 */
export async function generateContent(payload: any) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to call Gemini proxy and parse error' }));
    throw new Error(errorData.error || 'An unknown error occurred');
  }

  return response.json();
}
