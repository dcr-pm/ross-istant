
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from './ttsService';

// The singleton instance of the AI client. It starts as null.
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This prevents the SDK from being initialized at module load time, which can cause
 * fatal errors in some browser/CDN environments, leading to a blank screen.
 * @returns {GoogleGenAI} The initialized AI client.
 * @throws {Error} If the API key is not configured.
 */
const getAiClient = (): GoogleGenAI => {
  // If the client has already been initialized, return the existing instance.
  if (ai) {
    return ai;
  }
  
  // Check for a valid API key before attempting to initialize.
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PLACEHOLDER')) {
    throw new Error("Gemini API key is not configured in your deployment environment.");
  }
  
  // Initialize the client, store it in the module-scoped variable, and return it.
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return ai;
};

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
  try {
    // Get the lazily-initialized client. This will throw an error if the key is missing.
    const aiClient = getAiClient(); 

    const baseSystemInstruction = "You are Ross-istant, a helpful AI assistant. Unless the user specifies a different length, keep your answers concise and to a maximum of 200 words. After providing the answer, always end your response with a brief, natural-sounding follow-up question, like 'Would you like to explore this further?' or 'Is there anything else I can help with?'.";
    const searchSystemInstruction = "When a user asks about current events, news, or prices, prioritize using the search tool to find the most recent, up-to-date information. Always cite your sources accurately.";

    const config: { tools?: any[]; systemInstruction?: string } = {
        systemInstruction: baseSystemInstruction
    };

    if (isSearchEnabled) {
      config.tools = [{ googleSearch: {} }];
      config.systemInstruction = `${baseSystemInstruction} ${searchSystemInstruction}`;
    }

    const response = await aiClient.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
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
