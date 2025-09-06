"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, Loader2 } from 'lucide-react';

const AudioTestComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [audioSupported, setAudioSupported] = useState(true);

  // Ensure Puter.js exists
  const ensurePuterLoaded = async () => {
    if (typeof window === 'undefined') return false;
    if (window.puter?.ai?.txt2speech) return true;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://js.puter.com/v2/';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(s);
    });
    return !!window.puter?.ai?.txt2speech;
  };

  // Test TTS using Puter.js
  const testTTS = async () => {
    try {
      setError('');
      const ok = await ensurePuterLoaded();
      if (!ok) throw new Error('Puter.js not available');

      const audio = await window.puter.ai.txt2speech('Hello! This is a test of the text to speech functionality.', {
        voice: 'Amy',
        engine: 'neural',
        language: 'en-GB'
      });
      await audio.play();
    } catch (err) {
      setError('TTS Error: ' + err.message);
    }
  };

  // Test STT
  const testSTT = async () => {
    if (!navigator.mediaDevices) {
      setError('Media devices not supported');
      setAudioSupported(false);
      return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessing(false);
      return;
    }

    try {
      setError('');
      setIsRecording(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData
          });

          const data = await response.json();
          
          if (data.success) {
            setTranscript(data.transcript);
          } else {
            setError('STT Error: ' + data.error);
          }
        } catch (err) {
          setError('STT Error: ' + err.message);
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      
      // Auto stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);

    } catch (err) {
      setError('STT Error: ' + err.message);
      setIsRecording(false);
      setAudioSupported(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-lg text-white max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Audio API Test</h3>
      
      {error && (
        <div className="bg-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <Button 
          onClick={testTTS}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Test Text-to-Speech
        </Button>
        
        <Button 
          onClick={testSTT}
          disabled={!audioSupported}
          className={`w-full ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mic className="w-4 h-4 mr-2" />
          )}
          {isRecording ? 'Stop Recording (5s max)' : 'Test Speech-to-Text'}
        </Button>
        
        {transcript && (
          <div className="bg-slate-700 p-3 rounded">
            <strong>Transcript:</strong> {transcript}
          </div>
        )}
        
        {!audioSupported && (
          <div className="bg-yellow-600 p-3 rounded text-sm">
            Audio recording not supported in this browser
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTestComponent;
