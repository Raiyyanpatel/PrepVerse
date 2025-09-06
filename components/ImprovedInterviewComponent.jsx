"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, PhoneOff, Mic, MicOff, Send, Volume2, VolumeX, Eye, Brain, Monitor } from 'lucide-react';
import Webcam from 'react-webcam';
import { chatSession } from '@/utils/GeminiAIModel';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useSpeechToText from 'react-hook-speech-to-text';
// (duplicate imports removed)

const ImprovedInterviewComponent = ({ interviewData, mockInterviewQuestion, interviewId }) => {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [ttsDisabledReason, setTtsDisabledReason] = useState('');
  // Proctoring states (simulated)
  const [proctoringActive, setProctoringActive] = useState(false);
  const [emotionData, setEmotionData] = useState({ dominant: 'neutral', confidence: 0 });
  const [eyeTrackingData, setEyeTrackingData] = useState({ gazeDirection: 'center', blinkRate: 15, focusScore: 100 });
  const [tabSwitches, setTabSwitches] = useState(0);
  const [violations, setViolations] = useState([]);
  const [monitorTab, setMonitorTab] = useState('emotion'); // emotion | focus | tabs
  
  const { user } = useUser();
  const router = useRouter();
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionLockRef = useRef(false);
  const recognitionStartingRef = useRef(false);
  const lastRecStopTimeRef = useRef(0);
  const ttsTokenRef = useRef(0);
  const currentAudioUrlRef = useRef(null);
  const currentAudioRef = useRef(null);
  const lastSpokenTextRef = useRef('');
  const lastSpokenAtRef = useRef(0);
  const audioReadyResolversRef = useRef(new Map()); // token -> resolve()
  const lastAskedQuestionRef = useRef('');
  const lastSuggestedAnswerRef = useRef('');
  const questionCountMapRef = useRef(new Map());
  // Proctoring refs
  const emotionIntervalRef = useRef(null);
  const eyeIntervalRef = useRef(null);
  const visibilityHandlersRef = useRef({ added: false });

  // Dynamically load Puter.js on the client when needed
  const ensurePuterLoaded = async () => {
    if (typeof window === 'undefined') return false;
    if (window.puter?.ai?.txt2speech) return true;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://js.puter.com/v2/';
      s.async = true;
      s.onload = () => {
        s.dataset.loaded = 'true';
        resolve();
      };
      s.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(s);
    });
    return !!window.puter?.ai?.txt2speech;
  };

  // Speech to text hook - with error handling for SSR
  const speechToText = typeof window !== 'undefined' ? useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  }) : {
    error: null,
    interimResult: '',
    isRecording: false,
    results: [],
    startSpeechToText: () => {},
    stopSpeechToText: () => {},
    setResults: () => {}
  };

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = speechToText;

  // Auto-scroll chat to bottom (but don't scroll the page)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', // Prevent page scrolling
        inline: 'nearest' 
      });
    }
  }, [chatHistory]);

  // Handle speech recognition results
  useEffect(() => {
    if (results && results.length > 0) {
      const transcript = results[results.length - 1]?.transcript || '';
      setCurrentInput(prev => prev + ' ' + transcript);
    }
  }, [results]);

  // Auto-start recording when AI finishes speaking and we're waiting for user response
  useEffect(() => {
    if (
      !isAISpeaking &&
      waitingForUserResponse &&
      !isRecording &&
      interviewStarted &&
      !recognitionLockRef.current &&
      !recognitionStartingRef.current &&
      Date.now() - lastRecStopTimeRef.current > 800
    ) {
      const autoStartTimer = setTimeout(() => {
        // Double check conditions before starting
        if (
          !isRecording &&
          !isAISpeaking &&
          waitingForUserResponse &&
          !recognitionLockRef.current &&
          !recognitionStartingRef.current
        ) {
          try {
            recognitionLockRef.current = true;
            recognitionStartingRef.current = true;
            startSpeechToText();
            toast.info('Recording started automatically. Speak your answer or type manually.');
            // Safety unlock after 3s in case events don't propagate
            setTimeout(() => {
              recognitionLockRef.current = false;
              recognitionStartingRef.current = false;
            }, 3000);
          } catch (error) {
            console.error('❌ Failed to auto-start recording:', error);
            recognitionLockRef.current = false;
            recognitionStartingRef.current = false;
          }
        }
      }, 1500); // Longer delay to ensure audio has finished

      return () => clearTimeout(autoStartTimer);
    }
  }, [isAISpeaking, waitingForUserResponse, isRecording, interviewStarted]);

  // Initialize simple proctoring simulation when interview starts
  useEffect(() => {
    if (!interviewStarted) return;
    setProctoringActive(true);
    // Emotion simulation
    if (!emotionIntervalRef.current) {
      emotionIntervalRef.current = setInterval(() => {
        const emotions = ['confident', 'focused', 'neutral', 'nervous', 'confused'];
        const dominant = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = Math.round(60 + Math.random() * 40);
        setEmotionData({ dominant, confidence });
        if ((dominant === 'nervous' || dominant === 'confused') && confidence > 80) {
          addViolation(`High ${dominant} detected`);
        }
      }, 3000);
    }
    // Eye/focus simulation
    if (!eyeIntervalRef.current) {
      eyeIntervalRef.current = setInterval(() => {
        const dirs = ['center', 'left', 'right', 'up', 'down'];
        const gazeDirection = dirs[Math.floor(Math.random() * dirs.length)];
        const blinkRate = Math.round(10 + Math.random() * 15);
        const focusScore = Math.round(gazeDirection === 'center' ? 80 + Math.random() * 20 : 40 + Math.random() * 40);
        setEyeTrackingData({ gazeDirection, blinkRate, focusScore });
        if (focusScore < 55) addViolation('Low focus detected');
      }, 2000);
    }
    // Tab monitoring (visibility/blur)
    if (!visibilityHandlersRef.current.added) {
      const onVisibility = () => {
        if (document.hidden) {
          setTabSwitches(prev => prev + 1);
          addViolation('Tab switch detected');
        }
      };
      const onBlur = () => addViolation('Window lost focus');
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('blur', onBlur);
      visibilityHandlersRef.current = { added: true, onVisibility, onBlur };
    }
    return () => {
      // cleanup if interview toggles off in lifecycle
      if (emotionIntervalRef.current) { clearInterval(emotionIntervalRef.current); emotionIntervalRef.current = null; }
      if (eyeIntervalRef.current) { clearInterval(eyeIntervalRef.current); eyeIntervalRef.current = null; }
      if (visibilityHandlersRef.current.added) {
        document.removeEventListener('visibilitychange', visibilityHandlersRef.current.onVisibility);
        window.removeEventListener('blur', visibilityHandlersRef.current.onBlur);
        visibilityHandlersRef.current = { added: false };
      }
      setProctoringActive(false);
    };
  }, [interviewStarted]);

  // When recording state flips to true, clear the lock immediately
  useEffect(() => {
    if (isRecording) {
      recognitionLockRef.current = false;
      recognitionStartingRef.current = false;
    } else {
      // Record the time when recording stops to avoid immediate restarts
      lastRecStopTimeRef.current = Date.now();
    }
  }, [isRecording]);

  // Timer countdown
  useEffect(() => {
    if (interviewStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [interviewStarted, timeLeft]);

  // If speech recognition errors, clear locks and back off briefly
  useEffect(() => {
    if (error) {
      recognitionLockRef.current = false;
      recognitionStartingRef.current = false;
      lastRecStopTimeRef.current = Date.now();
    }
  }, [error]);

  // (Removed duplicate auto-start effect to prevent double start errors)

  // Stream text progressively while audio plays
  const streamTextWithAudio = (text, messageId, estimatedDuration = null) => {
    return new Promise((resolve) => {
      const words = text.split(' ');
      const wordsPerSecond = 3; // Adjust this to match speech speed
      const intervalTime = 1000 / wordsPerSecond;
      
      let currentWordIndex = 0;
      setStreamingMessageId(messageId);
      setCurrentStreamingText('');
      
      const streamInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
          const currentText = words.slice(0, currentWordIndex + 1).join(' ');
          setCurrentStreamingText(currentText);
          currentWordIndex++;
        } else {
          clearInterval(streamInterval);
          setCurrentStreamingText('');
          setStreamingMessageId(null);
          resolve();
        }
      }, intervalTime);
      
      // If we have estimated duration, sync with it
      if (estimatedDuration) {
        setTimeout(() => {
          clearInterval(streamInterval);
          setCurrentStreamingText('');
          setStreamingMessageId(null);
          resolve();
        }, estimatedDuration * 1000);
      }
    });
  };

  // Text-to-Speech using Puter.js (voice: Amy, engine: neural, language: en-GB)
  const speakText = async (text) => {
    if (!audioEnabled) return;
    const now = Date.now();
    // Prevent speaking the exact same text again within 4 seconds
    if (lastSpokenTextRef.current === (text || '').trim() && (now - lastSpokenAtRef.current) < 4000) {
      console.log('🚫 Skipping duplicate TTS of same text');
      return;
    }
    
    // Ensure STT is stopped before TTS begins
    if (isRecording) {
      try { stopSpeechToText(); } catch {}
      lastRecStopTimeRef.current = Date.now();
      recognitionLockRef.current = false;
      recognitionStartingRef.current = false;
    }

    // Stop any existing speech first
    stopAudio();
    const myToken = ++ttsTokenRef.current;
    // Create a one-shot onReady promise for this TTS token
    let readyResolve;
    const onReady = new Promise((resolve) => { readyResolve = resolve; });
    audioReadyResolversRef.current.set(myToken, readyResolve);

    // We are preparing audio: thinking
    setIsAIThinking(true);
    setIsAISpeaking(false);
    console.log('🎤 Requesting Puter TTS for:', (text || '').substring(0, 60) + '...');

    try {
      const ok = await ensurePuterLoaded();
      if (!ok) throw new Error('Puter.js not available');

      const ttsResult = await window.puter.ai.txt2speech((text || '').trim(), {
        voice: 'Amy',
        engine: 'neural',
        language: 'en-GB'
      });

      // Normalize possible return shapes from Puter TTS
      let audio = ttsResult;
      if (!audio || typeof audio.play !== 'function') {
        console.warn('Puter TTS returned non-audio object:', ttsResult);
        if (ttsResult?.audio_url) {
          audio = new Audio(ttsResult.audio_url);
        } else if (ttsResult?.audio?.url) {
          audio = new Audio(ttsResult.audio.url);
        } else if (ttsResult?.audio_base64) {
          try {
            const b64 = ttsResult.audio_base64.split(',').pop();
            const bin = atob(b64);
            const len = bin.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
            const blob = new Blob([bytes.buffer], { type: 'audio/mpeg' });
            audio = new Audio(URL.createObjectURL(blob));
          } catch (e) {
            console.warn('Failed to decode base64 audio from Puter TTS');
          }
        } else if (ttsResult?.success === false) {
          const msg = ttsResult?.error?.message || ttsResult?.error?.code || 'Puter TTS returned an error';
          throw new Error(msg);
        } else {
          throw new Error('Unexpected Puter TTS response shape');
        }
      }

      // Guard against stale token
      if (myToken !== ttsTokenRef.current) {
        console.log('🚫 Stale audio (Puter), not using');
        try { audio.pause?.(); } catch {}
        const r = audioReadyResolversRef.current.get(myToken);
        if (r) { r(); audioReadyResolversRef.current.delete(myToken); }
        return { token: myToken, onReady };
      }

      currentAudioRef.current = audio;
      audio.onended = () => {
        if (myToken !== ttsTokenRef.current) return;
        setIsAISpeaking(false);
        setIsAIThinking(false);
        setWaitingForUserResponse(true);
      };
      audio.onerror = (e) => {
        console.error('❌ Puter audio error:', e);
        setIsAISpeaking(false);
        setIsAIThinking(false);
        setWaitingForUserResponse(true);
        toast.error('Audio playback failed.');
        const r = audioReadyResolversRef.current.get(myToken);
        if (r) { r(); audioReadyResolversRef.current.delete(myToken); }
      };

      try {
        await audio.play();
        setIsAISpeaking(true);
        setIsAIThinking(false);
        lastSpokenTextRef.current = (text || '').trim();
        lastSpokenAtRef.current = Date.now();
      } catch (playErr) {
        console.error('❌ Puter play() failed:', playErr);
        setIsAISpeaking(false);
        setIsAIThinking(false);
        setWaitingForUserResponse(true);
        toast.error('Autoplay blocked. Click to enable audio.');
      }

      // Signal ready (after play attempt)
      const r = audioReadyResolversRef.current.get(myToken);
      if (r) { r(); audioReadyResolversRef.current.delete(myToken); }
    } catch (error) {
      try {
        // Surface more detail if Puter returned structured error
        const details = typeof error === 'object' ? JSON.stringify(error) : String(error);
        console.error('❌ TTS (Puter) failed:', details);
      } catch {
        console.error('❌ TTS (Puter) failed:', error);
      }
      setIsAISpeaking(false);
      setIsAIThinking(false);
      setWaitingForUserResponse(true);
      // If insufficient funds, auto-disable audio and show banner
      const msg = (error?.message || '') + JSON.stringify(error || '');
      if (/insufficient_funds|status\":402|status:402/i.test(msg)) {
        setAudioEnabled(false);
        setTtsDisabledReason('Puter TTS disabled: insufficient funds (402).');
        toast.error('Puter TTS unavailable: insufficient funds. Switched to text-only.');
      } else {
        toast.error(`TTS unavailable${error?.message ? ': ' + error.message : ''}`);
      }
      const r = audioReadyResolversRef.current.get(myToken);
      if (r) { r(); audioReadyResolversRef.current.delete(myToken); }
    }

    // Return an object allowing callers to await audio readiness
    return { token: myToken, onReady };
  };


  // Stop current audio
  const stopAudio = () => {
    console.log('🛑 Stopping all audio...');
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.oncanplaythrough = null;
        currentAudioRef.current.onended = null;
        currentAudioRef.current.onerror = null;
        currentAudioRef.current.onloadeddata = null;
      } catch {}
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if (currentAudioUrlRef.current) {
      try { URL.revokeObjectURL(currentAudioUrlRef.current); } catch {}
      currentAudioUrlRef.current = null;
    }
  setIsAISpeaking(false);
  setIsAIThinking(false);
  };

  const addViolation = (message) => {
    setViolations(prev => [...prev.slice(-4), { id: Date.now(), message }]);
  };

  // Start interview with first question
  const startInterview = async () => {
    setInterviewStarted(true);
    const firstQuestion = mockInterviewQuestion[0]?.question;
    const welcomeMessage = `Welcome to your interview! Let's begin with the first question: ${firstQuestion}`;
    
    const aiMessageId = 1;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      message: '', // delay showing text
      timestamp: new Date()
    };

    setChatHistory([aiMessage]);
    toast.success('Interview started! You have 5 minutes to complete.');
    
  // Start TTS immediately, then show text as soon as audio is ready
  const speak = await speakText(welcomeMessage);
  await speak.onReady;
  await streamTextWithAudio(welcomeMessage, aiMessageId);
  setChatHistory(prev => prev.map(m => m.id === aiMessageId ? { ...m, message: welcomeMessage } : m));

  // Record the first asked question and its suggested answer from dataset
  lastAskedQuestionRef.current = firstQuestion || '';
  questionCountMapRef.current.set(lastAskedQuestionRef.current, 0);
  lastSuggestedAnswerRef.current = mockInterviewQuestion[0]?.answer || '';
  };

  // Send message
  const sendMessage = async () => {
    if (!currentInput.trim() || isLoading || isAISpeaking) return;

    // Stop recording and clear waiting state
    if (isRecording) {
  stopSpeechToText();
  lastRecStopTimeRef.current = Date.now();
  recognitionLockRef.current = false;
  recognitionStartingRef.current = false;
    }
    setWaitingForUserResponse(false);
    setResults([]); // Clear speech results

  const userMessage = {
      id: Date.now(),
      type: 'user',
      message: currentInput.trim(),
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
  // Save user answer with feedback & rating using the last asked question
  const qBase = (lastAskedQuestionRef.current || mockInterviewQuestion[currentQuestionIndex]?.question || '').trim();
  const corr = (lastSuggestedAnswerRef.current || mockInterviewQuestion[currentQuestionIndex]?.answer || '').trim();
  const prevCount = questionCountMapRef.current.get(qBase) || 0;
  const saveQuestion = prevCount > 0 ? `${qBase} (Follow-up #${prevCount})` : qBase;
  questionCountMapRef.current.set(qBase, prevCount + 1);
  const evalRes = await EvaluateAndSaveUserAnswer(saveQuestion, corr, userMessage.message);

      // Generate AI response
      const feedbackPrompt = `
        Interview Question: ${mockInterviewQuestion[currentQuestionIndex]?.question}
        User's Answer: ${userMessage.message}
        
        As an AI interviewer, provide a brief acknowledgment of their answer (1 sentence max).
        Then either ask a follow-up question related to the same topic, or if the answer is complete,
        simply say "Thank you for that answer." and nothing more.
        
        Do NOT immediately move to the next interview question.
        Keep responses under 2 sentences and natural for speech.
      `;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const aiResponse = result.response.text();

      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        message: '', // delay showing text by 5s and stream it
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMessage]);

  // Speak, then show text as soon as audio is ready
  const speak = await speakText(aiResponse);
  await speak.onReady;
  await streamTextWithAudio(aiResponse, aiMessageId);
  setChatHistory(prev => prev.map(m => m.id === aiMessageId ? { ...m, message: aiResponse } : m));

      // Try to update last asked question from AI reply (follow-up)
      const maybeFollowUp = extractQuestionFromAI(aiResponse);
      if (maybeFollowUp) {
        lastAskedQuestionRef.current = maybeFollowUp;
        questionCountMapRef.current.set(maybeFollowUp, 0);
        try {
          lastSuggestedAnswerRef.current = await generateSuggestedAnswer(maybeFollowUp);
        } catch (e) {
          console.warn('Suggested answer generation failed:', e);
          lastSuggestedAnswerRef.current = '';
        }
      } else {
        try {
          const fu = await generateFollowUpQuestion(qBase, userMessage.message);
          if (fu) {
            lastAskedQuestionRef.current = fu;
            questionCountMapRef.current.set(fu, 0);
            try {
              lastSuggestedAnswerRef.current = await generateSuggestedAnswer(fu);
            } catch (e) {
              console.warn('Suggested answer generation failed:', e);
              lastSuggestedAnswerRef.current = '';
            }
          }
        } catch (e) {
          console.warn('Follow-up generation failed:', e);
        }
      }

      // Don't automatically move to next question
      // Let user control when to proceed
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process your response. Please try again.');
      setWaitingForUserResponse(true); // Allow user to try again
    } finally {
      setIsLoading(false);
    }
  };

  // Extract a question-like sentence ending with ? from AI response
  const extractQuestionFromAI = (text) => {
    if (!text) return '';
    const matches = text.match(/[^?.!]*\?+/g);
    if (matches && matches.length > 0) {
      let q = matches[matches.length - 1].trim();
      q = q.replace(/^\s*(follow[- ]?up|question)\s*[:\-]?\s*/i, '').trim();
      return q;
    }
    return '';
  };

  // Generate a concise suggested answer for any question using Gemini
  const generateSuggestedAnswer = async (question) => {
    const prompt = `Provide a concise suggested answer (2-4 sentences) to the interview question below.\nQuestion: ${question}`;
    const res = await chatSession.sendMessage(prompt);
    return res.response.text().trim();
  };
  const generateFollowUpQuestion = async (baseQuestion, userAnswer) => {
    const prompt = `You are an interviewer. Based on the candidate's answer, ask exactly ONE specific follow-up question about the same topic. Keep it crisp and end with a question mark.\n\nBase question: ${baseQuestion}\nCandidate's answer: ${userAnswer}\n\nReturn only the follow-up question.`;
    const res = await chatSession.sendMessage(prompt);
    return res.response.text().trim();
  };

  // Evaluate answer with Gemini and save to DB
  const EvaluateAndSaveUserAnswer = async (question, correctAns, userAns) => {
    try {
  const prompt = `Question: ${question}\nUser Answer: ${userAns}\n\nContext metrics (for evaluation):\n- Dominant Emotion: ${emotionData.dominant} (${emotionData.confidence}%)\n- Focus Score: ${eyeTrackingData.focusScore}% (gaze: ${eyeTrackingData.gazeDirection})\n- Tab Switches: ${tabSwitches}\n\nGive a JSON object only, with two fields: rating (1-10 as a number) and feedback (3-5 short lines, concise). Consider the metrics in your assessment.`;
      const result = await chatSession.sendMessage(prompt);
      const raw = result.response.text().replace('```json', '').replace('```', '').trim();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        // Fallback: try to extract JSON from text
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : { rating: 5, feedback: 'No structured feedback available.' };
      }

      await db.insert(UserAnswer).values({
        mockIdRef: interviewId,
        question,
        correctAns,
        userAns,
        feedback: parsed?.feedback ?? null,
        rating: String(parsed?.rating ?? ''),
        userEmail: user?.primaryEmailAddress?.emailAddress ?? '',
  createdAt: moment().format('DD-MM-yyyy'),
  // Proctoring data
  emotionData: JSON.stringify(emotionData),
  eyeTrackingData: JSON.stringify(eyeTrackingData),
  violationsCount: String(violations.length),
  tabSwitches: String(tabSwitches)
      });

      return parsed;
    } catch (err) {
      console.error('EvaluateAndSaveUserAnswer failed:', err);
      // Save minimal record to avoid empty feedback pages
      try {
        await db.insert(UserAnswer).values({
          mockIdRef: interviewId,
          question,
          correctAns,
          userAns,
          feedback: 'Feedback unavailable due to an error.',
          rating: '0',
          userEmail: user?.primaryEmailAddress?.emailAddress ?? '',
          createdAt: moment().format('DD-MM-yyyy'),
          emotionData: JSON.stringify(emotionData),
          eyeTrackingData: JSON.stringify(eyeTrackingData),
          violationsCount: String(violations.length),
          tabSwitches: String(tabSwitches)
        });
      } catch {}
      return null;
    }
  };

  // Save user answer to database
  const SaveUserAnswer = async (answer) => {
    try {
      await db.insert(UserAnswer).values({
        mockIdRef: interviewId,
        question: mockInterviewQuestion[currentQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[currentQuestionIndex]?.answer,
        userAns: answer,
        feedback: null,
        rating: null,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy')
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  // Go to next question manually
  const goToNextQuestion = async () => {
    if (currentQuestionIndex < mockInterviewQuestion.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = mockInterviewQuestion[currentQuestionIndex + 1]?.question;
      
      const msgId = Date.now() + 2;
      const nextQuestionMessage = {
        id: msgId,
        type: 'ai',
        message: '', // delay showing text; will stream after 5s
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, nextQuestionMessage]);

      // Prevent immediate STT start
      setWaitingForUserResponse(false);

  // Speak, then stream text as soon as audio is ready
  const line = `Let's move to the next question: ${nextQuestion}`;
  const speak = await speakText(line);
  await speak.onReady;
  await streamTextWithAudio(line, msgId);
  setChatHistory(prev => prev.map(m => m.id === msgId ? { ...m, message: line } : m));

  // Update last asked question and suggested answer from dataset
  lastAskedQuestionRef.current = nextQuestion || '';
  questionCountMapRef.current.set(lastAskedQuestionRef.current, 0);
      lastSuggestedAnswerRef.current = mockInterviewQuestion[currentQuestionIndex + 1]?.answer || '';
      setWaitingForUserResponse(true);
    } else {
      // Interview is complete
      const endMessage = {
        id: Date.now() + 2,
        type: 'ai',
        message: 'Thank you for completing the interview! Let me prepare your feedback.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, endMessage]);
      await speakText('Thank you for completing the interview! Let me prepare your feedback.');
      
      setTimeout(() => {
        endInterview();
      }, 3000);
    }
  };

  // End interview
  const endInterview = () => {
    clearInterval(timerRef.current);
    stopAudio();
    if (isRecording) {
  stopSpeechToText();
  lastRecStopTimeRef.current = Date.now();
  recognitionLockRef.current = false;
  recognitionStartingRef.current = false;
    }
    toast.success('Interview completed!');
    router.push(`/dashboard/interview/${interviewId}/feedback`);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle microphone and auto-send when stopping
  const toggleMicrophone = () => {
    try {
      if (isRecording) {
        stopSpeechToText();
        lastRecStopTimeRef.current = Date.now();
        setWaitingForUserResponse(false);
        recognitionLockRef.current = false;
        recognitionStartingRef.current = false;
        // Auto-send message when recording stops
        if (currentInput.trim()) {
          setTimeout(() => {
            sendMessage();
          }, 500); // Small delay to ensure speech processing is complete
        }
        toast.info('Recording stopped and message sent automatically.');
      } else {
        // Prevent double-starts
        const tooSoon = Date.now() - lastRecStopTimeRef.current < 800;
        if (!recognitionLockRef.current && !recognitionStartingRef.current && !tooSoon && !isAISpeaking) {
          recognitionLockRef.current = true;
          recognitionStartingRef.current = true;
          startSpeechToText();
          setWaitingForUserResponse(true);
          toast.info('Recording started. Speak your answer.');
          setTimeout(() => {
            recognitionLockRef.current = false;
            recognitionStartingRef.current = false;
          }, 3000);
        } else {
          console.log('⏳ Mic start suppressed (lock/starting/tooSoon/isAISpeaking)');
        }
      }
    } catch (error) {
      console.error('❌ Error toggling microphone:', error);
      recognitionLockRef.current = false;
      recognitionStartingRef.current = false;
      toast.error('Error with microphone. Please try again.');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled) {
      stopAudio();
      toast.info('Audio disabled. AI responses will be text-only.');
    } else {
      toast.info('Audio enabled. AI will speak responses.');
    }
  };

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="modern-card p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Ready to start?</h2>
          <p className="text-slate-600 mb-6">
            You’ll have 5 minutes to complete this interview. The AI will ask questions, and you can answer via text or voice.
          </p>
          <Button 
            onClick={startInterview}
            className="btn-primary px-8 py-3"
          >
            Start Interview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Timer and Controls Header */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 p-4 flex justify-between items-center">
        <div className="text-slate-900 font-mono text-xl">
          {formatTime(timeLeft)} minutes left
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`px-3 ${cameraEnabled ? 'btn-success' : 'btn-secondary'}`}
            title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          >
            {cameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
          </Button>
          <Button
            onClick={toggleAudio}
            className={`px-3 ${audioEnabled ? 'btn-secondary' : 'btn-secondary'}`}
            title={audioEnabled ? 'Disable audio' : 'Enable audio'}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          {isAISpeaking && (
            <Button
              onClick={stopAudio}
              className="btn-secondary"
            >
              Stop Audio
            </Button>
          )}
          <Button
            onClick={endInterview}
            className="px-3 border border-rose-200 text-rose-700 hover:bg-rose-50"
            title="End interview"
          >
            <PhoneOff size={20} />
          </Button>
        </div>
      </div>
      {ttsDisabledReason && (
        <div className="bg-amber-100 text-amber-800 text-sm px-4 py-2 text-center border-b border-amber-200">
          {ttsDisabledReason} Reload after topping up your Puter balance to re-enable.
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Video Feed - Center */}
        <div className="flex-1 flex items-center justify-center p-2">
          {cameraEnabled ? (
            <div className="modern-card p-2">
              <div className="w-[480px] h-[480px] max-w-full max-h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <Webcam
                  audio={false}
                  mirrored={true}
                  className="w-full h-full object-cover"
                  width={480}
                  height={480}
                  videoConstraints={{
                    width: 480,
                    height: 480,
                    aspectRatio: 1
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="modern-card p-10 text-center">
              <CameraOff size={48} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600">Camera is off</p>
            </div>
          )}
        </div>

        {/* Chat + Monitor - Right Side */}
        <div className="w-96 flex flex-col gap-4">
          {/* Focus/Emotion/Tab Switch Monitor */}
          <div className="modern-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Live Monitor</h3>
              <div className={`text-xs px-2 py-1 rounded-full ${proctoringActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {proctoringActive ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              <button onClick={() => setMonitorTab('emotion')} className={`px-3 py-1.5 text-xs rounded-lg border ${monitorTab==='emotion' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                <span className="inline-flex items-center gap-1"><Brain size={14}/> Emotion</span>
              </button>
              <button onClick={() => setMonitorTab('focus')} className={`px-3 py-1.5 text-xs rounded-lg border ${monitorTab==='focus' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                <span className="inline-flex items-center gap-1"><Eye size={14}/> Focus</span>
              </button>
              <button onClick={() => setMonitorTab('tabs')} className={`px-3 py-1.5 text-xs rounded-lg border ${monitorTab==='tabs' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                <span className="inline-flex items-center gap-1"><Monitor size={14}/> Tab Switch</span>
              </button>
            </div>
            {/* Tab Content */}
            {monitorTab === 'emotion' && (
              <div className="history-card">
                <div className="text-xs text-slate-600 mb-1">Dominant Emotion</div>
                <div className="text-lg font-semibold capitalize text-slate-900">{emotionData.dominant} <span className="text-slate-500 text-sm">({emotionData.confidence}%)</span></div>
              </div>
            )}
            {monitorTab === 'focus' && (
              <div className="history-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-600">Focus Score</div>
                    <div className="text-lg font-semibold text-slate-900">{eyeTrackingData.focusScore}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Gaze</div>
                    <div className="text-lg font-semibold capitalize text-slate-900">{eyeTrackingData.gazeDirection}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600">Blink Rate: <span className="text-slate-900 font-medium">{eyeTrackingData.blinkRate}</span> / min</div>
              </div>
            )}
            {monitorTab === 'tabs' && (
              <div className="history-card">
                <div className="text-xs text-slate-600">Tab switches during interview</div>
                <div className="text-2xl font-extrabold text-amber-600">{tabSwitches}</div>
                {violations.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600">Last alert: <span className="text-slate-900">{violations[violations.length-1]?.message}</span></div>
                )}
              </div>
            )}
          </div>
          {/* Chat Messages */}
          <div className="modern-card flex-1 p-4 overflow-y-auto space-y-4">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-xl border ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-900 border-slate-200'
                  }`}
                >
                  <p className="text-sm">
                    {/* Show streaming text if this message is currently streaming */}
                    {streamingMessageId === message.id && currentStreamingText 
                      ? currentStreamingText 
                      : message.message}
                    {/* Show typing indicator for streaming AI messages */}
                    {streamingMessageId === message.id && message.type === 'ai' && (
                      <span className="animate-pulse">|</span>
                    )}
                  </p>
                  {/* Timestamp removed for cleaner look */}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-600 text-white p-3 rounded-xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {isAISpeaking && (
              <div className="flex justify-start">
                <div className="bg-emerald-600 text-white p-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Volume2 size={16} className="animate-pulse" />
                    <span className="text-sm">AI is speaking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="modern-card p-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={waitingForUserResponse ? "Speak your answer (will auto-send when you stop recording)" : "Type your response..."}
                className="flex-1 bg-white border border-slate-200 text-slate-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                disabled={isLoading || isAISpeaking}
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-2 mb-2">
              <Button
                onClick={sendMessage}
                disabled={!currentInput.trim() || isLoading || isAISpeaking}
                className="flex-1 btn-primary px-4 py-2"
              >
                Send Response
              </Button>
              
              {currentQuestionIndex < mockInterviewQuestion.length - 1 && (
                <Button
                  onClick={goToNextQuestion}
                  disabled={isLoading || isAISpeaking}
                  className="btn-secondary px-4 py-2"
                >
                  Next Question
                </Button>
              )}
            </div>
            
            {/* Voice Input - Main Control */}
            <div className="flex justify-center">
              <Button
                onClick={toggleMicrophone}
                disabled={isAISpeaking}
                className={`px-8 py-4 text-lg ${
                  isRecording 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                    : waitingForUserResponse
                    ? 'btn-success'
                    : 'btn-secondary'
                }`}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                <span className="ml-3">
                  {isRecording ? 'Stop Recording (Auto-Send)' : waitingForUserResponse ? 'Start Recording' : 'Voice Input'}
                </span>
              </Button>
            </div>
            
            {/* Status Messages */}
            {waitingForUserResponse && !isRecording && (
              <div className="mt-3 text-sm text-emerald-600 text-center">
                ✓ Ready for your response. Click the microphone to start recording or type your answer.
              </div>
            )}
            
            {isRecording && (
              <div className="mt-3 text-sm text-rose-600 text-center animate-pulse">
                🎤 Recording... Click "Stop Recording" to automatically send your response.
              </div>
            )}
            
            {/* Speech Recognition Status */}
            {interimResult && (
              <div className="mt-2 text-sm text-slate-500 italic">
                Listening: {interimResult}
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-sm text-rose-600">
                Speech recognition error. Please use text input and press Enter.
              </div>
            )}

            {isAISpeaking && (
              <div className="mt-3 text-sm text-amber-600 text-center">
                🔊 AI is speaking. Please wait for the response to finish.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedInterviewComponent;
