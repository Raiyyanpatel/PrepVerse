import { NextResponse } from 'next/server';

// Prefer environment variable for the API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY 

// Parse audio mime type like "audio/L16;codec=pcm;rate=24000"
function parseAudioMimeType(mimeType) {
  let bitsPerSample = 16;
  let sampleRate = 24000;
  let numChannels = 1;

  if (!mimeType) return { bitsPerSample, sampleRate, numChannels };
  const [main, ...params] = mimeType.split(';');
  const match = /audio\/L(\d+)/i.exec(main.trim());
  if (match) {
    const v = parseInt(match[1], 10);
    if (!Number.isNaN(v)) bitsPerSample = v;
  }
  for (const p of params) {
    const [k, v] = p.split('=');
    if (!k) continue;
    const key = k.trim().toLowerCase();
    if (key === 'rate') {
      const r = parseInt((v || '').trim(), 10);
      if (!Number.isNaN(r)) sampleRate = r;
    } else if (key === 'channels') {
      const c = parseInt((v || '').trim(), 10);
      if (!Number.isNaN(c)) numChannels = c;
    }
  }
  return { bitsPerSample, sampleRate, numChannels };
}

// Build a WAV buffer from raw PCM (L16) mono/stereo
function pcmToWavBuffer(pcmBuffer, sampleRate, bitsPerSample = 16, numChannels = 1) {
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const subchunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subchunk2Size;

  const header = Buffer.alloc(44);
  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  // fmt subchunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20);  // AudioFormat PCM = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  // data subchunk
  header.write('data', 36);
  header.writeUInt32LE(subchunk2Size, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(request) {
  try {
    console.log('🎤 Gemini TTS API endpoint called');
    
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    console.log('📝 Text to convert:', text.substring(0, 50) + '...');
    
    // Use the correct Gemini 2.5 Flash TTS model and endpoint
    try {
      console.log('🔗 Calling Gemini 2.5 Flash TTS API...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: text
            }]
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
        })
      });

      console.log('📡 Gemini TTS API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Gemini TTS API Response received');
        
        // Check for audio data in the response
        if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          console.log('🎵 Found audio data in Gemini response!');

          const inline = data.candidates[0].content.parts[0].inlineData;
          const base64Data = inline.data; // Base64-encoded bytes
          const mimeType = inline.mimeType;

          console.log('📄 Audio MIME type:', mimeType);
          console.log('📊 Audio data (base64) length:', base64Data.length);

          // Decode base64 to raw bytes
          const rawBuffer = Buffer.from(base64Data, 'base64');

          let outBuffer = rawBuffer;
          let outMime = mimeType || 'audio/wav';

          // If inline data is raw PCM (e.g., audio/L16), convert to WAV for browser playback
          if (mimeType && /audio\/L\d+/i.test(mimeType)) {
            const { bitsPerSample, sampleRate, numChannels } = parseAudioMimeType(mimeType);
            console.log('🔧 Converting PCM to WAV:', { bitsPerSample, sampleRate, numChannels });
            outBuffer = pcmToWavBuffer(rawBuffer, sampleRate, bitsPerSample, numChannels);
            outMime = 'audio/wav';
          }

          const outBase64 = outBuffer.toString('base64');

          return NextResponse.json({
            success: true,
            audioData: outBase64,
            mimeType: outMime,
            source: 'Gemini 2.5 Flash TTS',
            useBrowserTTS: false
          });
        } else {
          console.log('⚠️ No audio data found in response:', JSON.stringify(data, null, 2));
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Gemini TTS API Error:', response.status, errorData);
        return NextResponse.json(
          { error: 'Gemini TTS API error', details: errorData },
          { status: response.status }
        );
      }
      
    } catch (geminiError) {
      console.error('❌ Gemini TTS Error:', geminiError);
      return NextResponse.json(
        { error: 'Gemini TTS call failed', details: String(geminiError) },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('❌ TTS API Error:', error);
    return NextResponse.json(
      { 
        error: 'TTS generation failed',
        details: error.message
      }, 
      { status: 500 }
    );
  }
}