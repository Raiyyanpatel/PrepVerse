"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import ImprovedInterviewComponent from "@/components/ImprovedInterviewComponent";

function StartInterview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  
  useEffect(() => {
    GetInterviewDetail();
  }, []);

  /**
   * Used to Get Interview Details by MockId/Interview Id
   */
  const GetInterviewDetail = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    const jsonMockResp = JSON.parse(result[0]?.jsonMockResp);

    setMockInterviewQuestion(jsonMockResp);
    setInterviewData(result[0]);
  };

  if (!interviewData || !mockInterviewQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="modern-card p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-500 mx-auto"></div>
          <p className="text-slate-600 mt-3">Preparing your interview…</p>
        </div>
      </div>
    );
  }

  return (
    <ImprovedInterviewComponent 
      interviewData={interviewData}
      mockInterviewQuestion={mockInterviewQuestion}
      interviewId={params.interviewId}
    />
  );
}

export default StartInterview;
