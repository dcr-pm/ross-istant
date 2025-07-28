import { GoogleGenAI } from "@google/genai";

// This key is exported to be checked in the main App component.
export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

const ai = GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" 
    ? new GoogleGenAI({apiKey: GEMINI_API_KEY}) 
    : null;

/**
 * Generates a response from the Gemini model and streams it back.
 * @param prompt The user's question or prompt.
 * @param isSearchEnabled Whether to enable Google Search for grounding.
 * @param onChunk A callback function to handle incoming text chunks.
 * @returns An object containing the full text response and citation metadata.
 */
export const generateStreamingResponse = async (
  prompt: string,
  isSearchEnabled: boolean,
  onChunk: (chunk: string) => void
): Promise<{ fullText: string, citations: any[] }> => {
  if (!ai) {
    throw new Error("Gemini API key is not configured. Please replace the placeholder in services/geminiService.ts");
  }

  try {
    const baseSystemInstruction = "You are Ross-istant, a helpful AI assistant. Unless the user specifies a different length, keep your answers concise and to a maximum of 200 words. After providing the answer, always end your response with a brief, natural-sounding follow-up question, like 'Would you like to explore this further?' or 'Is there anything else I can help with?'.";
    const searchSystemInstruction = "When a user asks about current events, news, or prices, prioritize using the search tool to find the most recent, up-to-date information. Always cite your sources accurately.";

    const config: { tools?: any[]; systemInstruction?: string } = {
        systemInstruction: baseSystemInstruction
    };

    if (isSearchEnabled) {
      config.tools = [{ googleSearch: {} }];
      config.systemInstruction = `${baseSystemInstruction} ${searchSystemInstruction}`;
    }

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config,
    });

    let fullResponse = '';
    const allCitations: any[] = [];
    for await (const chunk of response) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullResponse += chunkText;
        onChunk(chunkText);
      }
      
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        allCitations.push(...groundingMetadata.groundingChunks);
      }
    }
    
    if (!fullResponse) {
      throw new Error('Received an empty response from Gemini.');
    }
    return { fullText: fullResponse, citations: allCitations };

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
         throw new Error(`Failed to get response from Gemini: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while contacting the Gemini API.');
  }
};

/**
 * Rewrites text into a natural, conversational script for audio playback by cleaning it.
 * This is a fast, client-side operation.
 * @param text The original text from the Gemini response.
 * @returns A clean, conversational script ready for text-to-speech.
 */
export const generateConversationalAudioScript = (text: string): string => {
  // Remove markdown, multiple newlines/spaces, and trim.
  // This is a more robust regex than before.
  return text
    .replace(/\[\d+\]/g, '') // Remove citation numbers like [1], [2]
    .replace(/[*_#`~]/g, '') // Remove markdown characters: *, _, #, `, ~
    .replace(/(\r\n|\n|\r)/gm, " ") // Replace newlines with spaces
    .replace(/\s\s+/g, ' ') // Collapse multiple spaces into one
    .trim();
};