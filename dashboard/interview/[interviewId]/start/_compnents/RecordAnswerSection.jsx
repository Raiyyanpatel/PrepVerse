"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({ activeQuestionIndex, mockInterViewQuestion, interviewData }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const { user } = useUser();

  // Check speech recognition support
  useEffect(() => {
    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
        return false;
      }
      return true;
    };
    
    checkSpeechSupport();
  }, []);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (results && results.length > 0) {
      results.forEach((result) => {
        setUserAnswer((prevAns) => prevAns + result?.transcript);
      });
    }
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswerInDb();
    }
  }, [userAnswer, isRecording]);

  // Add safety check for required props AFTER all hooks
  if (!mockInterViewQuestion || !mockInterViewQuestion[activeQuestionIndex]) {
    return (
      <div className="flex items-center justify-center flex-col">
        <div className="p-5 text-center">
          <p>Loading interview questions...</p>
        </div>
      </div>
    );
  }

  // Show speech recognition not supported
  if (!speechSupported) {
    return (
      <div className="flex items-center justify-center flex-col">
        <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
          <Image
            src={"/webcam.png"}
            width={200}
            height={200}
            className="absolute"
          />
          <Webcam
            mirrored={true}
            style={{
              height: "50vh",
              width: "100%",
              zIndex: 10,
            }}
          />
        </div>
        <div className="p-5 text-center text-orange-600 bg-orange-50 rounded-lg mt-5">
          <h3 className="font-semibold mb-2">Speech Recognition Not Available</h3>
          <p className="text-sm mb-3">
            Speech recognition is only available in Chrome, Edge, or Safari browsers.
          </p>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Type your answer instead:</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    );
  }

  // Show error after all hooks are called
  if (error) {
    return (
      <div className="flex items-center justify-center flex-col">
        <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
          <Image
            src={"/webcam.png"}
            width={200}
            height={200}
            className="absolute"
          />
          <Webcam
            mirrored={true}
            style={{
              height: "50vh",
              width: "100%",
              zIndex: 10,
            }}
          />
        </div>
        <div className="p-5 text-center text-red-600 bg-red-50 rounded-lg mt-5">
          <h3 className="font-semibold mb-2">Microphone Access Issue</h3>
          <p className="text-sm mb-3">
            {error.message || error}. Please check your microphone permissions and try again.
          </p>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Type your answer instead:</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    );
  }

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswerInDb = async () => {
    try {
      console.log(userAnswer);
      setLoading(true);
      
      const feedbackPromt = `Question: ${mockInterViewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}. Based on the question and the user's answer, please provide a rating 1 to 10 for the answer and feedback in the form of areas for improvement, if any. The feedback should in JSON format only nothing else field should be rating and feedback only, in just 3 to 5 lines.`;
      
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
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy')
      });
      
      if (resp) {
        toast('User Answer recorded successfully!');
        setUserAnswer('');
        setResults([]);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast('Error saving your answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          className="absolute"
        />
        <Webcam
          mirrored={true}
          style={{
            height: "50vh",
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>
      <Button  
        disabled={loading} 
        variant="outline" 
        onClick={StartStopRecording} 
        className="my-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {isRecording ? (
          <h2 className="flex items-center justify-center text-white gap-2">
            <StopCircle />
            Recording...
          </h2>
        ) : (
          <h2 className="flex items-center justify-center gap-2">
            <Mic />
            Start Recording
          </h2>
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
