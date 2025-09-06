import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiTTSService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async convertTextToSpeech(text) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-tts"
      });

      const result = await model.generateContentStream({
        contents: [{
          role: "user",
          parts: [{ text: text }]
        }],
        generationConfig: {
          temperature: 1,
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Zephyr"
              }
            }
          }
        }
      });

      const audioChunks = [];
      for await (const chunk of result.stream) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          const audioData = chunk.candidates[0].content.parts[0].inlineData.data;
          const mimeType = chunk.candidates[0].content.parts[0].inlineData.mimeType;
          
          // Convert base64 to binary
          const binaryData = atob(audioData);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          // Convert to WAV if needed
          const wavData = this.convertToWav(bytes, mimeType);
          audioChunks.push(wavData);
        }
      }

      if (audioChunks.length > 0) {
        // Combine all audio chunks
        const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of audioChunks) {
          combinedAudio.set(chunk, offset);
          offset += chunk.length;
        }

        // Create blob and return URL
        const blob = new Blob([combinedAudio], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
      }

      throw new Error('No audio data received');
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  convertToWav(audioData, mimeType) {
    // Parse audio parameters
    const parameters = this.parseAudioMimeType(mimeType);
    const bitsPerSample = parameters.bits_per_sample;
    const sampleRate = parameters.rate;
    const numChannels = 1;
    const dataSize = audioData.length;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const chunkSize = 36 + dataSize;

    // Create WAV header
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, chunkSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // subchunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data subchunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    // Combine header and audio data
    const wavFile = new Uint8Array(header.byteLength + audioData.length);
    wavFile.set(new Uint8Array(header), 0);
    wavFile.set(audioData, header.byteLength);

    return wavFile;
  }

  parseAudioMimeType(mimeType) {
    let bitsPerSample = 16;
    let rate = 24000;

    // Extract rate from parameters
    const parts = mimeType.split(";");
    for (const param of parts) {
      const trimmed = param.trim();
      if (trimmed.toLowerCase().startsWith("rate=")) {
        try {
          const rateStr = trimmed.split("=", 2)[1];
          rate = parseInt(rateStr);
        } catch (error) {
          // Keep default rate
        }
      } else if (trimmed.startsWith("audio/L")) {
        try {
          bitsPerSample = parseInt(trimmed.split("L", 2)[1]);
        } catch (error) {
          // Keep default bits per sample
        }
      }
    }

    return { bits_per_sample: bitsPerSample, rate };
  }

  // Fallback TTS using browser API
  async fallbackTTS(text) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    });
  }
}

export default GeminiTTSService;
