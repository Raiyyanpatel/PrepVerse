import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Using Google Cloud Speech-to-Text REST API
    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${process.env.NEXT_PUBLIC_GOOGLE_STT_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_long'
        },
        audio: {
          content: base64Audio
        }
      })
    });

    if (!response.ok) {
      throw new Error(`STT API error: ${response.status}`);
    }

    const data = await response.json();
    
    const transcript = data.results && data.results.length > 0 
      ? data.results[0].alternatives[0].transcript 
      : '';

    return NextResponse.json({ 
      transcript,
      confidence: data.results?.[0]?.alternatives?.[0]?.confidence || 0,
      success: true 
    });

  } catch (error) {
    console.error('STT Error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe speech',
      details: error.message 
    }, { status: 500 });
  }
}
