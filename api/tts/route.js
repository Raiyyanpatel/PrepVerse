import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Since Google Cloud TTS API is blocked, signal client to use browser TTS
    return NextResponse.json({ 
      useBrowserTTS: true,
      text: text,
      success: true 
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech',
      details: error.message 
    }, { status: 500 });
  }
}
