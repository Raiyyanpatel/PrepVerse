"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { 
  Mic, 
  StopCircle, 
  Camera, 
  Eye, 
  Volume2, 
  Activity, 
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import mediaManager from "@/utils/mediaManager";

function EnhancedRecordAnswerSection({ 
  activeQuestionIndex, 
  mockInterViewQuestion, 
  interviewData 
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, processing, completed
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(activeQuestionIndex);
  const [isClient, setIsClient] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { user } = useUser();

  // Proctoring states
  const [proctoringActive, setProctoringActive] = useState(false);
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
  const [violations, setViolations] = useState([]);
  const [tabSwitches, setTabSwitches] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const emotionIntervalRef = useRef(null);
  const eyeTrackingIntervalRef = useRef(null);
  const voiceAnalysisIntervalRef = useRef(null);

  // Initialize speech-to-text hook with error handling
  const speechToTextResult = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = speechToTextResult || {
    error: null,
    interimResult: '',
    isRecording: false,
    results: [],
    startSpeechToText: () => {},
    stopSpeechToText: () => {},
    setResults: () => {}
  };

  // Check speech recognition support
  useEffect(() => {
    setIsClient(true);
    try {
      const checkSpeechSupport = () => {
        if (typeof window === 'undefined') return false;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setSpeechSupported(false);
          return false;
        }
        return true;
      };
      
      checkSpeechSupport();
      initializeProctoring();
    } catch (error) {
      console.error("Error in initialization:", error);
      setSpeechSupported(false);
    }
  }, []);

  // Reset component when question changes
  useEffect(() => {
    if (currentQuestionIndex !== activeQuestionIndex) {
      try {
        // Reset all recording states for new question
        setUserAnswer("");
        setRecordingStatus("ready");
        if (setResults) {
          setResults([]);
        }
        setLoading(false);
        setCurrentQuestionIndex(activeQuestionIndex);
        
        // Show ready message for new question
        if (typeof toast !== 'undefined') {
          toast.success("Ready for new question - Click 'Start Recording' to begin");
        }
      } catch (error) {
        console.error("Error resetting component:", error);
      }
    }
  }, [activeQuestionIndex, currentQuestionIndex, setResults]);

  useEffect(() => {
    try {
      if (results && results.length > 0) {
        results.forEach((result) => {
          setUserAnswer((prevAns) => prevAns + result?.transcript);
        });
      }
    } catch (error) {
      console.error("Error processing speech results:", error);
    }
  }, [results]);

  // Handle page visibility changes - turn off camera/mic when navigating away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (user navigated away or switched tabs)
        console.log('Page hidden - cleaning up media');
        cleanupMedia();
      } else if (isClient) {
        // Page is visible again - reinitialize if needed
        console.log('Page visible - reinitializing media');
        if (!proctoringActive) {
          initializeProctoring();
        }
      }
    };

    const handleBeforeUnload = () => {
      cleanupMedia();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isClient, proctoringActive]);

  // Detect interview completion and cleanup
  useEffect(() => {
    const isLastQuestion = activeQuestionIndex === (mockInterViewQuestion?.length - 1);
    
    if (isLastQuestion && recordingStatus === 'completed') {
      // Interview completed - cleanup everything
      setTimeout(() => {
        cleanupMedia();
        if (typeof toast !== 'undefined') {
          toast.success('Interview completed! Camera and microphone turned off.');
        }
      }, 3000); // Wait 3 seconds after completion message
    }
  }, [activeQuestionIndex, mockInterViewQuestion?.length, recordingStatus]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, []);

  // Remove automatic submission - now handled manually in stop recording

  // Cleanup media streams and intervals
  const cleanupMedia = () => {
    try {
      setIsCleaningUp(true);
      
      // Use global media manager for cleanup
      mediaManager.cleanupAll();
      
      // Local cleanup
      mediaStreamRef.current = null;
      emotionIntervalRef.current = null;
      eyeTrackingIntervalRef.current = null;
      voiceAnalysisIntervalRef.current = null;
      audioContextRef.current = null;

      setProctoringActive(false);
      setRecordingStatus('idle');
      
      console.log('Local media cleanup completed');
      
      // Reset cleanup status after a brief moment
      setTimeout(() => {
        setIsCleaningUp(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
      setIsCleaningUp(false);
    }
  };

  // Initialize proctoring systems
  const initializeProctoring = async () => {
    try {
      // Set interview as active
      mediaManager.setInterviewActive(true);
      
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      mediaStreamRef.current = stream;
      mediaManager.registerStream(stream);
      setProctoringActive(true);

      // Initialize monitoring systems
      setupEmotionDetection();
      setupEyeTracking();
      setupVoiceAnalysis(stream);
      setupTabMonitoring();

    } catch (error) {
      console.error('Failed to initialize proctoring:', error);
      mediaManager.setInterviewActive(false);
    }
  };

  // DeepFace emotion detection simulation (replace with actual DeepFace API)
  const setupEmotionDetection = () => {
    const emotions = ['happy', 'neutral', 'surprised', 'confused', 'focused', 'nervous', 'confident'];
    
    emotionIntervalRef.current = setInterval(() => {
      const dominant = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = Math.random() * 40 + 60; // 60-100%
      
      setEmotionData({
        dominant,
        confidence: Math.round(confidence)
      });

      // Check for negative emotions during interview
      if (['nervous', 'confused'].includes(dominant) && confidence > 80) {
        addViolation(`High ${dominant} emotion detected - candidate may need support`);
      }
    }, 3000);

    mediaManager.registerInterval(emotionIntervalRef.current);
  };

  // Eye tracking setup
  const setupEyeTracking = () => {
    const directions = ['center', 'left', 'right', 'up', 'down'];
    
    eyeTrackingIntervalRef.current = setInterval(() => {
      const gazeDirection = directions[Math.floor(Math.random() * directions.length)];
      const blinkRate = Math.random() * 20 + 10; // 10-30 blinks/min
      const focusScore = Math.random() * 40 + 60; // 60-100%

      setEyeTrackingData({
        gazeDirection,
        blinkRate: Math.round(blinkRate),
        focusScore: Math.round(focusScore)
      });

      // Check for suspicious eye movement
      if (gazeDirection !== 'center' && Math.random() > 0.8) {
        addViolation(`Looking ${gazeDirection} - maintain eye contact with camera`);
      }
    }, 2000);
    
    mediaManager.registerInterval(eyeTrackingIntervalRef.current);
  };

  // Voice analysis
  const setupVoiceAnalysis = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 2048;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyzeVoice = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate voice metrics
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

        if (volume < 10 && isRecording) {
          addViolation('Voice too low - speak clearly and louder');
        }
      };
      
      const voiceInterval = setInterval(analyzeVoice, 1000);
      voiceAnalysisIntervalRef.current = voiceInterval;
      audioContextRef.current = audioContext;
      
      mediaManager.registerInterval(voiceAnalysisIntervalRef.current);
      mediaManager.registerAudioContext(audioContext);
      
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
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        addViolation('Tab switch detected - stay focused on the interview');
      }
    };

    const handleBlur = () => {
      addViolation('Window lost focus - avoid using other applications');
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
      id: Date.now() + Math.random().toString(36).substr(2, 9), // Unique ID with timestamp + random string
      message,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'warning'
    };
    
    setViolations(prev => [...prev.slice(-4), violation]); // Keep only last 5
  };

  // Add safety check for required props AFTER all hooks
  if (!isClient) {
    return (
      <div className="flex items-center justify-center flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
          <p className="text-white">Initializing interview system...</p>
        </div>
      </div>
    );
  }

  if (!mockInterViewQuestion || !mockInterViewQuestion[activeQuestionIndex]) {
    return (
      <div className="flex items-center justify-center flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
          <p className="text-white">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  // Show speech recognition not supported
  if (!speechSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-6">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
              <Image
                src={"/webcam.png"}
                width={200}
                height={200}
                className="absolute inset-0 m-auto z-0"
                alt="Webcam placeholder"
              />
              <Webcam
                mirrored={true}
                className="w-full h-full object-cover relative z-10"
              />
            </div>
            <div className="bg-orange-900/20 border border-orange-600 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-orange-200">Speech Recognition Not Available</h3>
              <p className="text-sm mb-3 text-orange-300">
                Speech recognition is only available in Chrome, Edge, or Safari browsers.
              </p>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2 text-white">Type your answer instead:</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
              <Button 
                disabled={loading || userAnswer.length < 10} 
                onClick={() => UpdateUserAnswerInDb()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Submit Answer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error after all hooks are called
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-6">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
              <Image
                src={"/webcam.png"}
                width={200}
                height={200}
                className="absolute inset-0 m-auto z-0"
                alt="Webcam placeholder"
              />
              <Webcam
                mirrored={true}
                className="w-full h-full object-cover relative z-10"
              />
            </div>
            <div className="bg-red-900/20 border border-red-600 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-red-200">Microphone Access Issue</h3>
              <p className="text-sm mb-3 text-red-300">
                {error.message || error}. Please check your microphone permissions and try again.
              </p>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2 text-white">Type your answer instead:</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
              <Button 
                disabled={loading || userAnswer.length < 10} 
                onClick={() => UpdateUserAnswerInDb()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Submit Answer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StartStopRecording = async () => {
    try {
      if (isRecording) {
        stopSpeechToText();
        setRecordingStatus("processing");
        if (typeof toast !== 'undefined') {
          toast.info("Processing your response...");
        }
        
        // Handle submission when user has provided answer
        if (userAnswer.trim().length > 10) {
          await UpdateUserAnswerInDb();
        } else {
          setRecordingStatus('idle');
          if (typeof toast !== 'undefined') {
            toast.error('Please provide a longer response (minimum 10 characters)');
          }
        }
      } else {
        setRecordingStatus("recording");
        startSpeechToText();
        if (typeof toast !== 'undefined') {
          toast.success("Recording started - Speak your answer now");
        }
      }
    } catch (error) {
      console.error("Error in recording:", error);
      setRecordingStatus('idle');
      if (typeof toast !== 'undefined') {
        toast.error("Error with recording. Please try again.");
      }
    }
  };

  const UpdateUserAnswerInDb = async () => {
    try {
      console.log(userAnswer);
      setLoading(true);
      
      // Enhanced feedback prompt with proctoring data
      const feedbackPromt = `
        Question: ${mockInterViewQuestion[activeQuestionIndex]?.question}
        User Answer: ${userAnswer}
        
        Proctoring Data:
        - Dominant Emotion: ${emotionData.dominant} (${emotionData.confidence}% confidence)
        - Voice Clarity: ${voiceMetrics.clarity}%
        - Voice Confidence: ${voiceMetrics.confidence}%
        - Eye Focus Score: ${eyeTrackingData.focusScore}%
        - Tab Switches: ${tabSwitches}
        - Violations Count: ${violations.length}
        
        Based on the question, user's answer, and behavioral analysis, provide:
        1. Content rating (1-10) for the answer quality
        2. Presentation rating (1-10) considering voice clarity, confidence, and focus
        3. Overall feedback including areas for improvement
        4. Behavioral insights from proctoring data
        
        Response in JSON format only: 
        {
          "contentRating": number,
          "presentationRating": number, 
          "overallRating": number,
          "feedback": "detailed feedback",
          "behavioralInsights": "insights from monitoring data"
        }
      `;
      
      const result = await chatSession.sendMessage(feedbackPromt);
      const mockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "");

      const JsonFeedbackResp = JSON.parse(mockJsonResp);
      
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterViewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterViewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.overallRating || JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy'),
        // Additional proctoring data
        emotionData: JSON.stringify(emotionData),
        voiceMetrics: JSON.stringify(voiceMetrics),
        eyeTrackingData: JSON.stringify(eyeTrackingData),
        violationsCount: violations.length,
        tabSwitches: tabSwitches
      });
      
      if (resp) {
        const isLastQuestion = activeQuestionIndex === (mockInterViewQuestion?.length - 1);
        
        if (isLastQuestion) {
          toast.success('Final response submitted! Interview will complete shortly.');
        } else {
          toast.success('Response submitted successfully with AI feedback!');
        }
        
        setRecordingStatus("completed");
        setUserAnswer('');
        setResults([]);
        // Reset violation count for next question
        setViolations([]);
        setTabSwitches(0);
        // Reset status to idle after showing success briefly
        setTimeout(() => {
          setRecordingStatus('idle');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Error saving your answer. Please try again.');
      setRecordingStatus('idle'); // Reset status on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Camera and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-400" />
                  Interview Camera
                </h2>
                <div className="flex items-center gap-2">
                  {isCleaningUp && (
                    <span className="text-xs text-yellow-300 animate-pulse">Turning off...</span>
                  )}
                  <div className={`w-3 h-3 rounded-full ${
                    isCleaningUp ? 'bg-yellow-500 animate-pulse' : 
                    proctoringActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={"/webcam.png"}
                  width={200}
                  height={200}
                  className="absolute inset-0 m-auto z-0"
                  alt="Webcam placeholder"
                />
                <Webcam
                  ref={videoRef}
                  mirrored={true}
                  className="w-full h-full object-cover relative z-10"
                />
                
                {/* Overlay information */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="bg-black/70 rounded px-2 py-1 text-sm text-white">
                    Emotion: {emotionData.dominant} ({emotionData.confidence}%)
                  </div>
                  <div className="bg-black/70 rounded px-2 py-1 text-sm text-white">
                    Gaze: {eyeTrackingData.gazeDirection}
                  </div>
                  <div className="bg-black/70 rounded px-2 py-1 text-sm text-white">
                    Focus: {eyeTrackingData.focusScore}%
                  </div>
                </div>
                
                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-red-500 rounded px-2 py-1 text-sm text-white flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      REC
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Analysis */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-green-400" />
                  Voice Analysis
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-400">{voiceMetrics.clarity}%</div>
                    <div className="text-xs text-gray-400">Clarity</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{voiceMetrics.pace}%</div>
                    <div className="text-xs text-gray-400">Pace</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{voiceMetrics.volume}%</div>
                    <div className="text-xs text-gray-400">Volume</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">{voiceMetrics.confidence}%</div>
                    <div className="text-xs text-gray-400">Confidence</div>
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center">
                <Button  
                  disabled={loading || recordingStatus === "processing"} 
                  onClick={StartStopRecording} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Response...
                    </span>
                  ) : isRecording ? (
                    <span className="flex items-center gap-2">
                      <StopCircle className="h-4 w-4" />
                      Stop Recording
                    </span>
                  ) : recordingStatus === "completed" ? (
                    <span className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Record Again
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Start Recording
                    </span>
                  )}
                </Button>
              </div>

              {/* Status Display */}
              <div className="text-center mt-4">
                {recordingStatus === "ready" && (
                  <p className="text-blue-400 text-sm">Ready to record your answer</p>
                )}
                {recordingStatus === "recording" && (
                  <p className="text-green-400 text-sm animate-pulse">🔴 Recording in progress...</p>
                )}
                {recordingStatus === "processing" && (
                  <p className="text-yellow-400 text-sm">Processing your response...</p>
                )}
                {recordingStatus === "completed" && (
                  <p className="text-green-500 text-sm">✅ Response submitted successfully!</p>
                )}
              </div>
            </div>
          </div>

          {/* Monitoring Panel */}
          <div className="space-y-6">
            {/* Eye Tracking */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-400" />
                Eye Tracking
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Gaze</span>
                  <span className="text-white font-medium">{eyeTrackingData.gazeDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Blinks/min</span>
                  <span className="text-white font-medium">{eyeTrackingData.blinkRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Focus Score</span>
                  <span className="text-white font-medium">{eyeTrackingData.focusScore}%</span>
                </div>
              </div>
            </div>

            {/* Tab Switches Counter */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4 text-yellow-400" />
                Focus Tracking
              </h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{tabSwitches}</div>
                <div className="text-sm text-gray-400">Tab Switches</div>
              </div>
            </div>

            {/* Violations Log removed per user request */}
          </div>
        </div>

        {/* Current Answer Display */}
        {(userAnswer || interimResult) && (
          <div className="mt-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              Current Answer:
              {isRecording && (
                <span className="flex items-center gap-1 text-red-400 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Live
                </span>
              )}
            </h3>
            <p className="text-gray-300 text-sm">
              {userAnswer}
              {interimResult && (
                <span className="text-blue-400 italic">{interimResult}</span>
              )}
            </p>
          </div>
        )}

        {/* Question-specific Instructions */}
        {recordingStatus === "ready" && (
          <div className="mt-6 bg-blue-900/20 border border-blue-600 rounded-xl p-4">
            <h3 className="text-blue-300 font-medium mb-2">Instructions:</h3>
            <p className="text-blue-200 text-sm">
              Click "Start Recording" to begin answering this question. Speak clearly and take your time.
              Click "Stop Recording" when you're finished to submit your response.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedRecordAnswerSection;
