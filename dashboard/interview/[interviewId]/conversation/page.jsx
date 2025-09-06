"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import ConversationalInterview from '@/components/ConversationalInterview';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ConversationalInterviewPage = ({ params }) => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const GetInterviewDetails = async () => {
      try {
        const result = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, params.interviewId));

        if (result.length > 0) {
          setInterviewData(result[0]);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching interview details:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.interviewId) {
      GetInterviewDetails();
    }
  }, [params.interviewId, router]);

  const handleInterviewComplete = (summary) => {
    // You can save the conversation summary to the database here
    console.log('Interview completed:', summary);
    
    // Redirect to feedback page or dashboard
    router.push(`/dashboard/interview/${params.interviewId}/feedback`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="modern-card p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-500 mx-auto"></div>
          <p className="text-slate-600 mt-3">Loading interview…</p>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Interview Not Found</h1>
          <p className="text-slate-600 mb-6">The interview you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary px-6 py-2 rounded-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConversationalInterview 
      interviewData={interviewData}
      onComplete={handleInterviewComplete}
    />
  );
};

export default ConversationalInterviewPage;
