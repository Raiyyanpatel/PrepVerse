import { useState, useRef, useCallback, useEffect } from 'react';

export const useConversationalInterview = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  // Ensure Puter.js is available on the client
  const ensurePuterLoaded = useCallback(async () => {
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
  }, []);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        console.log('Microphone permission granted');
      } catch (err) {
        setPermissionGranted(false);
        setError('Microphone permission denied: ' + err.message);
        console.error('Permission error:', err);
      }
    };
    
    checkPermissions();
  }, []);

  // Start recording audio
  const startRecording = useCallback(async () => {
    // Prevent multiple concurrent recording starts
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Recording already in progress, ignoring start request');
      return;
    }

    try {
      setError(null);
      console.log('Starting recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      });
      
      console.log('Got media stream:', stream);
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Check supported MIME types and use fallback
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      );
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started');
        setIsRecording(true);
      };
      
      // Don't set onstop here - only when explicitly stopping
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording error: ' + event.error);
        setIsRecording(false);
      };
      
      console.log('About to call mediaRecorder.start()...');
      mediaRecorder.start(1000); // Collect data every 1 second instead of 100ms
      console.log('MediaRecorder.start() called, state:', mediaRecorder.state);
      
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
      console.error('Recording error:', err);
      setIsRecording(false);
    }
  }, []);

  // Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    console.log('stopRecording called, isRecording:', isRecording);
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('Stopping MediaRecorder...');
        
        // Set the onstop handler before stopping
        mediaRecorderRef.current.onstop = async () => {
          console.log('MediaRecorder stopped, processing...');
          setIsRecording(false);
          setIsProcessing(true);
          
          try {
            const audioBlob = new Blob(audioChunksRef.current, { 
              type: 'audio/webm' 
            });
            
            console.log('Audio blob size:', audioBlob.size);
            
            if (audioBlob.size === 0) {
              console.log('No audio data recorded');
              resolve('');
              return;
            }
            
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            
            console.log('Sending to STT API...');
            const response = await fetch('/api/stt', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            console.log('STT Response:', data);
            
            if (data.success) {
              setCurrentTranscript(data.transcript);
              resolve(data.transcript);
            } else {
              throw new Error(data.error || 'Transcription failed');
            }
          } catch (err) {
            setError('Failed to transcribe: ' + err.message);
            console.error('Transcription error:', err);
            resolve('');
          } finally {
            setIsProcessing(false);
            // Clean up stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          }
        };
        
        mediaRecorderRef.current.stop();
      } else {
        console.log('No active recording to stop');
        resolve('');
      }
    });
  }, [isRecording]);

  // Text to speech using Puter.js only (voice: Amy, engine: neural, language: en-GB)
  const speakText = useCallback(async (text) => {
    try {
      setError(null);
      const ok = await ensurePuterLoaded();
      if (!ok) throw new Error('Puter.js not available');

      // Stop any prior audio
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
      }

      const audio = await window.puter.ai.txt2speech((text || '').trim(), {
        voice: 'Amy',
        engine: 'neural',
        language: 'en-GB'
      });

      audioRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
      };
      audio.onerror = (e) => {
        console.error('Puter TTS audio error:', e);
        setIsSpeaking(false);
        setError('Audio playback failed');
      };

      await audio.play();
    } catch (err) {
      console.error('TTS (Puter) failed:', err);
      setIsSpeaking(false);
      setError('TTS unavailable');
    }
  }, [ensurePuterLoaded]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsSpeaking(false);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsRecording(false);
    setIsProcessing(false);
    setIsSpeaking(false);
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    currentTranscript,
    error,
    permissionGranted,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    cleanup
  };
};
