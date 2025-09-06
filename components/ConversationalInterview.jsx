"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  User, 
  Bot,
  Phone,
  PhoneOff,
  Loader2
} from 'lucide-react';
import { useConversationalInterview } from '@/hooks/useConversationalInterview';
import ConversationManager from '@/utils/conversationManager';
import Webcam from 'react-webcam';
import { toast } from 'sonner';

const ConversationalInterview = ({ 
  interviewData, 
  onComplete 
}) => {
  const [conversationManager] = useState(() => new ConversationManager());
  const [messages, setMessages] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef(null);

  const {
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
  } = useConversationalInterview();

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      isRecording,
      isProcessing,
      isSpeaking,
      isWaitingForResponse
    });
  }, [isRecording, isProcessing, isSpeaking, isWaitingForResponse]);

  // Start interview
  const startInterview = async () => {
    try {
      setInterviewStarted(true);
      const welcomeMessage = await conversationManager.initializeInterview(
        interviewData.jobPosition,
        interviewData.jobDesc,
        interviewData.jobExperience
      );
      
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        text: welcomeMessage,
        timestamp: new Date()
      };
      
      setMessages([aiMessage]);
      
      // Speak the welcome message
      await speakText(welcomeMessage);
      
      toast.success('Interview started! Please wait for the AI to finish speaking, then click the microphone to respond.');
    } catch (err) {
      toast.error('Failed to start interview: ' + err.message);
      setInterviewStarted(false);
    }
  };

  // Handle user response
  const handleUserResponse = async () => {
    console.log('handleUserResponse called, current states:', {
      isRecording,
      isProcessing,
      isSpeaking,
      isWaitingForResponse
    });

    if (isSpeaking) {
      console.log('Stopping speaking...');
      stopSpeaking();
      return;
    }

    if (isRecording) {
      console.log('User wants to stop recording...');
      // Stop recording and process
      setIsWaitingForResponse(true);
      const transcript = await stopRecording();
      
      if (transcript && transcript.trim()) {
        // Add user message
        const userMessage = {
          id: Date.now(),
          sender: 'user',
          text: transcript,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Get AI response
        const aiResponse = await conversationManager.addHumanMessage(transcript);
        
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Clear waiting state before speaking
        setIsWaitingForResponse(false);
        
        // Speak AI response
        await speakText(aiResponse);
      } else {
        setIsWaitingForResponse(false);
      }
    } else {
      console.log('User wants to start recording...');
      // Start recording
      await startRecording();
    }
  };

  // End interview
  const endInterview = () => {
    setInterviewEnded(true);
    cleanup();
    
    const summary = conversationManager.getInterviewSummary();
    toast.success('Interview completed!');
    
    if (onComplete) {
      onComplete(summary);
    }
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
            <div className="mb-6">
              <Phone className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Real-Time AI Interview
              </h1>
              <p className="text-slate-300">
                Experience a natural conversation with our AI interviewer
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Position</h3>
                <p className="text-slate-300">{interviewData.jobPosition}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Experience</h3>
                <p className="text-slate-300">{interviewData.jobExperience}</p>
              </div>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-green-400" />
                  <span>AI speaks questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-blue-400" />
                  <span>You speak your answers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span>Natural conversation flow</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startInterview}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Start Interview Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (interviewEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
            <PhoneOff className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Interview Completed!
            </h1>
            <p className="text-slate-300 mb-6">
              Thank you for participating in the conversational interview.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Interview Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <strong>Total Questions:</strong> {messages.filter(m => m.sender === 'ai').length}
                </div>
                <div>
                  <strong>Total Responses:</strong> {messages.filter(m => m.sender === 'user').length}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        
        {/* Video Call Section */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Video Call</h3>
              <div className="relative">
                <div className="bg-slate-900 rounded-lg overflow-hidden">
                  <Webcam
                    audio={false}
                    mirrored={true}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                {/* AI Avatar Overlay */}
                <div className="absolute top-2 right-2 bg-slate-800 rounded-lg p-2">
                  <Bot className={`w-6 h-6 ${isSpeaking ? 'text-green-400 animate-pulse' : 'text-slate-400'}`} />
                </div>
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-2 left-2 bg-red-600 rounded-full p-2 animate-pulse">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleUserResponse}
                disabled={!permissionGranted || isProcessing || isWaitingForResponse}
                className={`${
                  !permissionGranted
                    ? 'bg-gray-600 cursor-not-allowed'
                    : isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : isSpeaking
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors duration-200`}
                size="lg"
              >
                {isProcessing || isWaitingForResponse ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : isSpeaking ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                onClick={isSpeaking ? stopSpeaking : endInterview}
                variant="destructive"
                size="lg"
                className="transition-colors duration-200"
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <PhoneOff className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            {/* Status */}
            <div className="mt-4 text-center">
              {!permissionGranted && (
                <p className="text-red-400 text-sm mb-2">⚠️ Microphone permission required</p>
              )}
              {isProcessing && (
                <p className="text-yellow-400 text-sm">Processing your response...</p>
              )}
              {isWaitingForResponse && (
                <p className="text-blue-400 text-sm">Generating AI response...</p>
              )}
              {isSpeaking && (
                <p className="text-green-400 text-sm">AI is speaking... Click to interrupt or wait to respond</p>
              )}
              {isRecording && (
                <p className="text-red-400 text-sm">Recording your response... Click to stop</p>
              )}
              {!isRecording && !isProcessing && !isSpeaking && !isWaitingForResponse && permissionGranted && (
                <p className="text-slate-400 text-sm">Click the microphone to respond</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Conversation History */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 h-[600px] flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Conversation</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.sender === 'user' ? 'You' : 'AI Interviewer'}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Current Transcript */}
            {currentTranscript && (
              <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                <p className="text-slate-300 text-sm">
                  <span className="text-blue-400">Current transcript:</span> {currentTranscript}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalInterview;
