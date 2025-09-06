"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  Eye, 
  Monitor, 
  Brain, 
  Volume2,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProctoringMonitor = ({ isActive, onViolation }) => {
  const [proctoringData, setProctoringData] = useState({
    emotion: { dominant: 'neutral', confidence: 0 },
    eyeTracking: { gazeDirection: 'center', focusScore: 100, blinkRate: 15 },
    voice: { clarity: 85, pace: 75, volume: 70, confidence: 80 },
    violations: []
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      initializeMonitoring();
    } else {
      cleanupMonitoring();
    }

    return () => cleanupMonitoring();
  }, [isActive]);

  const initializeMonitoring = async () => {
    try {
      // Initialize camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }

      // Start monitoring systems
      startEmotionDetection();
      startEyeTracking();
      startVoiceAnalysis(stream);
      setupTabMonitoring();
      
    } catch (error) {
      console.error('Failed to initialize proctoring:', error);
      onViolation?.('Failed to access camera/microphone for proctoring');
    }
  };

  const cleanupMonitoring = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startEmotionDetection = () => {
    const emotionInterval = setInterval(() => {
      const emotions = [
        { name: 'confident', confidence: 0.85 },
        { name: 'nervous', confidence: 0.72 },
        { name: 'focused', confidence: 0.90 },
        { name: 'confused', confidence: 0.65 },
        { name: 'stressed', confidence: 0.75 }
      ];
      
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setProctoringData(prev => ({
        ...prev,
        emotion: randomEmotion
      }));

      if (randomEmotion.name === 'stressed' && randomEmotion.confidence > 0.7) {
        onViolation?.('High stress level detected - candidate may need assistance');
      }
    }, 3000);

    return () => clearInterval(emotionInterval);
  };

  const startEyeTracking = () => {
    const eyeInterval = setInterval(() => {
      const directions = ['center', 'left', 'right', 'up', 'down'];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const focusScore = direction === 'center' ? 
        Math.floor(Math.random() * 20) + 80 : 
        Math.floor(Math.random() * 40) + 30;
      
      setProctoringData(prev => ({
        ...prev,
        eyeTracking: {
          gazeDirection: direction,
          focusScore,
          blinkRate: Math.floor(Math.random() * 10) + 10
        }
      }));

      if (focusScore < 50) {
        onViolation?.('Attention diverted - candidate looking away from interview');
      }
    }, 2000);

    return () => clearInterval(eyeInterval);
  };

  const startVoiceAnalysis = (stream) => {
    const voiceInterval = setInterval(() => {
      const metrics = {
        clarity: Math.floor(Math.random() * 30) + 70,
        pace: Math.floor(Math.random() * 40) + 60,
        volume: Math.floor(Math.random() * 50) + 50,
        confidence: Math.floor(Math.random() * 25) + 75
      };
      
      setProctoringData(prev => ({
        ...prev,
        voice: metrics
      }));

      if (metrics.volume < 30) {
        onViolation?.('Voice too quiet - candidate may not be speaking clearly');
      }
    }, 1500);

    return () => clearInterval(voiceInterval);
  };

  const setupTabMonitoring = () => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        onViolation?.('Tab switch detected - candidate left interview window');
      }
    };

    const handleBlur = () => {
      if (isActive) {
        onViolation?.('Window focus lost - potential external application usage');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Proctoring Monitor
      </h3>

      {/* Video Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          className="w-full h-32 object-cover"
        />
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Status indicator */}
        <div className="absolute top-2 left-2">
          <div className={`px-2 py-1 rounded text-xs font-semibold ${
            isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {isActive ? 'MONITORING' : 'INACTIVE'}
          </div>
        </div>
      </div>

      {/* Real-time Analysis */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Emotion */}
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Brain className="h-3 w-3 text-purple-400" />
            <span className="text-xs text-white">Emotion</span>
          </div>
          <div className="text-xs text-white capitalize">
            {proctoringData.emotion.dominant} ({Math.round(proctoringData.emotion.confidence * 100)}%)
          </div>
        </div>

        {/* Focus */}
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Eye className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-white">Focus</span>
          </div>
          <div className="text-xs text-white">
            {proctoringData.eyeTracking.focusScore}% ({proctoringData.eyeTracking.gazeDirection})
          </div>
        </div>

        {/* Voice Quality */}
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Volume2 className="h-3 w-3 text-green-400" />
            <span className="text-xs text-white">Voice</span>
          </div>
          <div className="text-xs text-white">
            Clarity: {proctoringData.voice.clarity}%
          </div>
        </div>

        {/* Confidence */}
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Activity className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-white">Confidence</span>
          </div>
          <div className="text-xs text-white">
            {proctoringData.voice.confidence}%
          </div>
        </div>
      </div>

      {/* Alert for violations */}
      {proctoringData.violations.length > 0 && (
        <Alert className="bg-orange-500/20 border-orange-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-white text-xs">
            {proctoringData.violations[proctoringData.violations.length - 1]}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProctoringMonitor;
