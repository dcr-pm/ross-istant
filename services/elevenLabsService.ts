// This key is exported to be checked in the main App component.
export const ELEVENLABS_API_KEY = "YOUR_ELEVENLABS_API_KEY_HERE";
const VOICE_ID = 'SPDuaMFktwxyPzWKIvoL';

const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

/**
 * Generates audio from text using the ElevenLabs API.
 * @param text The text to convert to speech.
 * @returns A local URL for the generated audio blob.
 */
export const generateAudio = async (text: string): Promise<string> => {
  if (ELEVENLABS_API_KEY === "YOUR_ELEVENLABS_API_KEY_HERE") {
    throw new Error("ElevenLabs API key is not configured. Please replace the placeholder in services/elevenLabsService.ts");
  }

  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': ELEVENLABS_API_KEY,
  };

  const body = JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2', // A high-quality multilingual model
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.1,
      use_speaker_boost: true,
    },
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ElevenLabs API Error:", errorData);
      if (response.status === 401) {
        throw new Error('The provided ElevenLabs API Key is invalid or missing.');
      }
      throw new Error(`ElevenLabs request failed: ${errorData.detail?.message || response.statusText}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);

  } catch (error) {
    console.error("ElevenLabs audio generation failed:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Failed to generate audio. Please check your API key and network connection.');
  }
};