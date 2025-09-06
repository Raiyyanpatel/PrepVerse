"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ArrowLeft, 
  Camera, 
  Mic, 
  Eye, 
  Monitor, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  PlayCircle,
  StopCircle,
  Activity,
  Brain,
  Volume2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ProctoredPracticePage() {
  // Proctoring states
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [proctoringStatus, setProctoringStatus] = useState({
    camera: false,
    microphone: false,
    eyeTracking: false,
    tabMonitoring: false,
    emotionDetection: false,
    voiceAnalysis: false
  });
  
  // Monitoring data
  const [violations, setViolations] = useState([]);
  const [emotionData, setEmotionData] = useState({ dominant: 'neutral', confidence: 0 });
  const [voiceMetrics, setVoiceMetrics] = useState({ 
    clarity: 0, 
    pace: 0, 
    volume: 0, 
    confidence: 0 
  });
  const [eyeTrackingData, setEyeTrackingData] = useState({ 
    gazeDirection: 'center', 
    blinkRate: 0,
    focusScore: 100 
  });
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Required API Keys and Resources
  const requiredResources = [
    {
      name: "Azure Face API",
      purpose: "Emotion Detection & Face Analysis",
      type: "API Key",
      required: true,
      setup: "Get from Azure Cognitive Services"
    },
    {
      name: "WebRTC MediaDevices",
      purpose: "Camera & Microphone Access",
      type: "Browser Permission",
      required: true,
      setup: "Automatically requested"
    },
    {
      name: "WebGazer.js",
      purpose: "Eye Tracking",
      type: "JavaScript Library",
      required: true,
      setup: "CDN: https://webgazer.cs.brown.edu/webgazer.js"
    },
    {
      name: "TensorFlow.js",
      purpose: "Real-time ML Processing",
      type: "JavaScript Library", 
      required: true,
      setup: "CDN: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"
    },
    {
      name: "Face-api.js",
      purpose: "Facial Expression Analysis",
      type: "JavaScript Library",
      required: true,
      setup: "npm install face-api.js"
    },
    {
      name: "Web Audio API",
      purpose: "Voice Analysis",
      type: "Browser API",
      required: true,
      setup: "Built into modern browsers"
    }
  ];

  // Initialize proctoring systems
  const initializeProctoring = async () => {
    setIsCalibrating(true);
    
    try {
      // 1. Camera and Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }
      
      setProctoringStatus(prev => ({ 
        ...prev, 
        camera: true, 
        microphone: true 
      }));

      // 2. Initialize Eye Tracking (WebGazer.js simulation)
      setTimeout(() => {
        setProctoringStatus(prev => ({ ...prev, eyeTracking: true }));
        startEyeTracking();
      }, 1000);

      // 3. Initialize Emotion Detection
      setTimeout(() => {
        setProctoringStatus(prev => ({ ...prev, emotionDetection: true }));
        startEmotionDetection();
      }, 1500);

      // 4. Initialize Voice Analysis
      setTimeout(() => {
        setProctoringStatus(prev => ({ ...prev, voiceAnalysis: true }));
        startVoiceAnalysis(stream);
      }, 2000);

      // 5. Initialize Tab Monitoring
      setupTabMonitoring();
      setProctoringStatus(prev => ({ ...prev, tabMonitoring: true }));

      setTimeout(() => {
        setIsCalibrating(false);
        setCalibrationComplete(true);
      }, 3000);

    } catch (error) {
      console.error('Failed to initialize proctoring:', error);
      alert('Failed to access camera/microphone. Please grant permissions and try again.');
      setIsCalibrating(false);
    }
  };

  // Eye tracking simulation
  const startEyeTracking = () => {
    const eyeTrackingInterval = setInterval(() => {
      const gazeDirections = ['center', 'left', 'right', 'up', 'down'];
      const randomGaze = gazeDirections[Math.floor(Math.random() * gazeDirections.length)];
      const blinkRate = Math.floor(Math.random() * 20) + 10;
      const focusScore = randomGaze === 'center' ? 
        Math.floor(Math.random() * 20) + 80 : 
        Math.floor(Math.random() * 40) + 30;
      
      setEyeTrackingData({
        gazeDirection: randomGaze,
        blinkRate,
        focusScore
      });

      // Detect violations
      if (focusScore < 60) {
        addViolation('Low focus detected - candidate looking away from screen');
      }
    }, 2000);

    return () => clearInterval(eyeTrackingInterval);
  };

  // Emotion detection simulation
  const startEmotionDetection = () => {
    const emotionInterval = setInterval(() => {
      const emotions = [
        { name: 'confident', confidence: 0.85 },
        { name: 'nervous', confidence: 0.72 },
        { name: 'focused', confidence: 0.90 },
        { name: 'confused', confidence: 0.65 },
        { name: 'neutral', confidence: 0.80 }
      ];
      
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setEmotionData({
        dominant: randomEmotion.name,
        confidence: randomEmotion.confidence
      });
    }, 3000);

    return () => clearInterval(emotionInterval);
  };

  // Voice analysis simulation
  const startVoiceAnalysis = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 2048;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyzeVoice = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate voice metrics (simulation)
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const clarity = Math.random() * 40 + 60; // 60-100%
        const pace = Math.random() * 50 + 50; // 50-100%
        const confidence = Math.random() * 30 + 70; // 70-100%
        
        setVoiceMetrics({
          clarity: Math.round(clarity),
          pace: Math.round(pace),
          volume: Math.round(volume * 100 / 255),
          confidence: Math.round(confidence)
        });

        if (volume < 10) {
          addViolation('Voice too low - candidate may not be speaking clearly');
        }
      };
      
      const voiceInterval = setInterval(analyzeVoice, 1000);
      audioContextRef.current = audioContext;
      
      return () => {
        clearInterval(voiceInterval);
        audioContext.close();
      };
    } catch (error) {
      console.error('Voice analysis failed:', error);
    }
  };

  // Tab monitoring
  const setupTabMonitoring = () => {
    const handleVisibilityChange = () => {
      if (document.hidden && isInterviewActive) {
        addViolation('Tab switch detected - candidate left the interview window');
      }
    };

    const handleBlur = () => {
      if (isInterviewActive) {
        addViolation('Window lost focus - candidate may be using other applications');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  };

  // Add violation
  const addViolation = (message) => {
    const violation = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'warning'
    };
    
    setViolations(prev => [...prev, violation]);
  };

  // Start interview
  const startInterview = () => {
    setIsInterviewActive(true);
    addViolation('Interview started - monitoring active');
  };

  // Stop interview
  const stopInterview = () => {
    setIsInterviewActive(false);
    
    // Cleanup
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      stopInterview();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="modern-nav rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button className="btn-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">Advanced Proctored Interview</h1>
            </div>
          </div>
        </div>

        {!calibrationComplete ? (
          <>
            {/* Setup Requirements */}
            <div className="modern-card p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Required Setup & API Resources
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {requiredResources.map((resource, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="font-semibold text-white mb-2">{resource.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{resource.purpose}</p>
                    <p className="text-xs text-blue-300">
                      <strong>Type:</strong> {resource.type}
                    </p>
                    <p className="text-xs text-green-300">
                      <strong>Setup:</strong> {resource.setup}
                    </p>
                  </div>
                ))}
              </div>

              <Alert className="mb-6 bg-orange-500/20 border-orange-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <strong>Important:</strong> For production use, you'll need to set up actual API keys for Azure Face API, 
                  install the required JavaScript libraries (WebGazer.js, TensorFlow.js, Face-api.js), 
                  and configure proper backend endpoints for data processing.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Button 
                  onClick={initializeProctoring}
                  disabled={isCalibrating}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-none hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {isCalibrating ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Calibrating Systems...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Initialize Proctoring System
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isCalibrating && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">System Calibration</h3>
                <div className="space-y-3">
                  {Object.entries(proctoringStatus).map(([key, status]) => (
                    <div key={key} className="flex items-center gap-3">
                      {status ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-400 rounded-full animate-spin border-t-blue-500"></div>
                      )}
                      <span className="text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()} 
                        {status ? ' - Ready' : ' - Initializing...'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interview Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Interview Environment</h2>
                  <div className="flex gap-2">
                    {!isInterviewActive ? (
                      <Button 
                        onClick={startInterview}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Interview
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopInterview}
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Stop Interview
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Video Feed */}
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    className="w-full h-64 object-cover"
                  />
                  <canvas 
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                  
                  {/* Status Overlays */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {Object.entries(proctoringStatus).map(([key, status]) => (
                      <div 
                        key={key}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Interview Question */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Sample Interview Question:</h3>
                  <p className="text-gray-300">
                    "Tell me about a challenging project you worked on and how you overcame the obstacles."
                  </p>
                </div>
              </div>
            </div>

            {/* Monitoring Dashboard */}
            <div className="space-y-6">
              {/* Real-time Metrics */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Analysis
                </h3>
                
                {/* Emotion Detection */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Emotion</span>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-sm text-white capitalize">
                      {emotionData.dominant} ({Math.round(emotionData.confidence * 100)}%)
                    </div>
                  </div>
                </div>

                {/* Eye Tracking */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Eye Tracking</span>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-xs text-gray-300">
                    <div>Gaze: {eyeTrackingData.gazeDirection}</div>
                    <div>Focus Score: {eyeTrackingData.focusScore}%</div>
                    <div>Blink Rate: {eyeTrackingData.blinkRate}/min</div>
                  </div>
                </div>

                {/* Voice Analysis */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Voice Analysis</span>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-xs text-gray-300">
                    <div>Clarity: {voiceMetrics.clarity}%</div>
                    <div>Pace: {voiceMetrics.pace}%</div>
                    <div>Volume: {voiceMetrics.volume}%</div>
                    <div>Confidence: {voiceMetrics.confidence}%</div>
                  </div>
                </div>
              </div>

              {/* Violations Log */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Monitoring Log
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {violations.length === 0 ? (
                    <p className="text-gray-400 text-sm">No violations detected</p>
                  ) : (
                    violations.slice(-10).reverse().map((violation) => (
                      <div 
                        key={violation.id}
                        className="bg-orange-500/20 border border-orange-500/50 rounded p-2"
                      >
                        <div className="text-xs text-orange-300 mb-1">
                          {violation.timestamp}
                        </div>
                        <div className="text-sm text-white">
                          {violation.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProctoredPracticePage;
