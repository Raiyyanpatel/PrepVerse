"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  ChevronsUpDownIcon, 
  ArrowLeft, 
  Eye, 
  Volume2, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Brain,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import mediaManager from "@/utils/mediaManager";

function Feedback({ params }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [avgRating, setAvgRating] = useState();
  const [proctoringAnalysis, setProctoringAnalysis] = useState({
    avgEmotion: 'neutral',
    avgVoiceClarity: 0,
    avgFocusScore: 0,
    totalViolations: 0,
    totalTabSwitches: 0
  });
  const router = useRouter();

  useEffect(() => {
    // Cleanup media when entering feedback page
    mediaManager.setInterviewActive(false);
    mediaManager.cleanupAll();
    
    GetFeedBack();
  }, []);

  const GetFeedBack = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId))
      .orderBy(UserAnswer.id);

    setFeedbackList(result);
    let getTotalOfRating = result.reduce((sum, item) => sum + Number(item.rating), 0);
    setAvgRating(Math.round(getTotalOfRating / result?.length));

    // Analyze proctoring data
    analyzeProctoringData(result);
  };

  const analyzeProctoringData = (data) => {
    let totalClarity = 0;
    let totalFocus = 0;
    let totalViolations = 0;
    let totalTabSwitches = 0;
    let emotions = [];
    let validDataCount = 0;

    data.forEach(item => {
      if (item.emotionData) {
        try {
          const emotionData = JSON.parse(item.emotionData);
          emotions.push(emotionData.dominant);
        } catch (e) {}
      }

      if (item.voiceMetrics) {
        try {
          const voiceData = JSON.parse(item.voiceMetrics);
          totalClarity += voiceData.clarity || 0;
          validDataCount++;
        } catch (e) {}
      }

      if (item.eyeTrackingData) {
        try {
          const eyeData = JSON.parse(item.eyeTrackingData);
          totalFocus += eyeData.focusScore || 0;
        } catch (e) {}
      }

      totalViolations += parseInt(item.violationsCount) || 0;
      totalTabSwitches += parseInt(item.tabSwitches) || 0;
    });

    // Find most common emotion
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    const avgEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral'
    );

    setProctoringAnalysis({
      avgEmotion,
      avgVoiceClarity: validDataCount > 0 ? Math.round(totalClarity / validDataCount) : 0,
      avgFocusScore: validDataCount > 0 ? Math.round(totalFocus / validDataCount) : 0,
      totalViolations,
      totalTabSwitches
    });
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-green-500',
      confident: 'text-blue-500',
      focused: 'text-purple-500',
      neutral: 'text-gray-400',
      nervous: 'text-yellow-500',
      confused: 'text-orange-500',
      surprised: 'text-pink-500'
    };
    return colors[emotion] || 'text-gray-400';
  };

  const getOverallPerformance = () => {
    if (avgRating >= 8 && proctoringAnalysis.totalViolations <= 2) return { text: 'Excellent', color: 'text-green-500' };
    if (avgRating >= 6 && proctoringAnalysis.totalViolations <= 5) return { text: 'Good', color: 'text-blue-500' };
    if (avgRating >= 4) return { text: 'Average', color: 'text-yellow-500' };
    return { text: 'Needs Improvement', color: 'text-red-500' };
  };

  const performance = getOverallPerformance();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button className="btn-secondary inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Interview Feedback & Analysis</h1>
          <div></div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {feedbackList?.length == 0 ? (
            <div className="modern-card p-8 text-center">
              <h2 className="font-bold text-xl text-slate-700">No Interview Feedback Record Found</h2>
            </div>
          ) : (
            <>
              {/* Overall Results */}
              <div className="modern-card p-6 mb-6">
                <h2 className="text-3xl font-extrabold text-emerald-600 mb-1">Great job!</h2>
                <h2 className="font-bold text-xl text-slate-900 mb-4">Your interview is complete — here’s your summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div className="history-card text-center">
                    <div className="text-2xl font-bold text-blue-600">{avgRating}/10</div>
                    <div className="text-sm text-slate-500">Overall Rating</div>
                  </div>
                  <div className="history-card text-center">
                    <div className={`text-2xl font-bold ${performance.color.replace('text-', 'text-')}`}>{performance.text}</div>
                    <div className="text-sm text-slate-500">Performance</div>
                  </div>
                  <div className="history-card text-center">
                    <div className="text-2xl font-bold text-purple-600">{proctoringAnalysis.avgFocusScore}%</div>
                    <div className="text-sm text-slate-500">Avg Focus</div>
                  </div>
                  <div className="history-card text-center">
                    <div className="text-2xl font-bold text-emerald-600">{proctoringAnalysis.avgVoiceClarity}%</div>
                    <div className="text-sm text-slate-500">Voice Clarity</div>
                  </div>
                </div>
              </div>

              {/* Behavioral Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Emotion Analysis */}
                <div className="modern-card p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="icon-container-pink"><Brain className="h-5 w-5" /></span>
                    Emotion Analysis
                  </h3>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${getEmotionColor(proctoringAnalysis.avgEmotion)}`}>
                      {proctoringAnalysis.avgEmotion}
                    </div>
                    <div className="text-sm text-slate-500">Dominant Emotion</div>
                  </div>
                </div>

                {/* Focus Monitoring */}
                <div className="modern-card p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="icon-container-purple"><Eye className="h-5 w-5" /></span>
                    Focus Monitoring
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Focus Score</span>
                      <span className="text-slate-900 font-medium">{proctoringAnalysis.avgFocusScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tab Switches</span>
                      <span className="text-slate-900 font-medium">{proctoringAnalysis.totalTabSwitches}</span>
                    </div>
                  </div>
                </div>

                {/* Voice Analysis */}
                <div className="modern-card p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="icon-container-green"><Volume2 className="h-5 w-5" /></span>
                    Voice Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Clarity</span>
                      <span className="text-slate-900 font-medium">{proctoringAnalysis.avgVoiceClarity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Violations</span>
                      <span className="text-slate-900 font-medium">{proctoringAnalysis.totalViolations}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question by Question Analysis */}
              <div className="modern-card p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Detailed Question Analysis</h2>
                <p className="text-slate-600 text-sm mb-6">
                  Below you'll find each interview question with your answer, suggested answer, feedback, and behavioral insights.
                </p>

                {feedbackList && feedbackList.map((item, index) => (
                  <Collapsible key={index} className="mb-4">
                    <CollapsibleTrigger className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center justify-between gap-4 w-full hover:bg-white transition-colors duration-200">
                      <span className="text-slate-900 font-medium">Q{index + 1}: {item.question}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${parseInt(item.rating) >= 7 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : parseInt(item.rating) >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {item.rating}/10
                        </span>
                        <ChevronsUpDownIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-4 space-y-4">
                        {/* Answer Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="history-card">
                            <h3 className="font-semibold text-rose-600 mb-2">Your Answer</h3>
                            <p className="text-slate-700 text-sm">{item.userAns}</p>
                          </div>
                          <div className="history-card">
                            <h3 className="font-semibold text-emerald-600 mb-2">Suggested Answer</h3>
                            <p className="text-slate-700 text-sm">{item.correctAns}</p>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="history-card">
                          <h3 className="font-semibold text-blue-700 mb-2">Feedback & Improvement Areas</h3>
                          <p className="text-slate-700 text-sm">{item.feedback}</p>
                        </div>

                        {/* Behavioral Data */}
                        {(item.emotionData || item.voiceMetrics || item.eyeTrackingData) && (
                          <div className="history-card">
                            <h3 className="font-semibold text-purple-700 mb-3">Behavioral Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {item.emotionData && (
                                <div>
                                  <span className="text-slate-600">Emotion:</span>
                                  <span className="text-slate-900 ml-2">
                                    {JSON.parse(item.emotionData).dominant} ({JSON.parse(item.emotionData).confidence}%)
                                  </span>
                                </div>
                              )}
                              {item.voiceMetrics && (
                                <div>
                                  <span className="text-slate-600">Voice Clarity:</span>
                                  <span className="text-slate-900 ml-2">
                                    {JSON.parse(item.voiceMetrics).clarity}%
                                  </span>
                                </div>
                              )}
                              {item.eyeTrackingData && (
                                <div>
                                  <span className="text-slate-600">Focus Score:</span>
                                  <span className="text-slate-900 ml-2">
                                    {JSON.parse(item.eyeTrackingData).focusScore}%
                                  </span>
                                </div>
                              )}
                            </div>
                            {(item.violationsCount > 0 || item.tabSwitches > 0) && (
                              <div className="mt-2 text-sm">
                                <span className="text-slate-600">Issues:</span>
                                <span className="text-amber-700 ml-2">
                                  {item.violationsCount} violations, {item.tabSwitches} tab switches
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 mt-6">
                <Button 
                  onClick={() => router.replace('/dashboard')}
                  className="btn-secondary"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={() => router.replace('/dashboard')}
                  className="btn-primary"
                >
                  Take Another Interview
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
